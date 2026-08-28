import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  IconCalendar, IconUser, IconUsers, IconPackage,
  IconCheck, IconChevronRight, IconBarChart, IconRefresh,
} from "../../components/icons/index"
import useApi from "../../hooks/useApi"

const CHART_H = 110

// ─── Shared card ──────────────────────────────────────────────────────────────
function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
const STAT_THEMES = [
  { from: "#5B21B6", to: "#7C3AED", glow: "rgba(124,58,237,0.38)", shine: "rgba(196,181,253,0.28)" },
  { from: "#1E3A8A", to: "#3B82F6", glow: "rgba(59,130,246,0.38)", shine: "rgba(147,197,253,0.28)" },
  { from: "#065F46", to: "#10B981", glow: "rgba(16,185,129,0.38)", shine: "rgba(110,231,183,0.28)" },
  { from: "#92400E", to: "#F59E0B", glow: "rgba(245,158,11,0.38)", shine: "rgba(253,230,138,0.28)" },
]

function StatCard({ icon: Icon, label, value, sub, themeIndex = 0, delay = 0 }) {
  const [hovered, setHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const theme = STAT_THEMES[themeIndex]
  useEffect(() => { const t = setTimeout(() => setMounted(true), delay); return () => clearTimeout(t) }, [])

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl overflow-hidden cursor-default"
      style={{
        background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`,
        padding: "20px",
        transform: mounted ? (hovered ? "translateY(-5px) scale(1.015)" : "translateY(0) scale(1)") : "translateY(14px) scale(0.97)",
        opacity: mounted ? 1 : 0,
        boxShadow: hovered
          ? `0 20px 40px ${theme.glow}, 0 4px 12px rgba(0,0,0,0.15)`
          : `0 6px 20px ${theme.glow}, 0 2px 6px rgba(0,0,0,0.10)`,
        transition: mounted ? "all 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "opacity 0.5s ease, transform 0.5s ease",
      }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 10% 10%, ${theme.shine} 0%, transparent 60%)`, opacity: hovered ? 1 : 0.6, transition: "opacity 0.35s ease" }} />
      <div className="absolute bottom-0 inset-x-0 h-1/2 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.15), transparent)" }} />
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.15)",
            transform: hovered ? "scale(1.1) rotate(-5deg)" : "scale(1) rotate(0deg)",
            transition: "all 0.3s ease",
          }}>
          <Icon size={18} color="#FFFFFF" />
        </div>
        <div className="font-sans font-bold text-white leading-none mb-1"
          style={{ fontSize: "clamp(18px,2.5vw,26px)" }}>{value ?? "–"}</div>
        <div className="font-sans text-xs font-semibold text-white/85 mb-0.5">{label}</div>
        {sub && <div className="font-sans text-[10px] text-white/50">{sub}</div>}
      </div>
    </div>
  )
}

