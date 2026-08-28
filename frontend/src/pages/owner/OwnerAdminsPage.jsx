import { useState, useEffect } from "react"
import { IconX, IconEdit, IconTrash, IconCheck, IconPlus, IconUser } from "../../components/icons/index"
import useApi from "../../hooks/useApi"
import useConfirm from "../../hooks/useConfirm"
import ConfirmModal from "../../components/modals/ConfirmModal"
import ButtonLoading from "../../components/ButtonLoading"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json", "Content-Type": "application/json" })
const EMPTY   = { name: "", email: "", phone_wa: "", password: "" }

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
const onFocusIn  = e => { e.target.style.border = "1.5px solid #7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.10)"; e.target.style.backgroundColor = "#FFFFFF" }
const onFocusOut = e => { e.target.style.border = "1.5px solid #E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#FAFAFA" }

function Input({ type = "text", value, onChange, placeholder, disabled }) {
  const style = { ...inputBase, ...(disabled ? { backgroundColor: "#F8FAFC", cursor: "not-allowed", color: "#94A3B8" } : {}) }
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      onFocus={!disabled ? onFocusIn : undefined} onBlur={!disabled ? onFocusOut : undefined}
      style={style} />
  )
}

function AdminCard({ admin, onEdit, onToggle, onDelete }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered
          ? "8px 8px 20px rgba(0,0,0,0.10), -6px -6px 16px rgba(255,255,255,0.95), 0 0 0 1px rgba(124,58,237,0.15)"
          : "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.25s ease",
      }}>
      <div className="p-5">
        {/* Avatar + info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(145deg,#1E0A3C,#7C3AED)", boxShadow: "0 6px 18px rgba(124,58,237,0.30)" }}>
            <span className="font-display text-lg text-white">{admin.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-sans text-sm font-semibold truncate mb-0.5" style={{ color: "#0F172A" }}>{admin.name}</div>
            <div className="font-sans text-xs truncate mb-1.5" style={{ color: "#64748B" }}>{admin.email}</div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-[10px] font-semibold"
              style={{ backgroundColor: admin.is_active ? "#F0FDF4" : "#FEF2F2", color: admin.is_active ? "#15803D" : "#B91C1C" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: admin.is_active ? "#22C55E" : "#EF4444" }} />
              {admin.is_active ? "Aktif" : "Nonaktif"}
            </span>
          </div>
        </div>
        <div className="font-sans text-xs mb-4" style={{ color: "#94A3B8" }}>
          {admin.phone_wa || "No HP belum diisi"}
        </div>
        <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid #F8FAFC" }}>
          <button onClick={() => onEdit(admin)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
              font-sans text-xs font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}>
            <IconEdit size={12} color="#7C3AED" /> Edit
          </button>
          <button onClick={() => onToggle(admin.id, admin.name, admin.is_active)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
              font-sans text-xs font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: admin.is_active ? "#FFFBEB" : "#F0FDF4", color: admin.is_active ? "#B45309" : "#15803D" }}>
            {admin.is_active
              ? <><IconX size={12} color="#B45309" /> Nonaktifkan</>
              : <><IconCheck size={12} color="#15803D" /> Aktifkan</>}
          </button>
          <button onClick={() => onDelete(admin.id, admin.name)}
            className="inline-flex items-center justify-center px-3 py-2 rounded-xl
              font-sans text-xs font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
            <IconTrash size={12} color="#DC2626" />
          </button>
        </div>
      </div>
    </Card>
  )
}

export default function OwnerAdminsPage() {
  const [admins,    setAdmins]    = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form,      setForm]      = useState(EMPTY)
  const [editId,    setEditId]    = useState(null)
  const [saving,    setSaving]    = useState(false)
  const confirmModal = useConfirm()

  const { data, loading, refetch } = useApi("/api/owner/admins")
  useEffect(() => { if (data) setAdmins(Array.isArray(data) ? data : []) }, [data])

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setShowModal(true) }
  const openEdit = (a) => { setForm({ name: a.name, email: a.email, phone_wa: a.phone_wa || "", password: "" }); setEditId(a.id); setShowModal(true) }

  const handleSave = async () => {
    setSaving(true)
    const url     = editId ? `/api/owner/admins/${editId}` : "/api/owner/admins"
    const payload = editId ? { name: form.name, phone_wa: form.phone_wa } : form
    const res     = await fetch(url, { method: editId ? "PUT" : "POST", headers: headers(), body: JSON.stringify(payload) })
    if (res.ok) { setShowModal(false); refetch() }
    setSaving(false)
  }

  const handleToggle = (id, name, isActive) => {
    confirmModal.open({
      title: isActive ? "Nonaktifkan Admin?" : "Aktifkan Admin?",
      message: isActive
        ? `Admin "${name}" tidak akan bisa login sampai diaktifkan kembali.`
        : `Admin "${name}" akan bisa login kembali.`,
      confirmLabel: isActive ? "Ya, Nonaktifkan" : "Ya, Aktifkan",
      variant: isActive ? "warning" : "default",
      onConfirm: async () => { await fetch(`/api/owner/admins/${id}/toggle`, { method: "PATCH", headers: headers() }); refetch() },
    })
  }

  const handleDelete = (id, name) => {
    confirmModal.open({
      title: "Hapus Admin?",
      message: `Admin "${name}" akan dihapus permanen dari sistem.`,
      confirmLabel: "Ya, Hapus", variant: "danger",
      onConfirm: async () => { await fetch(`/api/owner/admins/${id}`, { method: "DELETE", headers: headers() }); refetch() },
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Kelola Admin</h2>
          <p className="font-sans text-sm" style={{ color: "#64748B" }}>{admins.length} admin terdaftar</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm
            font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(145deg,#1E0A3C,#7C3AED)", boxShadow: "0 6px 16px rgba(124,58,237,0.30), inset 0 1px 0 rgba(255,255,255,0.12)" }}>
          <IconPlus size={15} color="white" /> Tambah Admin
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl animate-pulse bg-white"
              style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9)" }} />
          ))}
        </div>
      ) : admins.length === 0 ? (
        <Card className="py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(124,58,237,0.08)" }}>
            <IconUser size={22} color="#7C3AED" />
          </div>
          <p className="font-sans text-sm font-medium mb-1" style={{ color: "#0F172A" }}>Belum ada admin</p>
          <p className="font-sans text-xs mb-5" style={{ color: "#94A3B8" }}>Tambahkan admin pertama untuk sistem</p>
          <button onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm font-semibold text-white border-none cursor-pointer"
            style={{ background: "linear-gradient(145deg,#1E0A3C,#7C3AED)" }}>
            <IconPlus size={14} color="white" /> Tambah Admin
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map(admin => (
            <AdminCard key={admin.id} admin={admin} onEdit={openEdit} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.20)" }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #F8FAFC" }}>
              <div>
                <h3 className="font-sans text-base font-semibold" style={{ color: "#0F172A" }}>
                  {editId ? "Edit Admin" : "Tambah Admin"}
                </h3>
                <p className="font-sans text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                  {editId ? "Ubah detail admin" : "Daftarkan admin baru"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors duration-150">
                <IconX size={15} color="#64748B" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <FormField label="Nama Lengkap">
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nama admin" />
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
            </div>

            <div className="flex gap-3 px-6 py-5" style={{ borderTop: "1px solid #F8FAFC" }}>
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl font-sans text-sm font-medium border-none cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors duration-150">
                Batal
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-2xl font-sans text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200"
                style={{
                  background: "linear-gradient(145deg,#1E0A3C,#7C3AED)",
                  boxShadow: saving ? "none" : "0 6px 16px rgba(124,58,237,0.28)",
                  opacity: saving ? 0.7 : 1, cursor: saving ? "not-allowed" : "pointer",
                }}>
                {saving ? <ButtonLoading variant="dots" /> : editId ? "Simpan Perubahan" : "Tambah Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal {...confirmModal.props} />
    </div>
  )
}
