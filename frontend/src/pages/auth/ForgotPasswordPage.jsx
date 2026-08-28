import { useState } from "react"
import { Link } from "react-router-dom"
import ButtonLoading from "../../components/ButtonLoading"

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("")
  const [error,   setError]   = useState("")
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const validate = () => {
    if (!email) return "Email wajib diisi"
    if (!/\S+@\S+\.\S+/.test(email)) return "Format email tidak valid"
    return ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    setError("")
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) { setError(data.message || "Gagal mengirim instruksi."); return }
      setSent(true)
    } catch {
      setError("Koneksi gagal. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E)", boxShadow: "0 0 0 8px rgba(196,151,62,0.1)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </div>
        <h2 className="font-display font-normal text-white mb-3 text-[28px]">Cek WhatsApp Kamu!</h2>
        <p className="font-sans text-sm leading-relaxed mb-8 text-[rgba(232,213,168,0.6)]">
          Link reset password sudah dikirim ke nomor WhatsApp terdaftar untuk{" "}
          <span className="text-bronze-light">{email}</span>. Berlaku 60 menit.
        </p>
        <div className="space-y-3">
          <button onClick={() => { setSent(false); setEmail("") }}
            className="btn-bronze-auth w-full py-3.5 rounded-xl font-sans text-sm font-medium">
            Kirim Ulang
          </button>
          <Link to="/login"
            className="block text-center py-3.5 rounded-xl font-sans text-sm no-underline
              text-[#E8D5A8] hover:-translate-y-0.5 transition-all duration-200"
            style={{ border: "1px solid rgba(196,151,62,0.3)" }}>
            Kembali ke Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <Link to="/login"
          className="inline-flex items-center gap-2 font-sans text-xs no-underline mb-6
            text-[rgba(232,213,168,0.4)] hover:text-bronze-light transition-colors duration-200">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Kembali ke Login
        </Link>
        <h1 className="font-display font-normal text-white mb-2 text-[clamp(26px,4vw,34px)]">
          Lupa Password?
        </h1>
        <p className="font-sans text-sm leading-relaxed text-[rgba(232,213,168,0.6)]">
          Masukkan email yang terdaftar dan kami akan mengirim link reset password via WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-sans text-xs font-medium mb-2 tracking-wide text-[rgba(232,213,168,0.7)]">
            EMAIL TERDAFTAR
          </label>
          <input type="email" value={email}
            onChange={e => { setEmail(e.target.value); setError("") }}
            placeholder="nama@email.com"
            className="w-full px-4 py-3.5 rounded-xl font-sans text-sm outline-none transition-all duration-200"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: `1px solid ${error ? "rgba(239,68,68,0.6)" : "rgba(196,151,62,0.25)"}`,
              color: "#E8D5A8", caretColor: "#C4973E",
            }}
            onFocus={e => e.target.style.border = "1px solid rgba(196,151,62,0.6)"}
            onBlur={e => e.target.style.border = `1px solid ${error ? "rgba(239,68,68,0.6)" : "rgba(196,151,62,0.25)"}`} />
          {error && <p className="font-sans text-xs mt-1.5 text-[#F87171]">{error}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="btn-bronze-auth w-full py-3.5 rounded-xl font-sans text-sm font-medium">
          {loading ? <ButtonLoading variant="dots" /> : "Kirim Link Reset"}
        </button>
      </form>

      <div className="mt-7 p-4 rounded-xl"
        style={{ backgroundColor: "rgba(196,151,62,0.06)", border: "1px solid rgba(196,151,62,0.12)" }}>
        <p className="font-sans text-xs leading-relaxed m-0 text-[rgba(232,213,168,0.5)]">
          Tidak menerima pesan? Pastikan nomor WhatsApp Anda aktif, atau{" "}
          <Link to="#" className="no-underline text-bronze-light hover:text-[#E8D5A8] transition-colors duration-200">
            hubungi support
          </Link>{" "}kami.
        </p>
      </div>
    </div>
  )
}
