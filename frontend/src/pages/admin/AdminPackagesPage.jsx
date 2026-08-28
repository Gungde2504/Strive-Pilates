import { useState, useEffect } from "react"
import { IconX, IconEdit, IconTrash, IconCheck, IconPlus, IconPackage } from "../../components/icons/index"
import useApi from "../../hooks/useApi"
import useConfirm from "../../hooks/useConfirm"
import ConfirmModal from "../../components/modals/ConfirmModal"
import ButtonLoading from "../../components/ButtonLoading"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json", "Content-Type": "application/json" })
const EMPTY   = { name: "", session_count: 1, validity_days: 30, price: 0, description: "", benefits: [], is_featured: false, is_active: true }

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

function Input({ type = "text", value, onChange, placeholder, min, rows }) {
  if (rows) return <textarea value={value} onChange={onChange} rows={rows} onFocus={onFocusIn} onBlur={onFocusOut} style={{ ...inputBase, resize: "none" }} />
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} onFocus={onFocusIn} onBlur={onFocusOut} style={inputBase} />
}

// ─── Package card ─────────────────────────────────────────────────────────────
function PackageCard({ pkg, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-2xl overflow-hidden transition-all duration-250"
      style={{
        boxShadow: hovered
          ? "8px 8px 20px rgba(0,0,0,0.10), -6px -6px 16px rgba(255,255,255,0.95), 0 0 0 1px rgba(59,130,246,0.15)"
          : pkg.is_featured
            ? "6px 6px 16px rgba(0,0,0,0.10), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 2px #3B82F6"
            : "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-3px)" : pkg.is_featured ? "translateY(-1px)" : "translateY(0)",
      }}>

      {/* Featured banner */}
      {pkg.is_featured && (
        <div className="flex items-center justify-center gap-1.5 py-2 font-sans text-[10px] font-bold text-white tracking-widest"
          style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)" }}>
          <IconPackage size={11} color="rgba(255,255,255,0.7)" />
          TERPOPULER
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-sans text-sm font-semibold mb-1" style={{ color: "#0F172A" }}>{pkg.name}</div>
            <div className="font-sans text-[10px]" style={{ color: "#94A3B8" }}>
              {pkg.validity_days} hari · {pkg.session_count} sesi
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-[10px] font-semibold"
            style={{ backgroundColor: pkg.is_active ? "#F0FDF4" : "#FEF2F2", color: pkg.is_active ? "#15803D" : "#B91C1C" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pkg.is_active ? "#22C55E" : "#EF4444" }} />
            {pkg.is_active ? "Aktif" : "Nonaktif"}
          </span>
        </div>

        {/* Price */}
        <div className="font-display text-2xl font-normal mb-3" style={{ color: "#0F172A" }}>
          Rp {parseInt(pkg.price || 0).toLocaleString("id-ID")}
        </div>

        {/* Description */}
        {pkg.description && (
          <p className="font-sans text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: "#64748B" }}>
            {pkg.description}
          </p>
        )}

        {/* Benefits */}
        {(pkg.benefits || []).length > 0 && (
          <div className="space-y-1.5 mb-4">
            {(pkg.benefits || []).slice(0, 3).map((b, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(59,130,246,0.10)" }}>
                  <IconCheck size={9} color="#3B82F6" />
                </div>
                <span className="font-sans text-xs" style={{ color: "#475569" }}>{b}</span>
              </div>
            ))}
            {(pkg.benefits || []).length > 3 && (
              <div className="font-sans text-[10px]" style={{ color: "#94A3B8" }}>
                +{pkg.benefits.length - 3} lainnya
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid #F8FAFC" }}>
          <button onClick={() => onEdit(pkg)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
              font-sans text-xs font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>
            <IconEdit size={12} color="#1D4ED8" /> Edit
          </button>
          <button onClick={() => onDelete(pkg.id, pkg.name)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
              font-sans text-xs font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
            <IconTrash size={12} color="#DC2626" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminPackagesPage() {
  const [packages,      setPackages]      = useState([])
  const [showModal,     setShowModal]     = useState(false)
  const [form,          setForm]          = useState(EMPTY)
  const [editId,        setEditId]        = useState(null)
  const [saving,        setSaving]        = useState(false)
  const [benefitInput,  setBenefitInput]  = useState("")
  const confirmModal = useConfirm()

  const { data, loading, refetch } = useApi("/api/admin/packages")
  useEffect(() => { if (data) setPackages(Array.isArray(data) ? data : []) }, [data])

  const openAdd = () => { setForm(EMPTY); setEditId(null); setBenefitInput(""); setShowModal(true) }
  const openEdit = (p) => {
    setForm({ name: p.name, session_count: p.session_count, validity_days: p.validity_days, price: p.price, description: p.description || "", benefits: p.benefits || [], is_featured: p.is_featured, is_active: p.is_active })
    setEditId(p.id); setBenefitInput(""); setShowModal(true)
  }

  const addBenefit    = () => { if (!benefitInput.trim()) return; setForm(p => ({ ...p, benefits: [...p.benefits, benefitInput.trim()] })); setBenefitInput("") }
  const removeBenefit = (i) => setForm(p => ({ ...p, benefits: p.benefits.filter((_, idx) => idx !== i) }))

  const handleSave = async () => {
    setSaving(true)
    const url = editId ? `/api/admin/packages/${editId}` : "/api/admin/packages"
    const res = await fetch(url, { method: editId ? "PUT" : "POST", headers: headers(), body: JSON.stringify(form) })
    if (res.ok) { setShowModal(false); refetch() }
    setSaving(false)
  }

  const handleDelete = (id, name) => {
    confirmModal.open({
      title: "Hapus Paket?",
      message: `Paket "${name}" akan dihapus permanen.`,
      confirmLabel: "Ya, Hapus", variant: "danger",
      onConfirm: async () => { await fetch(`/api/admin/packages/${id}`, { method: "DELETE", headers: headers() }); refetch() },
    })
  }

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Kelola Paket</h2>
          <p className="font-sans text-sm" style={{ color: "#64748B" }}>{packages.length} paket tersedia</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm
            font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)", boxShadow: "0 6px 16px rgba(59,130,246,0.30), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
          <IconPlus size={15} color="white" /> Tambah Paket
        </button>
      </div>

      {/* ── GRID ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl animate-pulse bg-white"
              style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9)" }} />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <Card className="py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(59,130,246,0.08)" }}>
            <IconPackage size={22} color="#3B82F6" />
          </div>
          <p className="font-sans text-sm font-medium mb-1" style={{ color: "#0F172A" }}>Belum ada paket</p>
          <p className="font-sans text-xs mb-5" style={{ color: "#94A3B8" }}>Tambahkan paket pilates pertama</p>
          <button onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm font-semibold text-white border-none cursor-pointer"
            style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)" }}>
            <IconPlus size={14} color="white" /> Tambah Paket
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map(pkg => (
            <PackageCard key={pkg.id} pkg={pkg} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* ── MODAL ────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden flex flex-col"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.20)", maxHeight: "90vh" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 flex-shrink-0"
              style={{ borderBottom: "1px solid #F8FAFC" }}>
              <div>
                <h3 className="font-sans text-base font-semibold" style={{ color: "#0F172A" }}>
                  {editId ? "Edit Paket" : "Tambah Paket"}
                </h3>
                <p className="font-sans text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                  {editId ? "Ubah detail paket" : "Buat paket pilates baru"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors duration-150">
                <IconX size={15} color="#64748B" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <FormField label="Nama Paket">
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="cth: Paket Starter" />
              </FormField>

              <div className="grid grid-cols-3 gap-3">
                <FormField label="Sesi">
                  <Input type="number" min="1" value={form.session_count} onChange={e => setForm(p => ({ ...p, session_count: e.target.value }))} />
                </FormField>
                <FormField label="Hari">
                  <Input type="number" min="1" value={form.validity_days} onChange={e => setForm(p => ({ ...p, validity_days: e.target.value }))} />
                </FormField>
                <FormField label="Harga">
                  <Input type="number" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                </FormField>
              </div>

              <FormField label="Deskripsi">
                <Input rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </FormField>

              {/* Benefits */}
              <FormField label="Benefit">
                <div className="flex gap-2 mb-2">
                  <input value={benefitInput} onChange={e => setBenefitInput(e.target.value)}
                    placeholder="Tambah benefit..." onKeyDown={e => e.key === "Enter" && addBenefit()}
                    onFocus={onFocusIn} onBlur={onFocusOut}
                    style={{ ...inputBase, flex: 1 }} />
                  <button onClick={addBenefit}
                    className="px-3.5 rounded-xl font-sans text-xs font-semibold border-none cursor-pointer flex items-center gap-1"
                    style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8", flexShrink: 0 }}>
                    <IconPlus size={12} color="#1D4ED8" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {form.benefits.map((b, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl"
                      style={{ backgroundColor: "#F8FAFC" }}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "rgba(59,130,246,0.10)" }}>
                          <IconCheck size={9} color="#3B82F6" />
                        </div>
                        <span className="font-sans text-xs" style={{ color: "#475569" }}>{b}</span>
                      </div>
                      <button onClick={() => removeBenefit(i)}
                        className="w-5 h-5 rounded-lg flex items-center justify-center border-none cursor-pointer"
                        style={{ backgroundColor: "#FEF2F2" }}>
                        <IconX size={9} color="#EF4444" />
                      </button>
                    </div>
                  ))}
                </div>
              </FormField>

              {/* Checkboxes */}
              <div className="flex items-center gap-5 pt-1">
                {[
                  ["is_featured", "Terpopuler"],
                  ["is_active",   "Aktif"],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <div className="relative">
                      <input type="checkbox" className="sr-only"
                        checked={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} />
                      <div className="w-4 h-4 rounded-md flex items-center justify-center transition-all duration-150"
                        style={{
                          backgroundColor: form[key] ? "#3B82F6" : "#F1F5F9",
                          border: form[key] ? "none" : "1.5px solid #E2E8F0",
                        }}
                        onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))}>
                        {form[key] && <IconCheck size={9} color="white" />}
                      </div>
                    </div>
                    <span className="font-sans text-sm" style={{ color: "#334155" }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-5 flex-shrink-0" style={{ borderTop: "1px solid #F8FAFC" }}>
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
                {saving ? <ButtonLoading variant="dots" /> : editId ? "Simpan Perubahan" : "Tambah Paket"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal {...confirmModal.props} />
    </div>
  )
}
