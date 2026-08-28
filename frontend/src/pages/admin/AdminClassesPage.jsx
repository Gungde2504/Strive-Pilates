import { useState, useEffect } from "react"
import { IconX, IconEdit, IconTrash, IconCheck, IconPlus } from "../../components/icons/index"
import useApi from "../../hooks/useApi"
import useConfirm from "../../hooks/useConfirm"
import ConfirmModal from "../../components/modals/ConfirmModal"
import ButtonLoading from "../../components/ButtonLoading"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json", "Content-Type": "application/json" })
const EMPTY   = { name: "", type: "mat", description: "", duration: 60, capacity: 10, price: 0, is_active: true }

// ─── Shared ───────────────────────────────────────────────────────────────────
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

function Input({ type = "text", value, onChange, placeholder, rows }) {
  const onFocus = e => { e.target.style.border = "1.5px solid #3B82F6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.10)"; e.target.style.backgroundColor = "#FFFFFF" }
  const onBlur  = e => { e.target.style.border = "1.5px solid #E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#FAFAFA" }
  if (rows) return <textarea value={value} onChange={onChange} rows={rows} onFocus={onFocus} onBlur={onBlur} style={{ ...inputBase, resize: "none" }} />
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} onFocus={onFocus} onBlur={onBlur} style={inputBase} />
}

function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange}
      onFocus={e => { e.target.style.border = "1.5px solid #3B82F6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.10)"; e.target.style.backgroundColor = "#FFFFFF" }}
      onBlur={e => { e.target.style.border = "1.5px solid #E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#FAFAFA" }}
      style={{ ...inputBase, cursor: "pointer" }}>
      {children}
    </select>
  )
}

