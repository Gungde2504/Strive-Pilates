import { useState, useEffect } from "react"
import useApi from "../../hooks/useApi"
import { IconSearch, IconX, IconCheck, IconUser } from "../../components/icons/index"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json" })
const PAGE_SIZE = 10

function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  )
}

function StatusBadge({ active }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold"
      style={{ backgroundColor: active ? "#F0FDF4" : "#FEF2F2", color: active ? "#15803D" : "#B91C1C" }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: active ? "#22C55E" : "#EF4444" }} />
      {active ? "Aktif" : "Nonaktif"}
    </span>
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

export default function OwnerMembersPage() {
  const [members, setMembers] = useState([])
  const [search,  setSearch]  = useState("")
  const [page,    setPage]    = useState(1)

  const { data, loading, refetch } = useApi("/api/owner/members")
  useEffect(() => { if (data) setMembers(Array.isArray(data) ? data : (data.data || [])) }, [data])

  const handleToggle = async (id) => {
    await fetch(`/api/owner/members/${id}/toggle`, { method: "PATCH", headers: headers() })
    refetch()
  }

  const filtered   = members.filter(m =>
    !search ||
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Data Member</h2>
          <p className="font-sans text-sm" style={{ color: "#64748B" }}>{members.length} total member</p>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <IconSearch size={14} color="#94A3B8" />
          </div>
          <input type="text" placeholder="Cari member..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-10 pr-10 py-2.5 rounded-xl font-sans text-sm outline-none transition-all duration-200"
            style={{
              width: "260px",
              border: search ? "1.5px solid #7C3AED" : "1.5px solid #E2E8F0",
              backgroundColor: "#FFFFFF", color: "#0F172A",
              boxShadow: "6px 6px 14px rgba(0,0,0,0.06), -3px -3px 10px rgba(255,255,255,0.9)",
            }}
            onFocus={e => { e.target.style.border = "1.5px solid #7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.10)" }}
            onBlur={e => { e.target.style.border = search ? "1.5px solid #7C3AED" : "1.5px solid #E2E8F0"; e.target.style.boxShadow = "6px 6px 14px rgba(0,0,0,0.06), -3px -3px 10px rgba(255,255,255,0.9)" }} />
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
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse bg-slate-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(124,58,237,0.08)" }}>
              <IconUser size={22} color="#7C3AED" />
            </div>
            <p className="font-sans text-sm font-medium mb-1" style={{ color: "#0F172A" }}>Tidak ada member ditemukan</p>
            <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                    {["Member", "Email", "No. HP", "Bergabung", "Status", "Aksi"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left font-sans text-[10px] font-bold tracking-widest uppercase"
                        style={{ color: "#94A3B8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((m, i) => (
                    <tr key={m.id}
                      className="transition-colors duration-150 hover:bg-slate-50/80"
                      style={{ borderBottom: i < paginated.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: "linear-gradient(145deg,#1E0A3C,#7C3AED)", boxShadow: "0 3px 8px rgba(124,58,237,0.22)" }}>
                            <span className="font-sans text-xs font-bold text-white">{m.name?.charAt(0)?.toUpperCase()}</span>
                          </div>
                          <div className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>{m.name}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-sans text-sm" style={{ color: "#334155" }}>{m.email}</td>
                      <td className="px-5 py-3.5 font-sans text-sm" style={{ color: "#334155" }}>{m.phone_wa || "–"}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-sans text-sm" style={{ color: "#334155" }}>
                          {m.created_at ? new Date(m.created_at).toLocaleDateString("id-ID",{day:"numeric",month:"short"}) : "–"}
                        </div>
                        <div className="font-sans text-[10px]" style={{ color: "#94A3B8" }}>
                          {m.created_at ? new Date(m.created_at).toLocaleDateString("id-ID",{year:"numeric"}) : ""}
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge active={m.is_active} /></td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => handleToggle(m.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs
                            font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                          style={{ backgroundColor: m.is_active ? "#FEF2F2" : "#F0FDF4", color: m.is_active ? "#DC2626" : "#15803D" }}>
                          {m.is_active
                            ? <><IconX size={12} color="#DC2626" /> Nonaktifkan</>
                            : <><IconCheck size={12} color="#15803D" /> Aktifkan</>}
                        </button>
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
    </div>
  )
}
