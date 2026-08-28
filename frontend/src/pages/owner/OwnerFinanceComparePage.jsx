import { useState, useEffect } from "react"
import { IconRefresh } from "../../components/icons/index"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json" })

function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  )
}

const selectStyle = {
  flex: 1, padding: "9px 12px", borderRadius: "12px", fontFamily: "inherit",
  fontSize: "13px", outline: "none", border: "1.5px solid #E2E8F0",
  backgroundColor: "#FAFAFA", color: "#0F172A", cursor: "pointer", transition: "all 0.2s ease",
}

function PeriodSelect({ value, onChange, label, accent }) {
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]
  const onF = e => { e.target.style.border = `1.5px solid ${accent}`; e.target.style.backgroundColor = "#FFFFFF" }
  const onB = e => { e.target.style.border = "1.5px solid #E2E8F0"; e.target.style.backgroundColor = "#FAFAFA" }
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
        <span className="font-sans text-[10px] font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>{label}</span>
      </div>
      <div className="flex gap-2">
        <select value={value.month} onChange={e => onChange({ ...value, month: parseInt(e.target.value) })}
          style={selectStyle} onFocus={onF} onBlur={onB}>
          {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select value={value.year} onChange={e => onChange({ ...value, year: parseInt(e.target.value) })}
          style={selectStyle} onFocus={onF} onBlur={onB}>
          {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </Card>
  )
}

