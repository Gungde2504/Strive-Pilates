import { useState, useEffect } from "react"
import { IconX, IconEdit, IconCheck, IconPlus, IconUser, IconRefresh } from "../../components/icons/index"
import useApi from "../../hooks/useApi"
import ButtonLoading from "../../components/ButtonLoading"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json", "Content-Type": "application/json" })
const EMPTY   = { name: "", email: "", phone_wa: "", password: "", bio: "" }

// ─── Shared ───────────────────────────────────────────────────────────────────
function Card({ children, className = "", style = {}, ...props }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}
      {...props}>
      {children}
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block font-sans text-[10px] font-bold tracking-widest uppercase mb-1.5"
        style={{ color: "#94A3B8" }}>{label}</label>
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
const onFocusIn  = e => { e.target.style.border = "1.5px solid #3B82F6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.10)"; e.target.style.backgroundColor = "#FFFFFF" }
const onFocusOut = e => { e.target.style.border = "1.5px solid #E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#FAFAFA" }

function Input({ type = "text", value, onChange, placeholder, disabled, rows }) {
  const style = { ...inputBase, ...(disabled ? { backgroundColor: "#F8FAFC", cursor: "not-allowed", color: "#94A3B8" } : {}) }
  if (rows) return <textarea value={value} onChange={onChange} rows={rows} onFocus={onFocusIn} onBlur={onFocusOut} style={{ ...style, resize: "none" }} />
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} onFocus={!disabled ? onFocusIn : undefined} onBlur={!disabled ? onFocusOut : undefined} style={style} />
}

