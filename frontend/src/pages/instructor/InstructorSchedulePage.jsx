import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { IconCalendar, IconChevronRight } from "../../components/icons/index"
import useApi from "../../hooks/useApi"

const GREEN = "#15502C"

function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  )
}

const STATUS_MAP = {
  active:    { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E", label: "Aktif" },
  cancelled: { bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444", label: "Dibatalkan" },
  completed: { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6", label: "Selesai" },
}

export default function InstructorSchedulePage() {
  const [schedules, setSchedules] = useState([])
  const [filter,    setFilter]    = useState("upcoming")
  const { data, loading } = useApi("/api/instructor/schedule")
  useEffect(() => { if (data) setSchedules(Array.isArray(data) ? data : []) }, [data])

  const filtered = schedules.filter(s => {
    const date  = new Date(s.date); const today = new Date(); today.setHours(0,0,0,0)
    if (filter === "upcoming") return date >= today
    if (filter === "past")     return date < today
    return true
  })

  const tabs = [
    { val: "upcoming", label: "Mendatang" },
    { val: "past",     label: "Sudah Lewat" },
    { val: "all",      label: "Semua" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Jadwal Mengajar</h2>
          <p className="font-sans text-sm" style={{ color: "#64748B" }}>{filtered.length} jadwal</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 p-1 rounded-2xl w-fit"
        style={{ backgroundColor: "#F0F9F4", boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(255,255,255,0.8)" }}>
        {tabs.map(tab => (
          <button key={tab.val} onClick={() => setFilter(tab.val)}
            className="px-4 py-2 rounded-xl font-sans text-sm font-medium border-none cursor-pointer transition-all duration-200"
            style={{
              background: filter===tab.val ? "linear-gradient(145deg,#15502C,#2D9A56)" : "transparent",
              color: filter===tab.val ? "#FFFFFF" : "#64748B",
              boxShadow: filter===tab.val ? "0 4px 12px rgba(21,80,44,0.25)" : "none",
              transform: filter===tab.val ? "translateY(-1px)" : "translateY(0)",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl animate-pulse bg-white"
          style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9)" }} />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(21,80,44,0.08)" }}>
            <IconCalendar size={22} color={GREEN} />
          </div>
          <p className="font-sans text-sm font-medium mb-1" style={{ color: "#0F172A" }}>Tidak ada jadwal</p>
          <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>Coba ubah filter di atas</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            const st      = STATUS_MAP[s.status] || STATUS_MAP.active
            const isToday = new Date(s.date).toDateString() === new Date().toDateString()
            return (
              <Card key={s.id}
                style={{
                  boxShadow: isToday
                    ? "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 2px #15502C"
                    : "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)",
                  transition: "all 0.2s ease",
                }}>
                <div className="p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>{s.class_name}</div>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-full font-sans text-[10px] font-bold text-white"
                            style={{ background: "linear-gradient(145deg,#15502C,#2D9A56)" }}>HARI INI</span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold"
                          style={{ backgroundColor: st.bg, color: st.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
                          {st.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                        {[
                          ["Tanggal", new Date(s.date).toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})],
                          ["Waktu",   `${s.start_time?.substring(0,5)} – ${s.end_time?.substring(0,5)}`],
                          ["Peserta", `${s.booked_count||0}/${s.capacity} orang`],
                        ].map(([label, val]) => (
                          <div key={label}>
                            <div className="font-sans text-[9px] font-bold tracking-widest uppercase mb-0.5" style={{ color: "#94A3B8" }}>{label}</div>
                            <div className="font-sans text-xs font-medium" style={{ color: "#334155" }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {s.status === "active" && (
                      <Link to={`/instructor/attendance/${s.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-sans text-xs font-semibold text-white no-underline transition-all duration-200 hover:-translate-y-0.5 flex-shrink-0"
                        style={{ background: "linear-gradient(145deg,#15502C,#2D9A56)", boxShadow: "0 4px 12px rgba(21,80,44,0.25)" }}>
                        Input Kehadiran <IconChevronRight size={13} color="currentColor" />
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