// ─── Class card ───────────────────────────────────────────────────────────────
function ClassCard({ c, onEdit, onToggle, onDelete }) {
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
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-sans text-sm font-semibold mb-1.5" style={{ color: "#0F172A" }}>{c.name}</div>
            <span className="px-2.5 py-0.5 rounded-full font-sans text-[10px] font-semibold"
              style={{
                backgroundColor: c.type === "mat" ? "#EFF6FF" : "#F5F3FF",
                color: c.type === "mat" ? "#1D4ED8" : "#6D28D9",
              }}>
              {c.type === "mat" ? "Mat" : "Reformer"}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-[10px] font-semibold"
            style={{ backgroundColor: c.is_active ? "#F0FDF4" : "#FEF2F2", color: c.is_active ? "#15803D" : "#B91C1C" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.is_active ? "#22C55E" : "#EF4444" }} />
            {c.is_active ? "Aktif" : "Nonaktif"}
          </span>
        </div>

        {/* Description */}
        {c.description && (
          <p className="font-sans text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: "#64748B" }}>{c.description}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            ["Durasi",    `${c.duration} mnt`],
            ["Kapasitas", `${c.capacity} org`],
            ["Harga",     `Rp ${parseInt(c.price || 0).toLocaleString("id-ID")}`],
          ].map(([l, v]) => (
            <div key={l} className="text-center p-2.5 rounded-xl" style={{ backgroundColor: "#F8FAFC" }}>
              <div className="font-sans text-xs font-bold mb-0.5" style={{ color: "#0F172A" }}>{v}</div>
              <div className="font-sans text-[9px] font-medium uppercase tracking-wide" style={{ color: "#94A3B8" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid #F8FAFC" }}>
          <button onClick={() => onEdit(c)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
              font-sans text-xs font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>
            <IconEdit size={12} color="#1D4ED8" /> Edit
          </button>
          <button onClick={() => onToggle(c.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
              font-sans text-xs font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: c.is_active ? "#FFFBEB" : "#F0FDF4", color: c.is_active ? "#B45309" : "#15803D" }}>
            {c.is_active
              ? <><IconX size={12} color="#B45309" /> Nonaktifkan</>
              : <><IconCheck size={12} color="#15803D" /> Aktifkan</>}
          </button>
          <button onClick={() => onDelete(c.id, c.name)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
              font-sans text-xs font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
            <IconTrash size={12} color="#DC2626" />
          </button>
        </div>
      </div>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminClassesPage() {
  const [classes,   setClasses]   = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form,      setForm]      = useState(EMPTY)
  const [editId,    setEditId]    = useState(null)
  const [saving,    setSaving]    = useState(false)
  const confirmModal = useConfirm()

  const { data, loading, refetch } = useApi("/api/admin/classes")
  useEffect(() => { if (data) setClasses(Array.isArray(data) ? data : []) }, [data])

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setShowModal(true) }
  const openEdit = (c) => {
    setForm({ name: c.name, type: c.type, description: c.description || "", duration: c.duration, capacity: c.capacity, price: c.price, is_active: c.is_active })
    setEditId(c.id); setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const url = editId ? `/api/admin/classes/${editId}` : "/api/admin/classes"
    const res = await fetch(url, { method: editId ? "PUT" : "POST", headers: headers(), body: JSON.stringify(form) })
    if (res.ok) { setShowModal(false); refetch() }
    setSaving(false)
  }

  const handleToggle = async (id) => {
    await fetch(`/api/admin/classes/${id}/toggle`, { method: "PATCH", headers: headers() }); refetch()
  }

  const handleDelete = (id, name) => {
    confirmModal.open({
      title: "Hapus Kelas?",
      message: `Kelas "${name}" akan dihapus permanen.`,
      confirmLabel: "Ya, Hapus", variant: "danger",
      onConfirm: async () => { await fetch(`/api/admin/classes/${id}`, { method: "DELETE", headers: headers() }); refetch() },
    })
  }

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Kelola Kelas</h2>
          <p className="font-sans text-sm" style={{ color: "#64748B" }}>{classes.length} kelas tersedia</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm
            font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)", boxShadow: "0 6px 16px rgba(59,130,246,0.30), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
          <IconPlus size={15} color="white" /> Tambah Kelas
        </button>
      </div>

      {/* ── GRID ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 rounded-2xl animate-pulse bg-white"
              style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9)" }} />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card className="py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(59,130,246,0.08)" }}>
            <IconPlus size={22} color="#3B82F6" />
          </div>
          <p className="font-sans text-sm font-medium mb-1" style={{ color: "#0F172A" }}>Belum ada kelas</p>
          <p className="font-sans text-xs mb-5" style={{ color: "#94A3B8" }}>Tambahkan kelas pilates pertama</p>
          <button onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm font-semibold text-white border-none cursor-pointer"
            style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)" }}>
            <IconPlus size={14} color="white" /> Tambah Kelas
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(c => (
            <ClassCard key={c.id} c={c} onEdit={openEdit} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* ── MODAL ────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.20)" }}>

            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #F8FAFC" }}>
              <div>
                <h3 className="font-sans text-base font-semibold" style={{ color: "#0F172A" }}>
                  {editId ? "Edit Kelas" : "Tambah Kelas"}
                </h3>
                <p className="font-sans text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                  {editId ? "Ubah detail kelas" : "Buat kelas pilates baru"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors duration-150">
                <IconX size={15} color="#64748B" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <FormField label="Nama Kelas">
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nama kelas" />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Tipe">
                  <Select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    <option value="mat">Mat</option>
                    <option value="reformer">Reformer</option>
                  </Select>
                </FormField>
                <FormField label="Durasi (mnt)">
                  <Input type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Kapasitas">
                  <Input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} />
                </FormField>
                <FormField label="Harga (IDR)">
                  <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                </FormField>
              </div>
              <FormField label="Deskripsi">
                <Input rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
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
                {saving ? <ButtonLoading variant="dots" /> : editId ? "Simpan Perubahan" : "Tambah Kelas"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal {...confirmModal.props} />
    </div>
  )
}
