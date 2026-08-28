import { useState, useEffect } from "react"
import { IconX, IconCheck, IconEdit, IconTrash, IconPlus, IconSettings } from "../../components/icons/index"
import useApi from "../../hooks/useApi"
import useConfirm from "../../hooks/useConfirm"
import ConfirmModal from "../../components/modals/ConfirmModal"
import ButtonLoading from "../../components/ButtonLoading"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json", "Content-Type": "application/json" })
const TABS = ["Banner", "Testimoni", "FAQ", "Galeri", "Settings"]

// ─── Shared ───────────────────────────────────────────────────────────────────
function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}>
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

function FieldLabel({ children }) {
  return <label className="block font-sans text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#94A3B8" }}>{children}</label>
}

function FormField({ label, value, onChange, type = "text", placeholder = "", textarea = false }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            rows={3} onFocus={onFocusIn} onBlur={onFocusOut}
            style={{ ...inputBase, resize: "none" }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            onFocus={onFocusIn} onBlur={onFocusOut} style={inputBase} />}
    </div>
  )
}

function FormCheck({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div className="w-4 h-4 rounded-md flex items-center justify-center transition-all duration-150 cursor-pointer"
        style={{ backgroundColor: checked ? "#3B82F6" : "#F1F5F9", border: checked ? "none" : "1.5px solid #E2E8F0" }}
        onClick={() => onChange(!checked)}>
        {checked && <IconCheck size={9} color="white" />}
      </div>
      <span className="font-sans text-sm" style={{ color: "#334155" }}>{label}</span>
    </label>
  )
}

