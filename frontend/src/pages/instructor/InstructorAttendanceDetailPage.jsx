import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { IconCheck, IconX, IconClock, IconUsers, IconCalendar } from "../../components/icons/index"
import ButtonLoading from "../../components/ButtonLoading"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json", "Content-Type": "application/json" })
const GREEN   = "#15502C"

function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  )
}

function StatCard({ label, value, color, bg, icon: Icon }) {
  return (
    <Card style={{ borderLeft: `4px solid ${color}` }}>
      <div className="p-4">
        <div className="font-sans text-2xl font-bold mb-2" style={{ color }}>{value}</div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
            <Icon size={11} color={color} />
          </div>
          <span className="font-sans text-xs font-medium" style={{ color: "#64748B" }}>{label}</span>
        </div>
      </div>
    </Card>
  )
}

export default function InstructorAttendanceDetailPage() {
  const navigate    = useNavigate()
  const { scheduleId } = useParams()

  const [schedule,   setSchedule]   = useState(null)
  const [bookings,   setBookings]   = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)

  useEffect(() => {
    if (!scheduleId) return
    setLoading(true)
    fetch(`/api/instructor/attendance/${scheduleId}`, { headers: headers() })
      .then(r => r.json())
      .then(d => {
        const data = d.data || d
        setSchedule(data.schedule || null)
        const b = data.bookings || []
        setBookings(b)
        const init = {}
        b.forEach(bk => {
          if (bk.status === "attended")     init[bk.id] = true
          else if (bk.status === "no_show") init[bk.id] = false
          else                              init[bk.id] = null
        })
        setAttendance(init)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [scheduleId])

  const isLocked = schedule?.status === "completed"

  const handleToggle = (id, val) => {
    if (isLocked) return
    setAttendance(p => ({ ...p, [id]: p[id] === val ? null : val }))
  }

  const handleMarkAll = (val) => {
    if (isLocked) return
    const next = {}
    bookings.forEach(bk => { next[bk.id] = val })
    setAttendance(next)
  }

  const handleSave = async () => {
    if (isLocked) return
    setSaving(true)
    try {
      const payload = Object.entries(attendance)
        .filter(([, v]) => v !== null)
        .map(([bookingId, attended]) => ({ booking_id: parseInt(bookingId), attended }))
      const res = await fetch(`/api/instructor/attendance/${scheduleId}`, {
        method: "POST", headers: headers(), body: JSON.stringify({ attendances: payload }),
      })
      if (res.ok) {
        setSaved(true)
        setSchedule(p => p ? { ...p, status: "completed" } : p)
        setTimeout(() => setSaved(false), 2500)
      }
    } catch {}
    setSaving(false)
  }

  const attended    = Object.values(attendance).filter(v => v === true).length
  const notAttended = Object.values(attendance).filter(v => v === false).length
  const pending     = bookings.length - attended - notAttended

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <button onClick={() => navigate("/instructor/attendance")}
            className="inline-flex items-center gap-1 font-sans text-xs font-medium mb-2 border-none bg-transparent cursor-pointer p-0 hover:opacity-70 transition-opacity"
            style={{ color: GREEN }}>
            ← Kembali ke Daftar Kelas
          </button>
          <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Input Kehadiran</h2>
          {schedule && (
            <p className="font-sans text-sm" style={{ color: "#64748B" }}>
              {schedule.class_name} · {new Date(schedule.date + "T00:00:00").toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"})} · {schedule.start_time?.substring(0,5)}
            </p>
          )}
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-sm"
            style={{ backgroundColor: "#F0FDF4", border: "1px solid #D5EDD8", color: "#15803D" }}>
            <IconCheck size={15} color="#15803D" /> Kehadiran berhasil disimpan!
          </div>
        )}
      </div>

      {/* Schedule info card */}
      {schedule && (
        <Card className="p-4 mb-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(21,80,44,0.08)" }}>
                <IconCalendar size={15} color={GREEN} />
              </div>
              <div>
                <div className="font-sans text-xs" style={{ color: "#94A3B8" }}>Tanggal</div>
                <div className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>
                  {new Date(schedule.date + "T00:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}
                </div>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-100" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(21,80,44,0.08)" }}>
                <IconClock size={15} color={GREEN} />
              </div>
              <div>
                <div className="font-sans text-xs" style={{ color: "#94A3B8" }}>Waktu</div>
                <div className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>
                  {schedule.start_time?.substring(0,5)} – {schedule.end_time?.substring(0,5)}
                </div>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-100" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(21,80,44,0.08)" }}>
                <IconUsers size={15} color={GREEN} />
              </div>
              <div>
                <div className="font-sans text-xs" style={{ color: "#94A3B8" }}>Peserta</div>
                <div className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>
                  {bookings.length} terdaftar
                </div>
              </div>
            </div>
            <div className="ml-auto">
              {isLocked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs font-semibold"
                  style={{ backgroundColor: "#F0FDF4", color: "#15803D" }}>
                  <IconCheck size={11} color="#15803D" /> Sudah Dikonfirmasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs font-semibold"
                  style={{ backgroundColor: "#FEF9EE", color: "#B45309" }}>
                  <IconClock size={11} color="#B45309" /> Belum Diinput
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Locked notice */}
      {isLocked && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-5"
          style={{ backgroundColor: "#FEF9EE", border: "1px solid #F5E8C0" }}>
          <IconCheck size={18} color="#B45309" />
          <div>
            <p className="font-sans text-sm font-semibold" style={{ color: "#B45309" }}>Kehadiran sudah dikonfirmasi</p>
            <p className="font-sans text-xs mt-0.5" style={{ color: "#D97706" }}>Sesi sudah selesai. Hubungi admin jika ada kesalahan.</p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <StatCard label="Hadir"   value={attended}    color={GREEN}   bg="rgba(21,80,44,0.08)"   icon={IconCheck} />
        <StatCard label="Absen"   value={notAttended} color="#DC2626" bg="rgba(220,38,38,0.08)"  icon={IconX} />
        <StatCard label="Pending" value={pending}     color="#B45309" bg="rgba(245,158,11,0.08)" icon={IconClock} />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse bg-white"
              style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07)" }} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="font-sans text-sm" style={{ color: "#94A3B8" }}>Belum ada peserta terdaftar</p>
        </Card>
      ) : (
        <>
          {/* Mark all buttons */}
          {!isLocked && (
            <div className="flex items-center gap-2 mb-4">
              <span className="font-sans text-xs" style={{ color: "#94A3B8" }}>Tandai semua:</span>
              <button onClick={() => handleMarkAll(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs font-semibold border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                style={{ backgroundColor: "rgba(21,80,44,0.08)", color: GREEN }}>
                <IconCheck size={11} color={GREEN} /> Hadir
              </button>
              <button onClick={() => handleMarkAll(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs font-semibold border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                style={{ backgroundColor: "rgba(220,38,38,0.08)", color: "#DC2626" }}>
                <IconX size={11} color="#DC2626" /> Absen
              </button>
            </div>
          )}

          {/* Booking list */}
          <div className="space-y-2.5 mb-6">
            {bookings.map((bk, idx) => {
              const val = attendance[bk.id]
              return (
                <div key={bk.id}
                  className="flex items-center justify-between gap-4 p-4 transition-all duration-200"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    boxShadow: val === true
                      ? `6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 2px ${GREEN}`
                      : val === false
                        ? "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 2px #EF4444"
                        : "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)",
                    opacity: isLocked ? 0.8 : 1,
                  }}>
                  {/* Avatar + info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* No urut */}
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-sans text-[10px] font-bold"
                      style={{ backgroundColor: "#F1F5F9", color: "#94A3B8" }}>
                      {idx + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: val === true ? `linear-gradient(145deg,${GREEN},#2D9A56)` : val === false ? "rgba(239,68,68,0.10)" : "#F8FAFC",
                        boxShadow: val === true ? "0 4px 12px rgba(21,80,44,0.25)" : "none",
                      }}>
                      <span className="font-sans text-sm font-bold"
                        style={{ color: val === true ? "#FFFFFF" : val === false ? "#EF4444" : "#94A3B8" }}>
                        {bk.member_name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-sans text-sm font-semibold truncate" style={{ color: "#0F172A" }}>{bk.member_name}</div>
                      <div className="font-sans text-xs" style={{ color: "#94A3B8" }}>{bk.booking_code || `#${bk.id}`}</div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleToggle(bk.id, true)} disabled={isLocked}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-sans text-xs font-semibold border-none transition-all duration-200"
                      style={{
                        backgroundColor: val === true ? GREEN : "#F0FDF4",
                        color: val === true ? "#FFFFFF" : GREEN,
                        cursor: isLocked ? "not-allowed" : "pointer",
                        boxShadow: val === true ? "0 4px 10px rgba(21,80,44,0.25)" : "none",
                        transform: val === true ? "scale(1.02)" : "scale(1)",
                      }}>
                      <IconCheck size={13} color="currentColor" /> Hadir
                    </button>
                    <button onClick={() => handleToggle(bk.id, false)} disabled={isLocked}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-sans text-xs font-semibold border-none transition-all duration-200"
                      style={{
                        backgroundColor: val === false ? "#EF4444" : "#FEF2F2",
                        color: val === false ? "#FFFFFF" : "#DC2626",
                        cursor: isLocked ? "not-allowed" : "pointer",
                        boxShadow: val === false ? "0 4px 10px rgba(239,68,68,0.25)" : "none",
                        transform: val === false ? "scale(1.02)" : "scale(1)",
                      }}>
                      <IconX size={13} color="currentColor" /> Absen
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Save button */}
          {!isLocked && (
            <button onClick={handleSave} disabled={saving}
              className="w-full py-3.5 rounded-2xl font-sans text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: `linear-gradient(145deg,${GREEN},#2D9A56)`, boxShadow: saving ? "none" : "0 6px 18px rgba(21,80,44,0.30)", opacity: saving ? 0.7 : 1 }}>
              {saving ? <ButtonLoading variant="dots" /> : `Simpan Kehadiran (${attended} Hadir · ${notAttended} Absen)`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
