export default function LoadingSpinner({ text = "Memuat..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div
        className="font-display text-3xl tracking-widest select-none
          bg-[linear-gradient(90deg,#1A1208_40%,#C4973E_50%,#1A1208_60%)]
          bg-[length:200%_auto] bg-clip-text text-transparent
          [-webkit-text-fill-color:transparent]
          animate-[shimmer_1.5s_linear_infinite]"
      >
        STRIVE
      </div>
      <div className="font-sans text-xs text-warm-text">{text}</div>
    </div>
  )
}
