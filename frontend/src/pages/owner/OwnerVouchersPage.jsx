import { useState, useEffect } from "react"
import { IconX, IconEdit, IconTrash, IconCheck, IconPlus, IconPackage } from "../../components/icons/index"
import useApi from "../../hooks/useApi"
import useConfirm from "../../hooks/useConfirm"
import ConfirmModal from "../../components/modals/ConfirmModal"
import ButtonLoading from "../../components/ButtonLoading"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json", "Content-Type": "application/json" })
const EMPTY   = { code: "", name: "", discount_type: "percentage", discount_value: 0, min_purchase: 0, max_discount: "", quota: "", started_at: "", expired_at: "", is_active: true }
const PAGE_SIZE = 10

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
const onFI = e => { e.target.style.border = "1.5px solid #7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.10)"; e.target.style.backgroundColor = "#FFFFFF" }
const onFO = e => { e.target.style.border = "1.5px solid #E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#FAFAFA" }

function Input({ type="text", value, onChange, placeholder, min }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} onFocus={onFI} onBlur={onFO} style={inputBase} />
}
function Select({ value, onChange, children }) {
  return <select value={value} onChange={onChange} onFocus={onFI} onBlur={onFO} style={{ ...inputBase, cursor: "pointer" }}>{children}</select>
}

