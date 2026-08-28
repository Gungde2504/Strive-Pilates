import { useState } from "react"
import useAuthStore from "../../stores/authStore"
import { IconCheck, IconUser } from "../../components/icons/index"
import useInView from "../../hooks/useInView"
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

function InputField({ label, value, onChange, type = "text", disabled = false, placeholder = "" }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block font-sans text-xs font-semibold tracking-[0.08em] mb-2"
        style={{ color: focused ? "#8B6914" : "#9CA3AF" }}>
        {label}
      </label>
      <input type={type} value={value} onChange={onChange} disabled={disabled}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 py-3 rounded-xl font-sans text-sm outline-none transition-all duration-200"
        style={{
          backgroundColor: disabled ? "#F9FAFB" : "#FFFFFF",
          border: `1.5px solid ${focused ? "#C4973E" : disabled ? "#F3F4F6" : "#E5E7EB"}`,
          color: disabled ? "#9CA3AF" : "#1A1208",
          boxShadow: focused ? "0 0 0 3px rgba(196,151,62,0.12)" : "none",
          cursor: disabled ? "not-allowed" : "text",
        }} />
    </div>
  )
}

export default function MemberProfilePage() {
  const { user, login } = useAuthStore()
  const token = localStorage.getItem("auth_token")

  const [form, setForm] = useState({
    name:     user?.name     || "",
    email:    user?.email    || "",
    phone_wa: user?.phone_wa || "",
  })
  const [passForm, setPassForm] = useState({
    current_password:      "",
    password:              "",
    password_confirmation: "",
  })
  const [loading,     setLoading]     = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [success,     setSuccess]     = useState("")
  const [error,       setError]       = useState("")
  const [activeTab,   setActiveTab]   = useState("profile")

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true); setSuccess(""); setError("")
    try {
      const res  = await fetch("/api/auth/profile", { method: "PUT", headers, body: JSON.stringify(form) })
      const data = await res.json()
      if (res.ok) { login({ ...user, ...form }, token); setSuccess("Profil berhasil diperbarui!") }
      else setError(data.message || "Gagal memperbarui profil")
    } catch { setError("Koneksi gagal") }
    setLoading(false)
  }

  const handlePassChange = async (e) => {
    e.preventDefault()
    if (passForm.password !== passForm.password_confirmation) { setError("Password baru tidak cocok"); return }
    setPassLoading(true); setSuccess(""); setError("")
    try {
      const res  = await fetch("/api/auth/change-password", { method: "POST", headers, body: JSON.stringify(passForm) })
      const data = await res.json()
      if (res.ok) { setSuccess("Password berhasil diubah!"); setPassForm({ current_password: "", password: "", password_confirmation: "" }) }
      else setError(data.message || "Gagal mengubah password")
    } catch { setError("Koneksi gagal") }
    setPassLoading(false)
  }

  const initials = user?.name
    ?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div className="max-w-3xl">

      {/* ── PROFILE HEADER ───────────────────────────────────────────── */}
      <FadeIn>
        <div className="relative rounded-3xl overflow-hidden mb-6"
          style={{ background: "linear-gradient(135deg, #1A1208 0%, #2D1F08 60%, #3D2A10 100%)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(196,151,62,0.18), transparent 60%)" }} />
          <div className="relative p-7 flex items-center gap-6 flex-wrap">

            {/* Avatar — full rounded */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, #7A5C0E, #C4973E)",
                  boxShadow: "0 8px 24px rgba(107,79,10,0.45), 0 0 0 4px rgba(196,151,62,0.20)",
                }}>
                <span className="font-display text-3xl text-white leading-none">{initials}</span>
              </div>
              {/* Active badge */}
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#10B981", border: "2.5px solid #1A1208" }}>
                <IconCheck size={9} color="white" />
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-white mb-1">{user?.name}</h2>
              <p className="font-sans text-sm mb-3 text-[rgba(232,213,168,0.55)]">{user?.email}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full font-sans text-xs font-medium"
                  style={{ backgroundColor: "rgba(196,151,62,0.2)", color: "#C4973E", border: "1px solid rgba(196,151,62,0.3)" }}>
                  Member Aktif
                </span>
                <span className="px-3 py-1 rounded-full font-sans text-xs"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(232,213,168,0.5)" }}>
                  Bergabung {new Date(user?.created_at || Date.now()).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── ALERT ────────────────────────────────────────────────────── */}
      {success && (
        <FadeIn>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 font-sans text-sm"
            style={{ backgroundColor: "#F0FDF4", border: "1px solid #D5EDD8", color: "#1A6B2A" }}>
            <IconCheck size={15} color="#1A6B2A" /> {success}
          </div>
        </FadeIn>
      )}
      {error && (
        <FadeIn>
          <div className="px-4 py-3 rounded-xl mb-5 font-sans text-sm"
            style={{ backgroundColor: "#FEF2F2", border: "1px solid #F0D4D4", color: "#8B1A1A" }}>
            {error}
          </div>
        </FadeIn>
      )}

      {/* ── TABS ─────────────────────────────────────────────────────── */}
      <FadeIn delay={100}>
        <div className="flex gap-1 mb-6 p-1 rounded-2xl w-fit bg-white"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {[["profile","Informasi Pribadi"], ["password","Ubah Password"]].map(([val, label]) => (
            <button key={val} onClick={() => { setActiveTab(val); setSuccess(""); setError("") }}
              className="px-5 py-2.5 rounded-xl font-sans text-sm font-medium border-none cursor-pointer transition-all duration-200"
              style={{
                background: activeTab === val ? "linear-gradient(145deg, #7A5C0E, #C4973E)" : "transparent",
                color: activeTab === val ? "#FFFFFF" : "#6B5E4A",
              }}>
              {label}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* ── PROFILE FORM ─────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <FadeIn delay={150}>
          <div className="bg-white rounded-2xl p-7"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #F3F4F6" }}>
            <h3 className="font-sans text-base font-semibold text-warm-black mb-6">Informasi Pribadi</h3>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField label="NAMA LENGKAP" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                <InputField label="EMAIL" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} disabled />
              </div>
              <InputField label="NOMOR HP / WHATSAPP" value={form.phone_wa}
                onChange={e => setForm(p => ({ ...p, phone_wa: e.target.value }))}
                placeholder="08xxxxxxxxxx" />

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="btn-bronze-auth px-7 py-3 rounded-xl font-sans text-sm font-medium">
                  {loading ? <ButtonLoading variant="dots" /> : "Simpan Perubahan"}
                </button>
                <button type="button"
                  onClick={() => setForm({ name: user?.name || "", email: user?.email || "", phone_wa: user?.phone_wa || "" })}
                  className="px-5 py-3 rounded-xl font-sans text-sm border-none cursor-pointer transition-all duration-200"
                  style={{ backgroundColor: "#F9FAFB", color: "#6B5E4A", border: "1px solid #E5E7EB" }}>
                  Reset
                </button>
              </div>
            </form>
          </div>
        </FadeIn>
      )}

      {/* ── PASSWORD FORM ─────────────────────────────────────────────── */}
      {activeTab === "password" && (
        <FadeIn delay={150}>
          <div className="bg-white rounded-2xl p-7"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #F3F4F6" }}>
            <h3 className="font-sans text-base font-semibold text-warm-black mb-2">Ubah Password</h3>
            <p className="font-sans text-sm text-warm-text/55 mb-6">Pastikan password baru minimal 8 karakter.</p>
            <form onSubmit={handlePassChange} className="space-y-5">
              <InputField label="PASSWORD SAAT INI" type="password"
                value={passForm.current_password}
                onChange={e => setPassForm(p => ({ ...p, current_password: e.target.value }))} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField label="PASSWORD BARU" type="password"
                  value={passForm.password}
                  onChange={e => setPassForm(p => ({ ...p, password: e.target.value }))} />
                <InputField label="KONFIRMASI PASSWORD" type="password"
                  value={passForm.password_confirmation}
                  onChange={e => setPassForm(p => ({ ...p, password_confirmation: e.target.value }))} />
              </div>

              {passForm.password && passForm.password_confirmation && (
                <p className="font-sans text-xs"
                  style={{ color: passForm.password === passForm.password_confirmation ? "#10B981" : "#EF4444" }}>
                  {passForm.password === passForm.password_confirmation ? "✓ Password cocok" : "✗ Password tidak cocok"}
                </p>
              )}

              <button type="submit" disabled={passLoading}
                className="btn-bronze-auth px-7 py-3 rounded-xl font-sans text-sm font-medium">
                {passLoading ? <ButtonLoading variant="dots" /> : "Ubah Password"}
              </button>
            </form>
          </div>
        </FadeIn>
      )}
    </div>
  )
}
