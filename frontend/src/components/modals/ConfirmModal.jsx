import { useEffect } from "react"
import { IconX, IconAlertTriangle } from "../icons/index"

export default function ConfirmModal({
  open,
  title = "Konfirmasi",
  message = "Apakah Anda yakin?",
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  variant = "danger", // danger | warning | default
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === "Escape") onCancel?.() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onCancel])

  if (!open) return null

  const colors = {
    danger:  { bg: "#FEF2F2", icon: "#DC2626", btn: "linear-gradient(145deg, #B91C1C, #DC2626)" },
    warning: { bg: "#FFFBEB", icon: "#D97706", btn: "linear-gradient(145deg, #B45309, #D97706)" },
    default: { bg: "#F5F0EA", icon: "#C4973E", btn: "linear-gradient(145deg, #7A5C0E, #C4973E)" },
  }[variant]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(26,18,8,0.5)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.() }}
    >
      <div
        className="bg-white rounded-3xl p-7 w-full max-w-sm animate-scale-in"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
            <IconAlertTriangle size={22} color={colors.icon} />
          </div>
          <button onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors duration-200"
            style={{ backgroundColor: "#F5F0EA" }}>
            <IconX size={14} color="#6B5E4A" />
          </button>
        </div>

        <h3 className="font-display text-xl mb-2" style={{ color: "#1A1208" }}>{title}</h3>
        <p className="font-sans text-sm mb-6 leading-relaxed" style={{ color: "#6B5E4A" }}>{message}</p>

        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-3 rounded-2xl font-sans text-sm font-medium border-none cursor-pointer transition-all duration-200"
            style={{ backgroundColor: "#F5F0EA", color: "#6B5E4A", opacity: loading ? 0.6 : 1 }}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-3 rounded-2xl font-sans text-sm font-medium text-white border-none cursor-pointer transition-all duration-200"
            style={{ background: colors.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