function CompareRow({ label, valA, valB, isCurrency = false, isLast = false }) {
  const numA = parseFloat(valA || 0)
  const numB = parseFloat(valB || 0)
  const pct  = numB > 0 ? (((numA - numB) / numB) * 100).toFixed(1) : null
  const up   = numA >= numB
  const fmt  = (v) => isCurrency ? `Rp ${parseInt(v).toLocaleString("id-ID")}` : v
  const maxVal = Math.max(numA, numB, 1)
  const barA   = Math.max((numA / maxVal) * 100, numA > 0 ? 6 : 0)
  const barB   = Math.max((numB / maxVal) * 100, numB > 0 ? 6 : 0)

  return (
    <div className="py-4" style={{ borderBottom: isLast ? "none" : "1px solid #F8FAFC" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans text-sm font-medium" style={{ color: "#334155" }}>{label}</span>
        {pct !== null && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-sans text-xs font-bold"
            style={{ backgroundColor: up ? "#F0FDF4" : "#FEF2F2", color: up ? "#15803D" : "#B91C1C" }}>
            {up ? "▲" : "▼"} {Math.abs(pct)}%
          </span>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-16 font-sans text-[10px] font-bold flex-shrink-0" style={{ color: "#7C3AED" }}>Periode A</div>
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-100">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${barA}%`, background: "linear-gradient(90deg,#1E0A3C,#7C3AED)", boxShadow: "0 0 6px rgba(124,58,237,0.3)" }} />
          </div>
          <div className="w-28 text-right font-sans text-xs font-bold flex-shrink-0" style={{ color: "#7C3AED" }}>{fmt(numA)}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 font-sans text-[10px] font-bold flex-shrink-0" style={{ color: "#94A3B8" }}>Periode B</div>
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-100">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${barB}%`, background: "linear-gradient(90deg,#94A3B8,#CBD5E1)" }} />
          </div>
          <div className="w-28 text-right font-sans text-xs font-semibold flex-shrink-0" style={{ color: "#64748B" }}>{fmt(numB)}</div>
        </div>
      </div>
    </div>
  )
}

function fmtMetric(v, isCurrency) {
  return isCurrency
    ? (v >= 1000000 ? `Rp ${(v / 1000000).toFixed(1)}jt` : `Rp ${parseInt(v).toLocaleString("id-ID")}`)
    : v
}

// Shell seragam untuk tiap card metrik: judul, area chart, footer nilai A/B
function MetricCard({ title, valA, valB, labelA, labelB, isCurrency, children }) {
  return (
    <Card className="p-4 flex flex-col">
      <div className="font-sans text-xs font-semibold mb-3 truncate" style={{ color: "#0F172A" }}>{title}</div>
      <div className="flex-1 flex items-center justify-center" style={{ minHeight: 84 }}>{children}</div>
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #F8FAFC" }}>
        <div className="text-center flex-1 min-w-0">
          <div className="font-sans text-[8px] font-bold truncate" style={{ color: "#7C3AED" }}>{labelA}</div>
          <div className="font-sans text-[11px] font-bold truncate" style={{ color: "#0F172A" }}>{fmtMetric(valA, isCurrency)}</div>
        </div>
        <div className="w-px h-6 flex-shrink-0" style={{ backgroundColor: "#F1F5F9" }} />
        <div className="text-center flex-1 min-w-0">
          <div className="font-sans text-[8px] font-bold truncate" style={{ color: "#94A3B8" }}>{labelB}</div>
          <div className="font-sans text-[11px] font-bold truncate" style={{ color: "#64748B" }}>{fmtMetric(valB, isCurrency)}</div>
        </div>
      </div>
    </Card>
  )
}

// 1. Bar chart — dipakai untuk Pendapatan
function BarCompareMini({ valA, valB }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 250); return () => clearTimeout(t) }, [])
  const max = Math.max(valA, valB, 1)
  const H   = 72
  const hA  = Math.max(Math.round((valA / max) * H), valA > 0 ? 8 : 2)
  const hB  = Math.max(Math.round((valB / max) * H), valB > 0 ? 8 : 2)
  return (
    <div className="flex items-end gap-3" style={{ height: H }}>
      <div className="rounded-t-lg transition-all duration-700 ease-out" style={{ width: 26, height: animated ? hA : 2, background: "linear-gradient(to top,#1E0A3C,#7C3AED)" }} />
      <div className="rounded-t-lg transition-all duration-700 ease-out" style={{ width: 26, height: animated ? hB : 2, background: "linear-gradient(to top,#94A3B8,#CBD5E1)", transitionDelay: "60ms" }} />
    </div>
  )
}

// 2. Progress ring (donut) — dipakai untuk Booking: proporsi A dari total A+B
function RingCompareMini({ valA, valB }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 250); return () => clearTimeout(t) }, [])
  const total = valA + valB
  const pctA  = total > 0 ? valA / total : 0
  const size = 84, cx = size / 2, cy = size / 2, R = size / 2 - 6
  const circumference = 2 * Math.PI * R
  const dash = animated ? pctA * circumference : 0
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F1F5F9" strokeWidth={9} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#7C3AED" strokeWidth={9}
          strokeDasharray={`${dash} ${circumference - dash}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.34,1.1,0.64,1)" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-sans text-sm font-bold" style={{ color: "#0F172A" }}>{Math.round(pctA * 100)}%</span>
      </div>
    </div>
  )
}

// 3. Line / dumbbell — dipakai untuk Member Baru: garis dari B (kiri) ke A (kanan)
function LineCompareMini({ valA, valB }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 250); return () => clearTimeout(t) }, [])
  const max = Math.max(valA, valB, 1)
  const w = 100, h = 76, padY = 14, xB = 22, xA = w - 22
  const yA = padY + (1 - valA / max) * (h - padY * 2)
  const yB = padY + (1 - valB / max) * (h - padY * 2)
  const up = valA >= valB
  return (
    <svg width={w} height={h}>
      <line x1={xB} y1={h - padY} x2={xB} y2={yB} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="2 2" />
      <line x1={xA} y1={h - padY} x2={xA} y2={yA} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="2 2" />
      <line x1={xB} y1={yB} x2={animated ? xA : xB} y2={animated ? yA : yB}
        stroke={up ? "#7C3AED" : "#F59E0B"} strokeWidth={2.5} strokeLinecap="round"
        style={{ transition: "x2 0.7s ease, y2 0.7s ease" }} />
      <circle cx={xB} cy={yB} r={5} fill="#94A3B8" />
      <circle cx={xA} cy={animated ? yA : yB} r={5} fill={up ? "#7C3AED" : "#F59E0B"} style={{ transition: "cy 0.7s ease" }} />
    </svg>
  )
}

// 4. Horizontal bar — dipakai untuk Avg/Hari
function HBarCompareMini({ valA, valB }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 250); return () => clearTimeout(t) }, [])
  const max = Math.max(valA, valB, 1)
  const wA  = Math.max((valA / max) * 100, valA > 0 ? 8 : 2)
  const wB  = Math.max((valB / max) * 100, valB > 0 ? 8 : 2)
  return (
    <div className="w-full space-y-2.5 px-1">
      <div className="h-2.5 rounded-full overflow-hidden bg-slate-100">
        <div className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${animated ? wA : 0}%`, background: "linear-gradient(90deg,#1E0A3C,#7C3AED)" }} />
      </div>
      <div className="h-2.5 rounded-full overflow-hidden bg-slate-100">
        <div className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${animated ? wB : 0}%`, background: "linear-gradient(90deg,#94A3B8,#CBD5E1)", transitionDelay: "60ms" }} />
      </div>
    </div>
  )
}

// 5. Radial gauge — dipakai untuk Dibatalkan: makin besar porsi A (periode ini),
// makin merah (indikasi buruk karena ini metrik yang idealnya kecil)
function GaugeCompareMini({ valA, valB }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 250); return () => clearTimeout(t) }, [])
  const total = valA + valB
  const pctA  = total > 0 ? valA / total : 0
  const size = 84, cx = size / 2, cy = size / 2, R = size / 2 - 6
  const circumference = 2 * Math.PI * R
  const dash = animated ? pctA * circumference : 0
  const color = pctA > 0.5 ? "#EF4444" : "#7C3AED"
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F1F5F9" strokeWidth={9} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={color} strokeWidth={9}
          strokeDasharray={`${dash} ${circumference - dash}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.34,1.1,0.64,1)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-sans text-sm font-bold" style={{ color: "#0F172A" }}>{valA}</span>
        <span className="font-sans text-[8px]" style={{ color: "#CBD5E1" }}>vs {valB}</span>
      </div>
    </div>
  )
}

