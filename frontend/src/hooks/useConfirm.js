import { useState, useCallback } from "react"

export default function useConfirm() {
  const [state, setState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Ya, Lanjutkan",
    cancelLabel: "Batal",
    variant: "danger",
    loading: false,
    onConfirm: null,
  })

  const open = useCallback((opts) => {
    setState({
      isOpen: true,
      title: opts.title || "Konfirmasi",
      message: opts.message || "Apakah Anda yakin?",
      confirmLabel: opts.confirmLabel || "Ya, Lanjutkan",
      cancelLabel: opts.cancelLabel || "Batal",
      variant: opts.variant || "danger",
      loading: false,
      onConfirm: opts.onConfirm,
    })
  }, [])

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, loading: false }))
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!state.onConfirm) return
    setState((prev) => ({ ...prev, loading: true }))
    try {
      await state.onConfirm()
    } finally {
      setState((prev) => ({ ...prev, isOpen: false, loading: false }))
    }
  }, [state.onConfirm])

  return {
    open,
    close,
    props: {
      open: state.isOpen,
      title: state.title,
      message: state.message,
      confirmLabel: state.confirmLabel,
      cancelLabel: state.cancelLabel,
      variant: state.variant,
      loading: state.loading,
      onConfirm: handleConfirm,
      onCancel: close,
    },
  }
}