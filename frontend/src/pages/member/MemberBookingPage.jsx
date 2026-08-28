import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { IconCalendar, IconUser, IconClock, IconCheck, IconX } from "../../components/icons/index"
import LoadingSpinner from "../../components/LoadingSpinner"
import ButtonLoading from "../../components/ButtonLoading"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({
  Authorization: `Bearer ${token()}`,
  Accept: "application/json",
  "Content-Type": "application/json",
})

function StepIndicator({ step }) {
  const steps = [
    { key: "detail",  num: "1", label: "Detail" },
    { key: "payment", num: "2", label: "Pembayaran" },
    { key: "success", num: "3", label: "Selesai" },
  ]
  const currentIdx = steps.findIndex(s => s.key === step)
  return (
    <div className="flex items-center gap-0 mb-7">
      {steps.map((s, i) => {
        const done   = currentIdx > i
        const active = currentIdx === i
        return (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-sans text-xs font-bold transition-all duration-300"
                style={{ backgroundColor: done ? "#C4973E" : active ? "#1A1208" : "#E5E7EB", color: done || active ? "#FFFFFF" : "#9CA3AF", boxShadow: active ? "0 0 0 4px rgba(26,18,8,0.1)" : done ? "0 0 0 4px rgba(196,151,62,0.15)" : "none" }}>
                {done ? "✓" : s.num}
              </div>
              <span className="font-sans text-[10px] font-medium" style={{ color: active ? "#1A1208" : done ? "#C4973E" : "#9CA3AF" }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-2 mb-4 transition-all duration-500" style={{ backgroundColor: done ? "#C4973E" : "#E5E7EB" }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid #F5F5F5" }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#F8F5F0" }}>
        <Icon size={15} color="#C4973E" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-sans text-[10px] font-semibold tracking-widest uppercase text-warm-text/40 mb-0.5">{label}</div>
        <div className="font-sans text-sm font-medium text-warm-black truncate">{value}</div>
      </div>
    </div>
  )
}

export default function MemberBookingPage() {
  const { scheduleId } = useParams()
  const navigate       = useNavigate()

  const [schedule,         setSchedule]         = useState(null)
  const [loading,          setLoading]          = useState(true)
  const [booking,          setBooking]          = useState(null)
  const [step,             setStep]             = useState("detail")
  const [processing,       setProcessing]       = useState(false)
  const [error,            setError]            = useState("")
  const [canWaitlist,      setCanWaitlist]      = useState(false)
  const [waitlistJoined,   setWaitlistJoined]   = useState(false)
  const [waitlistPosition, setWaitlistPosition] = useState(null)

  useEffect(() => {
    fetch(`/api/schedules/${scheduleId}`, { headers: headers() })
      .then(r => r.json())
      .then(d => { setSchedule(d.data || d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [scheduleId])

  const handleBook = async () => {
    setProcessing(true)
    setError("")
    setCanWaitlist(false)
    try {
      const pkgRes    = await fetch("/api/member/packages/active", { headers: headers() })
      const pkgData   = await pkgRes.json()
      const activePkg = pkgData.data

      const body = { schedule_id: parseInt(scheduleId) }
      if (activePkg) body.member_package_id = activePkg.id

      const res  = await fetch("/api/member/bookings", { method: "POST", headers: headers(), body: JSON.stringify(body) })
      const data = await res.json()

      if (res.ok) {
        setBooking(data.data)
        if (activePkg) {
          // Pakai paket — langsung success
          setStep("success")
        } else {
          // Perlu bayar — redirect ke MemberPaymentPage dengan voucher support
          const bookingId = data.data?.booking_id || data.data?.id
          navigate(`/member/payment/${bookingId}`)
        }
      } else {
        setError(data.message || "Gagal membuat booking")
        if (data.can_waitlist) setCanWaitlist(true)
      }
    } catch { setError("Terjadi kesalahan. Coba lagi.") }
    setProcessing(false)
  }

  const handleJoinWaitlist = async () => {
    setProcessing(true)
    setError("")
    try {
      const res  = await fetch("/api/member/bookings/waitlist", {
        method: "POST", headers: headers(), body: JSON.stringify({ schedule_id: parseInt(scheduleId) }),
      })
      const data = await res.json()
      if (res.ok) { setWaitlistJoined(true); setWaitlistPosition(data.data.position) }
      else setError(data.message || "Gagal masuk waiting list")
    } catch { setError("Terjadi kesalahan. Coba lagi.") }
    setProcessing(false)
  }

  const price = schedule?.class_price || schedule?.price || 0

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <LoadingSpinner text="Memuat detail kelas..." />
    </div>
  )

  return (
    <div className="min-h-screen bg-ivory py-10 px-4">
      <div className="max-w-md mx-auto">

        {/* Back + title */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer font-sans text-base text-warm-black transition-all duration-200 hover:bg-white/80"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            ←
          </button>
          <div>
            <h1 className="font-sans text-base font-semibold text-warm-black leading-tight">Booking Kelas</h1>
            <p className="font-sans text-xs text-warm-text/50">Strive Pilates Bali</p>
          </div>
        </div>

        <StepIndicator step={step} />

        {/* WAITLIST SUCCESS */}
        {waitlistJoined && (
          <div className="bg-white rounded-3xl p-8 text-center" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#FFFBEB" }}>
              <IconClock size={30} color="#D97706" />
            </div>
            <h2 className="font-display text-2xl text-warm-black mb-2">Masuk Waiting List!</h2>
            <p className="font-sans text-sm text-warm-text/60 mb-4">Posisi antrian Anda</p>
            <div className="inline-block px-6 py-2 rounded-xl font-sans text-2xl font-bold mb-5" style={{ backgroundColor: "#FFFBEB", color: "#D97706" }}>
              #{waitlistPosition}
            </div>
            <p className="font-sans text-sm text-warm-text/60 mb-7 leading-relaxed">Kami akan mengirimkan notifikasi WhatsApp jika slot tersedia.</p>
            <div className="flex gap-3">
              <Link to="/member/bookings" className="flex-1 py-3 rounded-2xl font-sans text-sm font-medium no-underline text-center bg-slate-100 text-slate-600">Lihat Booking</Link>
              <Link to="/schedule" className="flex-1 py-3 rounded-2xl font-sans text-sm font-medium text-white no-underline text-center" style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E)" }}>Kelas Lain</Link>
            </div>
          </div>
        )}

        {/* SUCCESS — pakai paket */}
        {!waitlistJoined && step === "success" && (
          <div className="bg-white rounded-3xl p-8 text-center" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E)", boxShadow: "0 8px 24px rgba(107,79,10,0.30)" }}>
              <IconCheck size={28} color="#FFFFFF" />
            </div>
            <h2 className="font-display text-2xl text-warm-black mb-2">Booking Berhasil!</h2>
            <p className="font-sans text-xs font-semibold tracking-widest uppercase text-warm-text/40 mb-2">Kode Booking</p>
            <div className="inline-block px-5 py-2 rounded-xl font-mono text-base font-bold mb-5" style={{ backgroundColor: "#F8F5F0", color: "#C4973E" }}>
              {booking?.booking_code}
            </div>
            <p className="font-sans text-sm text-warm-text/60 mb-7 leading-relaxed">Sesi paket Anda telah digunakan. Sampai jumpa di kelas!</p>
            <div className="flex gap-3">
              <Link to="/member/bookings" className="flex-1 py-3 rounded-2xl font-sans text-sm font-medium no-underline text-center bg-slate-100 text-slate-600">Lihat Booking</Link>
              <Link to="/schedule" className="flex-1 py-3 rounded-2xl font-sans text-sm font-medium text-white no-underline text-center" style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E)" }}>Booking Lagi</Link>
            </div>
          </div>
        )}

        {/* DETAIL */}
        {!waitlistJoined && step === "detail" && schedule && (
          <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid #F5F5F5" }}>
              <div className="flex items-start justify-between gap-3 mb-1">
                <h2 className="font-display text-xl text-warm-black leading-tight">{schedule.class_name}</h2>
                <span className="flex-shrink-0 px-2.5 py-1 rounded-full font-sans text-[11px] font-semibold"
                  style={{ backgroundColor: schedule.class_type === "mat" ? "#EFF6FF" : "#F5F3FF", color: schedule.class_type === "mat" ? "#1D4ED8" : "#6D28D9" }}>
                  {schedule.class_type === "mat" ? "Mat" : "Reformer"}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl text-bronze-light">Rp {parseInt(price).toLocaleString("id-ID")}</span>
                <span className="font-sans text-xs text-warm-text/40">/pax</span>
              </div>
            </div>

            <div className="px-6">
              <InfoRow icon={IconCalendar} label="Tanggal" value={new Date(schedule.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
              <InfoRow icon={IconClock}    label="Waktu"       value={`${schedule.start_time?.substring(0, 5)} – ${schedule.end_time?.substring(0, 5)}`} />
              <InfoRow icon={IconUser}     label="Instruktur"  value={schedule.instructor_name} />
              <InfoRow icon={IconCheck}    label="Slot Tersedia" value={`${schedule.available_slots} dari ${schedule.capacity} slot`} />
            </div>

            {error && (
              <div className="mx-6 mt-4 px-4 py-3 rounded-xl font-sans text-sm text-red-700 bg-red-50">{error}</div>
            )}

            <div className="px-6 py-6">
              {schedule.available_slots === 0 ? (
                <>
                  <div className="text-center py-2 mb-4 font-sans text-sm text-warm-text/50">Slot kelas ini sudah penuh</div>
                  <button onClick={canWaitlist ? handleJoinWaitlist : handleBook} disabled={processing}
                    className="w-full py-4 rounded-2xl font-sans text-sm font-semibold text-white border-none cursor-pointer"
                    style={{ background: "linear-gradient(145deg,#D97706,#F59E0B)", boxShadow: "0 6px 20px rgba(217,119,6,0.30)", opacity: processing ? 0.7 : 1 }}>
                    {processing ? <ButtonLoading variant="letters" /> : canWaitlist ? "Masuk Waiting List" : "Cek Waiting List"}
                  </button>
                  <p className="text-center font-sans text-xs mt-3 text-warm-text/40">Kami akan mengabari via WhatsApp jika slot tersedia</p>
                </>
              ) : (
                <>
                  <button onClick={handleBook} disabled={processing}
                    className="w-full py-4 rounded-2xl font-sans text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200"
                    style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E,#A0792A)", boxShadow: "0 6px 20px rgba(107,79,10,0.32)", opacity: processing ? 0.7 : 1 }}>
                    {processing ? <ButtonLoading variant="letters" /> : `Booking Sekarang — Rp ${parseInt(price).toLocaleString("id-ID")}`}
                  </button>
                  <p className="text-center font-sans text-xs mt-3 text-warm-text/40">Pembayaran harus diselesaikan dalam 1 jam setelah booking</p>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
