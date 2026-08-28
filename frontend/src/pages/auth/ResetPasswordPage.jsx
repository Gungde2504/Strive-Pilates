import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import ButtonLoading from "../../components/ButtonLoading"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""

  const [form,     setForm]     = useState({ password: "", password_confirmation: "" })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [apiError, setApiError] = useState("")
  const [success,  setSuccess]  = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
    if (apiError) setApiError("")
  }

  const validate = () => {
    const errs = {}
    if (!form.password) errs.password = "Password wajib diisi"
    else if (form.password.length < 8) errs.password = "Password minimal 8 karakter"
    if (!form.password_confirmation) errs.password_confirmation = "Konfirmasi password wajib diisi"
    else if (form.password !== form.password_confirmation) errs.password_confirmation = "Password tidak cocok"
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token || !email) { setApiError("Link reset password tidak valid."); return }
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    setApiError("")
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, token, ...form }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) { setApiError(data.message || "Gagal reset password."); return }
      setSuccess(true)
      setTimeout(() => navigate("/login"), 2500)
    } catch {
      setApiError("Koneksi gagal. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field) => ({
    backgroundColor: "rgba(255,255,255,0.06)",
    border: `1px solid ${errors[field] ? "rgba(239,68,68,0.6)" : "rgba(196,151,62,0.25)"}`,
    color: "#E8D5A8", caretColor: "#C4973E",
  })
  const onFocus = (e) => e.target.style.border = "1px solid rgba(196,151,62,0.6)"
  const onBlur  = (field) => (e) => {
    e.target.style.border = `1px solid ${errors[field] ? "rgba(239,68,68,0.6)" : "rgba(196,151,62,0.25)"}`
  }

  if (!token || !email) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-[rgba(239,68,68,0.15)]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="font-display font-normal text-white mb-3 text-[26px]">Link Tidak Valid</h2>
        <p className="font-sans text-sm leading-relaxed mb-8 text-[rgba(232,213,168,0.6)]">
          Link reset password ini tidak valid atau sudah kedaluwarsa.
        </p>
        <Link to="/forgot-password"
          className="btn-bronze-auth block text-center py-3.5 rounded-xl font-sans text-sm font-medium no-underline">
          Minta Link Baru
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E)", boxShadow: "0 0 0 8px rgba(196,151,62,0.1)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-display font-normal text-white mb-3 text-[28px]">Password Berhasil Diubah!</h2>
        <p className="font-sans text-sm leading-relaxed mb-2 text-[rgba(232,213,168,0.6)]">
          Mengarahkan ke halaman login...
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-normal text-white mb-2 text-[clamp(26px,4vw,34px)]">
          Buat Password Baru
        </h1>
        <p className="font-sans text-sm leading-relaxed text-[rgba(232,213,168,0.6)]">
          Masukkan password baru untuk akun{" "}
          <span className="text-bronze-light">{email}</span>
        </p>
      </div>

      {apiError && (
        <div className="mb-5 px-4 py-3 rounded-xl font-sans text-sm text-[#F0A0A0]"
          style={{ backgroundColor: "rgba(139,26,26,0.2)", border: "1px solid rgba(139,26,26,0.3)" }}>
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-sans text-xs font-medium mb-2 tracking-wide text-[rgba(232,213,168,0.7)]">PASSWORD BARU</label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
              placeholder="Minimal 8 karakter"
              className="w-full px-4 py-3.5 pr-12 rounded-xl font-sans text-sm outline-none transition-all duration-200"
              style={inputStyle("password")} onFocus={onFocus} onBlur={onBlur("password")} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 font-sans text-xs
                text-[rgba(232,213,168,0.4)] bg-transparent border-none cursor-pointer
                hover:text-bronze-light transition-colors duration-200">
              {showPass ? "HIDE" : "SHOW"}
            </button>
          </div>
          {errors.password && <p className="font-sans text-xs mt-1.5 text-[#F87171]">{errors.password}</p>}
        </div>

        <div>
          <label className="block font-sans text-xs font-medium mb-2 tracking-wide text-[rgba(232,213,168,0.7)]">KONFIRMASI PASSWORD</label>
          <input type={showPass ? "text" : "password"} name="password_confirmation" value={form.password_confirmation} onChange={handleChange}
            placeholder="Ulangi password baru"
            className="w-full px-4 py-3.5 rounded-xl font-sans text-sm outline-none transition-all duration-200"
            style={inputStyle("password_confirmation")} onFocus={onFocus} onBlur={onBlur("password_confirmation")} />
          {form.password_confirmation && (
            <p className="font-sans text-[10px] mt-1"
              style={{ color: form.password === form.password_confirmation ? "#10B981" : "#EF4444" }}>
              {form.password === form.password_confirmation ? "Password cocok ✓" : "Password tidak cocok"}
            </p>
          )}
          {errors.password_confirmation && <p className="font-sans text-xs mt-1.5 text-[#F87171]">{errors.password_confirmation}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="btn-bronze-auth w-full py-3.5 rounded-xl font-sans text-sm font-medium mt-2">
          {loading ? <ButtonLoading variant="letters" /> : "Reset Password"}
        </button>
      </form>
    </div>
  )
}
