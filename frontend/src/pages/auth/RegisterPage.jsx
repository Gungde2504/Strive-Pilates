import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import useAuthStore from "../../stores/authStore"
import ButtonLoading from "../../components/ButtonLoading"

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState({ name: "", email: "", phone_wa: "", password: "", password_confirmation: "" })
  const [errors,      setErrors]      = useState({})
  const [loading,     setLoading]     = useState(false)
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError,    setApiError]    = useState("")

  // Auto konversi 08xxx → 628xxx
  const normalizePhone = (val) => {
    const digits = val.replace(/\D/g, "")
    if (digits.startsWith("0")) return "62" + digits.slice(1)
    return digits
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "phone_wa") {
      // Simpan raw input dulu supaya user bisa edit
      setForm(prev => ({ ...prev, phone_wa: value }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
    if (apiError) setApiError("")
  }

  const handlePhoneBlur = () => {
    if (form.phone_wa) {
      const normalized = normalizePhone(form.phone_wa)
      setForm(prev => ({ ...prev, phone_wa: normalized }))
    }
  }

  const startsWithZero = form.phone_wa.startsWith("0")

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = "Nama wajib diisi"
    else if (form.name.trim().length < 2) errs.name = "Nama minimal 2 karakter"
    if (!form.email) errs.email = "Email wajib diisi"
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Format email tidak valid"
    if (!form.phone_wa) errs.phone_wa = "Nomor HP wajib diisi"
    else if (form.phone_wa.length < 10) errs.phone_wa = "Nomor HP tidak valid"
    if (!form.password) errs.password = "Password wajib diisi"
    else if (form.password.length < 8) errs.password = "Password minimal 8 karakter"
    if (!form.password_confirmation) errs.password_confirmation = "Konfirmasi password wajib diisi"
    else if (form.password !== form.password_confirmation) errs.password_confirmation = "Password tidak cocok"
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Normalize phone sebelum submit
    const normalizedForm = { ...form, phone_wa: normalizePhone(form.phone_wa) }
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    setApiError("")
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(normalizedForm),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.errors) {
          const apiErrs = {}
          Object.keys(data.errors).forEach(k => { apiErrs[k] = data.errors[k][0] })
          setErrors(apiErrs)
        } else {
          setApiError(data.message || "Registrasi gagal. Coba lagi.")
        }
        return
      }
      login(data.data.user, data.data.token)
      navigate(searchParams.get("redirect") || "/member/dashboard")
    } catch {
      setApiError("Koneksi gagal. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const getStrength = (pass) => {
    if (!pass) return { level: 0, label: "", color: "" }
    let score = 0
    if (pass.length >= 8)          score++
    if (/[A-Z]/.test(pass))        score++
    if (/[0-9]/.test(pass))        score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return [
      { level: 1, label: "Lemah",  color: "#EF4444" },
      { level: 2, label: "Cukup",  color: "#F59E0B" },
      { level: 3, label: "Baik",   color: "#10B981" },
      { level: 4, label: "Kuat",   color: "#059669" },
    ][score - 1] || { level: 0, label: "", color: "" }
  }
  const strength = getStrength(form.password)

  const inputStyle = (field) => ({
    backgroundColor: "rgba(255,255,255,0.06)",
    border: `1px solid ${errors[field] ? "rgba(239,68,68,0.6)" : "rgba(196,151,62,0.25)"}`,
    color: "#E8D5A8", caretColor: "#C4973E",
  })
  const phoneInputStyle = {
    backgroundColor: "rgba(255,255,255,0.06)",
    border: `1px solid ${errors.phone_wa ? "rgba(239,68,68,0.6)" : startsWithZero ? "rgba(239,68,68,0.5)" : "rgba(196,151,62,0.25)"}`,
    color: startsWithZero ? "#FCA5A5" : "#E8D5A8",
    caretColor: "#C4973E",
  }
  const onFocus = (e) => e.target.style.border = "1px solid rgba(196,151,62,0.6)"
  const onBlur  = (field) => (e) => {
    e.target.style.border = `1px solid ${errors[field] ? "rgba(239,68,68,0.6)" : "rgba(196,151,62,0.25)"}`
  }
  const onPhoneFocus = (e) => e.target.style.border = "1px solid rgba(196,151,62,0.6)"
  const onPhoneBlur  = (e) => {
    handlePhoneBlur()
    e.target.style.border = `1px solid ${errors.phone_wa ? "rgba(239,68,68,0.6)" : "rgba(196,151,62,0.25)"}`
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display font-normal text-white mb-2 text-[clamp(26px,4vw,34px)]">Buat Akun</h1>
        <p className="font-sans text-sm text-[rgba(232,213,168,0.6)]">Bergabung dengan komunitas Strive Pilates Bali</p>
      </div>

      {apiError && (
        <div className="mb-5 px-4 py-3 rounded-xl font-sans text-sm text-[#F0A0A0]"
          style={{ backgroundColor: "rgba(139,26,26,0.2)", border: "1px solid rgba(139,26,26,0.3)" }}>
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama */}
        <div>
          <label className="block font-sans text-xs font-medium mb-2 tracking-wide text-[rgba(232,213,168,0.7)]">NAMA LENGKAP</label>
          <input type="text" name="name" value={form.name} onChange={handleChange}
            placeholder="Nama lengkap kamu"
            className="w-full px-4 py-3.5 rounded-xl font-sans text-sm outline-none transition-all duration-200"
            style={inputStyle("name")} onFocus={onFocus} onBlur={onBlur("name")} />
          {errors.name && <p className="font-sans text-xs mt-1.5 text-[#F87171]">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block font-sans text-xs font-medium mb-2 tracking-wide text-[rgba(232,213,168,0.7)]">EMAIL</label>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="nama@email.com"
            className="w-full px-4 py-3.5 rounded-xl font-sans text-sm outline-none transition-all duration-200"
            style={inputStyle("email")} onFocus={onFocus} onBlur={onBlur("email")} />
          {errors.email && <p className="font-sans text-xs mt-1.5 text-[#F87171]">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block font-sans text-xs font-medium mb-2 tracking-wide text-[rgba(232,213,168,0.7)]">NOMOR HP (WhatsApp)</label>
          <input type="tel" name="phone_wa" value={form.phone_wa} onChange={handleChange}
            placeholder="628xxxxxxxxx"
            className="w-full px-4 py-3.5 rounded-xl font-sans text-sm outline-none transition-all duration-200"
            style={phoneInputStyle} onFocus={onPhoneFocus} onBlur={onPhoneBlur} />
          {startsWithZero && !errors.phone_wa && (
            <p className="font-sans text-xs mt-1.5 flex items-center gap-1" style={{ color: "#FCA5A5" }}>
              ⚠ Format nomor diawali 0 — akan otomatis dikonversi ke <strong>62{form.phone_wa.slice(1)}</strong> saat disimpan
            </p>
          )}
          {errors.phone_wa && <p className="font-sans text-xs mt-1.5 text-[#F87171]">{errors.phone_wa}</p>}
          {!startsWithZero && !errors.phone_wa && form.phone_wa && (
            <p className="font-sans text-xs mt-1.5" style={{ color: "rgba(232,213,168,0.4)" }}>
              Format: 628xxxxxxxxx
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block font-sans text-xs font-medium mb-2 tracking-wide text-[rgba(232,213,168,0.7)]">PASSWORD</label>
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
          {form.password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{ backgroundColor: i <= strength.level ? strength.color : "rgba(255,255,255,0.1)" }} />
                ))}
              </div>
              <p className="font-sans text-[10px]" style={{ color: strength.color }}>{strength.label}</p>
            </div>
          )}
          {errors.password && <p className="font-sans text-xs mt-1.5 text-[#F87171]">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block font-sans text-xs font-medium mb-2 tracking-wide text-[rgba(232,213,168,0.7)]">KONFIRMASI PASSWORD</label>
          <div className="relative">
            <input type={showConfirm ? "text" : "password"} name="password_confirmation" value={form.password_confirmation} onChange={handleChange}
              placeholder="Ulangi password"
              className="w-full px-4 py-3.5 pr-12 rounded-xl font-sans text-sm outline-none transition-all duration-200"
              style={inputStyle("password_confirmation")} onFocus={onFocus} onBlur={onBlur("password_confirmation")} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 font-sans text-xs
                text-[rgba(232,213,168,0.4)] bg-transparent border-none cursor-pointer
                hover:text-bronze-light transition-colors duration-200">
              {showConfirm ? "HIDE" : "SHOW"}
            </button>
          </div>
          {form.password_confirmation && (
            <p className="font-sans text-[10px] mt-1"
              style={{ color: form.password === form.password_confirmation ? "#10B981" : "#EF4444" }}>
              {form.password === form.password_confirmation ? "Password cocok ✓" : "Password tidak cocok"}
            </p>
          )}
          {errors.password_confirmation && <p className="font-sans text-xs mt-1.5 text-[#F87171]">{errors.password_confirmation}</p>}
        </div>

        <p className="font-sans text-xs leading-relaxed pt-1 text-[rgba(232,213,168,0.4)]">
          Dengan mendaftar, kamu menyetujui{" "}
          <Link to="#" className="no-underline text-bronze-light hover:text-[#E8D5A8] transition-colors duration-200">Syarat & Ketentuan</Link>
          {" "}dan{" "}
          <Link to="#" className="no-underline text-bronze-light hover:text-[#E8D5A8] transition-colors duration-200">Kebijakan Privasi</Link> kami.
        </p>

        <button type="submit" disabled={loading}
          className="btn-bronze-auth w-full py-3.5 rounded-xl font-sans text-sm font-medium">
          {loading ? <ButtonLoading variant="letters" /> : "Daftar Sekarang"}
        </button>
      </form>

      <p className="text-center font-sans text-sm mt-6 text-[rgba(232,213,168,0.5)]">
        Sudah punya akun?{" "}
        <Link to={`/login${searchParams.get("redirect") ? `?redirect=${searchParams.get("redirect")}` : ""}`}
          className="font-medium no-underline text-bronze-light hover:text-[#E8D5A8] transition-colors duration-200">
          Masuk
        </Link>
      </p>

      <p className="text-center font-sans text-xs mt-3">
        <Link to="/"
          className="no-underline text-[rgba(232,213,168,0.3)] hover:text-[rgba(232,213,168,0.6)] transition-colors duration-200">
          Kembali ke beranda
        </Link>
      </p>
    </div>
  )
}
