import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import useAuthStore from "../../stores/authStore"
import ButtonLoading from "../../components/ButtonLoading"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [searchParams] = useSearchParams()

  const [form,     setForm]     = useState({ email: "", password: "" })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [apiError, setApiError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
    if (apiError) setApiError("")
  }

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = "Email wajib diisi"
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Format email tidak valid"
    if (!form.password) errs.password = "Password wajib diisi"
    else if (form.password.length < 6) errs.password = "Password minimal 6 karakter"
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    setApiError("")
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.success) { setApiError(data.message || "Email atau password salah"); return }
      login(data.data.user, data.data.token)
      const redirect = searchParams.get("redirect")
      navigate(redirect && data.data.user.role === "member" ? redirect : `/${data.data.user.role}/dashboard`)
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-normal text-white mb-2 text-[clamp(28px,4vw,36px)]">
          Selamat Datang
        </h1>
        <p className="font-sans text-sm text-[rgba(232,213,168,0.6)]">
          Masuk ke akun Strive Pilates kamu
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
          <label className="block font-sans text-xs font-medium mb-2 tracking-wide text-[rgba(232,213,168,0.7)]">EMAIL</label>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="nama@email.com"
            className="w-full px-4 py-3.5 rounded-xl font-sans text-sm outline-none transition-all duration-200"
            style={inputStyle("email")} onFocus={onFocus} onBlur={onBlur("email")} />
          {errors.email && <p className="font-sans text-xs mt-1.5 text-[#F87171]">{errors.email}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="font-sans text-xs font-medium tracking-wide text-[rgba(232,213,168,0.7)]">PASSWORD</label>
            <Link to="/forgot-password"
              className="font-sans text-xs no-underline text-bronze-light hover:text-[#E8D5A8] transition-colors duration-200">
              Lupa password?
            </Link>
          </div>
          <div className="relative">
            <input type={showPass ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
              placeholder="Minimal 6 karakter"
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

        <button type="submit" disabled={loading}
          className="btn-bronze-auth w-full py-3.5 rounded-xl font-sans text-sm font-medium mt-2">
          {loading ? <ButtonLoading variant="letters" /> : "Masuk"}
        </button>
      </form>

      <div className="flex items-center gap-4 my-7">
        <div className="flex-1 h-px bg-[rgba(196,151,62,0.2)]" />
        <span className="font-sans text-xs text-[rgba(232,213,168,0.3)]">atau</span>
        <div className="flex-1 h-px bg-[rgba(196,151,62,0.2)]" />
      </div>

      <p className="text-center font-sans text-sm text-[rgba(232,213,168,0.5)]">
        Belum punya akun?{" "}
        <Link to={`/register${searchParams.get("redirect") ? `?redirect=${searchParams.get("redirect")}` : ""}`}
          className="font-medium no-underline text-bronze-light hover:text-[#E8D5A8] transition-colors duration-200">
          Daftar sekarang
        </Link>
      </p>

      <p className="text-center font-sans text-xs mt-4">
        <Link to="/"
          className="no-underline text-[rgba(232,213,168,0.3)] hover:text-[rgba(232,213,168,0.6)] transition-colors duration-200">
          Kembali ke beranda
        </Link>
      </p>
    </div>
  )
}
