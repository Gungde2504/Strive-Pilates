import { useState, useEffect } from "react"
import {
  IconX, IconEdit, IconTrash, IconCalendar,
  IconPlus, IconFilter, IconCheck, IconAlertTriangle,
} from "../../components/icons/index"
import useApi from "../../hooks/useApi"
import useConfirm from "../../hooks/useConfirm"
import ConfirmModal from "../../components/modals/ConfirmModal"
import ButtonLoading from "../../components/ButtonLoading"

const token   = () => localStorage.getItem("auth_token")
const headers = () => ({ "Authorization": `Bearer ${token()}`, "Accept": "application/json", "Content-Type": "application/json" })
const EMPTY   = { pilates_class_id: "", instructor_id: "", date: "", start_time: "", end_time: "", capacity: 10, notes: "" }
const PAGE_SIZE = 10

// ─── Neumorphic card ──────────────────────────────────────────────────────────
function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "6px 6px 16px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  )
}

// ─── Form input ───────────────────────────────────────────────────────────────
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

function Input({ type = "text", value, onChange, placeholder, min, max }) {
  const [focused, setFocused] = useState(false)
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      min={min} max={max}
      onFocus={e => { setFocused(true); e.target.style.border = "1.5px solid #3B82F6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.10)"; e.target.style.backgroundColor = "#FFFFFF" }}
      onBlur={e => { setFocused(false); e.target.style.border = "1.5px solid #E2E8F0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#FAFAFA" }}
      style={inputBase} />
  )
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

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active:    { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E", label: "Aktif" },
    cancelled: { bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444", label: "Dibatalkan" },
  }
  const s = map[status] || map.active
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
      {s.label}
    </span>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid #F8FAFC" }}>
      <p className="font-sans text-xs" style={{ color: "#94A3B8" }}>
        Halaman {page} dari {totalPages}
      </p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs border-none cursor-pointer transition-all duration-150"
          style={{ backgroundColor: page === 1 ? "#F8FAFC" : "#EFF6FF", color: page === 1 ? "#CBD5E1" : "#3B82F6", cursor: page === 1 ? "not-allowed" : "pointer" }}>
          ‹
        </button>
        {[...Array(totalPages)].map((_, i) => {
          const p = i + 1
          const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1
          const ellipsis = (p === 2 && page > 3) || (p === totalPages - 1 && page < totalPages - 2)
          if (!show && !ellipsis) return null
          if (ellipsis) return <span key={p} className="font-sans text-xs" style={{ color: "#CBD5E1" }}>…</span>
          return (
            <button key={p} onClick={() => onChange(p)}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs font-semibold border-none cursor-pointer transition-all duration-150"
              style={{
                background: page === p ? "linear-gradient(145deg,#1E3A8A,#3B82F6)" : "transparent",
                color: page === p ? "#FFFFFF" : "#64748B",
                boxShadow: page === p ? "0 4px 10px rgba(59,130,246,0.25)" : "none",
              }}>
              {p}
            </button>
          )
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-sans text-xs border-none cursor-pointer transition-all duration-150"
          style={{ backgroundColor: page === totalPages ? "#F8FAFC" : "#EFF6FF", color: page === totalPages ? "#CBD5E1" : "#3B82F6", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
          ›
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminSchedulesPage() {
  const [schedules,   setSchedules]   = useState([])
  const [classes,     setClasses]     = useState([])
  const [instructors, setInstructors] = useState([])
  const [showModal,   setShowModal]   = useState(false)
  const [form,        setForm]        = useState(EMPTY)
  const [editId,      setEditId]      = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [filterDate,  setFilterDate]  = useState("")
  const [page,        setPage]        = useState(1)
  const confirmModal = useConfirm()

  const { data: schedulesData,   loading, refetch } = useApi("/api/admin/schedules")
  const { data: classesData }     = useApi("/api/admin/classes")
  const { data: instructorsData } = useApi("/api/admin/instructors")

  useEffect(() => { if (schedulesData)   setSchedules(Array.isArray(schedulesData)   ? schedulesData   : []) }, [schedulesData])
  useEffect(() => { if (classesData)     setClasses(Array.isArray(classesData)        ? classesData     : []) }, [classesData])
  useEffect(() => { if (instructorsData) setInstructors(Array.isArray(instructorsData) ? instructorsData : []) }, [instructorsData])

  const filtered   = filterDate ? schedules.filter(s => s.date === filterDate) : schedules
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setShowModal(true) }
  const openEdit = (s) => {
    setForm({
      pilates_class_id: s.pilates_class_id, instructor_id: s.instructor_id,
      date: s.date, start_time: s.start_time?.substring(0,5),
      end_time: s.end_time?.substring(0,5), capacity: s.capacity, notes: s.notes || "",
    })
    setEditId(s.id); setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const url = editId ? `/api/admin/schedules/${editId}` : "/api/admin/schedules"
    const res = await fetch(url, { method: editId ? "PUT" : "POST", headers: headers(), body: JSON.stringify(form) })
    if (res.ok) { setShowModal(false); refetch() }
    setSaving(false)
  }

  const handleCancel = (id, className, date) => {
    confirmModal.open({
      title: "Batalkan Jadwal Ini?",
      message: `Jadwal "${className}" pada ${date ? new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long" }) : "-"} akan dibatalkan.`,
      confirmLabel: "Ya, Batalkan", variant: "warning",
      onConfirm: async () => { await fetch(`/api/admin/schedules/${id}/cancel`, { method: "PATCH", headers: headers() }); refetch() },
    })
  }

  const handleDelete = (id, className) => {
    confirmModal.open({
      title: "Hapus Jadwal?",
      message: `Jadwal "${className}" akan dihapus permanen.`,
      confirmLabel: "Ya, Hapus", variant: "danger",
      onConfirm: async () => { await fetch(`/api/admin/schedules/${id}`, { method: "DELETE", headers: headers() }); refetch() },
    })
  }

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-sans text-xl font-semibold mb-0.5" style={{ color: "#0F172A" }}>Kelola Jadwal</h2>
          <p className="font-sans text-sm" style={{ color: "#64748B" }}>{schedules.length} total jadwal</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date filter */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <IconCalendar size={14} color="#94A3B8" />
            </div>
            <input type="date" value={filterDate}
              onChange={e => { setFilterDate(e.target.value); setPage(1) }}
              className="pl-9 pr-4 py-2.5 rounded-xl font-sans text-sm outline-none transition-all duration-200"
              style={{
                border: filterDate ? "1.5px solid #3B82F6" : "1.5px solid #E2E8F0",
                backgroundColor: filterDate ? "#EFF6FF" : "#FFFFFF",
                color: "#0F172A",
                boxShadow: "6px 6px 14px rgba(0,0,0,0.06), -3px -3px 10px rgba(255,255,255,0.9)",
              }}
              onFocus={e => e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)"}
              onBlur={e => e.target.style.boxShadow = "6px 6px 14px rgba(0,0,0,0.06), -3px -3px 10px rgba(255,255,255,0.9)"} />
            {filterDate && (
              <button onClick={() => { setFilterDate(""); setPage(1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer p-0">
                <IconX size={12} color="#94A3B8" />
              </button>
            )}
          </div>

          {/* Add button */}
          <button onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm
              font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(145deg,#1E3A8A,#3B82F6)",
              boxShadow: "0 6px 16px rgba(59,130,246,0.30), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}>
            <IconPlus size={15} color="white" />
            Tambah Jadwal
          </button>
        </div>
      </div>

      {/* ── TABLE ────────────────────────────────────────────────────────── */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl animate-pulse bg-slate-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(59,130,246,0.08)" }}>
              <IconCalendar size={24} color="#3B82F6" />
            </div>
            <p className="font-sans text-sm font-medium mb-1" style={{ color: "#0F172A" }}>
              Belum ada jadwal{filterDate ? " untuk tanggal ini" : ""}
            </p>
            <p className="font-sans text-xs mb-5" style={{ color: "#94A3B8" }}>Tambahkan jadwal kelas baru untuk mulai</p>
            <button onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm
                font-semibold text-white border-none cursor-pointer"
              style={{ background: "linear-gradient(145deg,#1E3A8A,#3B82F6)" }}>
              <IconPlus size={14} color="white" /> Tambah Jadwal
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                    {["Tanggal", "Kelas", "Instruktur", "Waktu", "Kapasitas", "Status", "Aksi"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left font-sans text-[10px] font-bold tracking-widest uppercase"
                        style={{ color: "#94A3B8" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((s, i) => (
                    <tr key={s.id}
                      className="transition-colors duration-150 hover:bg-slate-50/80 group"
                      style={{ borderBottom: i < paginated.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                      <td className="px-5 py-3.5">
                        <div className="font-sans text-sm font-semibold" style={{ color: "#0F172A" }}>
                          {new Date(s.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </div>
                        <div className="font-sans text-[10px]" style={{ color: "#94A3B8" }}>
                          {new Date(s.date).toLocaleDateString("id-ID", { year: "numeric" })}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-sans text-sm" style={{ color: "#334155" }}>{s.class_name}</td>
                      <td className="px-5 py-3.5 font-sans text-sm" style={{ color: "#334155" }}>{s.instructor_name}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-sans text-xs font-medium" style={{ color: "#334155" }}>
                          {s.start_time?.substring(0,5)} – {s.end_time?.substring(0,5)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 rounded-full flex-1 overflow-hidden bg-slate-100" style={{ maxWidth: "48px" }}>
                            <div className="h-full rounded-full"
                              style={{
                                width: `${Math.min(((s.booked_count || 0) / s.capacity) * 100, 100)}%`,
                                backgroundColor: (s.booked_count || 0) >= s.capacity ? "#EF4444" : "#3B82F6",
                              }} />
                          </div>
                          <span className="font-sans text-xs font-medium" style={{ color: "#64748B" }}>
                            {s.booked_count || 0}/{s.capacity}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs
                              font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                            style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}
                            title="Edit jadwal">
                            <IconEdit size={12} color="#1D4ED8" />
                            Edit
                          </button>
                          {s.status !== "cancelled" && (
                            <button onClick={() => handleCancel(s.id, s.class_name, s.date)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs
                                font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                              style={{ backgroundColor: "#FFFBEB", color: "#B45309" }}
                              title="Batalkan jadwal">
                              <IconAlertTriangle size={12} color="#B45309" />
                              Batalkan
                            </button>
                          )}
                          <button onClick={() => handleDelete(s.id, s.class_name)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs
                              font-medium border-none cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                            style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
                            title="Hapus jadwal">
                            <IconTrash size={12} color="#DC2626" />
                            Hapus
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

      {/* ── MODAL ────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.20)" }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid #F8FAFC" }}>
              <div>
                <h3 className="font-sans text-base font-semibold" style={{ color: "#0F172A" }}>
                  {editId ? "Edit Jadwal" : "Tambah Jadwal"}
                </h3>
                <p className="font-sans text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                  {editId ? "Ubah detail jadwal kelas" : "Buat jadwal kelas baru"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer bg-slate-100 hover:bg-slate-200 transition-colors duration-150">
                <IconX size={15} color="#64748B" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              <FormField label="Kelas">
                <Select value={form.pilates_class_id} onChange={e => setForm(p => ({ ...p, pilates_class_id: e.target.value }))}>
                  <option value="">Pilih kelas...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </FormField>

              <FormField label="Instruktur">
                <Select value={form.instructor_id} onChange={e => setForm(p => ({ ...p, instructor_id: e.target.value }))}>
                  <option value="">Pilih instruktur...</option>
                  {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </Select>
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Tanggal">
                  <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </FormField>
                <FormField label="Kapasitas">
                  <Input type="number" min="1" max="20" value={form.capacity}
                    onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Waktu Mulai">
                  <Input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} />
                </FormField>
                <FormField label="Waktu Selesai">
                  <Input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} />
                </FormField>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-5" style={{ borderTop: "1px solid #F8FAFC" }}>
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl font-sans text-sm font-medium border-none cursor-pointer
                  bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors duration-150">
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
                {saving ? <ButtonLoading variant="dots" /> : (editId ? "Simpan Perubahan" : "Tambah Jadwal")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal {...confirmModal.props} />
    </div>
  )
}
