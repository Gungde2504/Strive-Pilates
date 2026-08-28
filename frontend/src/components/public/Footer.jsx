import { useState } from "react"
import { Link } from "react-router-dom"
import { IconMapPin, IconPhone, IconMail, IconClock, IconInstagram } from "../icons/index"

const MAPS_URL = "https://maps.app.goo.gl/Jf4wQUh6z5rA25nd6"
const IG_URL   = "https://www.instagram.com/strivepilates.bali"

export default function Footer() {
  const contacts = [
    { Icon: IconMapPin, text: "Jl. Dewata Gg. I, Ubung, Kec. Denpasar Utara, Kota Denpasar, Bali 80111", href: MAPS_URL },
    { Icon: IconPhone,  text: "089672971557",         href: "tel:+62896729715557" },
    { Icon: IconMail,   text: "strivepilatesbali",    href: "mailto:strivepilatesbali@gmail.com" },
    { Icon: IconClock,  text: "07:00 - 19:00 Setiap Hari", href: null },
  ]

  return (
    <footer style={{ backgroundColor: "#1A1208", borderTop: "1px solid rgba(196,151,62,0.2)" }}>
      <div className="max-w-7xl mx-auto px-5 py-14">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="font-display text-2xl tracking-[0.1em]" style={{ color: "#E8D5A8" }}>STRIVE</div>
            <div className="font-display text-2xl tracking-[0.1em] -mt-1" style={{ color: "#E8D5A8" }}>PILATES</div>
            <div className="font-sans text-[11px] tracking-[0.2em] uppercase mt-0.5" style={{ color: "#C4973E" }}>BALI</div>
            <div className="h-px w-9 mt-3 mb-3" style={{ background: "linear-gradient(90deg,#C4973E,transparent)" }} />
            <p className="font-sans text-[13px] leading-relaxed m-0" style={{ color: "rgba(232,213,168,0.5)" }}>
              Elevating movement, grounding your vitality.
            </p>
            {/* Instagram */}
            <a href={IG_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 transition-colors duration-200"
              style={{ color: "rgba(232,213,168,0.5)", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = "#C4973E"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(232,213,168,0.5)"}>
              <IconInstagram size={18} color="currentColor" />
              <span className="font-sans text-xs">@strivepilates.bali</span>
            </a>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-sans text-[11px] tracking-[0.1em] uppercase m-0 mb-4" style={{ color: "#C4973E" }}>EXPLORE</h4>
            {[
              ["Kelas Pilates",  "/classes"],
              ["Jadwal Kelas",   "/schedule"],
              ["Tentang Kami",   "/about"],
              ["Harga & Paket",  "/packages"],
            ].map(([label, to]) => (
              <FooterLink key={to} to={to} label={label} />
            ))}
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-sans text-[11px] tracking-[0.1em] uppercase m-0 mb-4" style={{ color: "#C4973E" }}>LEGAL</h4>
            {[
              ["Syarat & Ketentuan", "#"],
              ["Kebijakan Privasi",  "#"],
            ].map(([label, to]) => (
              <FooterLink key={label} to={to} label={label} isAnchor />
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans text-[11px] tracking-[0.1em] uppercase m-0 mb-4" style={{ color: "#C4973E" }}>HUBUNGI KAMI</h4>
            {contacts.map(({ Icon, text, href }) => (
              <ContactItem key={text} Icon={Icon} text={text} href={href} />
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex justify-between items-center flex-wrap gap-2 mt-10 pt-5"
          style={{ borderTop: "1px solid rgba(196,151,62,0.12)" }}>
          <span className="font-sans text-xs" style={{ color: "rgba(232,213,168,0.3)" }}>
            © 2025 Strive Pilates Bali. All rights reserved.
          </span>
          <span className="font-sans text-xs" style={{ color: "rgba(232,213,168,0.3)" }}>
            Dibuat dengan cinta di Bali 🌺
          </span>
        </div>
      </div>
    </footer>
  )
}

function ContactItem({ Icon, text, href }) {
  const [hovered, setHovered] = useState(false)
  const inner = (
    <div className="flex items-start gap-2.5 mb-3 transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: href ? "pointer" : "default" }}>
      <Icon size={14} color={hovered && href ? "#E8D5A8" : "#C4973E"} style={{ flexShrink: 0, marginTop: "1px" }} />
      <span className="font-sans text-[13px] leading-snug"
        style={{ color: hovered && href ? "#E8D5A8" : "rgba(232,213,168,0.55)", textDecoration: hovered && href ? "underline" : "none", textDecorationColor: "rgba(196,151,62,0.4)" }}>
        {text}
      </span>
    </div>
  )
  if (!href) return inner
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : "_self"}
      rel="noopener noreferrer" style={{ textDecoration: "none" }}>
      {inner}
    </a>
  )
}

function FooterLink({ to, label, isAnchor = false }) {
  const [hovered, setHovered] = useState(false)
  const style = {
    display: "block",
    fontFamily: "DM Sans, sans-serif",
    fontSize: "13px",
    color: hovered ? "#E8D5A8" : "rgba(232,213,168,0.55)",
    marginBottom: "9px",
    textDecoration: "none",
    transition: "color 0.2s",
  }
  return isAnchor
    ? <a href={to} style={style} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>{label}</a>
    : <Link to={to} style={style} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>{label}</Link>
}