// ─── CMS Modal ────────────────────────────────────────────────────────────────
function CmsModal({ title, subtitle, onClose, onSave, saving, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-md flex flex-col overflow-hidden"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.20)", maxHeight: "90vh" }}>
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid #F8FAFC" }}>
          <div>
            <h3 className="font-sans text-base font-semibold" style={{ color: "#0F172A" }}>{title}</h3>
            {subtitle && <p className="font-sans text-xs mt-0.5" style={{ color: "#94A3B8" }}>{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors duration-150">
            <IconX size={15} color="#64748B" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">{children}</div>
        <div className="flex gap-3 px-6 py-5 flex-shrink-0" style={{ borderTop: "1px solid #F8FAFC" }}>
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-sans text-sm font-medium border-none cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors duration-150">
            Batal
          </button>
          <button onClick={onSave} disabled={saving}
            className="flex-1 py-3 rounded-2xl font-sans text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200"
            style={{
              background: "linear-gradient(145deg,#1E3A8A,#3B82F6)",
              boxShadow: saving ? "none" : "0 6px 16px rgba(59,130,246,0.28)",
              opacity: saving ? 0.7 : 1, cursor: saving ? "not-allowed" : "pointer",
            }}>
            {saving ? <ButtonLoading variant="dots" /> : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CMS Section (list) ───────────────────────────────────────────────────────
function CmsSection({ title, items, loading, onAdd, onEdit, onDelete, renderItem, modal }) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm
            font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)", boxShadow: "0 6px 16px rgba(59,130,246,0.28)" }}>
          <IconPlus size={14} color="white" /> Tambah {title}
        </button>
      </div>
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse bg-slate-100" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-sans text-sm font-medium mb-1" style={{ color: "#0F172A" }}>Belum ada {title.toLowerCase()}</p>
            <p className="font-sans text-xs mb-5" style={{ color: "#94A3B8" }}>Tambahkan konten {title.toLowerCase()} baru</p>
            <button onClick={onAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm font-semibold text-white border-none cursor-pointer"
              style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)" }}>
              <IconPlus size={13} color="white" /> Tambah {title}
            </button>
          </div>
        ) : (
          <div>
            {items.map((item, i) => (
              <div key={item.id}
                className="flex items-start justify-between px-5 py-4 transition-colors duration-150 hover:bg-slate-50/80"
                style={{ borderBottom: i < items.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                <div className="flex-1 min-w-0 mr-4">{renderItem(item)}</div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {onEdit && (
                    <button onClick={() => onEdit(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs
                        font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                      style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>
                      <IconEdit size={12} color="#1D4ED8" /> Edit
                    </button>
                  )}
                  <button onClick={() => onDelete(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs
                      font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                    style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
                    <IconTrash size={12} color="#DC2626" /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      {modal}
    </div>
  )
}

// ─── Banner ───────────────────────────────────────────────────────────────────
function BannerSection() {
  const EMPTY = { title: "", description: "", photo: "", cta_text: "", cta_link: "", is_active: true, sort_order: 0 }
  const [items, setItems] = useState([]); const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null); const [saving, setSaving] = useState(false); const [form, setForm] = useState(EMPTY)
  const { data, loading, refetch } = useApi("/api/admin/cms/banners"); const confirmModal = useConfirm()
  useEffect(() => { if (data) setItems(Array.isArray(data) ? data : []) }, [data])
  const openAdd  = () => { setForm(EMPTY); setEditId(null); setShowModal(true) }
  const openEdit = (item) => { setForm({ title: item.title || "", description: item.description || "", photo: item.photo, cta_text: item.cta_text || "", cta_link: item.cta_link || "", is_active: item.is_active, sort_order: item.sort_order || 0 }); setEditId(item.id); setShowModal(true) }
  const handleSave = async () => { setSaving(true); const url = editId ? `/api/admin/cms/banners/${editId}` : "/api/admin/cms/banners"; const res = await fetch(url, { method: editId ? "PUT" : "POST", headers: headers(), body: JSON.stringify(form) }); if (res.ok) { setShowModal(false); refetch() }; setSaving(false) }
  const handleDelete = (id) => { const item = items.find(i => i.id === id); confirmModal.open({ title: "Hapus Banner?", message: `Banner "${item?.title || "tanpa judul"}" akan dihapus.`, confirmLabel: "Ya, Hapus", variant: "danger", onConfirm: async () => { await fetch(`/api/admin/cms/banners/${id}`, { method: "DELETE", headers: headers() }); refetch() } }) }
  return <>
    <CmsSection title="Banner" items={items} loading={loading} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete}
      renderItem={item => (<div><div className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>{item.title || "(Tanpa judul)"}</div><div className="font-sans text-xs truncate mt-0.5" style={{ color: "#94A3B8" }}>{item.photo}</div></div>)}
      modal={showModal && <CmsModal title={editId ? "Edit Banner" : "Tambah Banner"} subtitle="Kelola banner halaman utama" onClose={() => setShowModal(false)} onSave={handleSave} saving={saving}>
        <FormField label="Judul" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
        <FormField label="Deskripsi" value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} textarea />
        <FormField label="URL Foto" value={form.photo} onChange={v => setForm(p => ({ ...p, photo: v }))} placeholder="https://..." />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Teks Tombol" value={form.cta_text} onChange={v => setForm(p => ({ ...p, cta_text: v }))} />
          <FormField label="URL Tombol" value={form.cta_link} onChange={v => setForm(p => ({ ...p, cta_link: v }))} />
        </div>
        <FormField label="Urutan" type="number" value={form.sort_order} onChange={v => setForm(p => ({ ...p, sort_order: v }))} />
        <FormCheck label="Aktif" checked={form.is_active} onChange={v => setForm(p => ({ ...p, is_active: v }))} />
      </CmsModal>} />
    <ConfirmModal {...confirmModal.props} />
  </>
}

// ─── Testimoni ────────────────────────────────────────────────────────────────
function TestimonialSection() {
  const EMPTY = { member_name: "", content: "", rating: 5, photo: "", is_visible: true, sort_order: 0 }
  const [items, setItems] = useState([]); const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null); const [saving, setSaving] = useState(false); const [form, setForm] = useState(EMPTY)
  const { data, loading, refetch } = useApi("/api/admin/cms/testimonials"); const confirmModal = useConfirm()
  useEffect(() => { if (data) setItems(Array.isArray(data) ? data : []) }, [data])
  const openAdd  = () => { setForm(EMPTY); setEditId(null); setShowModal(true) }
  const openEdit = (item) => { setForm({ member_name: item.member_name, content: item.content, rating: item.rating || 5, photo: item.photo || "", is_visible: item.is_visible, sort_order: item.sort_order || 0 }); setEditId(item.id); setShowModal(true) }
  const handleSave = async () => { setSaving(true); const url = editId ? `/api/admin/cms/testimonials/${editId}` : "/api/admin/cms/testimonials"; const res = await fetch(url, { method: editId ? "PUT" : "POST", headers: headers(), body: JSON.stringify(form) }); if (res.ok) { setShowModal(false); refetch() }; setSaving(false) }
  const handleDelete = (id) => { const item = items.find(i => i.id === id); confirmModal.open({ title: "Hapus Testimoni?", message: `Testimoni dari "${item?.member_name}" akan dihapus.`, confirmLabel: "Ya, Hapus", variant: "danger", onConfirm: async () => { await fetch(`/api/admin/cms/testimonials/${id}`, { method: "DELETE", headers: headers() }); refetch() } }) }
  return <>
    <CmsSection title="Testimoni" items={items} loading={loading} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete}
      renderItem={item => (<div>
        <div className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>{item.member_name}</div>
        <div className="font-sans text-xs line-clamp-1 mt-0.5" style={{ color: "#94A3B8" }}>{item.content}</div>
        <div className="flex gap-0.5 mt-1">{[...Array(item.rating || 5)].map((_, j) => <span key={j} style={{ color: "#F59E0B", fontSize: "11px" }}>★</span>)}</div>
      </div>)}
      modal={showModal && <CmsModal title={editId ? "Edit Testimoni" : "Tambah Testimoni"} subtitle="Kelola testimoni halaman publik" onClose={() => setShowModal(false)} onSave={handleSave} saving={saving}>
        <FormField label="Nama Member" value={form.member_name} onChange={v => setForm(p => ({ ...p, member_name: v }))} />
        <FormField label="Isi Testimoni" value={form.content} onChange={v => setForm(p => ({ ...p, content: v }))} textarea />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Rating (1-5)" type="number" value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
          <FormField label="URL Foto" value={form.photo} onChange={v => setForm(p => ({ ...p, photo: v }))} />
        </div>
        <FormCheck label="Tampilkan di halaman publik" checked={form.is_visible} onChange={v => setForm(p => ({ ...p, is_visible: v }))} />
      </CmsModal>} />
    <ConfirmModal {...confirmModal.props} />
  </>
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FaqSection() {
  const EMPTY = { question: "", answer: "", category: "", sort_order: 0, is_active: true }
  const [items, setItems] = useState([]); const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null); const [saving, setSaving] = useState(false); const [form, setForm] = useState(EMPTY)
  const { data, loading, refetch } = useApi("/api/admin/cms/faqs"); const confirmModal = useConfirm()
  useEffect(() => { if (data) setItems(Array.isArray(data) ? data : []) }, [data])
  const openAdd  = () => { setForm(EMPTY); setEditId(null); setShowModal(true) }
  const openEdit = (item) => { setForm({ question: item.question, answer: item.answer, category: item.category || "", sort_order: item.sort_order || 0, is_active: item.is_active }); setEditId(item.id); setShowModal(true) }
  const handleSave = async () => { setSaving(true); const url = editId ? `/api/admin/cms/faqs/${editId}` : "/api/admin/cms/faqs"; const res = await fetch(url, { method: editId ? "PUT" : "POST", headers: headers(), body: JSON.stringify(form) }); if (res.ok) { setShowModal(false); refetch() }; setSaving(false) }
  const handleDelete = (id) => { const item = items.find(i => i.id === id); confirmModal.open({ title: "Hapus FAQ?", message: `Pertanyaan "${item?.question}" akan dihapus.`, confirmLabel: "Ya, Hapus", variant: "danger", onConfirm: async () => { await fetch(`/api/admin/cms/faqs/${id}`, { method: "DELETE", headers: headers() }); refetch() } }) }
  return <>
    <CmsSection title="FAQ" items={items} loading={loading} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete}
      renderItem={item => (<div>
        <div className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>{item.question}</div>
        <div className="font-sans text-xs line-clamp-1 mt-0.5" style={{ color: "#94A3B8" }}>{item.answer}</div>
        {item.category && <span className="inline-block mt-1 px-2 py-0.5 rounded-full font-sans text-[10px] font-semibold" style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>{item.category}</span>}
      </div>)}
      modal={showModal && <CmsModal title={editId ? "Edit FAQ" : "Tambah FAQ"} subtitle="Kelola pertanyaan yang sering ditanyakan" onClose={() => setShowModal(false)} onSave={handleSave} saving={saving}>
        <FormField label="Pertanyaan" value={form.question} onChange={v => setForm(p => ({ ...p, question: v }))} />
        <FormField label="Jawaban" value={form.answer} onChange={v => setForm(p => ({ ...p, answer: v }))} textarea />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Kategori" value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))} placeholder="cth: Umum" />
          <FormField label="Urutan" type="number" value={form.sort_order} onChange={v => setForm(p => ({ ...p, sort_order: v }))} />
        </div>
        <FormCheck label="Aktif" checked={form.is_active} onChange={v => setForm(p => ({ ...p, is_active: v }))} />
      </CmsModal>} />
    <ConfirmModal {...confirmModal.props} />
  </>
}

// ─── Galeri ───────────────────────────────────────────────────────────────────
function GallerySection() {
  const EMPTY = { photo: "", caption: "", category: "studio", sort_order: 0, is_active: true }
  const [items, setItems] = useState([]); const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false); const [form, setForm] = useState(EMPTY)
  const { data, loading, refetch } = useApi("/api/admin/cms/gallery"); const confirmModal = useConfirm()
  useEffect(() => { if (data) setItems(Array.isArray(data) ? data : []) }, [data])
  const handleSave = async () => { setSaving(true); const res = await fetch("/api/admin/cms/gallery", { method: "POST", headers: headers(), body: JSON.stringify(form) }); if (res.ok) { setShowModal(false); setForm(EMPTY); refetch() }; setSaving(false) }
  const handleDelete = (id) => { const item = items.find(i => i.id === id); confirmModal.open({ title: "Hapus Foto?", message: `Foto "${item?.caption || "tanpa keterangan"}" akan dihapus dari galeri.`, confirmLabel: "Ya, Hapus", variant: "danger", onConfirm: async () => { await fetch(`/api/admin/cms/gallery/${id}`, { method: "DELETE", headers: headers() }); refetch() } }) }
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm
            font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)", boxShadow: "0 6px 16px rgba(59,130,246,0.28)" }}>
          <IconPlus size={14} color="white" /> Tambah Foto
        </button>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-square rounded-2xl animate-pulse bg-white"
            style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9)" }} />)}
        </div>
      ) : items.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="font-sans text-sm font-medium mb-1" style={{ color: "#0F172A" }}>Belum ada foto galeri</p>
          <p className="font-sans text-xs mb-5" style={{ color: "#94A3B8" }}>Tambahkan foto studio dan kelas</p>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm font-semibold text-white border-none cursor-pointer"
            style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)" }}>
            <IconPlus size={13} color="white" /> Tambah Foto
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-square"
              style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9)" }}>
              {item.photo
                ? <img src={item.photo} alt={item.caption} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <span className="font-sans text-xs" style={{ color: "#94A3B8" }}>No Image</span>
                  </div>}
              <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
                <div className="flex items-center justify-between w-full">
                  <span className="font-sans text-xs text-white truncate mr-2">{item.caption || "Tanpa keterangan"}</span>
                  <button onClick={() => handleDelete(item.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer flex-shrink-0"
                    style={{ backgroundColor: "rgba(239,68,68,0.9)" }}>
                    <IconTrash size={12} color="white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && <CmsModal title="Tambah Foto" subtitle="Tambahkan foto ke galeri studio" onClose={() => setShowModal(false)} onSave={handleSave} saving={saving}>
        <FormField label="URL Foto" value={form.photo} onChange={v => setForm(p => ({ ...p, photo: v }))} placeholder="https://..." />
        <FormField label="Keterangan" value={form.caption} onChange={v => setForm(p => ({ ...p, caption: v }))} placeholder="Keterangan foto (opsional)" />
        <div>
          <FieldLabel>Kategori</FieldLabel>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            onFocus={onFocusIn} onBlur={onFocusOut} style={{ ...inputBase, cursor: "pointer" }}>
            <option value="studio">Studio</option>
            <option value="class">Kelas</option>
            <option value="event">Event</option>
          </select>
        </div>
        <FormField label="Urutan" type="number" value={form.sort_order} onChange={v => setForm(p => ({ ...p, sort_order: v }))} />
      </CmsModal>}
      <ConfirmModal {...confirmModal.props} />
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function SettingsSection() {
  const [settings, setSettings] = useState({}); const [saving, setSaving] = useState(false); const [success, setSuccess] = useState(false)
  const { data, loading } = useApi("/api/admin/cms/settings")
  useEffect(() => { if (data) setSettings(data) }, [data])
  const handleSave = async () => {
    setSaving(true)
    const res = await fetch("/api/admin/cms/settings", { method: "POST", headers: headers(), body: JSON.stringify({ settings }) })
    if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 2500) }
    setSaving(false)
  }
  const fields = [
    ["site_name",      "Nama Studio"],
    ["site_phone",     "No. Telepon"],
    ["site_email",     "Email Studio"],
    ["site_address",   "Alamat Studio"],
    ["site_instagram", "Instagram"],
    ["site_whatsapp",  "WhatsApp"],
  ]
  return (
    <div className="max-w-2xl">
      {success && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5 font-sans text-sm"
          style={{ backgroundColor: "#F0FDF4", border: "1px solid #D5EDD8", color: "#15803D" }}>
          <IconCheck size={15} color="#15803D" /> Pengaturan berhasil disimpan!
        </div>
      )}
      <Card className="p-6">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.08)" }}>
            <IconSettings size={16} color="#3B82F6" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>Pengaturan Umum</h3>
            <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>Informasi studio yang tampil di website</p>
          </div>
        </div>
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-10 rounded-xl animate-pulse bg-slate-100" />)}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map(([key, label]) => (
                <div key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <input value={settings[key] || ""} onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                    onFocus={onFocusIn} onBlur={onFocusOut} style={inputBase} />
                </div>
              ))}
            </div>
            <div className="pt-2">
              <button onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-sans text-sm font-semibold
                  text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(145deg,#1E3A8A,#3B82F6)",
                  boxShadow: saving ? "none" : "0 6px 16px rgba(59,130,246,0.28)",
                  opacity: saving ? 0.7 : 1,
                }}>
                {saving ? <ButtonLoading variant="dots" /> : <><IconCheck size={14} color="white" /> Simpan Pengaturan</>}
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminCmsPage() {
  const [activeTab, setActiveTab] = useState("Banner")
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Kelola CMS</h2>
        <p className="font-sans text-sm" style={{ color: "#64748B" }}>Kelola konten halaman publik website</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap mb-6 p-1 rounded-2xl w-fit"
        style={{
          backgroundColor: "#F8FAFC",
          boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(255,255,255,0.8)",
        }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-xl font-sans text-sm font-medium border-none cursor-pointer transition-all duration-200"
            style={{
              background: activeTab === tab ? "linear-gradient(145deg,#1E3A8A,#3B82F6)" : "transparent",
              color: activeTab === tab ? "#FFFFFF" : "#64748B",
              boxShadow: activeTab === tab ? "0 4px 12px rgba(59,130,246,0.25)" : "none",
              transform: activeTab === tab ? "translateY(-1px)" : "translateY(0)",
            }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Banner"    && <BannerSection />}
      {activeTab === "Testimoni" && <TestimonialSection />}
      {activeTab === "FAQ"       && <FaqSection />}
      {activeTab === "Galeri"    && <GallerySection />}
      {activeTab === "Settings"  && <SettingsSection />}
    </div>
  )
}