export default function OwnerFinanceComparePage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [periodA, setPeriodA] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 })
  const [periodB, setPeriodB] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() === 0 ? 12 : new Date().getMonth() })

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ year_a: periodA.year, month_a: periodA.month, year_b: periodB.year, month_b: periodB.month })
    fetch(`/api/owner/finance/compare?${params}`, { headers: headers() })
      .then(r => r.json())
      .then(d => { setData(d.data || d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [periodA, periodB])

  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]
  const a = data?.period_a || {}
  const b = data?.period_b || {}

  const labelA = `${months[(periodA.month||1)-1]} ${periodA.year}`
  const labelB = `${months[(periodB.month||1)-1]} ${periodB.year}`

  const totalA = parseFloat(a.total_revenue || 0)
  const totalB = parseFloat(b.total_revenue || 0)
  const winner = totalA > totalB ? "A" : totalB > totalA ? "B" : null
  const winPct = totalB > 0 ? Math.abs(((totalA - totalB) / totalB) * 100).toFixed(1) : null

  // Data untuk grid 5 card metrik

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Laporan Komparatif</h2>
        <p className="font-sans text-sm" style={{ color: "#64748B" }}>Bandingkan pendapatan antar dua periode</p>
      </div>

      {/* Period selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <PeriodSelect value={periodA} onChange={setPeriodA} label="Periode A (Pembanding)" accent="#7C3AED" />
        <PeriodSelect value={periodB} onChange={setPeriodB} label="Periode B (Dasar)" accent="#94A3B8" />
      </div>

      {/* Summary banner */}
      {!loading && winner && (
        <div className="rounded-2xl p-5 mb-5 flex items-center justify-between flex-wrap gap-3"
          style={{ background: winner==="A" ? "linear-gradient(135deg,#1E0A3C,#4C1D95)" : "linear-gradient(135deg,#1E293B,#334155)" }}>
          <div>
            <p className="font-sans text-[10px] tracking-widest uppercase mb-1" style={{ color: "rgba(167,139,250,0.7)" }}>HASIL PERBANDINGAN</p>
            <p className="font-sans text-base font-semibold text-white">
              Periode {winner} ({winner==="A" ? labelA : labelB}) lebih tinggi
            </p>
          </div>
          {winPct && (
            <div className="px-4 py-2 rounded-2xl"
              style={{ backgroundColor: "rgba(124,58,237,0.25)", border: "1px solid rgba(167,139,250,0.3)" }}>
              <span className="font-sans text-lg font-bold" style={{ color: "#C4B5FD" }}>+{winPct}%</span>
            </div>
          )}
        </div>
      )}

      {/* ── BAR CHART CARD ─────────────────────────────────────────────── */}
      <Card className="p-6 mb-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.08)" }}>
            <IconRefresh size={15} color="#7C3AED" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Visualisasi Perbandingan</h3>
            <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>{labelA} vs {labelB}</p>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-40 rounded-2xl animate-pulse bg-slate-100" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard title="Pendapatan" valA={totalA} valB={totalB} labelA={labelA} labelB={labelB} isCurrency>
              <BarCompareMini valA={totalA} valB={totalB} />
            </MetricCard>
            <MetricCard title="Booking" valA={a.total_bookings || 0} valB={b.total_bookings || 0} labelA={labelA} labelB={labelB}>
              <RingCompareMini valA={a.total_bookings || 0} valB={b.total_bookings || 0} />
            </MetricCard>
            <MetricCard title="Member Baru" valA={a.new_members || 0} valB={b.new_members || 0} labelA={labelA} labelB={labelB}>
              <LineCompareMini valA={a.new_members || 0} valB={b.new_members || 0} />
            </MetricCard>
            <MetricCard title="Avg/Hari" valA={a.avg_daily_revenue || 0} valB={b.avg_daily_revenue || 0} labelA={labelA} labelB={labelB} isCurrency>
              <HBarCompareMini valA={a.avg_daily_revenue || 0} valB={b.avg_daily_revenue || 0} />
            </MetricCard>
            <MetricCard title="Dibatalkan" valA={a.cancelled_bookings || 0} valB={b.cancelled_bookings || 0} labelA={labelA} labelB={labelB}>
              <GaugeCompareMini valA={a.cancelled_bookings || 0} valB={b.cancelled_bookings || 0} />
            </MetricCard>
          </div>
        )}
      </Card>

      {/* ── DETAIL COMPARE ROWS ────────────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.08)" }}>
            <IconRefresh size={15} color="#7C3AED" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>{labelA} vs {labelB}</h3>
            <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>Perbandingan detail metrik</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 rounded-lg animate-pulse bg-slate-100 w-32" />
                <div className="h-2.5 rounded-full animate-pulse bg-slate-100" />
                <div className="h-2.5 rounded-full animate-pulse bg-slate-100 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <CompareRow label="Total Pendapatan"   valA={a.total_revenue}      valB={b.total_revenue}      isCurrency />
            <CompareRow label="Total Booking"      valA={a.total_bookings}     valB={b.total_bookings} />
            <CompareRow label="Member Baru"        valA={a.new_members}        valB={b.new_members} />
            <CompareRow label="Rata-rata/Hari"     valA={a.avg_daily_revenue}  valB={b.avg_daily_revenue}  isCurrency />
            <CompareRow label="Booking Dibatalkan" valA={a.cancelled_bookings} valB={b.cancelled_bookings} isLast />
          </>
        )}

        {!loading && (
          <div className="flex items-center gap-5 mt-5 pt-4" style={{ borderTop: "1px solid #F8FAFC" }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1.5 rounded-full" style={{ background: "linear-gradient(90deg,#1E0A3C,#7C3AED)" }} />
              <span className="font-sans text-xs font-medium" style={{ color: "#7C3AED" }}>{labelA}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1.5 rounded-full bg-slate-300" />
              <span className="font-sans text-xs font-medium" style={{ color: "#94A3B8" }}>{labelB}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
