

export default function ButtonLoading({ variant = "letters" }) {
  if (variant === "dots") {
    return (
      <span className="inline-flex items-center gap-1" role="status" aria-label="Memuat">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-current animate-[bounce_900ms_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
    )
  }

  const letters = "STRIVE".split("")

  return (
    <span
      className="inline-flex items-center gap-[3px] font-sans text-[13px] tracking-widest"
      role="status"
      aria-label="Memuat"
    >
      {letters.map((letter, i) => (
        <span
          key={i}
          className="inline-block animate-[pulse_900ms_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {letter}
        </span>
      ))}
    </span>
  )
}
