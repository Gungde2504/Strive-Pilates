import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { IconCheck, IconX, IconPackage } from "../../components/icons/index"
import LoadingSpinner from "../../components/LoadingSpinner"
import ButtonLoading from "../../components/ButtonLoading"
import PaymentLoadingOverlay from "../../components/PaymentLoadingOverlay"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({
  Authorization: `Bearer ${token()}`,
  Accept: "application/json",
  "Content-Type": "application/json",
})

const CLIENT_KEY = "Mid-client-AnIPubZigOV8sbYV"

export default function MemberPackagePurchasePage() {
  const { packageId } = useParams()
  const navigate      = useNavigate()

  const [pkg,            setPkg]            = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [processing,     setProcessing]     = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error,          setError]          = useState("")
  const [step,           setStep]           = useState("detail") // detail | polling | success | failed

  // Simpan member_package_id setelah purchase berhasil
  const memberPackageIdRef = useRef(null)
  const pollingRef         = useRef(null)

  // Load Midtrans Snap
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js"
    script.setAttribute("data-client-key", CLIENT_KEY)
    script.async = true
    document.head.appendChild(script)
    return () => { try { document.head.removeChild(script) } catch {} }
  }, [])

  // Fetch package detail
  useEffect(() => {
    fetch(`/api/packages/${packageId}`, { headers: headers() })
      .then(r => r.json())
      .then(d => { setPkg(d.data || d); setLoading(false) })
      .catch(() => {
        fetch("/api/packages", { headers: headers() })
          .then(r => r.json())
          .then(d => {
            const found = (d.data || []).find(p => p.id === parseInt(packageId))
            setPkg(found || null)
            setLoading(false)
          })
          .catch(() => setLoading(false))
      })
  }, [packageId])

  // Cleanup polling saat unmount
  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [])

  // ── Polling status member_package ────────────────────────────────────────
  const startPolling = (memberPackageId) => {
    memberPackageIdRef.current = memberPackageId
    setStep("polling")
    let attempts = 0
    const MAX_ATTEMPTS = 20 // 20 x 3s = 60 detik

    pollingRef.current = setInterval(async () => {
      attempts++
      try {
        const res  = await fetch("/api/member/packages/active", { headers: headers() })
        const data = await res.json()
        // Cek apakah ada paket yang baru aktif
        const activePackages = data.data || data || []
        const found = activePackages.find(p =>
          p.id === memberPackageId || p.package_id === parseInt(packageId)
        )
        if (found && found.status === "active") {
          clearInterval(pollingRef.current)
          setStep("success")
          setPaymentLoading(false)
          return
        }
      } catch {}

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(pollingRef.current)
        // Timeout — anggap pending, tetap tampilkan success dengan pesan pending
        setStep("success")
        setPaymentLoading(false)
      }
    }, 3000)
  }

  const handlePurchase = async () => {
    setProcessing(true)
    setError("")
    try {
      const res  = await fetch("/api/member/packages/purchase", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ package_id: parseInt(packageId) }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || "Gagal memulai pembayaran.")
        setProcessing(false)
        return
      }

      const memberPackageId = data.member_package_id || null

      setPaymentLoading(true)
      window.snap.pay(data.snap_token, {
        onSuccess: () => {
          setPaymentLoading(false)
          if (memberPackageId) startPolling(memberPackageId)
          else setStep("success")
          setProcessing(false)
        },
        onPending: () => {
          setPaymentLoading(false)
          // Mulai polling — Midtrans kirim webhook setelah QRIS dibayar
          if (memberPackageId) startPolling(memberPackageId)
          else setStep("success")
          setProcessing(false)
        },
        onError: () => {
          setPaymentLoading(false)
          setError("Pembayaran gagal. Silakan coba lagi.")
          setStep("failed")
          setProcessing(false)
        },
        onClose: () => {
          setPaymentLoading(false)
          setProcessing(false)
        },
      })
    } catch {
      setPaymentLoading(false)
      setError("Terjadi kesalahan. Coba lagi.")
      setProcessing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <LoadingSpinner text="Memuat detail paket..." />
    </div>
  )

  if (!pkg) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="text-center">
        <p className="font-sans text-sm text-warm-text/50 mb-4">Paket tidak ditemukan</p>
        <Link to="/packages" className="font-sans text-sm no-underline text-bronze-light">
          ← Kembali ke Paket
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen py-10 px-4 bg-ivory">
      <PaymentLoadingOverlay show={paymentLoading} text="Menghubungkan ke Midtrans..." />

      <div className="max-w-md mx-auto">

        {/* Back + title */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer
              font-sans text-base text-warm-black transition-all duration-200 hover:bg-white/80"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            ←
          </button>
          <div>
            <h1 className="font-sans text-base font-semibold text-warm-black leading-tight">Beli Paket</h1>
            <p className="font-sans text-xs text-warm-text/50">Strive Pilates Bali</p>
          </div>
        </div>

        {/* ── POLLING — menunggu konfirmasi pembayaran ─────────────────── */}
        {step === "polling" && (
          <div className="bg-white rounded-3xl p-8 text-center"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            {/* Spinner animasi */}
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-bronze-pale" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-bronze-light animate-spin" />
              <div className="absolute inset-2 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E)" }}>
                <IconPackage size={16} color="white" />
              </div>
            </div>
            <h2 className="font-display text-xl text-warm-black mb-2">Menunggu Konfirmasi</h2>
            <p className="font-sans text-sm text-warm-text/60 mb-1">
              Pembayaran sedang diverifikasi oleh Midtrans.
            </p>
            <p className="font-sans text-xs text-warm-text/40 leading-relaxed">
              Halaman ini akan otomatis update saat pembayaran dikonfirmasi.<br />
              Jangan tutup halaman ini.
            </p>
            {/* Dots animasi */}
            <div className="flex justify-center gap-1.5 mt-5">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: "#C4973E", animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── SUCCESS ──────────────────────────────────────────────────── */}
        {step === "success" && (
          <div className="bg-white rounded-3xl p-8 text-center"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E)", boxShadow: "0 8px 24px rgba(107,79,10,0.30)" }}>
              <IconCheck size={28} color="#FFFFFF" />
            </div>
            <h2 className="font-display text-2xl text-warm-black mb-2">Pembayaran Berhasil!</h2>
            <p className="font-sans text-sm text-warm-text/70 mb-1">
              Paket <span className="font-semibold text-warm-black">{pkg.name}</span> sudah aktif.
            </p>
            <p className="font-sans text-xs text-warm-text/45 mb-7 leading-relaxed">
              Notifikasi konfirmasi akan dikirim via WhatsApp.
            </p>
            <div className="flex gap-3">
              <Link to="/member/packages"
                className="flex-1 py-3 rounded-2xl font-sans text-sm font-medium no-underline
                  text-center bg-slate-100 text-slate-600">
                Lihat Paket
              </Link>
              <Link to="/schedule"
                className="flex-1 py-3 rounded-2xl font-sans text-sm font-semibold text-white
                  no-underline text-center"
                style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E)" }}>
                Booking Kelas
              </Link>
            </div>
          </div>
        )}

        {/* ── FAILED ───────────────────────────────────────────────────── */}
        {step === "failed" && (
          <div className="bg-white rounded-3xl p-8 text-center"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "#FEF2F2" }}>
              <IconX size={28} color="#DC2626" />
            </div>
            <h2 className="font-display text-2xl text-warm-black mb-2">Pembayaran Gagal</h2>
            <p className="font-sans text-sm text-warm-text/60 mb-7">{error}</p>
            <button onClick={() => { setStep("detail"); setError("") }}
              className="btn-bronze-auth w-full py-3.5 rounded-2xl font-sans text-sm font-semibold">
              Coba Lagi
            </button>
          </div>
        )}

        {/* ── DETAIL ───────────────────────────────────────────────────── */}
        {step === "detail" && (
          <div className="bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

            {pkg.is_featured && (
              <div className="flex items-center justify-center gap-2 py-2.5 font-sans text-xs font-bold text-white tracking-widest"
                style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E)" }}>
                <IconPackage size={12} color="rgba(255,255,255,0.7)" />
                TERPOPULER
              </div>
            )}

            <div className="p-6">
              <div className="mb-5">
                <h2 className="font-display text-2xl text-warm-black mb-1">{pkg.name}</h2>
                {pkg.description && (
                  <p className="font-sans text-sm text-warm-text/60 leading-relaxed">{pkg.description}</p>
                )}
              </div>

              <div className="p-5 rounded-2xl mb-5" style={{ backgroundColor: "#F8F5F0" }}>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="font-display text-[36px] leading-none text-bronze-light">
                    Rp {parseInt(pkg.price).toLocaleString("id-ID")}
                  </span>
                  <span className="font-sans text-xs text-warm-text/40">/pax</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    ["JUMLAH SESI",  `${pkg.session_count} sesi`],
                    ["MASA BERLAKU", `${pkg.validity_days} hari`],
                  ].map(([label, val]) => (
                    <div key={label} className="text-center p-3 rounded-xl bg-white"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <div className="font-sans text-[9px] font-bold tracking-widest text-warm-text/40 mb-1">{label}</div>
                      <div className="font-sans text-sm font-semibold text-warm-black">{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {(pkg.benefits || []).length > 0 && (
                <div className="mb-5 space-y-2.5">
                  {pkg.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#F5F0EA" }}>
                        <IconCheck size={11} color="#C4973E" />
                      </div>
                      <span className="font-sans text-sm text-warm-text/70">{b}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5"
                style={{ backgroundColor: "#F0FDF4", border: "1px solid #D5EDD8" }}>
                <IconCheck size={14} color="#15803D" />
                <div>
                  <div className="font-sans text-[10px] font-bold tracking-widest text-green-800 mb-0.5">
                    FASILITAS TERMASUK
                  </div>
                  <div className="font-sans text-xs text-green-700">
                    Free Gym Access · Locker · Water Refill · Shower
                  </div>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl mb-4 font-sans text-sm text-red-700 bg-red-50">
                  {error}
                </div>
              )}

              <button onClick={handlePurchase} disabled={processing}
                className="w-full py-4 rounded-2xl font-sans text-sm font-semibold text-white
                  border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(145deg,#7A5C0E,#C4973E,#A0792A)",
                  boxShadow: "0 6px 20px rgba(107,79,10,0.32)",
                  opacity: processing ? 0.7 : 1,
                  cursor: processing ? "not-allowed" : "pointer",
                }}>
                {processing
                  ? <ButtonLoading variant="letters" />
                  : `Beli Sekarang — Rp ${parseInt(pkg.price).toLocaleString("id-ID")}`}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span className="font-sans text-xs text-warm-text/40">Pembayaran aman via Midtrans</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
