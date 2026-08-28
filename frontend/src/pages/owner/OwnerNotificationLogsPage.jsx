import { useState, useEffect } from "react"
import { IconSearch, IconX, IconBell, IconChevronRight } from "../../components/icons/index"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json" })

const STATUS_MAP = {
  sent:    { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E", label: "Terkirim" },
  failed:  { bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444", label: "Gagal" },
  pending: { bg: "#FEF9EE", color: "#B45309", dot: "#F59E0B", label: "Pending" },
}

const EVENT_LABELS = {
  booking_created:"Booking Dibuat", booking_cancelled_member:"Booking Dibatalkan Member",
  booking_cancelled_admin:"Booking Dibatalkan Admin", booking_confirmed_admin:"Booking Dikonfirmasi Admin",
  booking_confirmed_staff:"Booking Confirmed (Staff)", booking_rescheduled:"Booking Reschedule",
  payment_success:"Pembayaran Sukses", payment_expired:"Pembayaran Expired",
  payment_rejected:"Pembayaran Ditolak", payment_received_staff:"Pembayaran Masuk (Staff)",
  package_purchased:"Paket Dibeli", package_almost_empty:"Paket Hampir Habis",
  package_expired:"Paket Expired", waiting_list_promoted:"Naik Waiting List",
  reminder_h1_member:"Reminder H-1 Member", reminder_h0_member:"Reminder H-0 Member",
  reminder_h1_instructor:"Reminder H-1 Instruktur", reminder_h0_instructor:"Reminder H-0 Instruktur",
  instructor_schedule_assigned:"Jadwal Instruktur Assigned", instructor_schedule_updated:"Jadwal Instruktur Diupdate",
  instructor_schedule_cancelled:"Jadwal Instruktur Dibatalkan", schedule_cancelled_member:"Jadwal Dibatalkan (Member)",
  registration_success:"Registrasi Berhasil", password_reset_request:"Reset Password Request",
  password_reset_success:"Reset Password Sukses", daily_report:"Laporan Harian",
}

function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  )
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8", label: status }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
      {s.label}
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
          style={{ backgroundColor: page===1?"#F8FAFC":"#F5F3FF", color: page===1?"#CBD5E1":"#7C3AED", cursor: page===1?"not-allowed":"pointer" }}>‹</button>
        {[...Array(totalPages)].map((_, i) => {
          const p = i + 1
          const show = p===1 || p===totalPages || Math.abs(p-page)<=1
          const ellipsis = (p===2 && page>3) || (p===totalPages-1 && page<totalPages-2)
          if (!show && !ellipsis) return null
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

export default function OwnerNotificationLogsPage() {
  const [logs,     setLogs]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState("all")
  const [search,   setSearch]   = useState("")
  const [page,     setPage]     = useState(1)
  const [total,    setTotal]    = useState(0)
  const [expanded, setExpanded] = useState(null)
  const PER_PAGE = 20

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, per_page: PER_PAGE })
    if (filter !== "all") params.append("status", filter)
    if (search) params.append("search", search)
    fetch(`/api/owner/notification-logs?${params}`, { headers: headers() })
      .then(r => r.json())
      .then(d => { setLogs(d.data || []); setTotal(d.total || 0); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filter, search, page])

  const totalPages = Math.ceil(total / PER_PAGE)

  const TABS = [
    { val: "all",     label: "Semua" },
    { val: "sent",    label: "Terkirim" },
    { val: "failed",  label: "Gagal" },
    { val: "pending", label: "Pending" },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Log Notifikasi WhatsApp</h2>
        <p className="font-sans text-sm" style={{ color: "#64748B" }}>{total} total notifikasi tercatat</p>
      </div>

      {/* Filters row */}
      <div className="flex gap-3 flex-wrap mb-5 items-center">
        {/* Tabs */}
        <div className="flex gap-1.5 p-1 rounded-2xl"
          style={{ backgroundColor: "#F8FAFC", boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(255,255,255,0.8)" }}>
          {TABS.map(t => (
            <button key={t.val} onClick={() => { setFilter(t.val); setPage(1) }}
              className="px-4 py-2 rounded-xl font-sans text-sm font-medium border-none cursor-pointer transition-all duration-200"
              style={{
                background: filter===t.val ? "linear-gradient(145deg,#1E0A3C,#7C3AED)" : "transparent",
                color: filter===t.val ? "#FFFFFF" : "#64748B",
                boxShadow: filter===t.val ? "0 4px 12px rgba(124,58,237,0.25)" : "none",
                transform: filter===t.val ? "translateY(-1px)" : "translateY(0)",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <IconSearch size={14} color="#94A3B8" />
          </div>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari nomor / event..."
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
              <IconBell size={22} color="#7C3AED" />
            </div>
            <p className="font-sans text-sm font-medium mb-1" style={{ color: "#0F172A" }}>Tidak ada log notifikasi</p>
            <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>Coba ubah filter atau kata kunci</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                    {["Waktu", "Nomor WA", "Event", "Status", "Percobaan", "Detail"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left font-sans text-[10px] font-bold tracking-widest uppercase"
                        style={{ color: "#94A3B8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <>
                      <tr key={log.id}
                        className="transition-colors duration-150 hover:bg-slate-50/80"
                        style={{ borderBottom: expanded===log.id ? "none" : (i < logs.length-1 ? "1px solid #F8FAFC" : "none") }}>
                        <td className="px-5 py-3.5">
                          <div className="font-sans text-xs font-medium" style={{ color: "#334155" }}>
                            {log.created_at ? new Date(log.created_at).toLocaleDateString("id-ID",{day:"numeric",month:"short"}) : "–"}
                          </div>
                          <div className="font-sans text-[10px]" style={{ color: "#94A3B8" }}>
                            {log.created_at ? new Date(log.created_at).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}) : ""}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold" style={{ color: "#0F172A" }}>{log.phone_wa}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-sans text-[10px] font-semibold"
                            style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}>
                            {EVENT_LABELS[log.event_type] || log.event_type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={log.status} /></td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg font-sans text-xs font-bold"
                            style={{ backgroundColor: "#F8FAFC", color: "#64748B" }}>
                            {log.attempt_count}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => setExpanded(expanded===log.id ? null : log.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs
                              font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                            style={{ backgroundColor: expanded===log.id?"#EDE9FE":"#F8FAFC", color: expanded===log.id?"#7C3AED":"#64748B" }}>
                            {expanded===log.id ? "Tutup" : "Lihat"}
                            <div style={{ transform: expanded===log.id?"rotate(90deg)":"rotate(0deg)", transition: "transform 0.2s ease" }}>
                              <IconChevronRight size={11} color="currentColor" />
                            </div>
                          </button>
                        </td>
                      </tr>
                      {expanded === log.id && (
                        <tr key={`${log.id}-detail`}>
                          <td colSpan={6} style={{ backgroundColor: "#F8FAFC", borderBottom: i < logs.length-1 ? "1px solid #F8FAFC" : "none" }}>
                            <div className="px-5 py-4 space-y-3">
                              <div>
                                <p className="font-sans text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#94A3B8" }}>Pesan Dikirim</p>
                                <div className="font-sans text-xs p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed"
                                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", color: "#0F172A" }}>
                                  {log.message_sent}
                                </div>
                              </div>
                              {log.response_raw && (
                                <div>
                                  <p className="font-sans text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#94A3B8" }}>Response Fonnte</p>
                                  <div className="font-mono text-xs p-3.5 rounded-xl"
                                    style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", color: "#475569" }}>
                                    {log.response_raw}
                                  </div>
                                </div>
                              )}
                              {log.sent_at && (
                                <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>
                                  Terkirim: {new Date(log.sent_at).toLocaleString("id-ID")}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
