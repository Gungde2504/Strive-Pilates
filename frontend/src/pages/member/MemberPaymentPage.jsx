import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { IconClock, IconCheck, IconX, IconUser } from "../../components/icons/index"
import LoadingSpinner from "../../components/LoadingSpinner"
import ButtonLoading from "../../components/ButtonLoading"
import PaymentLoadingOverlay from "../../components/PaymentLoadingOverlay"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({
  "Authorization": `Bearer ${token()}`,
  "Accept": "application/json",
  "Content-Type": "application/json",
})

const CLIENT_KEY = "Mid-client-AnIPubZigOV8sbYV"

export default function MemberPaymentPage() {
  const { bookingId } = useParams()
  const navigate      = useNavigate()

  const [booking,        setBooking]        = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [processing,     setProcessing]     = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error,          setError]          = useState("")
  const [step,           setStep]           = useState("payment")
  const [countdown,      setCountdown]      = useState(null)

  // Voucher state
  const [voucherCode,    setVoucherCode]    = useState("")
  const [voucherApplied, setVoucherApplied] = useState(null) // { code, discount_type, discount_value, discount_amount }
  const [voucherLoading, setVoucherLoading] = useState(false)
  const [voucherError,   setVoucherError]   = useState("")

  const pollingRef = useRef(null)

  // Load Midtrans Snap
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js"
    script.setAttribute("data-client-key", CLIENT_KEY)
    script.async = true
    document.head.appendChild(script)
    return () => { try { document.head.removeChild(script) } catch {} }
  }, [])

  // Fetch booking detail
  useEffect(() => {
    fetch(`/api/member/bookings/${bookingId}`, { headers: headers() })
      .then(r => r.json())
      .then(d => { setBooking(d.data || d); setLoading(false) })
      .catch(() => {
        fetch("/api/member/bookings", { headers: headers() })
          .then(r => r.json())
          .then(d => {
            const found = (d.data || []).find(b => b.id === parseInt(bookingId))
            setBooking(found || null)
            setLoading(false)
          })
          .catch(() => setLoading(false))
      })
  }, [bookingId])

  // Countdown timer
  useEffect(() => {
    if (!booking?.payment_expired_at) return
    const interval = setInterval(() => {
      const diff = new Date(booking.payment_expired_at) - new Date()
      if (diff <= 0) { setCountdown("00:00"); clearInterval(interval); return }
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setCountdown(`${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [booking])

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [])

  // ── Apply voucher ─────────────────────────────────────────────────────────
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return
    setVoucherLoading(true)
    setVoucherError("")
    try {
      const res  = await fetch("/api/member/vouchers/validate", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ code: voucherCode.trim(), booking_id: parseInt(bookingId) }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setVoucherError(data.message || "Voucher tidak valid")
        setVoucherApplied(null)
      } else {
        setVoucherApplied(data.data)
        setVoucherError("")
      }
    } catch {
      setVoucherError("Gagal memvalidasi voucher")
    }
    setVoucherLoading(false)
  }

  const handleRemoveVoucher = () => {
    setVoucherApplied(null)
    setVoucherCode("")
    setVoucherError("")
  }

  // ── Polling ───────────────────────────────────────────────────────────────
  const startPolling = () => {
    setStep("polling")
    let attempts = 0
    pollingRef.current = setInterval(async () => {
      attempts++
      try {
        const res  = await fetch(`/api/member/payments/${bookingId}/status`, { headers: headers() })
        const data = await res.json()
        const paymentStatus = data.data?.payment_status
        const bookingStatus = data.data?.booking_status
        if (paymentStatus === "settlement" || bookingStatus === "confirmed") {
          clearInterval(pollingRef.current)
          setBooking(prev => prev ? { ...prev, status: "confirmed" } : prev)
          setStep("success")
          return
        }
      } catch {}
      if (attempts >= 20) {
        clearInterval(pollingRef.current)
        setStep("success")
      }
    }, 3000)
  }

  const handlePay = async () => {
    setProcessing(true)
    setError("")
    try {
      const body = {}
      if (voucherApplied) body.voucher_code = voucherApplied.code

      const res  = await fetch(`/api/member/payments/${bookingId}/initiate`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "Gagal menghubungi payment gateway")
        setProcessing(false)
        return
      }
      setPaymentLoading(true)
      window.snap.pay(data.snap_token, {
        onSuccess: () => { setPaymentLoading(false); startPolling(); setProcessing(false) },
        onPending: () => { setPaymentLoading(false); startPolling(); setProcessing(false) },
        onError:   () => { setPaymentLoading(false); setError("Pembayaran gagal. Silakan coba lagi."); setStep("failed"); setProcessing(false) },
        onClose:   () => { setPaymentLoading(false); setProcessing(false) },
      })
    } catch {
      setPaymentLoading(false)
      setError("Terjadi kesalahan. Coba lagi.")
      setProcessing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <LoadingSpinner text="Memuat data pembayaran..." />
    </div>
  )

  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="text-center">
        <p className="font-sans text-sm text-warm-text/50 mb-4">Booking tidak ditemukan</p>
        <Link to="/member/bookings" className="font-sans text-sm no-underline text-bronze-light">← Kembali</Link>
      </div>
    </div>
  )

  const baseAmount     = parseInt(booking.price || booking.amount || 0)
  const discountAmount = voucherApplied?.discount_amount ?? 0
  const finalAmount    = Math.max(baseAmount - discountAmount, 0)

  return (
    <div className="min-h-screen py-10 px-4 bg-ivory">
      <PaymentLoadingOverlay show={paymentLoading} text="Menghubungkan ke Midtrans..." />

      <div className="max-w-md mx-auto">

        {/* Back + title */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer font-sans text-base text-warm-black transition-all duration-200 hover:bg-white/80"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            ←
          </button>
          <div>
            <h1 className="font-sans text-base font-semibold text-warm-black leading-tight">Selesaikan Pembayaran</h1>
            <p className="font-sans text-xs text-warm-text/50">Strive Pilates Bali</p>
          </div>
        </div>

        {/* POLLING */}
        {step === "polling" && (
          <div className="bg-white rounded-3xl p-8 text-center" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-bronze-pale" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-bronze-light animate-spin" />
              <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E)" }}>
                <IconCheck size={16} color="white" />
              </div>
            </div>
            <h2 className="font-display text-xl text-warm-black mb-2">Menunggu Konfirmasi</h2>
            <p className="font-sans text-sm text-warm-text/60 mb-1">Pembayaran sedang diverifikasi oleh Midtrans.</p>
            <p className="font-sans text-xs text-warm-text/40 leading-relaxed">Halaman ini akan otomatis update saat pembayaran dikonfirmasi.<br />Jangan tutup halaman ini.</p>
            <div className="flex justify-center gap-1.5 mt-5">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#C4973E", animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <div className="bg-white rounded-3xl p-8 text-center" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E)", boxShadow: "0 8px 24px rgba(107,79,10,0.30)" }}>
              <IconCheck size={28} color="#FFFFFF" />
            </div>
            <h2 className="font-display text-2xl text-warm-black mb-2">Pembayaran Berhasil!</h2>
            <p className="font-sans text-xs font-semibold tracking-widest uppercase text-warm-text/40 mb-2">Kode Booking</p>
            <div className="inline-block px-5 py-2 rounded-xl font-mono text-base font-bold mb-5" style={{ backgroundColor: "#F8F5F0", color: "#C4973E" }}>
              {booking.booking_code}
            </div>
            <p className="font-sans text-sm text-warm-text/60 mb-7 leading-relaxed">Konfirmasi akan dikirimkan via WhatsApp. Sampai jumpa di kelas!</p>
            <Link to="/member/bookings" className="block w-full py-3.5 rounded-2xl font-sans text-sm font-semibold text-white no-underline text-center"
              style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E)", boxShadow: "0 6px 18px rgba(107,79,10,0.28)" }}>
              Lihat Booking Saya
            </Link>
          </div>
        )}

        {/* FAILED */}
        {step === "failed" && (
          <div className="bg-white rounded-3xl p-8 text-center" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#FEF2F2" }}>
              <IconX size={28} color="#DC2626" />
            </div>
            <h2 className="font-display text-2xl text-warm-black mb-2">Pembayaran Gagal</h2>
            <p className="font-sans text-sm text-warm-text/60 mb-7">{error}</p>
            <button onClick={() => { setStep("payment"); setError("") }} className="btn-bronze-auth w-full py-3.5 rounded-2xl font-sans text-sm font-semibold">Coba Lagi</button>
          </div>
        )}

        {/* PAYMENT */}
        {step === "payment" && (
          <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

            {countdown && (
              <div className="flex items-center justify-center gap-2 py-3 px-5"
                style={{ backgroundColor: countdown === "00:00" ? "#FEF2F2" : "#FFFBEB", borderBottom: `1px solid ${countdown === "00:00" ? "#FECACA" : "#FDE68A"}` }}>
                <IconClock size={14} color={countdown === "00:00" ? "#DC2626" : "#D97706"} />
                <span className="font-sans text-sm font-semibold" style={{ color: countdown === "00:00" ? "#DC2626" : "#D97706" }}>
                  {countdown === "00:00" ? "Waktu pembayaran habis!" : `Selesaikan dalam ${countdown}`}
                </span>
              </div>
            )}

            <div className="p-6">
              <p className="font-sans text-[10px] font-bold tracking-widest uppercase text-warm-text/40 mb-4">DETAIL BOOKING</p>

              <div className="flex items-start gap-4 p-4 rounded-2xl mb-4" style={{ backgroundColor: "#F8F5F0" }}>
                <div className="flex-shrink-0 w-12 text-center rounded-xl py-2" style={{ background: "linear-gradient(145deg,#1A1208,#2D1F08)" }}>
                  <div className="font-sans text-[9px] font-bold text-bronze-light uppercase tracking-wide leading-none">
                    {booking.date ? new Date(booking.date).toLocaleDateString("id-ID",{month:"short"}) : "--"}
                  </div>
                  <div className="font-display text-xl text-white leading-none mt-0.5">
                    {booking.date ? new Date(booking.date).getDate() : "--"}
                  </div>
                  <div className="font-sans text-[9px] text-[rgba(232,213,168,0.5)] leading-none mt-0.5">
                    {booking.date ? new Date(booking.date).toLocaleDateString("id-ID",{weekday:"short"}) : "--"}
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="font-sans text-sm font-semibold text-warm-black mb-1 truncate">{booking.class_name}</div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <IconClock size={11} color="#C4973E" />
                    <span className="font-sans text-xs text-warm-text/60">{booking.start_time?.substring(0,5) || "-"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconUser size={11} color="#C4973E" />
                    <span className="font-sans text-xs text-warm-text/60">{booking.instructor || booking.instructor_name || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-2.5 px-4 rounded-xl mb-4" style={{ backgroundColor: "#F8F5F0" }}>
                <span className="font-sans text-xs text-warm-text/50">Kode Booking</span>
                <span className="font-mono text-xs font-semibold text-bronze-light">
                  {booking.booking_code || `#${String(booking.id).padStart(6,"0")}`}
                </span>
              </div>

              {/* ── VOUCHER INPUT ─────────────────────────────────────── */}
              <div className="mb-4">
                <p className="font-sans text-[10px] font-bold tracking-widest uppercase text-warm-text/40 mb-2">VOUCHER</p>
                {voucherApplied ? (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                    <div className="flex items-center gap-2">
                      <IconCheck size={14} color="#15803D" />
                      <div>
                        <div className="font-sans text-xs font-bold text-green-700">{voucherApplied.code}</div>
                        <div className="font-sans text-[10px] text-green-600">
                          Hemat Rp {discountAmount.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                    <button onClick={handleRemoveVoucher}
                      className="w-6 h-6 rounded-full flex items-center justify-center border-none cursor-pointer"
                      style={{ backgroundColor: "#DCFCE7" }}>
                      <IconX size={10} color="#15803D" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={e => { setVoucherCode(e.target.value.toUpperCase()); setVoucherError("") }}
                        onKeyDown={e => e.key === "Enter" && handleApplyVoucher()}
                        placeholder="Masukkan kode voucher"
                        className="flex-1 px-4 py-2.5 rounded-xl font-sans text-sm outline-none transition-all duration-200"
                        style={{ border: `1px solid ${voucherError ? "#FCA5A5" : "#E2E8F0"}`, backgroundColor: "#FAFAFA", color: "#0F172A" }}
                      />
                      <button onClick={handleApplyVoucher} disabled={voucherLoading || !voucherCode.trim()}
                        className="px-4 py-2.5 rounded-xl font-sans text-xs font-semibold border-none cursor-pointer transition-all duration-200"
                        style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E)", color: "#FFFFFF", opacity: (!voucherCode.trim() || voucherLoading) ? 0.5 : 1 }}>
                        {voucherLoading ? "..." : "Pakai"}
                      </button>
                    </div>
                    {voucherError && (
                      <p className="font-sans text-xs mt-1.5" style={{ color: "#EF4444" }}>{voucherError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-100 my-4" />

              {/* ── RINGKASAN HARGA ───────────────────────────────────── */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-warm-text/50">Harga kelas</span>
                  <span className="font-sans text-sm text-warm-black">Rp {baseAmount.toLocaleString("id-ID")}</span>
                </div>
                {voucherApplied && (
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs text-green-600">Diskon voucher</span>
                    <span className="font-sans text-sm font-semibold text-green-600">
                      - Rp {discountAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="font-sans text-sm font-semibold text-warm-black">Total Bayar</span>
                  <span className="font-display text-xl text-bronze-light">
                    Rp {finalAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl mb-4 font-sans text-sm text-red-700 bg-red-50">{error}</div>
              )}

              <button onClick={handlePay} disabled={processing || countdown === "00:00"}
                className="w-full py-4 rounded-2xl font-sans text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E,#A0792A)", boxShadow: "0 6px 20px rgba(107,79,10,0.32)", opacity: (processing || countdown === "00:00") ? 0.65 : 1, cursor: countdown === "00:00" ? "not-allowed" : "pointer" }}>
                {processing ? <ButtonLoading variant="letters" /> : `Bayar Rp ${finalAmount.toLocaleString("id-ID")}`}
              </button>

              <div className="flex flex-col items-center gap-2 mt-4">
                <div className="flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span className="font-sans text-xs text-warm-text/40">Pembayaran aman via Midtrans</span>
                </div>
                <Link to="/member/bookings" className="font-sans text-xs no-underline text-warm-text/35 hover:text-warm-text/60 transition-colors duration-200">
                  Bayar Nanti
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
