import { useState, useEffect } from "react"
import { IconFilter } from "../../components/icons/index"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json" })
const PAGE_SIZE = 10

// ─── Shared ───────────────────────────────────────────────────────────────────
function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  )
}

const selectStyle = {
  padding: "9px 14px", borderRadius: "12px", fontFamily: "inherit",
  fontSize: "13px", outline: "none", border: "1.5px solid #E2E8F0",
  backgroundColor: "#FFFFFF", color: "#0F172A", cursor: "pointer",
  boxShadow: "6px 6px 14px rgba(0,0,0,0.06), -3px -3px 10px rgba(255,255,255,0.9)",
  transition: "all 0.2s ease",
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid #F8FAFC" }}>
      <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>Halaman {page} dari {totalPages}</p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs border-none cursor-pointer transition-all duration-150"
          style={{ backgroundColor: page === 1 ? "#F8FAFC" : "#F5F3FF", color: page === 1 ? "#CBD5E1" : "#7C3AED", cursor: page === 1 ? "not-allowed" : "pointer" }}>
          ‹
        </button>
        {[...Array(totalPages)].map((_, i) => {
          const p = i + 1
          const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1
          const ellipsis = (p === 2 && page > 3) || (p === totalPages - 1 && page < totalPages - 2)
          if (!show && !ellipsis) return null
          if (ellipsis) return <span key={p} className="font-sans text-xs" style={{ color: "#CBD5E1" }}>…</span>
          return (
            <button key={p} onClick={() => onChange(p)}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs font-semibold border-none cursor-pointer transition-all duration-150"
              style={{
                background: page === p ? "linear-gradient(145deg,#1E0A3C,#7C3AED)" : "transparent",
                color: page === p ? "#FFFFFF" : "#64748B",
                boxShadow: page === p ? "0 4px 10px rgba(124,58,237,0.25)" : "none",
              }}>
              {p}
            </button>
          )
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs border-none cursor-pointer transition-all duration-150"
          style={{ backgroundColor: page === totalPages ? "#F8FAFC" : "#F5F3FF", color: page === totalPages ? "#CBD5E1" : "#7C3AED", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
          ›
        </button>
      </div>
    </div>
  )
}

export default function OwnerFinancePage() {
  const [period,  setPeriod]  = useState("monthly")
  const [year,    setYear]    = useState(new Date().getFullYear())
  const [month,   setMonth]   = useState(new Date().getMonth() + 1)
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)

  useEffect(() => {
    setLoading(true)
    setPage(1)
    const params = new URLSearchParams({ period, year, month })
    fetch(`/api/owner/finance?${params}`, { headers: headers() })
      .then(r => r.json())
      .then(d => { setData(d.data || d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [period, year, month])

  const summary      = data?.summary      || {}
  const transactions = data?.transactions  || []
  const byClass      = data?.by_class      || []
  const months       = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE)
  const paginated  = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const summaryCards = [
    { label: "Total Pendapatan", value: `Rp ${parseInt(summary.total_revenue||0).toLocaleString("id-ID")}`, color: "#7C3AED", dot: "#7C3AED" },
    { label: "Total Transaksi",  value: summary.total_transactions ?? "–",                                   color: "#3B82F6", dot: "#3B82F6" },
    { label: "Rata-rata/Hari",   value: `Rp ${parseInt(summary.avg_daily||0).toLocaleString("id-ID")}`,     color: "#10B981", dot: "#10B981" },
    { label: "Tingkat Sukses",   value: summary.success_rate ? `${summary.success_rate}%` : "–",            color: "#F59E0B", dot: "#F59E0B" },
  ]

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Laporan Keuangan</h2>
          <p className="font-sans text-sm" style={{ color: "#64748B" }}>Ringkasan pendapatan dan transaksi</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ backgroundColor: "rgba(124,58,237,0.08)" }}>
            <IconFilter size={13} color="#7C3AED" />
            <span className="font-sans text-xs font-medium" style={{ color: "#7C3AED" }}>Filter</span>
          </div>
          <select value={period} onChange={e => setPeriod(e.target.value)} style={selectStyle}
            onFocus={e => e.target.style.border = "1.5px solid #7C3AED"}
            onBlur={e => e.target.style.border = "1.5px solid #E2E8F0"}>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </select>
          {period === "monthly" && (
            <select value={month} onChange={e => setMonth(e.target.value)} style={selectStyle}
              onFocus={e => e.target.style.border = "1.5px solid #7C3AED"}
              onBlur={e => e.target.style.border = "1.5px solid #E2E8F0"}>
              {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          )}
          <select value={year} onChange={e => setYear(e.target.value)} style={selectStyle}
            onFocus={e => e.target.style.border = "1.5px solid #7C3AED"}
            onBlur={e => e.target.style.border = "1.5px solid #E2E8F0"}>
            {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* ── SUMMARY CARDS ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((s, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.dot }} />
              <span className="font-sans text-[10px] font-bold tracking-widest uppercase" style={{ color: "#94A3B8" }}>{s.label}</span>
            </div>
            <div className="font-sans text-lg font-bold truncate" style={{ color: "#0F172A" }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* ── CONTENT GRID ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Transactions table */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #F8FAFC" }}>
            <div>
              <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Riwayat Transaksi</h3>
              <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>{transactions.length} transaksi</p>
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl animate-pulse bg-slate-100" />)}</div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center font-sans text-sm" style={{ color: "#94A3B8" }}>Tidak ada transaksi</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                      {["Member", "Kelas", "Tanggal", "Jumlah", "Metode"].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left font-sans text-[10px] font-bold tracking-widest uppercase"
                          style={{ color: "#94A3B8" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((t, i) => (
                      <tr key={t.id}
                        className="transition-colors duration-150 hover:bg-slate-50/80"
                        style={{ borderBottom: i < paginated.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: "linear-gradient(145deg,#1E0A3C,#7C3AED)", boxShadow: "0 3px 8px rgba(124,58,237,0.22)" }}>
                              <span className="font-sans text-[10px] font-bold text-white">{t.member_name?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <span className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>{t.member_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-sans text-sm" style={{ color: "#334155" }}>{t.class_name}</td>
                        <td className="px-5 py-3.5">
                          <div className="font-sans text-sm" style={{ color: "#334155" }}>
                            {t.paid_at ? new Date(t.paid_at).toLocaleDateString("id-ID",{day:"numeric",month:"short"}) : "–"}
                          </div>
                          <div className="font-sans text-[10px]" style={{ color: "#94A3B8" }}>
                            {t.paid_at ? new Date(t.paid_at).toLocaleDateString("id-ID",{year:"numeric"}) : ""}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-sans text-sm font-bold" style={{ color: "#7C3AED" }}>
                          Rp {parseInt(t.amount||0).toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold"
                            style={{ backgroundColor: "#F5F3FF", color: "#7C3AED" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                            {t.payment_method || "Midtrans"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </Card>

        {/* Per kelas */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #F8FAFC" }}>
            <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Pendapatan per Kelas</h3>
            <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>Berdasarkan periode</p>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse bg-slate-100" />)}</div>
          ) : byClass.length === 0 ? (
            <div className="p-10 text-center font-sans text-sm" style={{ color: "#94A3B8" }}>Belum ada data</div>
          ) : (
            <div>
              {byClass.map((c, i) => {
                const maxRev = byClass[0]?.revenue || 1
                const pct    = Math.min((c.revenue / maxRev) * 100, 100)
                return (
                  <div key={i} className="px-5 py-4 transition-colors duration-150 hover:bg-slate-50/80"
                    style={{ borderBottom: i < byClass.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-sans text-xs font-semibold" style={{ color: "#0F172A" }}>{c.class_name}</span>
                      <span className="font-sans text-xs font-bold" style={{ color: "#7C3AED" }}>
                        Rp {parseInt(c.revenue||0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#1E0A3C,#7C3AED)", boxShadow: "0 0 6px rgba(124,58,237,0.3)" }} />
                      </div>
                      <span className="font-sans text-[10px] flex-shrink-0" style={{ color: "#94A3B8" }}>
                        {c.total_bookings} booking
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
