import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { IconCalendar, IconCheck, IconUser, IconClock, IconChevronRight } from "../../components/icons/index"
import useApi from "../../hooks/useApi"

const GREEN      = "#15502C"
const GREEN_GRAD = "linear-gradient(145deg,#15502C,#2D9A56)"

const STAT_THEMES = [
  { from: "#0F3D20", to: "#2D9A56", glow: "rgba(45,154,86,0.38)", shine: "rgba(134,239,172,0.25)" },
  { from: "#1E3A8A", to: "#3B82F6", glow: "rgba(59,130,246,0.38)", shine: "rgba(147,197,253,0.25)" },
  { from: "#5B21B6", to: "#8B5CF6", glow: "rgba(139,92,246,0.38)", shine: "rgba(196,181,253,0.25)" },
  { from: "#92400E", to: "#F59E0B", glow: "rgba(245,158,11,0.38)", shine: "rgba(253,230,138,0.25)" },
]

function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, themeIndex = 0, delay = 0 }) {
  const [hovered, setHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const t = STAT_THEMES[themeIndex]
  useEffect(() => { const id = setTimeout(() => setMounted(true), delay); return () => clearTimeout(id) }, [])
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl overflow-hidden cursor-default"
      style={{
        background: `linear-gradient(135deg,${t.from} 0%,${t.to} 100%)`,
        padding: "20px",
        transform: mounted ? (hovered ? "translateY(-5px) scale(1.015)" : "translateY(0)") : "translateY(14px) scale(0.97)",
        opacity: mounted ? 1 : 0,
        boxShadow: hovered ? `0 20px 40px ${t.glow}, 0 4px 12px rgba(0,0,0,0.15)` : `0 6px 20px ${t.glow}`,
        transition: mounted ? "all 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "opacity 0.5s ease, transform 0.5s ease",
      }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 10% 10%,${t.shine} 0%,transparent 60%)` }} />
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)",
            transform: hovered ? "scale(1.1) rotate(-5deg)" : "scale(1)", transition: "all 0.3s ease" }}>
          <Icon size={18} color="#FFFFFF" />
        </div>
        <div className="font-sans font-bold text-white leading-none mb-1" style={{ fontSize: "clamp(18px,2.5vw,26px)" }}>{value ?? "–"}</div>
        <div className="font-sans text-xs font-semibold text-white/85 mb-0.5">{label}</div>
        <div className="font-sans text-[10px] text-white/50">{sub}</div>
      </div>
    </div>
  )
}

const STATUS_MAP = {
  active:    { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E", label: "Aktif" },
  cancelled: { bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444", label: "Dibatalkan" },
  completed: { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6", label: "Selesai" },
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.active
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {s.label}
    </span>
  )
}

function QuickAction({ label, to, desc, icon: Icon }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link to={to} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3 p-3.5 rounded-2xl no-underline transition-all duration-200"
      style={{
        backgroundColor: hovered ? "rgba(21,80,44,0.06)" : "#FAFAFA",
        border: `1px solid ${hovered ? GREEN+"33" : "#F1F5F9"}`,
        transform: hovered ? "translateX(4px)" : "translateX(0)",
        boxShadow: hovered ? "0 4px 14px rgba(21,80,44,0.10)" : "none",
      }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{ backgroundColor: hovered ? GREEN : "rgba(21,80,44,0.08)", transform: hovered ? "scale(1.08)" : "scale(1)" }}>
        <Icon size={15} color={hovered ? "#FFFFFF" : GREEN} />
      </div>
      <div className="min-w-0">
        <div className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>{label}</div>
        <div className="font-sans text-[10px]" style={{ color: "#94A3B8" }}>{desc}</div>
      </div>
      <div className="ml-auto" style={{ transform: hovered ? "translateX(3px)" : "translateX(0)", transition: "transform 0.2s ease" }}>
        <IconChevronRight size={14} color={hovered ? GREEN : "#CBD5E1"} />
      </div>
    </Link>
  )
}

export default function InstructorDashboardPage() {
  const { data, loading } = useApi("/api/instructor/dashboard")
  const kpi               = data?.kpi               || {}
  const todaySchedules    = data?.today_schedules    || []
  const upcomingSchedules = data?.upcoming_schedules || []

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Selamat Datang!</h2>
        <p className="font-sans text-sm" style={{ color: "#64748B" }}>Pantau jadwal mengajar dan peserta Anda hari ini.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IconCalendar} label="Jadwal Hari Ini" value={kpi.today_sessions ?? "–"}  sub="Sesi mengajar"    themeIndex={0} delay={0} />
        <StatCard icon={IconCheck}    label="Total Peserta"   value={kpi.today_students ?? "–"}  sub="Peserta hari ini" themeIndex={1} delay={80} />
        <StatCard icon={IconClock}    label="Bulan Ini"       value={kpi.month_sessions ?? "–"}  sub="Total sesi"       themeIndex={2} delay={160} />
        <StatCard icon={IconUser}     label="Total Peserta"   value={kpi.month_students ?? "–"}  sub="Bulan ini"        themeIndex={3} delay={240} />
      </div>

      {/* Schedule row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hari ini */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #F8FAFC" }}>
            <div>
              <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Jadwal Hari Ini</h3>
              <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>
                {new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"})}
              </p>
            </div>
            <Link to="/instructor/schedule" className="flex items-center gap-1 font-sans text-xs font-medium no-underline" style={{ color: GREEN }}>
              Lihat semua <IconChevronRight size={13} color="currentColor" />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse bg-slate-100" />)}</div>
          ) : todaySchedules.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(21,80,44,0.08)" }}>
                <IconCalendar size={20} color={GREEN} />
              </div>
              <p className="font-sans text-sm mb-0.5" style={{ color: "#94A3B8" }}>Tidak ada jadwal hari ini</p>
              <p className="font-sans text-xs" style={{ color: "#CBD5E1" }}>Nikmati hari istirahat Anda!</p>
            </div>
          ) : (
            <div>
              {todaySchedules.map((s, i) => (
                <div key={s.id}
                  className="px-5 py-3.5 transition-colors duration-150 hover:bg-slate-50/80"
                  style={{ borderBottom: i < todaySchedules.length-1 ? "1px solid #F8FAFC" : "none" }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>{s.class_name}</div>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs" style={{ color: "#64748B" }}>{s.start_time?.substring(0,5)} – {s.end_time?.substring(0,5)}</span>
                    <span className="font-sans text-xs font-semibold" style={{ color: GREEN }}>{s.booked_count}/{s.capacity} peserta</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Mendatang */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #F8FAFC" }}>
            <div>
              <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Jadwal Mendatang</h3>
              <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>7 hari ke depan</p>
            </div>
            <Link to="/instructor/schedule" className="flex items-center gap-1 font-sans text-xs font-medium no-underline" style={{ color: GREEN }}>
              Kelola <IconChevronRight size={13} color="currentColor" />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse bg-slate-100" />)}</div>
          ) : upcomingSchedules.length === 0 ? (
            <div className="py-14 text-center font-sans text-sm" style={{ color: "#94A3B8" }}>Tidak ada jadwal mendatang</div>
          ) : (
            <div>
              {upcomingSchedules.slice(0, 6).map((s, i) => (
                <div key={s.id}
                  className="px-5 py-3.5 transition-colors duration-150 hover:bg-slate-50/80"
                  style={{ borderBottom: i < Math.min(upcomingSchedules.length,6)-1 ? "1px solid #F8FAFC" : "none" }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>{s.class_name}</div>
                    <span className="font-sans text-xs font-semibold" style={{ color: GREEN }}>{s.booked_count}/{s.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs" style={{ color: "#64748B" }}>
                      {new Date(s.date).toLocaleDateString("id-ID",{weekday:"short",day:"numeric",month:"short"})}
                    </span>
                    <span className="font-sans text-xs" style={{ color: "#94A3B8" }}>{s.start_time?.substring(0,5)} – {s.end_time?.substring(0,5)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="p-4">
        <h3 className="font-sans text-sm font-semibold mb-3" style={{ color: "#0F172A" }}>Aksi Cepat</h3>
        <div className="space-y-1.5">
          <QuickAction label="Lihat Jadwal Lengkap" to="/instructor/schedule"   desc="Semua jadwal mengajar"        icon={IconCalendar} />
          <QuickAction label="Input Kehadiran"       to="/instructor/attendance" desc="Catat kehadiran peserta"      icon={IconCheck} />
        </div>
      </Card>
    </div>
  )
}
