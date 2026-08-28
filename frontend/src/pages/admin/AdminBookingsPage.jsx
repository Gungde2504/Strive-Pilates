import { useState, useEffect } from "react"
import useApi from "../../hooks/useApi"
import useConfirm from "../../hooks/useConfirm"
import ConfirmModal from "../../components/modals/ConfirmModal"
import { IconSearch, IconCheck, IconX, IconFilter } from "../../components/icons/index"
import ButtonLoading from "../../components/ButtonLoading"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json", "Content-Type": "application/json" })
const PAGE_SIZE = 10

// ─── Shared card ──────────────────────────────────────────────────────────────
function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  pending:         { bg: "#FEF9EE", color: "#B45309", dot: "#F59E0B", label: "Menunggu" },
  pending_payment: { bg: "#FEF9EE", color: "#B45309", dot: "#F59E0B", label: "Belum Bayar" },
  confirmed:       { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E", label: "Dikonfirmasi" },
  attended:        { bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6", label: "Hadir" },
  cancelled:       { bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444", label: "Dibatalkan" },
  no_show:         { bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444", label: "Tidak Hadir" },
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
      {s.label}
    </span>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid #F8FAFC" }}>
      <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>Halaman {page} dari {totalPages}</p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs border-none cursor-pointer transition-all duration-150"
          style={{ backgroundColor: page === 1 ? "#F8FAFC" : "#EFF6FF", color: page === 1 ? "#CBD5E1" : "#3B82F6", cursor: page === 1 ? "not-allowed" : "pointer" }}>
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
                background: page === p ? "linear-gradient(145deg,#1E3A8A,#3B82F6)" : "transparent",
                color: page === p ? "#FFFFFF" : "#64748B",
                boxShadow: page === p ? "0 4px 10px rgba(59,130,246,0.25)" : "none",
              }}>
              {p}
            </button>
          )
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs border-none cursor-pointer transition-all duration-150"
          style={{ backgroundColor: page === totalPages ? "#F8FAFC" : "#EFF6FF", color: page === totalPages ? "#CBD5E1" : "#3B82F6", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
          ›
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminBookingsPage() {
  const [bookings,    setBookings]    = useState([])
  const [filter,      setFilter]      = useState("all")
  const [search,      setSearch]      = useState("")
  const [page,        setPage]        = useState(1)
  const [actionId,    setActionId]    = useState(null)
  const confirmModal = useConfirm()

  const { data, loading, refetch } = useApi("/api/admin/bookings")
  useEffect(() => { if (data) setBookings(Array.isArray(data) ? data : []) }, [data])

  const handleConfirm = (id, memberName) => {
    confirmModal.open({
      title: "Konfirmasi Booking?",
      message: `Booking dari ${memberName || "member ini"} akan dikonfirmasi.`,
      confirmLabel: "Ya, Konfirmasi", variant: "default",
      onConfirm: async () => {
        setActionId(id)
        await fetch(`/api/admin/bookings/${id}/confirm`, { method: "PATCH", headers: headers() })
        setActionId(null); refetch()
      },
    })
  }

  const handleCancel = (id, memberName) => {
    confirmModal.open({
      title: "Batalkan Booking?",
      message: `Booking dari ${memberName || "member ini"} akan dibatalkan.`,
      confirmLabel: "Ya, Batalkan", variant: "danger",
      onConfirm: async () => {
        setActionId(id)
        await fetch(`/api/admin/bookings/${id}/cancel`, { method: "PATCH", headers: headers() })
        setActionId(null); refetch()
      },
    })
  }

  const tabs = [
    { val: "all",       label: "Semua",        count: bookings.length },
    { val: "pending",   label: "Menunggu",     count: bookings.filter(b => b.status === "pending").length },
    { val: "confirmed", label: "Dikonfirmasi", count: bookings.filter(b => b.status === "confirmed").length },
    { val: "attended",  label: "Hadir",        count: bookings.filter(b => b.status === "attended").length },
    { val: "cancelled", label: "Dibatalkan",   count: bookings.filter(b => b.status === "cancelled").length },
  ]

  const filtered = bookings
    .filter(b => filter === "all" || b.status === filter)
    .filter(b => !search ||
      b.member_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.class_name?.toLowerCase().includes(search.toLowerCase()))

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Kelola Booking</h2>
          <p className="font-sans text-sm" style={{ color: "#64748B" }}>{bookings.length} total booking</p>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <IconSearch size={14} color="#94A3B8" />
          </div>
          <input type="text" placeholder="Cari member atau kelas..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-10 pr-10 py-2.5 rounded-xl font-sans text-sm outline-none transition-all duration-200"
            style={{
              width: "260px",
              border: search ? "1.5px solid #3B82F6" : "1.5px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              color: "#0F172A",
              boxShadow: "6px 6px 14px rgba(0,0,0,0.06), -3px -3px 10px rgba(255,255,255,0.9)",
            }}
            onFocus={e => { e.target.style.border = "1.5px solid #3B82F6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.10)" }}
            onBlur={e => { e.target.style.border = search ? "1.5px solid #3B82F6" : "1.5px solid #E2E8F0"; e.target.style.boxShadow = "6px 6px 14px rgba(0,0,0,0.06), -3px -3px 10px rgba(255,255,255,0.9)" }} />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1) }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer p-0">
              <IconX size={13} color="#94A3B8" />
            </button>
          )}
        </div>
      </div>

      {/* ── FILTER TABS ──────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 flex-wrap mb-5 p-1 rounded-2xl w-fit"
        style={{
          backgroundColor: "#F8FAFC",
          boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(255,255,255,0.8)",
        }}>
        {tabs.map(tab => (
          <button key={tab.val} onClick={() => { setFilter(tab.val); setPage(1) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-sans text-sm font-medium border-none cursor-pointer transition-all duration-200"
            style={{
              background: filter === tab.val ? "linear-gradient(145deg,#1E3A8A,#3B82F6)" : "transparent",
              color: filter === tab.val ? "#FFFFFF" : "#64748B",
              boxShadow: filter === tab.val ? "0 4px 12px rgba(59,130,246,0.25)" : "none",
              transform: filter === tab.val ? "translateY(-1px)" : "translateY(0)",
            }}>
            {tab.label}
            {tab.count > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{
                  backgroundColor: filter === tab.val ? "rgba(255,255,255,0.25)" : "#E2E8F0",
                  color: filter === tab.val ? "#FFFFFF" : "#64748B",
                }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TABLE ────────────────────────────────────────────────────────── */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl animate-pulse bg-slate-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(59,130,246,0.08)" }}>
              <IconFilter size={22} color="#3B82F6" />
            </div>
            <p className="font-sans text-sm font-medium mb-1" style={{ color: "#0F172A" }}>Tidak ada booking ditemukan</p>
            <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                    {["Member", "Kelas", "Tanggal", "Waktu", "Status", "Pembayaran", "Aksi"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left font-sans text-[10px] font-bold tracking-widest uppercase"
                        style={{ color: "#94A3B8" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((b, i) => (
                    <tr key={b.id}
                      className="transition-colors duration-150 hover:bg-slate-50/80"
                      style={{ borderBottom: i < paginated.length - 1 ? "1px solid #F8FAFC" : "none" }}>

                      {/* Member */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)", boxShadow: "0 3px 8px rgba(59,130,246,0.22)" }}>
                            <span className="font-sans text-[10px] font-bold text-white">
                              {b.member_name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-sans text-sm font-semibold truncate" style={{ color: "#0F172A" }}>{b.member_name}</div>
                            <div className="font-sans text-[10px] truncate" style={{ color: "#94A3B8" }}>{b.member_email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Kelas */}
                      <td className="px-5 py-3.5 font-sans text-sm" style={{ color: "#334155" }}>{b.class_name}</td>

                      {/* Tanggal */}
                      <td className="px-5 py-3.5">
                        <div className="font-sans text-sm font-medium" style={{ color: "#334155" }}>
                          {b.date ? new Date(b.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-"}
                        </div>
                        <div className="font-sans text-[10px]" style={{ color: "#94A3B8" }}>
                          {b.date ? new Date(b.date).toLocaleDateString("id-ID", { year: "numeric" }) : ""}
                        </div>
                      </td>

                      {/* Waktu */}
                      <td className="px-5 py-3.5 font-sans text-sm font-medium" style={{ color: "#334155" }}>
                        {b.start_time?.substring(0, 5) || "-"}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>

                      {/* Pembayaran */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold"
                          style={{
                            backgroundColor: b.payment_status === "paid" ? "#F0FDF4" : "#FEF9EE",
                            color: b.payment_status === "paid" ? "#15803D" : "#B45309",
                          }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: b.payment_status === "paid" ? "#22C55E" : "#F59E0B" }} />
                          {b.payment_status === "paid" ? "Lunas" : "Belum Bayar"}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {b.status === "pending" && (
                            <button onClick={() => handleConfirm(b.id, b.member_name)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs
                                font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                              style={{ backgroundColor: "#F0FDF4", color: "#15803D" }}>
                              <IconCheck size={12} color="#15803D" />
                              Konfirmasi
                            </button>
                          )}
                          {["pending", "confirmed"].includes(b.status) && (
                            <button onClick={() => handleCancel(b.id, b.member_name)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs
                                font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                              style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
                              <IconX size={12} color="#DC2626" />
                              Batalkan
                            </button>
                          )}
                          {!["pending", "confirmed"].includes(b.status) && (
                            <span className="font-sans text-xs" style={{ color: "#CBD5E1" }}>–</span>
                          )}
                        </div>
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

      <ConfirmModal {...confirmModal.props} />
    </div>
  )
}
