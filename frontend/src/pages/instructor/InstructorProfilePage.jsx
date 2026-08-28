import { useState, useEffect } from "react"
import { IconCheck, IconUser } from "../../components/icons/index"
import useAuthStore from "../../stores/authStore"
import ButtonLoading from "../../components/ButtonLoading"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json", "Content-Type": "application/json" })
const GREEN   = "#15502C"

function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block font-sans text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#94A3B8" }}>{label}</label>
      {children}
    </div>
  )
}

const inputBase = {
  width: "100%", padding: "10px 14px", borderRadius: "12px",
  fontFamily: "inherit", fontSize: "13px", outline: "none",
  border: "1.5px solid #E2E8F0", backgroundColor: "#FAFAFA",
  color: "#0F172A", transition: "all 0.2s ease",
}
const onFI = e => { e.target.style.border = `1.5px solid ${GREEN}`; e.target.style.boxShadow = "0 0 0 3px rgba(21,80,44,0.10)"; e.target.style.backgroundColor = "#FFFFFF" }
const onFO = e => { e.target.style.border = "1.5px solid #E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#FAFAFA" }

export default function InstructorProfilePage() {
  const { user, setUser } = useAuthStore()
  const [form,    setForm]    = useState({ name: "", phone_wa: "", bio: "" })
  const [pwForm,  setPwForm]  = useState({ current_password: "", password: "", password_confirmation: "" })
  const [saving,  setSaving]  = useState(false)
  const [savingPw,setSavingPw]= useState(false)
  const [success, setSuccess] = useState("")
  const [error,   setError]   = useState("")

  useEffect(() => { if (user) setForm({ name: user.name||"", phone_wa: user.phone_wa||"", bio: user.bio||"" }) }, [user])

  const flash = (type, msg) => {
    if (type === "ok") { setSuccess(msg); setError("") }
    else { setError(msg); setSuccess("") }
    setTimeout(() => { setSuccess(""); setError("") }, 3000)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    const res  = await fetch("/api/auth/profile", { method: "PUT", headers: headers(), body: JSON.stringify(form) })
    const data = await res.json()
    if (res.ok) { flash("ok", "Profil berhasil diperbarui!"); if (data.data) setUser(data.data) }
    else flash("err", data.message || "Gagal memperbarui profil")
    setSaving(false)
  }

  const handleSavePw = async () => {
    setSavingPw(true)
    const res  = await fetch("/api/auth/change-password", { method: "POST", headers: headers(), body: JSON.stringify(pwForm) })
    const data = await res.json()
    if (res.ok) { flash("ok", "Password berhasil diubah!"); setPwForm({ current_password:"", password:"", password_confirmation:"" }) }
    else flash("err", data.message || "Gagal mengubah password")
    setSavingPw(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Profil Saya</h2>
        <p className="font-sans text-sm" style={{ color: "#64748B" }}>Kelola informasi akun Anda</p>
      </div>

      {success && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5 font-sans text-sm"
          style={{ backgroundColor: "#F0FDF4", border: "1px solid #D5EDD8", color: "#15803D" }}>
          <IconCheck size={15} color="#15803D" /> {success}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-xl mb-5 font-sans text-sm"
          style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" }}>
          {error}
        </div>
      )}

      {/* Profile card */}
      <Card className="p-6 mb-5">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid #F8FAFC" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(145deg,#15502C,#2D9A56)", boxShadow: "0 8px 24px rgba(21,80,44,0.30)" }}>
            <span className="font-display text-2xl text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <div className="font-sans text-base font-semibold mb-0.5" style={{ color: "#0F172A" }}>{user?.name}</div>
            <div className="font-sans text-sm mb-1.5" style={{ color: "#64748B" }}>{user?.email}</div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold"
              style={{ backgroundColor: "#F0FDF4", color: "#15803D" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Instruktur
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <FormField label="Nama Lengkap">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              onFocus={onFI} onBlur={onFO} style={inputBase} />
          </FormField>
          <FormField label="No. HP / WhatsApp">
            <input type="tel" value={form.phone_wa} onChange={e => setForm(p => ({ ...p, phone_wa: e.target.value }))}
              onFocus={onFI} onBlur={onFO} style={inputBase} />
          </FormField>
          <FormField label="Bio">
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              rows={3} placeholder="Ceritakan tentang diri Anda..."
              onFocus={onFI} onBlur={onFO} style={{ ...inputBase, resize: "none" }} />
          </FormField>
          <button onClick={handleSaveProfile} disabled={saving}
            className="w-full py-3 rounded-2xl font-sans text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(145deg,#15502C,#2D9A56)", boxShadow: saving?"none":"0 6px 16px rgba(21,80,44,0.25)", opacity: saving?0.7:1 }}>
            {saving ? <ButtonLoading variant="dots" /> : "Simpan Profil"}
          </button>
        </div>
      </Card>

      {/* Password card */}
      <Card className="p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(21,80,44,0.08)" }}>
            <IconUser size={15} color={GREEN} />
          </div>
          <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Ganti Password</h3>
        </div>
        <div className="space-y-4">
          {[["Password Lama","current_password"],["Password Baru","password"],["Konfirmasi Password","password_confirmation"]].map(([label, field]) => (
            <FormField key={field} label={label}>
              <input type="password" value={pwForm[field]} onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                placeholder="••••••••" onFocus={onFI} onBlur={onFO} style={inputBase} />
            </FormField>
          ))}
          <button onClick={handleSavePw} disabled={savingPw}
            className="w-full py-3 rounded-2xl font-sans text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(145deg,#15502C,#2D9A56)", boxShadow: savingPw?"none":"0 6px 16px rgba(21,80,44,0.25)", opacity: savingPw?0.7:1 }}>
            {savingPw ? <ButtonLoading variant="dots" /> : "Ubah Password"}
          </button>
        </div>
      </Card>
    </div>
  )
}
