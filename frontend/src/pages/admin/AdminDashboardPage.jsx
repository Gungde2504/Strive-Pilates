import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  IconCalendar, IconUser, IconUsers, IconPackage,
  IconCheck, IconClock, IconChevronRight,
} from "../../components/icons/index"
import useApi from "../../hooks/useApi"

const STAT_THEMES = [
  { from: "#1E3A8A", to: "#3B82F6", glow: "rgba(59,130,246,0.35)",  shine: "rgba(147,197,253,0.25)" },
  { from: "#5B21B6", to: "#8B5CF6", glow: "rgba(139,92,246,0.35)",  shine: "rgba(196,181,253,0.25)" },
  { from: "#065F46", to: "#10B981", glow: "rgba(16,185,129,0.35)",  shine: "rgba(110,231,183,0.25)" },
  { from: "#92400E", to: "#F59E0B", glow: "rgba(245,158,11,0.35)",  shine: "rgba(253,230,138,0.25)" },
]

function StatCard({ icon: Icon, label, value, sub, themeIndex = 0 }) {
  const [hovered, setHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const theme = STAT_THEMES[themeIndex]
  useEffect(() => { const t = setTimeout(() => setMounted(true), themeIndex * 80); return () => clearTimeout(t) }, [])
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl overflow-hidden cursor-default"
      style={{
        background: `linear-gradient(135deg,${theme.from} 0%,${theme.to} 100%)`,
        padding: "20px",
        transform: mounted ? (hovered ? "translateY(-5px) scale(1.015)" : "translateY(0)") : "translateY(16px) scale(0.97)",
        opacity: mounted ? 1 : 0,
        boxShadow: hovered ? `0 20px 40px ${theme.glow},0 4px 12px rgba(0,0,0,0.15)` : `0 6px 20px ${theme.glow}`,
        transition: mounted ? "all 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "opacity 0.5s ease,transform 0.5s ease",
      }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 10% 10%,${theme.shine} 0%,transparent 60%)`, opacity: hovered ? 1 : 0.6, transition: "opacity 0.35s ease" }} />
      <div className="absolute bottom-0 inset-x-0 h-1/2 pointer-events-none"
        style={{ background: "linear-gradient(to top,rgba(0,0,0,0.15),transparent)" }} />
      <div className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3),0 4px 12px rgba(0,0,0,0.15)", transform: hovered ? "scale(1.1) rotate(-5deg)" : "scale(1)", transition: "all 0.3s ease" }}>
        <Icon size={18} color="#FFFFFF" />
      </div>
      <div className="relative z-10">
        <div className="font-sans font-bold text-white leading-none mb-1" style={{ fontSize: "clamp(22px,3vw,28px)" }}>{value ?? "–"}</div>
        <div className="font-sans text-xs font-semibold text-white/85 mb-0.5">{label}</div>
        {sub && <div className="font-sans text-[10px] text-white/50">{sub}</div>}
      </div>
    </div>
  )
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
// Revisi: tinggi bar chart mengikuti penuh ruang yang tersedia (bukan fixed 88px),
// top bar full rounded (capsule), + garis grid tipis horizontal.
function BarChart({ data }) {
  const [animated, setAnimated] = useState(false)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const areaRef = useRef(null)

  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t) }, [])

  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    ro.observe(el)
    setSize({ w: el.offsetWidth, h: el.offsetHeight })
    return () => ro.disconnect()
  }, [])

  if (!data || data.length === 0) return null

  const max        = Math.max(...data.map(d => d.count), 1)
  const CHART_H     = Math.max(size.h, 40)
  const barW        = size.w > 0 ? Math.min(22, Math.floor((size.w - (data.length - 1) * 8) / data.length)) : 16
  const GRID_LINES  = [1, 0.75, 0.5, 0.25]
  const BAR_COLOR   = "#3B82F6" // warna solid rata, tidak ada highlight beda per-bar

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 flex">
        {/* Label sumbu Y — sejajar dengan garis grid */}
        <div className="relative flex-shrink-0" style={{ width: 24, height: "100%" }}>
          {GRID_LINES.map((g, i) => (
            <span key={i} className="absolute right-1.5 font-sans text-[8px] leading-none"
              style={{ top: `${(1 - g) * 100}%`, transform: "translateY(-50%)", color: "#CBD5E1" }}>
              {Math.round(max * g)}
            </span>
          ))}
          <span className="absolute right-1.5 bottom-0 font-sans text-[8px] leading-none" style={{ color: "#CBD5E1" }}>0</span>
        </div>

        {/* Area chart */}
        <div ref={areaRef} className="relative flex-1 min-h-0 overflow-visible">
          {/* Garis grid tipis */}
          <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: CHART_H }}>
            {GRID_LINES.map((g, i) => (
              <div key={i} className="absolute inset-x-0" style={{ top: `${(1 - g) * 100}%`, borderTop: "1px dashed #F1F5F9" }} />
            ))}
            <div className="absolute inset-x-0 bottom-0" style={{ borderTop: "1px solid #E2E8F0" }} />
          </div>

          {/* Bars — tipis, rapat, radius kecil di atas (bukan pill) */}
          <div className="absolute inset-x-0 bottom-0 flex items-end gap-1.5" style={{ height: CHART_H }}>
            {data.map((d, i) => {
              const pct  = d.count / max
              const barH = Math.max(Math.round(pct * CHART_H), d.count > 0 ? 6 : 2)
              return (
                <div key={i} className="flex flex-col items-center justify-end group relative"
                  style={{ height: "100%", width: `${barW}px`, flexShrink: 0 }}>
                  {d.count > 0 && (
                    <div className="absolute font-sans text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                      style={{ bottom: barH + 3, color: "#3B82F6" }}>
                      {d.count}
                    </div>
                  )}
                  <div className="w-full transition-all duration-700 ease-out"
                    style={{
                      height: animated ? barH : 2,
                      borderRadius: "4px 4px 0 0",
                      backgroundColor: d.count === 0 ? "#F1F5F9" : BAR_COLOR,
                      transitionDelay: `${i * 40}ms`,
                    }} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Label sumbu X */}
      <div className="flex mt-1.5">
        <div style={{ width: 24, flexShrink: 0 }} />
        <div className="flex-1 flex gap-1.5">
          {data.map((d, i) => (
            <div key={i} className="text-center font-sans text-[9px] font-medium" style={{ width: `${barW}px`, flexShrink: 0, color: "#CBD5E1" }}>
              {d.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Pie Chart (donut exploded, label nempel di tiap slice) ────────────────────
// Sesuai referensi: donut dengan celah antar-slice (exploded), tiap slice punya
// label kategori + persentase langsung di atasnya, lubang tengah putih berisi
// ringkasan total.
function PieChart({ data, size = 150 }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const total   = data.reduce((s, d) => s + d.value, 0)
  const cx      = size / 2
  const cy      = size / 2
  const R       = size / 2 - 4        // radius luar
  const rInner  = R * 0.52            // radius dalam (lubang donut)
  const GAP     = 0.045               // celah sudut antar slice (radian)
  const EXPLODE = 5                   // px, jarak "meletus" dari pusat

  const holeSize = rInner * 2 - 6

  if (total === 0) {
    return (
      <div className="relative rounded-full flex items-center justify-center"
        style={{ width: size, height: size, backgroundColor: "#F1F5F9" }}>
        <span className="font-sans text-[10px]" style={{ color: "#CBD5E1" }}>Belum ada data</span>
      </div>
    )
  }

  let cumulative = -Math.PI / 2 // mulai dari jam 12
  const slices = data.map((d) => {
    const angle = (d.value / total) * Math.PI * 2
    const start = cumulative
    const end   = cumulative + angle
    cumulative  = end
    return { ...d, start, end, pct: Math.round((d.value / total) * 100) }
  })

  const point = (angle, radius) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  })

  // Kasus khusus: hanya 1 kategori yang punya nilai = donut 100% satu warna.
  // Arc SVG (M-A-Z) tidak bisa menggambar ring penuh (titik awal & akhir busur
  // jadi sama persis, path collapse) — jadi untuk kasus ini pakai teknik
  // <circle> + stroke tebal, bukan <path> arc.
  const isFullSingle = slices.length === 1

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {isFullSingle ? (
          <circle
            cx={cx} cy={cy} r={(R + rInner) / 2}
            fill="none"
            stroke={slices[0].color}
            strokeWidth={R - rInner}
            onMouseEnter={() => setHoverIndex(0)}
            onMouseLeave={() => setHoverIndex(null)}
            style={{ cursor: "pointer" }}
            opacity={hoverIndex === 0 ? 1 : 0.92}
          />
        ) : (
          slices.map((s, i) => {
            const start = s.start + GAP / 2
            const end   = s.end - GAP / 2
            const mid   = (start + end) / 2
            const large = end - start > Math.PI ? 1 : 0
            const hovered = hoverIndex === i
            const offset  = hovered ? EXPLODE + 3 : EXPLODE
            const dx      = Math.cos(mid) * offset
            const dy      = Math.sin(mid) * offset

            const po1 = point(start, R)
            const po2 = point(end, R)
            const pi1 = point(start, rInner)
            const pi2 = point(end, rInner)
            const labelPt = point(mid, (R + rInner) / 2)

            return (
              <g key={i}
                transform={`translate(${dx},${dy})`}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                style={{ cursor: "pointer", transition: "transform 0.2s ease-out" }}
              >
                <path
                  d={`M ${po1.x} ${po1.y} A ${R} ${R} 0 ${large} 1 ${po2.x} ${po2.y}
                      L ${pi2.x} ${pi2.y} A ${rInner} ${rInner} 0 ${large} 0 ${pi1.x} ${pi1.y} Z`}
                  fill={s.color}
                  opacity={hovered ? 1 : 0.92}
                />
                <text x={labelPt.x} y={labelPt.y - 3} textAnchor="middle"
                  className="font-sans" style={{ fontSize: 5.5, fontWeight: 600, fill: "rgba(255,255,255,0.9)", letterSpacing: "0.02em" }}>
                  {s.label}
                </text>
                <text x={labelPt.x} y={labelPt.y + 7} textAnchor="middle"
                  className="font-sans" style={{ fontSize: 9, fontWeight: 700, fill: "#fff" }}>
                  {s.pct}%
                </text>
              </g>
            )
          })
        )}
      </svg>

      {/* Lubang tengah — ringkasan total */}
      <div className="absolute rounded-full bg-white flex flex-col items-center justify-center"
        style={{
          width: holeSize, height: holeSize,
          left: cx - holeSize / 2, top: cy - holeSize / 2,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
        }}>
        <span className="font-sans text-[6px] font-semibold tracking-wide" style={{ color: "#94A3B8" }}>TOTAL</span>
        <div className="flex gap-0.5 my-0.5">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="w-0.5 h-0.5 rounded-full" style={{ backgroundColor: "#E2E8F0" }} />
          ))}
        </div>
        <span className="font-sans text-sm font-bold leading-none" style={{ color: "#0F172A" }}>{total}</span>
        <span className="font-sans text-[5.5px] mt-0.5" style={{ color: "#CBD5E1" }}>booking hari ini</span>
      </div>
    </div>
  )
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────
// Revisi: sel tanggal pakai tinggi baris tetap (bukan aspect-ratio mengikuti lebar
// kolom) supaya kalender tidak jadi terlalu tinggi ke bawah saat card melebar.
function MiniCalendar({ schedules = [] }) {
  const today = new Date()
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const { year, month } = view
  const firstDay    = new Date(year, month, 1).getDay()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const scheduleDates = new Set(schedules.map(s => s.date?.substring(0, 10)))
  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  const pad         = n => String(n).padStart(2, "0")
  const isToday     = d => d && year === today.getFullYear() && month === today.getMonth() && d === today.getDate()
  const hasSchedule = d => d && scheduleDates.has(`${year}-${pad(month + 1)}-${pad(d)}`)
  const monthName   = new Date(year, month).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
  const prevMonth   = () => setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })
  const nextMonth   = () => setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="w-5 h-5 rounded-md flex items-center justify-center border-none cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors">
          <IconChevronRight size={10} color="#64748B" style={{ transform: "rotate(180deg)" }} />
        </button>
        <span className="font-sans text-[11px] font-semibold capitalize" style={{ color: "#0F172A" }}>{monthName}</span>
        <button onClick={nextMonth} className="w-5 h-5 rounded-md flex items-center justify-center border-none cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors">
          <IconChevronRight size={10} color="#64748B" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-0.5">
        {["S","S","R","K","J","S","M"].map((d, i) => (
          <div key={i} className="text-center font-sans text-[8px] font-bold py-0.5" style={{ color: "#CBD5E1" }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 content-center gap-y-1">
        {cells.map((d, i) => (
          <div key={i} className="flex items-center justify-center">
            {d ? (
              <div className="relative w-6 h-6 flex items-center justify-center rounded-md font-sans text-[10px] font-medium transition-colors duration-150"
                style={{ backgroundColor: isToday(d) ? "#3B82F6" : "transparent", color: isToday(d) ? "#fff" : "#334155", fontWeight: isToday(d) ? "700" : "500" }}>
                {d}
                {hasSchedule(d) && !isToday(d) && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: "#3B82F6" }} />}
                {hasSchedule(d) && isToday(d)  && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2 pt-2" style={{ borderTop: "1px solid #F1F5F9" }}>
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /><span className="font-sans text-[9px]" style={{ color: "#94A3B8" }}>Jadwal</span></div>
        <div className="flex items-center gap-1"><div className="w-4 h-4 rounded-md flex items-center justify-center" style={{ backgroundColor: "#3B82F6" }}><span className="font-sans text-[7px] font-bold text-white">•</span></div><span className="font-sans text-[9px]" style={{ color: "#94A3B8" }}>Hari ini</span></div>
      </div>
    </div>
  )
}

function QuickAction({ label, to, icon: Icon, color, bg }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link to={to} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2 p-2.5 rounded-xl no-underline transition-all duration-200"
      style={{ backgroundColor: hovered ? bg : "#FAFAFA", border: `1px solid ${hovered ? color + "33" : "#F1F5F9"}`, transform: hovered ? "translateX(2px)" : "translateX(0)" }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{ backgroundColor: hovered ? color : bg, transform: hovered ? "scale(1.08)" : "scale(1)" }}>
        <Icon size={13} color={hovered ? "#FFFFFF" : color} />
      </div>
      <span className="font-sans text-xs font-medium" style={{ color: "#0F172A" }}>{label}</span>
    </Link>
  )
}

function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data, loading } = useApi("/api/admin/dashboard")
  const kpi            = data?.kpi            || {}
  const chartData      = data?.chart_7days    || []
  const recentBookings = data?.today_bookings  || []
  const todaySchedules = data?.today_schedules || []
  const totalBookings7d = chartData.reduce((s, d) => s + d.count, 0)

  const statusStyle = {
    pending:         { bg: "#FEF9EE", text: "#92400E", label: "Menunggu" },
    pending_payment: { bg: "#FEF9EE", text: "#92400E", label: "Belum Bayar" },
    confirmed:       { bg: "#F0FDF4", text: "#14532D", label: "Dikonfirmasi" },
    attended:        { bg: "#EFF6FF", text: "#1E40AF", label: "Selesai" },
    cancelled:       { bg: "#FEF2F2", text: "#7F1D1D", label: "Dibatalkan" },
  }

  const pieData = [
    { label: "Dikonfirmasi", value: kpi.confirmed_today  ?? 0, color: "#3B82F6" },
    { label: "Menunggu",     value: kpi.pending_today    ?? 0, color: "#F59E0B" },
    { label: "Selesai",      value: kpi.attended_today   ?? 0, color: "#10B981" },
    { label: "Dibatalkan",   value: kpi.cancelled_today  ?? 0, color: "#EF4444" },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-5">
      <style>{`
        .thin-scroll::-webkit-scrollbar { width: 3px; }
        .thin-scroll::-webkit-scrollbar-track { background: transparent; }
        .thin-scroll::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #93C5FD, #3B82F6); border-radius: 99px; }
        .thin-scroll::-webkit-scrollbar-thumb:hover { background: #2563EB; }
        .thin-scroll { scrollbar-width: thin; scrollbar-color: #3B82F6 transparent; }
      `}</style>

      <div>
        <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Selamat Datang, Admin!</h2>
        <p className="font-sans text-sm" style={{ color: "#64748B" }}>Pantau aktivitas studio Strive Pilates Bali hari ini.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IconUsers}    label="Total Member"     value={kpi.total_members ?? "–"}   sub="Member terdaftar" themeIndex={0} />
        <StatCard icon={IconCalendar} label="Booking Hari Ini" value={kpi.bookings_today ?? "–"}  sub="Sesi terjadwal"   themeIndex={1} />
        <StatCard icon={IconCheck}    label="Pendapatan Hari"
          value={kpi.revenue_today !== undefined ? `Rp ${parseInt(kpi.revenue_today).toLocaleString("id-ID")}` : "–"}
          sub="Hari ini" themeIndex={2} />
        <StatCard icon={IconClock}    label="Jadwal Aktif"     value={kpi.sessions_today ?? "–"}  sub="Hari ini" themeIndex={3} />
      </div>

      <div className="flex gap-4 items-stretch">

        {/* Bar chart */}
        <Card className="p-5 flex-[2] min-w-0 min-h-0 flex flex-col overflow-hidden h-[300px]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Booking 7 Hari Terakhir</h3>
              <p className="font-sans text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                Total <span className="font-semibold" style={{ color: "#3B82F6" }}>{totalBookings7d}</span> booking minggu ini
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(59,130,246,0.07)" }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3B82F6" }} />
              <span className="font-sans text-[9px] font-medium" style={{ color: "#3B82F6" }}>per hari</span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            {loading ? <div className="h-full rounded-xl animate-pulse bg-slate-100" /> : <BarChart data={chartData} />}
          </div>
          <div className="mt-4 pt-3 flex items-center gap-4" style={{ borderTop: "1px solid #F1F5F9" }}>
            {[
              { label: "Tertinggi", val: Math.max(...chartData.map(d => d.count), 0), color: "#3B82F6" },
              { label: "Rata-rata", val: chartData.filter(d=>d.count>0).length ? Math.round(totalBookings7d / chartData.filter(d=>d.count>0).length) : 0, color: "#8B5CF6" },
              { label: "Total",     val: totalBookings7d, color: "#10B981" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col">
                <span className="font-sans text-[10px]" style={{ color: "#94A3B8" }}>{s.label}</span>
                <span className="font-sans text-sm font-bold" style={{ color: s.color }}>{isNaN(s.val) ? 0 : s.val}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Pie chart */}
        <Card className="p-4 flex-[1] min-w-0 min-h-0 flex flex-col overflow-hidden h-[300px]">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Status Booking</h3>
            <span className="font-sans text-[9px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EFF6FF", color: "#3B82F6" }}>Hari ini</span>
          </div>
          {loading ? (
            <div className="flex-1 flex justify-center items-center">
              <div className="w-16 h-16 rounded-full animate-pulse bg-slate-100" />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-center my-3">
                <PieChart data={pieData} size={150} />
              </div>
              <div className="space-y-1.5 overflow-y-auto min-h-0">
                {pieData.length === 0 ? (
                  <p className="text-center font-sans text-[10px]" style={{ color: "#94A3B8" }}>Belum ada data</p>
                ) : pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="font-sans text-[10px]" style={{ color: "#64748B" }}>{d.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1 rounded-full" style={{ width: `${Math.round((d.value / pieData.reduce((s,x)=>s+x.value,0)) * 40)}px`, backgroundColor: d.color, opacity: 0.4 }} />
                      <span className="font-sans text-[10px] font-semibold" style={{ color: "#0F172A" }}>{d.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Kalender */}
        <Card className="p-4 flex-[1] min-w-0 min-h-0 flex flex-col overflow-hidden h-[300px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Kalender</h3>
            <Link to="/admin/schedules" className="font-sans text-[9px] font-medium no-underline px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#EFF6FF", color: "#3B82F6" }}>Jadwal →</Link>
          </div>
          <div className="flex-1 min-h-0">
            <MiniCalendar schedules={todaySchedules} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #F8FAFC" }}>
            <div>
              <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Booking Hari Ini</h3>
              <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>{recentBookings.length} booking</p>
            </div>
            <Link to="/admin/bookings" className="flex items-center gap-1 font-sans text-xs font-medium no-underline" style={{ color: "#3B82F6" }}>
              Lihat semua <IconChevronRight size={13} color="currentColor" />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-xl animate-pulse bg-slate-100" />)}</div>
          ) : recentBookings.length === 0 ? (
            <div className="p-12 text-center font-sans text-sm" style={{ color: "#94A3B8" }}>Belum ada booking hari ini</div>
          ) : (
            <div>
              {recentBookings.map((b, i) => {
                const st = statusStyle[b.status] || statusStyle.pending
                return (
                  <div key={b.id} className="flex items-center justify-between px-6 py-3.5 transition-colors duration-150 hover:bg-slate-50"
                    style={{ borderBottom: i < recentBookings.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)", boxShadow: "0 4px 10px rgba(59,130,246,0.25)" }}>
                        <span className="font-sans text-xs font-bold text-white">{b.member_name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-sans text-sm font-semibold truncate" style={{ color: "#0F172A" }}>{b.member_name}</div>
                        <div className="font-sans text-xs truncate" style={{ color: "#94A3B8" }}>{b.class_name} · {b.start_time?.substring(0,5)}</div>
                      </div>
                    </div>
                    <span className="flex-shrink-0 px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold ml-2"
                      style={{ backgroundColor: st.bg, color: st.text }}>{st.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #F8FAFC" }}>
              <div>
                <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Jadwal Hari Ini</h3>
                <p className="font-sans text-[10px]" style={{ color: "#94A3B8" }}>
                  {new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"short"})}
                </p>
              </div>
              <Link to="/admin/schedules" className="font-sans text-xs font-medium no-underline" style={{ color: "#3B82F6" }}>Kelola</Link>
            </div>
            {loading ? (
              <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-10 rounded-xl animate-pulse bg-slate-100" />)}</div>
            ) : todaySchedules.length === 0 ? (
              <div className="p-5 text-center">
                <p className="font-sans text-xs mb-2" style={{ color: "#94A3B8" }}>Tidak ada jadwal</p>
                <Link to="/admin/schedules" className="font-sans text-xs no-underline" style={{ color: "#3B82F6" }}>+ Tambah jadwal</Link>
              </div>
            ) : (
              <div className="thin-scroll p-3 space-y-1.5 overflow-y-auto" style={{ maxHeight: "200px" }}>
                {todaySchedules.map(s => (
                  <div key={s.id} className="p-2.5 rounded-xl transition-all duration-150 cursor-default"
                    style={{ backgroundColor: "#F8FAFC" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#EFF6FF"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#F8FAFC"}>
                    <div className="font-sans text-xs font-semibold mb-0.5" style={{ color: "#0F172A" }}>{s.class_name}</div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[10px]" style={{ color: "#64748B" }}>{s.start_time?.substring(0,5)} – {s.end_time?.substring(0,5)}</span>
                      <span className="font-sans text-[10px] font-semibold" style={{ color: "#3B82F6" }}>{s.booked_count}/{s.capacity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="font-sans text-sm font-semibold mb-3" style={{ color: "#0F172A" }}>Aksi Cepat</h3>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction label="Tambah Jadwal" to="/admin/schedules"   icon={IconCalendar} color="#3B82F6" bg="rgba(59,130,246,0.08)" />
              <QuickAction label="Data Member"   to="/admin/members"     icon={IconUsers}    color="#8B5CF6" bg="rgba(139,92,246,0.08)" />
              <QuickAction label="Kelola Kelas"  to="/admin/classes"     icon={IconPackage}  color="#10B981" bg="rgba(16,185,129,0.08)" />
              <QuickAction label="Instruktur"    to="/admin/instructors" icon={IconUser}     color="#F59E0B" bg="rgba(245,158,11,0.08)" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
