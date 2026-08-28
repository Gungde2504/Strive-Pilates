import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { IconCalendar, IconChevronLeft, IconChevronRight, IconCheck, IconClock, IconUsers } from "../../components/icons/index"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json" })
const GREEN   = "#15502C"

function toYMD(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`
}
function getWeekStart(date) {
  const d = new Date(date), day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0,0,0,0); return d
}
function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}

// ─── Schedule Card ────────────────────────────────────────────────────────────
function ScheduleCard({ schedule, index }) {
  const [hovered, setHovered] = useState(false)
  const isCompleted = schedule.status === "completed"
  const booked      = schedule.booked_count ?? 0
  const fillPct     = schedule.capacity > 0 ? Math.round((booked / schedule.capacity) * 100) : 0
  const isFull      = fillPct >= 100

  return (
    <Link to={`/instructor/attendance/${schedule.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="block no-underline transition-all duration-300"
      style={{
        borderRadius: "20px",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 12px 32px rgba(21,80,44,0.18), 0 0 0 2px ${GREEN}`
          : "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)",
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
      }}>

      {/* Top accent bar */}
      <div className="h-1 w-full"
        style={{ background: isCompleted ? "linear-gradient(90deg,#14532D,#22C55E)" : "linear-gradient(90deg,#0F3D20,#2D9A56,rgba(45,154,86,0))" }} />

      <div className="p-4">
        <div className="flex items-center gap-4">

          {/* Time badge */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl px-3 py-3 min-w-[60px]"
            style={{ background: isCompleted ? "linear-gradient(145deg,#14532D,#15803D)" : "linear-gradient(145deg,#0F3D20,#15502C)", boxShadow: `0 4px 14px rgba(21,80,44,0.3)` }}>
            <span className="font-sans text-sm font-bold text-white leading-none">
              {schedule.start_time?.substring(0,5)}
            </span>
            <div className="w-4 h-px bg-white/30 my-1" />
            <span className="font-sans text-[9px] text-white/50 leading-none">
              {schedule.end_time?.substring(0,5)}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-sans text-sm font-semibold truncate" style={{ color: "#0F172A" }}>
                {schedule.class_name}
              </div>
              {isCompleted ? (
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-[9px] font-bold"
                  style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}>
                  <IconCheck size={8} color="#15803D" /> Selesai
                </span>
              ) : (
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-[9px] font-bold"
                  style={{ backgroundColor: "#FEF9EE", color: "#B45309" }}>
                  <IconClock size={8} color="#B45309" /> Pending
                </span>
              )}
            </div>

            {/* Progress bar peserta */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${fillPct}%`,
                    background: isFull ? "linear-gradient(90deg,#DC2626,#EF4444)" : `linear-gradient(90deg,${GREEN},#2D9A56)`,
                  }} />
              </div>
              <span className="font-sans text-[10px] font-semibold flex-shrink-0"
                style={{ color: isFull ? "#DC2626" : GREEN }}>
                {booked}/{schedule.capacity}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {schedule.class_type && (
                <span className="font-sans text-[9px] px-2 py-0.5 rounded-full capitalize font-medium"
                  style={{ backgroundColor: "rgba(21,80,44,0.07)", color: GREEN }}>
                  {schedule.class_type}
                </span>
              )}
              <span className="font-sans text-[9px]" style={{ color: "#CBD5E1" }}>
                {fillPct}% terisi
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{ backgroundColor: hovered ? GREEN : "rgba(21,80,44,0.07)", transform: hovered ? "translateX(2px)" : "translateX(0)" }}>
            <IconChevronRight size={13} color={hovered ? "#FFFFFF" : GREEN} />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function InstructorAttendancePage() {
  const today = new Date(); today.setHours(0,0,0,0)

  const [weekAnchor, setWeekAnchor] = useState(() => getWeekStart(today))
  const [schedules,  setSchedules]  = useState([])
  const [loading,    setLoading]    = useState(true)

  const weekEnd       = addDays(weekAnchor, 6)
  const isCurrentWeek = weekAnchor <= getWeekStart(today)

  const monthLabel = weekAnchor.getMonth() === weekEnd.getMonth()
    ? weekAnchor.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : `${weekAnchor.toLocaleDateString("id-ID",{month:"long"})} – ${weekEnd.toLocaleDateString("id-ID",{month:"long",year:"numeric"})}`

  useEffect(() => {
    setLoading(true)
    fetch(`/api/instructor/schedule?date=${toYMD(weekAnchor)}`, { headers: headers() })
      .then(r => r.json())
      .then(d => { setSchedules(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [weekAnchor])

  const prevWeek = () => { if (!isCurrentWeek) setWeekAnchor(p => addDays(p, -7)) }
  const nextWeek = () => setWeekAnchor(p => addDays(p, 7))
  const goToday  = () => setWeekAnchor(getWeekStart(today))

  const grouped        = schedules.reduce((acc, s) => { const d = s.date?.substring(0,10) || toYMD(today); if (!acc[d]) acc[d]=[]; acc[d].push(s); return acc }, {})
  const completedCount = schedules.filter(s => s.status === "completed").length
  const pendingCount   = schedules.filter(s => s.status !== "completed").length

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Input Kehadiran</h2>
        <p className="font-sans text-sm" style={{ color: "#64748B" }}>Pilih kelas untuk menginput kehadiran peserta</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total Kelas",  value: schedules.length, color: "#3B82F6", bg: "rgba(59,130,246,0.08)",  iconBg: "#3B82F6",  Icon: IconCalendar },
          { label: "Sudah Input",  value: completedCount,   color: "#10B981", bg: "rgba(16,185,129,0.08)",  iconBg: "#10B981",  Icon: IconCheck },
          { label: "Belum Input",  value: pendingCount,     color: "#F59E0B", bg: "rgba(245,158,11,0.08)",  iconBg: "#F59E0B",  Icon: IconClock },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4"
            style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", borderLeft: `3px solid ${s.color}` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="font-sans text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.Icon size={14} color={s.color} />
              </div>
            </div>
            <div className="font-sans text-[10px] font-medium" style={{ color: "#94A3B8" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Week navigation */}
      <div className="bg-white rounded-2xl p-4 mb-5"
        style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between gap-3">
          <button onClick={prevWeek} disabled={isCurrentWeek}
            className="w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all duration-200"
            style={{ backgroundColor: isCurrentWeek ? "#F8FAFC" : "rgba(21,80,44,0.08)", opacity: isCurrentWeek ? 0.3 : 1, cursor: isCurrentWeek ? "not-allowed" : "pointer" }}>
            <IconChevronLeft size={15} color={GREEN} />
          </button>

          <div className="text-center flex-1">
            <div className="font-sans text-sm font-semibold capitalize" style={{ color: "#0F172A" }}>{monthLabel}</div>
            <div className="font-sans text-xs mt-0.5" style={{ color: "#94A3B8" }}>
              {toYMD(weekAnchor)} – {toYMD(weekEnd)}
            </div>
            {!isCurrentWeek && (
              <button onClick={goToday}
                className="mt-1.5 px-3 py-1 rounded-full font-sans text-[10px] font-semibold border-none cursor-pointer transition-all duration-150 hover:opacity-80"
                style={{ backgroundColor: "rgba(21,80,44,0.08)", color: GREEN }}>
                ↩ Minggu Ini
              </button>
            )}
          </div>

          <button onClick={nextWeek}
            className="w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all duration-200 hover:opacity-80"
            style={{ backgroundColor: "rgba(21,80,44,0.08)" }}>
            <IconChevronRight size={15} color={GREEN} />
          </button>
        </div>
      </div>

      {/* Schedule list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse"
              style={{ backgroundColor: "#F8FAFC", boxShadow: "6px 6px 16px rgba(0,0,0,0.04)" }} />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="rounded-2xl py-16 text-center bg-white"
          style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(145deg,#0F3D20,#15502C)", boxShadow: "0 6px 20px rgba(21,80,44,0.3)" }}>
            <IconCalendar size={24} color="white" />
          </div>
          <p className="font-sans text-sm font-semibold mb-1" style={{ color: "#334155" }}>Tidak ada jadwal minggu ini</p>
          <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>Coba navigasi ke minggu lain</p>
        </div>
      ) : (
        <div className="space-y-7">
          {Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([date, slots]) => {
            const dateObj  = new Date(date + "T00:00:00")
            const isToday  = date === toYMD(today)
            const dayLabel = dateObj.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"})
            const doneCount = slots.filter(s => s.status === "completed").length

            return (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  {/* Date pill */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isToday ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                        style={{ background: "linear-gradient(135deg,#0F3D20,#15502C)", boxShadow: "0 3px 10px rgba(21,80,44,0.3)" }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="font-sans text-xs font-bold text-white capitalize">{dayLabel}</span>
                        <span className="font-sans text-[9px] font-bold text-white/60 uppercase tracking-wider">HARI INI</span>
                      </div>
                    ) : (
                      <span className="font-sans text-sm font-semibold capitalize" style={{ color: "#334155" }}>{dayLabel}</span>
                    )}
                  </div>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(21,80,44,0.15),transparent)" }} />
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="font-sans text-[10px] font-medium" style={{ color: "#94A3B8" }}>{doneCount}/{slots.length} selesai</span>
                    {doneCount === slots.length && slots.length > 0 && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#DCFCE7" }}>
                        <IconCheck size={9} color="#15803D" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-2.5">
                  {slots.map((s, i) => <ScheduleCard key={s.id} schedule={s} index={i} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
 