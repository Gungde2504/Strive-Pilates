

export default function PaymentLoadingOverlay({ show, text = "Menghubungkan ke Midtrans..." }) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-ivory/90">
      <div className="flex flex-col items-center gap-3">
        <p className="font-sans text-sm text-warm-text">{text}</p>
        <div
          className="font-display text-2xl tracking-[0.05em] select-none
            bg-[linear-gradient(90deg,#1A1208_40%,#C4973E_50%,#1A1208_60%)]
            bg-[length:200%_auto] bg-clip-text text-transparent
            [-webkit-text-fill-color:transparent]
            animate-[shimmer_1.5s_linear_infinite]"
        >
          STRIVE PILATES
        </div>
      </div>
    </div>
  )
}
