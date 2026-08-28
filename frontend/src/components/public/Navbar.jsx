import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { IconMenu, IconX } from "../icons/index"

const navLinks = [
  { label: "Home",         to: "/" },
  { label: "Kelas",        to: "/classes" },
  { label: "Jadwal",       to: "/schedule" },
  { label: "Tentang Kami", to: "/about" },
  { label: "Paket",        to: "/packages" },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      <nav className="sticky top-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(26,18,8,0.97)" : "#1A1208",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: "1px solid rgba(196,151,62,0.3)",
          height: "64px",
        }}>
        <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-underline flex-shrink-0">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E, #A0792A)", boxShadow: "inset 0 1px 0 rgba(255,240,180,0.35)" }}>
              <span className="font-display text-[14px] text-white">SP</span>
            </div>
            <span className="font-display text-base tracking-[0.1em] font-normal" style={{ color: "#E8D5A8" }}>
              STRIVE PILATES
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} active={pathname === link.to} label={link.label} />
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2.5">
            <NavButton to="/login" outline label="Masuk" />
            <NavButton to="/register" label="Daftar" />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden bg-transparent border-none cursor-pointer p-1.5 flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu">
            {mobileOpen
              ? <IconX size={22} color="#E8D5A8" />
              : <IconMenu size={22} color="#E8D5A8" />}
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col px-5 py-6 overflow-y-auto"
          style={{ backgroundColor: "#1A1208", top: "64px" }}>

          {/* Nav links */}
          <div className="flex-1">
            {navLinks.map((link, i) => (
              <Link key={link.to} to={link.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-4 no-underline border-b transition-colors duration-150"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "clamp(22px, 7vw, 32px)",
                  fontWeight: 400,
                  color: pathname === link.to ? "#C4973E" : "#E8D5A8",
                  borderColor: "rgba(196,151,62,0.12)",
                  animationDelay: `${i * 0.05}s`,
                }}>
                {link.label}
                <span className="text-lg" style={{ color: "rgba(196,151,62,0.4)" }}>→</span>
              </Link>
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="pt-7 flex flex-col gap-3">
            <Link to="/register" onClick={() => setMobileOpen(false)}
              className="block text-center py-4 rounded-xl font-sans text-sm font-medium text-white no-underline"
              style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E, #A0792A)", boxShadow: "4px 4px 14px rgba(107,79,10,0.40)" }}>
              Daftar Sekarang
            </Link>
            <Link to="/login" onClick={() => setMobileOpen(false)}
              className="block text-center py-4 rounded-xl font-sans text-sm no-underline"
              style={{ color: "#E8D5A8", border: "1px solid rgba(196,151,62,0.35)" }}>
              Masuk
            </Link>
          </div>

          {/* Footer info */}
          <p className="font-sans text-xs text-center mt-6 pt-5" style={{ color: "rgba(232,213,168,0.3)", borderTop: "1px solid rgba(196,151,62,0.1)" }}>
            Seminyak, Bali · 07:00 - 19:00
          </p>
        </div>
      )}
    </>
  )
}

function NavLink({ to, active, label }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link to={to}
      className="font-sans text-sm no-underline transition-all duration-200"
      style={{
        color: active || hovered ? "#E8D5A8" : "rgba(232,213,168,0.65)",
        borderBottom: active ? "2px solid #C4973E" : "2px solid transparent",
        paddingBottom: "2px",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {label}
    </Link>
  )
}

function NavButton({ to, label, outline = false }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link to={to}
      className="font-sans text-sm font-medium px-4 py-2 rounded-[10px] no-underline transition-all duration-200"
      style={outline ? {
        color: "#E8D5A8",
        border: "1px solid rgba(196,151,62,0.4)",
        background: hovered ? "rgba(196,151,62,0.1)" : "transparent",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
      } : {
        color: "#FFFFFF",
        background: "linear-gradient(145deg, #7A5C0E 0%, #C4973E 45%, #A0792A 65%, #6B4F0A 100%)",
        boxShadow: hovered ? "4px 4px 14px rgba(107,79,10,0.50)" : "2px 2px 8px rgba(107,79,10,0.30)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {label}
    </Link>
  )
}