// ─── Instructor card ──────────────────────────────────────────────────────────
function InstructorCard({ inst, onEdit, onResetPw, onToggle }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered
          ? "8px 8px 20px rgba(0,0,0,0.10), -6px -6px 16px rgba(255,255,255,0.95), 0 0 0 1px rgba(59,130,246,0.15)"
          : "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.25s ease",
      }}>
      <div className="p-5">
        {/* Avatar + info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)", boxShadow: "0 6px 18px rgba(59,130,246,0.30)" }}>
            <span className="font-display text-xl text-white">{inst.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-sans text-sm font-semibold truncate mb-0.5" style={{ color: "#0F172A" }}>{inst.name}</div>
            <div className="font-sans text-xs truncate mb-1.5" style={{ color: "#64748B" }}>{inst.email}</div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-[10px] font-semibold"
              style={{ backgroundColor: inst.is_active ? "#F0FDF4" : "#FEF2F2", color: inst.is_active ? "#15803D" : "#B91C1C" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: inst.is_active ? "#22C55E" : "#EF4444" }} />
              {inst.is_active ? "Aktif" : "Nonaktif"}
            </span>
          </div>
        </div>

        {inst.bio && (
          <p className="font-sans text-xs mb-2 line-clamp-2 leading-relaxed" style={{ color: "#64748B" }}>{inst.bio}</p>
        )}
        <div className="font-sans text-xs mb-4" style={{ color: "#94A3B8" }}>
          {inst.phone_wa || "No HP belum diisi"}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid #F8FAFC" }}>
          <button onClick={() => onEdit(inst)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
              font-sans text-xs font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>
            <IconEdit size={12} color="#1D4ED8" /> Edit
          </button>
          <button onClick={() => onResetPw(inst.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
              font-sans text-xs font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: "#FFFBEB", color: "#B45309" }}>
            <IconRefresh size={12} color="#B45309" /> Reset PW
          </button>
          <button onClick={() => onToggle(inst.id)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
              font-sans text-xs font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: inst.is_active ? "#FEF2F2" : "#F0FDF4", color: inst.is_active ? "#DC2626" : "#15803D" }}>
            {inst.is_active
              ? <IconX size={12} color="#DC2626" />
              : <IconCheck size={12} color="#15803D" />}
          </button>
        </div>
      </div>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminInstructorsPage() {
  const [instructors,     setInstructors]     = useState([])
  const [showModal,       setShowModal]       = useState(false)
  const [showResetModal,  setShowResetModal]  = useState(false)
  const [form,            setForm]            = useState(EMPTY)
  const [editId,          setEditId]          = useState(null)
  const [resetId,         setResetId]         = useState(null)
  const [newPassword,     setNewPassword]     = useState("")
  const [saving,          setSaving]          = useState(false)
  const [resetting,       setResetting]       = useState(false)

  const { data, loading, refetch } = useApi("/api/admin/instructors")
  useEffect(() => { if (data) setInstructors(Array.isArray(data) ? data : []) }, [data])

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setShowModal(true) }
  const openEdit = (i) => {
    setForm({ name: i.name, email: i.email, phone_wa: i.phone_wa || "", password: "", bio: i.bio || "" })
    setEditId(i.id); setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = editId ? { name: form.name, phone_wa: form.phone_wa, bio: form.bio } : form
    const url = editId ? `/api/admin/instructors/${editId}` : "/api/admin/instructors"
    const res = await fetch(url, { method: editId ? "PUT" : "POST", headers: headers(), body: JSON.stringify(payload) })
    if (res.ok) { setShowModal(false); refetch() }
    setSaving(false)
  }

  const handleToggle = async (id) => {
    await fetch(`/api/admin/instructors/${id}/toggle`, { method: "PATCH", headers: headers() }); refetch()
  }

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 8) return alert("Password minimal 8 karakter")
    setResetting(true)
    const res = await fetch(`/api/admin/instructors/${resetId}/reset-password`, {
      method: "POST", headers: headers(), body: JSON.stringify({ password: newPassword }),
    })
    if (res.ok) { setShowResetModal(false); setNewPassword("") }
    setResetting(false)
  }

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Kelola Instruktur</h2>
          <p className="font-sans text-sm" style={{ color: "#64748B" }}>{instructors.length} instruktur terdaftar</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm
            font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)", boxShadow: "0 6px 16px rgba(59,130,246,0.30), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
          <IconPlus size={15} color="white" /> Tambah Instruktur
        </button>
      </div>

      {/* ── GRID ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-52 rounded-2xl animate-pulse bg-white"
              style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9)" }} />
          ))}
        </div>
      ) : instructors.length === 0 ? (
        <Card className="py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(59,130,246,0.08)" }}>
            <IconUser size={22} color="#3B82F6" />
          </div>
          <p className="font-sans text-sm font-medium mb-1" style={{ color: "#0F172A" }}>Belum ada instruktur</p>
          <p className="font-sans text-xs mb-5" style={{ color: "#94A3B8" }}>Tambahkan instruktur pertama</p>
          <button onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm font-semibold text-white border-none cursor-pointer"
            style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)" }}>
            <IconPlus size={14} color="white" /> Tambah Instruktur
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {instructors.map(inst => (
            <InstructorCard key={inst.id} inst={inst}
              onEdit={openEdit}
              onResetPw={(id) => { setResetId(id); setNewPassword(""); setShowResetModal(true) }}
              onToggle={handleToggle} />
          ))}
        </div>
      )}

      {/* ── ADD/EDIT MODAL ───────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.20)" }}>

            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #F8FAFC" }}>
              <div>
                <h3 className="font-sans text-base font-semibold" style={{ color: "#0F172A" }}>
                  {editId ? "Edit Instruktur" : "Tambah Instruktur"}
                </h3>
                <p className="font-sans text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                  {editId ? "Ubah detail instruktur" : "Daftarkan instruktur baru"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors duration-150">
                <IconX size={15} color="#64748B" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <FormField label="Nama Lengkap">
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nama instruktur" />
              </FormField>
              <FormField label="Email">
                <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="email@example.com" disabled={!!editId} />
              </FormField>
              <FormField label="No. HP (WhatsApp)">
                <Input type="tel" value={form.phone_wa} onChange={e => setForm(p => ({ ...p, phone_wa: e.target.value }))} placeholder="08xxxxxxxxxx" />
              </FormField>
              {!editId && (
                <FormField label="Password">
                  <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Minimal 8 karakter" />
                </FormField>
              )}
              <FormField label="Bio">
                <Input rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
              </FormField>
            </div>

            <div className="flex gap-3 px-6 py-5" style={{ borderTop: "1px solid #F8FAFC" }}>
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl font-sans text-sm font-medium border-none cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors duration-150">
                Batal
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-2xl font-sans text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200"
                style={{
                  background: "linear-gradient(145deg,#1E3A8A,#3B82F6)",
                  boxShadow: saving ? "none" : "0 6px 16px rgba(59,130,246,0.28)",
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}>
                {saving ? <ButtonLoading variant="dots" /> : editId ? "Simpan Perubahan" : "Tambah Instruktur"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESET PASSWORD MODAL ─────────────────────────────────────────── */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={e => e.target === e.currentTarget && setShowResetModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.20)" }}>

            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #F8FAFC" }}>
              <div>
                <h3 className="font-sans text-base font-semibold" style={{ color: "#0F172A" }}>Reset Password</h3>
                <p className="font-sans text-xs mt-0.5" style={{ color: "#94A3B8" }}>Buat password baru untuk instruktur</p>
              </div>
              <button onClick={() => setShowResetModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors duration-150">
                <IconX size={15} color="#64748B" />
              </button>
            </div>

            <div className="px-6 py-5">
              <FormField label="Password Baru">
                <Input type="password" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} placeholder="Minimal 8 karakter" />
              </FormField>
              {newPassword && newPassword.length < 8 && (
                <p className="font-sans text-xs mt-1.5" style={{ color: "#EF4444" }}>Password minimal 8 karakter</p>
              )}
            </div>

            <div className="flex gap-3 px-6 py-5" style={{ borderTop: "1px solid #F8FAFC" }}>
              <button onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 rounded-2xl font-sans text-sm font-medium border-none cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors duration-150">
                Batal
              </button>
              <button onClick={handleReset} disabled={resetting || newPassword.length < 8}
                className="flex-1 py-3 rounded-2xl font-sans text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200"
                style={{
                  background: "linear-gradient(145deg,#1E3A8A,#3B82F6)",
                  boxShadow: resetting ? "none" : "0 6px 16px rgba(59,130,246,0.28)",
                  opacity: (resetting || newPassword.length < 8) ? 0.55 : 1,
                  cursor: (resetting || newPassword.length < 8) ? "not-allowed" : "pointer",
                }}>
                {resetting ? <ButtonLoading variant="dots" /> : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
