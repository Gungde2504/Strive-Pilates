import { useState, useEffect } from "react"
import { IconSearch, IconX, IconBookmark, IconChevronRight } from "../../components/icons/index"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json" })

const EVENT_MAP = {
  created: { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  updated: { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  deleted: { bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444" },
}

function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  )
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid #F8FAFC" }}>
      <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>Halaman {page} dari {totalPages}</p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs border-none cursor-pointer transition-all duration-150"
          style={{ backgroundColor: page===1?"#F8FAFC":"#F5F3FF", color: page===1?"#CBD5E1":"#7C3AED", cursor: page===1?"not-allowed":"pointer" }}>‹</button>
        {[...Array(totalPages)].map((_, i) => {
          const p = i + 1
          const show = p===1||p===totalPages||Math.abs(p-page)<=1
          const ellipsis = (p===2&&page>3)||(p===totalPages-1&&page<totalPages-2)
          if (!show&&!ellipsis) return null
          if (ellipsis) return <span key={p} className="font-sans text-xs" style={{ color: "#CBD5E1" }}>…</span>
          return (
            <button key={p} onClick={() => onChange(p)}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs font-semibold border-none cursor-pointer transition-all duration-150"
              style={{ background: page===p?"linear-gradient(145deg,#1E0A3C,#7C3AED)":"transparent", color: page===p?"#FFFFFF":"#64748B", boxShadow: page===p?"0 4px 10px rgba(124,58,237,0.25)":"none" }}>
              {p}
            </button>
          )
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs border-none cursor-pointer transition-all duration-150"
          style={{ backgroundColor: page===totalPages?"#F8FAFC":"#F5F3FF", color: page===totalPages?"#CBD5E1":"#7C3AED", cursor: page===totalPages?"not-allowed":"pointer" }}>›</button>
      </div>
    </div>
  )
}

export default function OwnerAuditTrailPage() {
  const [logs,     setLogs]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState("")
  const [page,     setPage]     = useState(1)
  const [total,    setTotal]    = useState(0)
  const [expanded, setExpanded] = useState(null)
  const PER_PAGE = 20

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, per_page: PER_PAGE })
    if (search) params.append("search", search)
    fetch(`/api/owner/audit-trail?${params}`, { headers: headers() })
      .then(r => r.json())
      .then(d => { setLogs(d.data || []); setTotal(d.total || 0); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, page])

  const totalPages = Math.ceil(total / PER_PAGE)
  const getModel   = (t) => t ? t.split("\\").pop() : "–"
  const evStyle    = (e) => EVENT_MAP[e] || { bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8" }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Audit Trail</h2>
        <p className="font-sans text-sm" style={{ color: "#64748B" }}>{total} total aktivitas tercatat</p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative" style={{ maxWidth: "360px" }}>
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <IconSearch size={14} color="#94A3B8" />
          </div>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari deskripsi / model..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl font-sans text-sm outline-none transition-all duration-200"
            style={{
              border: search ? "1.5px solid #7C3AED" : "1.5px solid #E2E8F0",
              backgroundColor: "#FFFFFF", color: "#0F172A",
              boxShadow: "6px 6px 14px rgba(0,0,0,0.06), -3px -3px 10px rgba(255,255,255,0.9)",
            }}
            onFocus={e => { e.target.style.border = "1.5px solid #7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.10)" }}
            onBlur={e => { e.target.style.border = search?"1.5px solid #7C3AED":"1.5px solid #E2E8F0"; e.target.style.boxShadow = "6px 6px 14px rgba(0,0,0,0.06), -3px -3px 10px rgba(255,255,255,0.9)" }} />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1) }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer p-0">
              <IconX size={13} color="#94A3B8" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl animate-pulse bg-slate-100" />)}</div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(124,58,237,0.08)" }}>
              <IconBookmark size={22} color="#7C3AED" />
            </div>
            <p className="font-sans text-sm font-medium mb-1" style={{ color: "#0F172A" }}>
              {search ? "Tidak ada hasil pencarian" : "Belum ada aktivitas tercatat"}
            </p>
            <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>
              {search ? "Coba ubah kata kunci pencarian" : "Audit trail tercatat otomatis saat data diubah"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                    {["Waktu", "Oleh", "Event", "Model", "ID", "Deskripsi", "Detail"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left font-sans text-[10px] font-bold tracking-widest uppercase"
                        style={{ color: "#94A3B8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => {
                    const ev = evStyle(log.event)
                    const isExp = expanded === log.id
                    return (
                      <>
                        <tr key={log.id}
                          className="transition-colors duration-150 hover:bg-slate-50/80"
                          style={{ borderBottom: isExp ? "none" : (i < logs.length-1 ? "1px solid #F8FAFC" : "none") }}>
                          <td className="px-5 py-3.5">
                            <div className="font-sans text-xs font-medium whitespace-nowrap" style={{ color: "#334155" }}>
                              {log.created_at ? new Date(log.created_at).toLocaleDateString("id-ID",{day:"numeric",month:"short"}) : "–"}
                            </div>
                            <div className="font-sans text-[10px]" style={{ color: "#94A3B8" }}>
                              {log.created_at ? new Date(log.created_at).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}) : ""}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-sans text-xs font-medium" style={{ color: "#0F172A" }}>
                              {log.causer_id ? `User #${log.causer_id}` : "System"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold"
                              style={{ backgroundColor: ev.bg, color: ev.color }}>
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ev.dot }} />
                              {log.event || "–"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-sans text-xs px-2 py-0.5 rounded-lg"
                              style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}>
                              {getModel(log.subject_type)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs" style={{ color: "#94A3B8" }}>
                            {log.subject_id || "–"}
                          </td>
                          <td className="px-5 py-3.5 font-sans text-xs" style={{ color: "#334155", maxWidth: "220px" }}>
                            <span className="line-clamp-2">{log.description}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            {log.attribute_changes && (
                              <button onClick={() => setExpanded(isExp ? null : log.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs
                                  font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                                style={{ backgroundColor: isExp?"#EDE9FE":"#F8FAFC", color: isExp?"#7C3AED":"#64748B" }}>
                                {isExp ? "Tutup" : "Lihat"}
                                <div style={{ transform: isExp?"rotate(90deg)":"rotate(0deg)", transition: "transform 0.2s ease" }}>
                                  <IconChevronRight size={11} color="currentColor" />
                                </div>
                              </button>
                            )}
                          </td>
                        </tr>
                        {isExp && log.attribute_changes && (
                          <tr key={`${log.id}-d`}>
                            <td colSpan={7}
                              style={{ backgroundColor: "#F8FAFC", borderBottom: i < logs.length-1 ? "1px solid #F8FAFC" : "none" }}>
                              <div className="px-5 py-4">
                                <p className="font-sans text-[10px] font-bold tracking-widest uppercase mb-2"
                                  style={{ color: "#94A3B8" }}>Perubahan Atribut</p>
                                <div className="font-mono text-xs p-3.5 rounded-xl whitespace-pre-wrap overflow-auto"
                                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", color: "#475569", maxHeight: "192px" }}>
                                  {JSON.stringify(log.attribute_changes, null, 2)}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  )
}
