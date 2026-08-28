import { Outlet, Link } from "react-router-dom"

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#1A1208" }}>

      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(135deg, #1A1208 0%, #2D1F08 50%, #1A1208 100%)" }}>

        {/* Background radial */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(139,105,20,0.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(196,151,62,0.08) 0%, transparent 50%)" }} />

        {/* Gold lines decoration */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C4973E, transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C4973E, transparent)" }} />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-3 no-underline">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E, #A0792A)", boxShadow: "inset 0 1px 0 rgba(255,240,180,0.35)" }}>
            <span className="font-display text-base text-white">SP</span>
          </div>
          <span className="font-display text-xl tracking-[0.1em]" style={{ color: "#E8D5A8" }}>STRIVE PILATES</span>
        </Link>

        {/* Center content */}
        <div className="relative">
          <p className="font-sans text-xs tracking-[0.15em] uppercase mb-4" style={{ color: "#C4973E" }}>STUDIO PILATES PREMIUM</p>
          <h2 className="font-display font-normal text-white mb-6 leading-tight" style={{ fontSize: "clamp(32px, 3vw, 48px)" }}>
            Transform Your Body,<br />Elevate Your Mind
          </h2>
          <div className="h-px w-16 mb-6" style={{ background: "linear-gradient(90deg, #C4973E, transparent)" }} />
          <p className="font-sans text-sm leading-relaxed" style={{ color: "rgba(232,213,168,0.6)" }}>
            Bergabung dengan 500+ member aktif yang sudah merasakan manfaat pilates bersama instruktur bersertifikat internasional kami.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-10">
            {[["500+", "Member Aktif"], ["4", "Instruktur"], ["10", "Sesi/Hari"]].map(([num, label]) => (
              <div key={label}>
                <div className="font-display text-3xl" style={{ color: "#C4973E" }}>{num}</div>
                <div className="font-sans text-xs mt-1" style={{ color: "rgba(232,213,168,0.5)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative p-5 rounded-2xl" style={{ backgroundColor: "rgba(196,151,62,0.08)", border: "1px solid rgba(196,151,62,0.15)" }}>
          <p className="font-sans text-sm italic leading-relaxed mb-3" style={{ color: "rgba(232,213,168,0.7)" }}>
            "Kelas Reformer di Strive benar-benar mengubah postur saya. Instrukturnya sangat profesional!"
          </p>
          <div className="font-sans text-xs font-semibold" style={{ color: "#C4973E" }}>Sarah A. — Member sejak 2023</div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-5 sm:px-10 lg:px-16 py-10">

        {/* Mobile logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2.5 no-underline mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E, #A0792A)" }}>
            <span className="font-display text-sm text-white">SP</span>
          </div>
          <span className="font-display text-lg tracking-[0.1em]" style={{ color: "#E8D5A8" }}>STRIVE PILATES</span>
        </Link>

        <div className="w-full max-w-md mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