// ─── Bar chart ────────────────────────────────────────────────────────────────
// Tipis & rapat, label sumbu Y (0/mid/max) sejajar garis grid, sesuai referensi.
function formatShort(v) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}jt`
  if (v >= 1000) return `${Math.round(v / 1000)}rb`
  return `${Math.round(v)}`
}

function BarChart({ data, valueKey = "count", formatVal }) {
  const [animated, setAnimated] = useState(false)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const areaRef = useRef(null)

  useEffect(() => { const t = setTimeout(() => setAnimated(true), 150); return () => clearTimeout(t) }, [])

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

  const vals       = data.map(d => d[valueKey] || d.revenue || d.count || 0)
  const max         = Math.max(...vals, 1)
  const CHART_H_FIT = Math.max(size.h, 40)
  const barW        = size.w > 0 ? Math.min(20, Math.floor((size.w - (data.length - 1) * 6) / data.length)) : 14
  const GRID_LINES  = [1, 0.75, 0.5, 0.25]

  return (
    <div style={{ height: CHART_H + 34 }} className="flex flex-col">
      <div className="flex-1 min-h-0 flex">
        {/* Label sumbu Y */}
        <div className="relative flex-shrink-0" style={{ width: 30, height: "100%" }}>
          {GRID_LINES.map((g, i) => (
            <span key={i} className="absolute right-1.5 font-sans text-[8px] leading-none"
              style={{ top: `${(1 - g) * 100}%`, transform: "translateY(-50%)", color: "#CBD5E1" }}>
              {formatShort(max * g)}
            </span>
          ))}
          <span className="absolute right-1.5 bottom-0 font-sans text-[8px] leading-none" style={{ color: "#CBD5E1" }}>0</span>
        </div>

        {/* Area chart */}
        <div ref={areaRef} className="relative flex-1 min-h-0 overflow-visible">
          {/* Garis grid tipis */}
          <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: CHART_H_FIT }}>
            {GRID_LINES.map((g, i) => (
              <div key={i} className="absolute inset-x-0" style={{ top: `${(1 - g) * 100}%`, borderTop: "1px dashed #F1F5F9" }} />
            ))}
            <div className="absolute inset-x-0 bottom-0" style={{ borderTop: "1px solid #E2E8F0" }} />
          </div>

          {/* Bars — tipis & rapat */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-1.5" style={{ height: CHART_H_FIT }}>
            {data.map((d, i) => {
              const val   = vals[i]
              const barH  = Math.max(Math.round((val / max) * CHART_H_FIT), val > 0 ? 6 : 2)
              const tip   = formatVal ? formatVal(val) : val
              return (
                <div key={i} className="flex flex-col items-center justify-end group relative"
                  style={{ height: "100%", width: `${barW}px`, flexShrink: 0 }}>
                  <div className="absolute px-2 py-1 rounded-lg font-sans text-[9px] font-bold text-white whitespace-nowrap z-10
                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150"
                    style={{ bottom: barH + 6, backgroundColor: "#1E0A3C" }}>
                    {tip}
                  </div>
                  <div className="w-full transition-all duration-700 ease-out"
                    style={{
                      height: animated ? barH : 2,
                      borderRadius: "4px 4px 0 0",
                      background: val > 0 ? "linear-gradient(to top, #1E0A3C, #7C3AED)" : "#F1F5F9",
                      transitionDelay: `${i * 30}ms`,
                    }} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Label sumbu X */}
      <div className="flex mt-1.5">
        <div style={{ width: 30, flexShrink: 0 }} />
        <div className="flex-1 flex justify-center gap-1.5">
          {data.map((d, i) => (
            <div key={i} className="text-center font-sans text-[9px] font-medium" style={{ width: `${barW}px`, flexShrink: 0, color: "#CBD5E1" }}>
              {d.label || d.month || ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Pie chart (donut exploded, label per slice) ───────────────────────────────
function PieChart({ data, size = 130 }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const total   = data.reduce((s, d) => s + d.value, 0)
  const cx      = size / 2
  const cy      = size / 2
  const R       = size / 2 - 4
  const rInner  = R * 0.52
  const GAP     = 0.05
  const EXPLODE = 4
  const holeSize = rInner * 2 - 6

  if (total === 0) {
    return (
      <div className="rounded-full bg-slate-100 mx-auto flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="font-sans text-[10px]" style={{ color: "#CBD5E1" }}>Belum ada data</span>
      </div>
    )
  }

  let cumulative = -Math.PI / 2
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
  // jadi sama persis, path collapse jadi tidak kelihatan) — jadi untuk kasus
  // ini pakai <circle> + stroke tebal, bukan <path> arc.
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
                  className="font-sans" style={{ fontSize: 5.5, fontWeight: 600, fill: "rgba(255,255,255,0.9)" }}>
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
        <span className="font-sans text-sm font-bold leading-none" style={{ color: "#0F172A" }}>{total}</span>
        <span className="font-sans text-[5.5px] mt-0.5" style={{ color: "#CBD5E1" }}>transaksi</span>
      </div>
    </div>
  )
}

// ─── Quick action ─────────────────────────────────────────────────────────────
function QuickAction({ label, to, icon: Icon, color, bg }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link to={to} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3 p-3.5 rounded-2xl no-underline transition-all duration-200"
      style={{
        backgroundColor: hovered ? bg : "#FAFAFA",
        border: `1px solid ${hovered ? color + "33" : "#F1F5F9"}`,
        transform: hovered ? "translateX(4px)" : "translateX(0)",
        boxShadow: hovered ? `0 4px 14px ${color}22` : "none",
      }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{ backgroundColor: hovered ? color : bg, boxShadow: hovered ? `0 4px 12px ${color}44` : "none", transform: hovered ? "scale(1.08)" : "scale(1)" }}>
        <Icon size={15} color={hovered ? "#FFFFFF" : color} />
      </div>
      <span className="font-sans text-sm font-medium flex-1" style={{ color: "#0F172A" }}>{label}</span>
      <div style={{ transform: hovered ? "translateX(3px)" : "translateX(0)", transition: "transform 0.2s ease" }}>
        <IconChevronRight size={14} color={hovered ? color : "#CBD5E1"} />
      </div>
    </Link>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OwnerDashboardPage() {
  const { data, loading } = useApi("/api/owner/dashboard")
  const kpi                = data?.kpi                || {}
  const chartData          = data?.chart              || data?.revenue_chart || []
  const recentTransactions = data?.recent_transactions || []
  const topClasses         = data?.top_classes         || []

  // Pie: distribusi transaksi paid vs pending
  const paidCount    = recentTransactions.filter(t => t.status === "paid").length
  const pendingCount = recentTransactions.filter(t => t.status !== "paid").length
  const pieData = [
    { label: "Lunas",   value: paidCount,    color: "#7C3AED", colorLight: "#A78BFA" },
    { label: "Pending", value: pendingCount, color: "#F59E0B", colorLight: "#FCD34D" },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Dashboard Owner</h2>
        <p className="font-sans text-sm" style={{ color: "#64748B" }}>Ringkasan performa studio Strive Pilates Bali.</p>
      </div>

      {/* ── KPI ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IconPackage}  label="Total Pendapatan" value={kpi.total_revenue !== undefined ? `Rp ${parseInt(kpi.total_revenue||0).toLocaleString("id-ID")}` : "–"} sub="Bulan ini" themeIndex={0} delay={0} />
        <StatCard icon={IconCalendar} label="Total Booking"    value={kpi.total_bookings ?? "–"} sub="Bulan ini" themeIndex={1} delay={80} />
        <StatCard icon={IconUsers}    label="Total Member"     value={kpi.total_members ?? "–"}  sub="Terdaftar"  themeIndex={2} delay={160} />
        <StatCard icon={IconCheck}    label="Pendapatan Hari"  value={kpi.today_revenue !== undefined ? `Rp ${parseInt(kpi.today_revenue||0).toLocaleString("id-ID")}` : "–"} sub="Hari ini" themeIndex={3} delay={240} />
      </div>

      {/* ── CHARTS ROW ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Tren Pendapatan</h3>
              <p className="font-sans text-xs mt-0.5" style={{ color: "#94A3B8" }}>Berdasarkan data transaksi</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: "rgba(124,58,237,0.08)" }}>
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "linear-gradient(145deg,#1E0A3C,#7C3AED)" }} />
              <span className="font-sans text-xs font-medium" style={{ color: "#7C3AED" }}>Revenue</span>
            </div>
          </div>
          {loading
            ? <div className="h-28 rounded-xl animate-pulse bg-slate-100" />
            : <BarChart data={chartData} valueKey="revenue"
                formatVal={v => `Rp ${parseInt(v).toLocaleString("id-ID")}`} />}
        </Card>

        {/* Pie chart */}
        <Card className="p-6">
          <h3 className="font-sans text-sm font-semibold mb-1" style={{ color: "#0F172A" }}>Status Transaksi</h3>
          <p className="font-sans text-xs mb-4" style={{ color: "#94A3B8" }}>Terbaru</p>
          {loading ? (
            <div className="flex justify-center"><div className="w-24 h-24 rounded-full animate-pulse bg-slate-100" /></div>
          ) : (
            <>
              <div className="flex justify-center mb-4"><PieChart data={pieData} size={130} /></div>
              <div className="space-y-2">
                {pieData.length === 0
                  ? <p className="text-center font-sans text-xs" style={{ color: "#94A3B8" }}>Belum ada data</p>
                  : pieData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="font-sans text-xs" style={{ color: "#64748B" }}>{d.label}</span>
                      </div>
                      <span className="font-sans text-xs font-semibold" style={{ color: "#0F172A" }}>{d.value}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* ── CONTENT ROW ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent transactions */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #F8FAFC" }}>
            <div>
              <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Transaksi Terbaru</h3>
              <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>{recentTransactions.length} transaksi</p>
            </div>
            <Link to="/owner/finance" className="flex items-center gap-1 font-sans text-xs font-medium no-underline"
              style={{ color: "#7C3AED" }}>
              Lihat semua <IconChevronRight size={13} color="currentColor" />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-xl animate-pulse bg-slate-100" />)}</div>
          ) : recentTransactions.length === 0 ? (
            <div className="p-12 text-center font-sans text-sm" style={{ color: "#94A3B8" }}>Belum ada transaksi</div>
          ) : (
            <div>
              {recentTransactions.map((t, i) => (
                <div key={t.id}
                  className="flex items-center justify-between px-6 py-3.5 transition-colors duration-150 hover:bg-slate-50/80"
                  style={{ borderBottom: i < recentTransactions.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(145deg,#1E0A3C,#7C3AED)", boxShadow: "0 3px 8px rgba(124,58,237,0.22)" }}>
                      <span className="font-sans text-[10px] font-bold text-white">{t.member_name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-sans text-sm font-semibold truncate" style={{ color: "#0F172A" }}>{t.member_name}</div>
                      <div className="font-sans text-xs truncate" style={{ color: "#94A3B8" }}>
                        {t.class_name} · {t.created_at ? new Date(t.created_at).toLocaleDateString("id-ID",{day:"numeric",month:"short"}) : "-"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="font-sans text-sm font-semibold" style={{ color: "#7C3AED" }}>
                      Rp {parseInt(t.amount||0).toLocaleString("id-ID")}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-[10px] font-semibold"
                      style={{ backgroundColor: t.status==="paid"?"#F0FDF4":"#FEF9EE", color: t.status==="paid"?"#15803D":"#B45309" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.status==="paid"?"#22C55E":"#F59E0B" }} />
                      {t.status==="paid"?"Lunas":"Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top classes + Quick actions */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #F8FAFC" }}>
              <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Kelas Terpopuler</h3>
              <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>Berdasarkan booking</p>
            </div>
            {loading ? (
              <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-10 rounded-xl animate-pulse bg-slate-100" />)}</div>
            ) : topClasses.length === 0 ? (
              <div className="p-8 text-center font-sans text-xs" style={{ color: "#94A3B8" }}>Belum ada data</div>
            ) : (
              <div>
                {topClasses.map((c, i) => (
                  <div key={i}
                    className="flex items-center justify-between px-5 py-3 transition-colors duration-150 hover:bg-slate-50/80"
                    style={{ borderBottom: i < topClasses.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center font-sans text-xs font-bold"
                        style={{ backgroundColor: i===0?"rgba(124,58,237,0.12)":"#F8FAFC", color: i===0?"#7C3AED":"#94A3B8" }}>
                        {i + 1}
                      </div>
                      <span className="font-sans text-xs font-medium" style={{ color: "#334155" }}>{c.class_name||c.name}</span>
                    </div>
                    <span className="font-sans text-xs font-semibold" style={{ color: "#7C3AED" }}>
                      {c.total_bookings||c.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick actions */}
          <Card className="p-4">
            <h3 className="font-sans text-sm font-semibold mb-3" style={{ color: "#0F172A" }}>Aksi Cepat</h3>
            <div className="space-y-1.5">
              <QuickAction label="Lap. Keuangan"   to="/owner/finance"         icon={IconBarChart} color="#7C3AED" bg="rgba(124,58,237,0.08)" />
              <QuickAction label="Lap. Komparatif" to="/owner/finance/compare" icon={IconRefresh}  color="#3B82F6" bg="rgba(59,130,246,0.08)"  />
              <QuickAction label="Kelola Admin"    to="/owner/admins"          icon={IconUser}     color="#10B981" bg="rgba(16,185,129,0.08)"  />
              <QuickAction label="Data Member"     to="/owner/members"         icon={IconUsers}    color="#F59E0B" bg="rgba(245,158,11,0.08)"  />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