function FormCheck({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div className="w-4 h-4 rounded-md flex items-center justify-center transition-all duration-150 cursor-pointer"
        style={{ backgroundColor: checked ? "#7C3AED" : "#F1F5F9", border: checked ? "none" : "1.5px solid #E2E8F0" }}
        onClick={() => onChange(!checked)}>
        {checked && <IconCheck size={9} color="white" />}
      </div>
      <span className="font-sans text-sm" style={{ color: "#334155" }}>{label}</span>
    </label>
  )
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid #F8FAFC" }}>
      <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>Halaman {page} dari {totalPages}</p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs border-none cursor-pointer transition-all duration-150"
          style={{ backgroundColor: page === 1 ? "#F8FAFC" : "#F5F3FF", color: page === 1 ? "#CBD5E1" : "#7C3AED", cursor: page === 1 ? "not-allowed" : "pointer" }}>‹</button>
        {[...Array(totalPages)].map((_, i) => {
          const p = i + 1
          const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1
          const ellipsis = (p === 2 && page > 3) || (p === totalPages - 1 && page < totalPages - 2)
          if (!show && !ellipsis) return null
          if (ellipsis) return <span key={p} className="font-sans text-xs" style={{ color: "#CBD5E1" }}>…</span>
          return (
            <button key={p} onClick={() => onChange(p)}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs font-semibold border-none cursor-pointer transition-all duration-150"
              style={{ background: page===p?"linear-gradient(145deg,#1E0A3C,#7C3AED)":"transparent", color: page===p?"#FFFFFF":"#64748B", boxShadow: page===p?"0 4px 10px rgba(124,58,237,0.25)":"none" }}>
              {p}
            </button>
          )
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs border-none cursor-pointer transition-all duration-150"
          style={{ backgroundColor: page===totalPages?"#F8FAFC":"#F5F3FF", color: page===totalPages?"#CBD5E1":"#7C3AED", cursor: page===totalPages?"not-allowed":"pointer" }}>›</button>
      </div>
    </div>
  )
}

export default function OwnerVouchersPage() {
  const [vouchers,  setVouchers]  = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form,      setForm]      = useState(EMPTY)
  const [editId,    setEditId]    = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [page,      setPage]      = useState(1)
  const confirmModal = useConfirm()

  const { data, loading, refetch } = useApi("/api/owner/vouchers")
  useEffect(() => { if (data) setVouchers(Array.isArray(data) ? data : []) }, [data])

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setShowModal(true) }
  const openEdit = (v) => {
    setForm({ code: v.code, name: v.name, discount_type: v.discount_type, discount_value: v.discount_value,
      min_purchase: v.min_purchase||0, max_discount: v.max_discount||"", quota: v.quota||"",
      started_at: v.started_at?v.started_at.substring(0,10):"", expired_at: v.expired_at?v.expired_at.substring(0,10):"", is_active: v.is_active })
    setEditId(v.id); setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const url     = editId ? `/api/owner/vouchers/${editId}` : "/api/owner/vouchers"
    const payload = { ...form, max_discount: form.max_discount||null, quota: form.quota||null, started_at: form.started_at||null, expired_at: form.expired_at||null }
    const res = await fetch(url, { method: editId?"PUT":"POST", headers: headers(), body: JSON.stringify(payload) })
    if (res.ok) { setShowModal(false); refetch() }
    setSaving(false)
  }

  const handleToggle = (id, name, isActive) => {
    confirmModal.open({
      title: isActive ? "Nonaktifkan Voucher?" : "Aktifkan Voucher?",
      message: isActive ? `Voucher "${name}" tidak bisa digunakan member.` : `Voucher "${name}" bisa digunakan kembali.`,
      confirmLabel: isActive ? "Ya, Nonaktifkan" : "Ya, Aktifkan",
      variant: isActive ? "warning" : "default",
      onConfirm: async () => { await fetch(`/api/owner/vouchers/${id}/toggle`, { method: "PATCH", headers: headers() }); refetch() },
    })
  }

  const handleDelete = (id, name) => {
    confirmModal.open({
      title: "Hapus Voucher?", message: `Voucher "${name}" akan dihapus permanen.`,
      confirmLabel: "Ya, Hapus", variant: "danger",
      onConfirm: async () => {
        const res = await fetch(`/api/owner/vouchers/${id}`, { method: "DELETE", headers: headers() })
        const d   = await res.json()
        if (!res.ok) { alert(d.message || "Gagal menghapus voucher."); return }
        refetch()
      },
    })
  }

  const totalPages = Math.ceil(vouchers.length / PAGE_SIZE)
  const paginated  = vouchers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Kelola Voucher</h2>
          <p className="font-sans text-sm" style={{ color: "#64748B" }}>{vouchers.length} voucher terdaftar</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm
            font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(145deg,#1E0A3C,#7C3AED)", boxShadow: "0 6px 16px rgba(124,58,237,0.30), inset 0 1px 0 rgba(255,255,255,0.12)" }}>
          <IconPlus size={15} color="white" /> Tambah Voucher
        </button>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-xl animate-pulse bg-slate-100" />)}</div>
        ) : vouchers.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(124,58,237,0.08)" }}>
              <IconPackage size={22} color="#7C3AED" />
            </div>
            <p className="font-sans text-sm font-medium mb-1" style={{ color: "#0F172A" }}>Belum ada voucher</p>
            <p className="font-sans text-xs mb-5" style={{ color: "#94A3B8" }}>Buat voucher diskon untuk member</p>
            <button onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm font-semibold text-white border-none cursor-pointer"
              style={{ background: "linear-gradient(145deg,#1E0A3C,#7C3AED)" }}>
              <IconPlus size={14} color="white" /> Tambah Voucher
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                    {["Kode", "Nama", "Diskon", "Min. Belanja", "Kuota", "Berlaku", "Status", "Aksi"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left font-sans text-[10px] font-bold tracking-widest uppercase"
                        style={{ color: "#94A3B8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((v, i) => (
                    <tr key={v.id}
                      className="transition-colors duration-150 hover:bg-slate-50/80"
                      style={{ borderBottom: i < paginated.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg"
                          style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}>{v.code}</span>
                      </td>
                      <td className="px-5 py-3.5 font-sans text-sm font-medium" style={{ color: "#0F172A" }}>{v.name}</td>
                      <td className="px-5 py-3.5 font-sans text-sm font-semibold" style={{ color: "#7C3AED" }}>
                        {v.discount_type === "percentage" ? `${parseInt(v.discount_value)}%` : `Rp ${parseInt(v.discount_value).toLocaleString("id-ID")}`}
                      </td>
                      <td className="px-5 py-3.5 font-sans text-sm" style={{ color: "#334155" }}>
                        {v.min_purchase > 0 ? `Rp ${parseInt(v.min_purchase).toLocaleString("id-ID")}` : "–"}
                      </td>
                      <td className="px-5 py-3.5">
                        {v.quota ? (
                          <div>
                            <div className="font-sans text-xs font-medium" style={{ color: "#334155" }}>{v.used_count}/{v.quota}</div>
                            <div className="h-1 rounded-full overflow-hidden bg-slate-100 mt-1" style={{ width: "48px" }}>
                              <div className="h-full rounded-full" style={{ width: `${Math.min((v.used_count/v.quota)*100,100)}%`, background: "linear-gradient(90deg,#1E0A3C,#7C3AED)" }} />
                            </div>
                          </div>
                        ) : (
                          <span className="font-sans text-xs" style={{ color: "#94A3B8" }}>Tanpa batas</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-sans text-xs" style={{ color: "#334155" }}>
                          {v.expired_at ? new Date(v.expired_at).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}) : "–"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold"
                          style={{ backgroundColor: v.is_active?"#F0FDF4":"#FEF2F2", color: v.is_active?"#15803D":"#B91C1C" }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: v.is_active?"#22C55E":"#EF4444" }} />
                          {v.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(v)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs
                              font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                            style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}>
                            <IconEdit size={12} color="#7C3AED" /> Edit
                          </button>
                          <button onClick={() => handleToggle(v.id, v.name, v.is_active)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs
                              font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                            style={{ backgroundColor: v.is_active?"#FFFBEB":"#F0FDF4", color: v.is_active?"#B45309":"#15803D" }}>
                            {v.is_active ? <><IconX size={12} color="#B45309" />Off</> : <><IconCheck size={12} color="#15803D" />On</>}
                          </button>
                          <button onClick={() => handleDelete(v.id, v.name)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs
                              font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                            style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
                            <IconTrash size={12} color="#DC2626" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md flex flex-col overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.20)", maxHeight: "90vh" }}>
            <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: "1px solid #F8FAFC" }}>
              <div>
                <h3 className="font-sans text-base font-semibold" style={{ color: "#0F172A" }}>{editId ? "Edit Voucher" : "Tambah Voucher"}</h3>
                <p className="font-sans text-xs mt-0.5" style={{ color: "#94A3B8" }}>{editId ? "Ubah detail voucher" : "Buat voucher diskon baru"}</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors duration-150">
                <IconX size={15} color="#64748B" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Kode Voucher">
                  <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="DISKON20" />
                </FormField>
                <FormField label="Nama">
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Promo Awal Bulan" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Tipe Diskon">
                  <Select value={form.discount_type} onChange={e => setForm(p => ({ ...p, discount_type: e.target.value }))}>
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal (Rp)</option>
                  </Select>
                </FormField>
                <FormField label="Nilai Diskon">
                  <Input type="number" min="0" value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))} />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Min. Belanja (Rp)">
                  <Input type="number" min="0" value={form.min_purchase} onChange={e => setForm(p => ({ ...p, min_purchase: e.target.value }))} />
                </FormField>
                <FormField label="Maks. Diskon (Rp)">
                  <Input type="number" min="0" value={form.max_discount} onChange={e => setForm(p => ({ ...p, max_discount: e.target.value }))} placeholder="Tanpa batas" />
                </FormField>
              </div>
              <FormField label="Kuota Pemakaian">
                <Input type="number" min="1" value={form.quota} onChange={e => setForm(p => ({ ...p, quota: e.target.value }))} placeholder="Kosongkan jika tanpa batas" />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Mulai Berlaku">
                  <Input type="date" value={form.started_at} onChange={e => setForm(p => ({ ...p, started_at: e.target.value }))} />
                </FormField>
                <FormField label="Berakhir">
                  <Input type="date" value={form.expired_at} onChange={e => setForm(p => ({ ...p, expired_at: e.target.value }))} />
                </FormField>
              </div>
              <FormCheck label="Aktifkan voucher" checked={form.is_active} onChange={v => setForm(p => ({ ...p, is_active: v }))} />
            </div>

            <div className="flex gap-3 px-6 py-5 flex-shrink-0" style={{ borderTop: "1px solid #F8FAFC" }}>
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl font-sans text-sm font-medium border-none cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors duration-150">
                Batal
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-2xl font-sans text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200"
                style={{ background: "linear-gradient(145deg,#1E0A3C,#7C3AED)", boxShadow: saving?"none":"0 6px 16px rgba(124,58,237,0.28)", opacity: saving?0.7:1, cursor: saving?"not-allowed":"pointer" }}>
                {saving ? <ButtonLoading variant="dots" /> : editId ? "Simpan Perubahan" : "Tambah Voucher"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal {...confirmModal.props} />
    </div>
  )
}
