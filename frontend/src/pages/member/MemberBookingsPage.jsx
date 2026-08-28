import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { IconCalendar, IconChevronRight, IconX, IconCreditCard } from "../../components/icons/index"
import useInView from "../../hooks/useInView"
import useConfirm from "../../hooks/useConfirm"
import ConfirmModal from "../../components/modals/ConfirmModal"
import ButtonLoading from "../../components/ButtonLoading"

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView()
  return (
    <div ref={ref}
      className={`transition-all duration-500 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

const statusStyle = {
  pending:         { bg: "#FEF9EE", border: "#F5E8C0", text: "#8B6500", dot: "#F59E0B", label: "Menunggu Pembayaran" },
  pending_payment: { bg: "#FEF9EE", border: "#F5E8C0", text: "#8B6500", dot: "#F59E0B", label: "Menunggu Bayar" },
  confirmed:       { bg: "#F0FDF4", border: "#D5EDD8", text: "#1A6B2A", dot: "#10B981", label: "Dikonfirmasi" },
  attended:        { bg: "#FDF8EE", border: "#E8D5A8", text: "#6B4F0A", dot: "#C4973E", label: "Selesai" },
  cancelled:       { bg: "#FEF2F2", border: "#F0D4D4", text: "#8B1A1A", dot: "#EF4444", label: "Dibatalkan" },
  no_show:         { bg: "#FEF2F2", border: "#F0D4D4", text: "#8B1A1A", dot: "#EF4444", label: "Tidak Hadir" },
}

function IconReschedule({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <path d="M8 14h4l-2 4"/><path d="M16 14h-4l2 4"/>
    </svg>
  )
}

function IconCancel({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  )
}

// ─── Reschedule Modal ─────────────────────────────────────────────────────────
function RescheduleModal({ booking, onClose, onSuccess }) {
  const [schedules,  setSchedules]  = useState({})
  const [loading,    setLoading]    = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState("")
  const token   = localStorage.getItem("auth_token")
  const headers = { "Authorization": `Bearer ${token}`, "Accept": "application/json" }

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    fetch(`/api/schedules?date=${today}`)
      .then(r => r.json())
      .then(d => { setSchedules(d.data || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const allSlots = Object.entries(schedules).flatMap(([date, slots]) =>
    slots.map(s => ({ ...s, date })).filter(s => s.id !== booking.id && s.available_slots > 0)
  )

  const handleSubmit = async () => {
    if (!selectedId) return
    setSubmitting(true); setError("")
    try {
      const res  = await fetch(`/api/member/bookings/${booking.id}/reschedule`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ new_schedule_id: selectedId }),
      })
      const data = await res.json()
      if (res.ok) onSuccess()
      else setError(data.message || "Gagal reschedule booking.")
    } catch { setError("Terjadi kesalahan. Coba lagi.") }
    setSubmitting(false)
  }

  return (
    <>
      {/* Scrollbar style — hanya untuk scrollable list di modal ini */}
      <style>{`
        .reschedule-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .reschedule-scroll::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 99px;
        }
        .reschedule-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #C4973E, #8B6914);
          border-radius: 99px;
        }
        .reschedule-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #A0792A, #6B4F0A);
        }
        .reschedule-scroll {
          scrollbar-width: thin;
          scrollbar-color: #C4973E transparent;
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(26,18,8,0.5)", backdropFilter: "blur(4px)" }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5"
            style={{ borderBottom: "1px solid #F5F0EA" }}>
            <div>
              <h3 className="font-display text-xl text-warm-black">Pilih Jadwal Baru</h3>
              <p className="font-sans text-xs mt-0.5" style={{ color: "#9B8B77" }}>
                Reschedule dari "{booking.class_name}"
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors duration-150 hover:bg-[#EDE5D8]"
              style={{ backgroundColor: "#F5F0EA" }}>
              <IconX size={14} color="#6B5E4A" />
            </button>
          </div>

          {/* Body — scrollable list */}
          <div className="px-6 py-4">
            {error && (
              <div className="px-4 py-3 rounded-xl mb-4 font-sans text-sm"
                style={{ backgroundColor: "#FEF2F2", color: "#7F1D1D" }}>{error}</div>
            )}

            {loading ? (
              <div className="py-12 text-center font-sans text-sm" style={{ color: "#9B8B77" }}>
                Memuat jadwal...
              </div>
            ) : allSlots.length === 0 ? (
              <div className="py-12 text-center font-sans text-sm" style={{ color: "#9B8B77" }}>
                Tidak ada jadwal tersedia untuk reschedule
              </div>
            ) : (
              /* scrollbar tipis coklat hanya pada list ini */
              <div className="reschedule-scroll space-y-2 pr-1"
                style={{ maxHeight: "340px", overflowY: "auto" }}>
                {allSlots.map(slot => (
                  <button key={slot.id} onClick={() => setSelectedId(slot.id)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl text-left border-none cursor-pointer transition-all duration-200"
                    style={{
                      backgroundColor: selectedId === slot.id ? "#FEF9EE" : "#F8F5F0",
                      border: `1.5px solid ${selectedId === slot.id ? "#C4973E" : "transparent"}`,
                      boxShadow: selectedId === slot.id ? "0 4px 12px rgba(139,105,20,0.15)" : "none",
                    }}>
                    <div>
                      <div className="font-sans text-sm font-semibold" style={{ color: "#1A1208" }}>
                        {slot.class_name}
                      </div>
                      <div className="font-sans text-xs mt-0.5" style={{ color: "#9B8B77" }}>
                        {new Date(slot.date).toLocaleDateString("id-ID",{weekday:"short",day:"numeric",month:"short"})}
                        {" · "}{slot.start_time?.substring(0,5)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {selectedId === slot.id && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E)" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                            stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                      <div className="font-sans text-xs font-medium" style={{ color: "#9B8B77" }}>
                        {slot.available_slots}/{slot.capacity}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-5" style={{ borderTop: "1px solid #F5F0EA" }}>
            <button onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-sans text-sm font-medium border-none cursor-pointer transition-colors duration-150"
              style={{ backgroundColor: "#F5F0EA", color: "#6B5E4A" }}>
              Batal
            </button>
            <button onClick={handleSubmit} disabled={!selectedId || submitting}
              className="flex-1 py-3 rounded-2xl font-sans text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200"
              style={{
                background: "linear-gradient(145deg,#7A5C0E,#C4973E)",
                boxShadow: (!selectedId || submitting) ? "none" : "0 6px 16px rgba(107,79,10,0.28)",
                opacity: (!selectedId || submitting) ? 0.55 : 1,
                cursor: (!selectedId || submitting) ? "not-allowed" : "pointer",
              }}>
              {submitting ? <ButtonLoading variant="dots" /> : "Konfirmasi Reschedule"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({ booking, onCancel, onReschedule, cancelling }) {
  const [hovered, setHovered] = useState(false)
  const st            = statusStyle[booking.status] || statusStyle.pending
  const canCancel     = ["pending", "pending_payment", "confirmed"].includes(booking.status)
  const canReschedule = booking.status === "confirmed"
  const dateObj       = new Date(booking.date)

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.10)" : "0 2px 8px rgba(0,0,0,0.06)",
        border: `1px solid ${hovered ? "#E8D5A8" : "#F3F4F6"}`,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}>
      <div className="h-[3px]" style={{ background: `linear-gradient(90deg,${st.dot},${st.dot}55)` }} />
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-13 text-center rounded-xl py-2 px-2.5"
            style={{ background: "linear-gradient(145deg,#1A1208,#2D1F08)", minWidth: "52px" }}>
            <div className="font-sans text-[9px] font-bold text-bronze-light uppercase tracking-wide leading-none">
              {dateObj.toLocaleDateString("id-ID",{month:"short"})}
            </div>
            <div className="font-display text-2xl text-white leading-none my-0.5">{dateObj.getDate()}</div>
            <div className="font-sans text-[9px] text-[rgba(232,213,168,0.5)] leading-none">
              {dateObj.toLocaleDateString("id-ID",{weekday:"short"})}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="font-sans text-sm font-semibold text-warm-black leading-snug truncate">{booking.class_name}</div>
              <span className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold"
                style={{ backgroundColor: st.bg, color: st.text, border: `1px solid ${st.border}` }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: st.dot }} />
                {st.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="font-sans text-xs text-warm-text/55">
                {booking.start_time?.substring(0,5)}{booking.end_time?`–${booking.end_time.substring(0,5)}`:""}
              </span>
              {booking.instructor_name && (
                <><span className="text-warm-text/25">·</span>
                <span className="font-sans text-xs text-warm-text/55">{booking.instructor_name}</span></>
              )}
            </div>
          </div>
        </div>
        <div className="h-px bg-slate-100 my-3.5" />
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-mono text-[11px] text-warm-text/40">
              {booking.booking_code || `#${String(booking.id).padStart(5,"0")}`}
            </span>
            <span className="font-sans text-[10px] text-warm-text/30 ml-2">
              · {new Date(booking.created_at).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {(booking.status === "pending_payment" ||
              (booking.payment_status === "pending" && booking.status !== "cancelled")) && (
              <Link to={`/member/payment/${booking.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                  font-sans text-xs font-semibold text-white no-underline
                  transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E)", boxShadow: "0 4px 10px rgba(107,79,10,0.25)" }}>
                <IconCreditCard size={13} color="#FFFFFF" /> Bayar
              </Link>
            )}
            {canReschedule && (
              <button onClick={() => onReschedule(booking)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                  font-sans text-xs font-medium border-none cursor-pointer
                  transition-all duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: "#EFF6FF", color: "#1D5FA5" }}>
                <IconReschedule size={13} color="#1D5FA5" /> Reschedule
              </button>
            )}
            {canCancel && (
              <button onClick={() => onCancel(booking)} disabled={cancelling === booking.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                  font-sans text-xs font-medium border-none cursor-pointer
                  transition-all duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: "#FEF2F2", color: "#EF4444", opacity: cancelling===booking.id?0.6:1, cursor: cancelling===booking.id?"not-allowed":"pointer" }}>
                {cancelling === booking.id
                  ? <ButtonLoading variant="dots" />
                  : <><IconCancel size={13} color="#EF4444" /> Batalkan</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MemberBookingsPage() {
  const [bookings,          setBookings]          = useState([])
  const [loading,           setLoading]           = useState(true)
  const [filter,            setFilter]            = useState("all")
  const [cancelling,        setCancelling]        = useState(null)
  const [rescheduleBooking, setRescheduleBooking] = useState(null)
  const confirmModal = useConfirm()

  const token   = localStorage.getItem("auth_token")
  const headers = { "Authorization": `Bearer ${token}`, "Accept": "application/json" }

  const fetchBookings = () => {
    fetch("/api/member/bookings", { headers })
      .then(r => r.json())
      .then(d => { setBookings(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchBookings() }, [])

  const filtered = filter === "all"
    ? bookings
    : filter === "pending"
      ? bookings.filter(b => ["pending","pending_payment"].includes(b.status))
      : bookings.filter(b => b.status === filter)

  const doCancel = async (id) => {
    setCancelling(id)
    try {
      const res  = await fetch(`/api/member/bookings/${id}/cancel`, {
        method: "PATCH", headers: { ...headers, "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (res.ok) setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b))
      else alert(data.message || "Gagal membatalkan booking.")
    } catch {}
    setCancelling(null)
  }

  const handleCancel = (booking) => {
    confirmModal.open({
      title: "Batalkan Booking Ini?",
      message: `Booking "${booking.class_name}" pada ${new Date(booking.date).toLocaleDateString("id-ID",{day:"numeric",month:"long"})} akan dibatalkan.`,
      confirmLabel: "Ya, Batalkan", variant: "danger",
      onConfirm: () => doCancel(booking.id),
    })
  }

  const tabs = [
    { val: "all",       label: "Semua",        count: bookings.length },
    { val: "pending",   label: "Menunggu",     count: bookings.filter(b => ["pending","pending_payment"].includes(b.status)).length },
    { val: "confirmed", label: "Dikonfirmasi", count: bookings.filter(b => b.status === "confirmed").length },
    { val: "attended",  label: "Selesai",      count: bookings.filter(b => b.status === "attended").length },
    { val: "cancelled", label: "Dibatalkan",   count: bookings.filter(b => b.status === "cancelled").length },
  ]

  return (
    <div>
      <FadeIn>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h2 className="font-sans text-xl font-semibold text-warm-black mb-1">Booking Saya</h2>
            <p className="font-sans text-sm text-warm-text/60">{bookings.length} total booking</p>
          </div>
          <Link to="/schedule"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm font-medium
              text-white no-underline transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E,#A0792A)", boxShadow: "4px 4px 12px rgba(107,79,10,0.30)" }}>
            <IconCalendar size={16} color="white" /> + Booking Baru
          </Link>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="flex gap-2 flex-wrap mb-6 p-1 rounded-2xl w-fit bg-white"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {tabs.map(tab => (
            <button key={tab.val} onClick={() => setFilter(tab.val)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-sans text-sm
                font-medium border-none cursor-pointer transition-all duration-200"
              style={{
                background: filter===tab.val ? "linear-gradient(145deg,#7A5C0E,#C4973E)" : "transparent",
                color: filter===tab.val ? "#FFFFFF" : "#6B5E4A",
              }}>
              {tab.label}
              {tab.count > 0 && (
                <span className="text-[11px] px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: filter===tab.val?"rgba(255,255,255,0.25)":"#F3F4F6", color: filter===tab.val?"#FFFFFF":"#6B5E4A" }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <FadeIn>
          <div className="bg-white rounded-2xl p-16 text-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "linear-gradient(145deg,rgba(139,105,20,0.08),rgba(196,151,62,0.08))" }}>
              <IconCalendar size={36} color="#C4973E" />
            </div>
            <h3 className="font-sans text-base font-semibold text-warm-black mb-2">
              {filter==="all" ? "Belum ada booking" : `Tidak ada booking ${tabs.find(t=>t.val===filter)?.label.toLowerCase()}`}
            </h3>
            <p className="font-sans text-sm text-warm-text/50 mb-6">
              {filter==="all" ? "Yuk booking kelas pilates pertamamu!" : "Coba lihat tab lain atau booking kelas baru."}
            </p>
            <Link to="/schedule"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-sans text-sm
                font-medium text-white no-underline transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E,#A0792A)" }}>
              Lihat Jadwal <IconChevronRight size={15} color="white" />
            </Link>
          </div>
        </FadeIn>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking, i) => (
            <FadeIn key={booking.id} delay={i * 50}>
              <BookingCard booking={booking} onCancel={handleCancel} onReschedule={setRescheduleBooking} cancelling={cancelling} />
            </FadeIn>
          ))}
        </div>
      )}

      <ConfirmModal {...confirmModal.props} />
      {rescheduleBooking && (
        <RescheduleModal
          booking={rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
          onSuccess={() => { setRescheduleBooking(null); fetchBookings() }}
        />
      )}
    </div>
  )
}
