import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import useAuthStore from "../stores/authStore"
import {
  IconHome, IconCalendar, IconPackage, IconUser,
  IconLogOut, IconMenu, IconX, IconChevronRight,
  IconClock,
} from "../components/icons/index"

const menuItems = [
  { icon: IconHome,     label: "Dashboard",    to: "/member/dashboard",  desc: "Ringkasan akun" },
  { icon: IconCalendar, label: "Booking Saya", to: "/member/bookings",   desc: "Riwayat booking" },
  { icon: IconClock,    label: "Jadwal",        to: "/schedule",          desc: "Lihat jadwal kelas" },
  { icon: IconPackage,  label: "Paket Saya",   to: "/member/packages",   desc: "Kelola paket" },
  { icon: IconUser,     label: "Profil",        to: "/member/profile",    desc: "Pengaturan akun" },
]

function SidebarLink({ item, active, expanded, onClick }) {
  const Icon = item.icon
  return (
    <Link to={item.to} onClick={onClick}
      className="flex items-center gap-3 rounded-2xl no-underline transition-all duration-200 relative overflow-hidden group"
      style={{
        padding: expanded ? "10px 12px" : "10px 0",
        justifyContent: expanded ? "flex-start" : "center",
        backgroundColor: active ? "rgba(139,105,20,0.08)" : "transparent",
        color: active ? "#7A5C0E" : "#9CA3AF",
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "rgba(139,105,20,0.05)"
          e.currentTarget.style.color = "#7A5C0E"
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "transparent"
          e.currentTarget.style.color = "#9CA3AF"
        }
      }}>
      {/* Active indicator */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
          style={{ backgroundColor: "#C4973E" }} />
      )}
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{
          background: active ? "linear-gradient(145deg, #7A5C0E, #C4973E)" : "transparent",
          boxShadow: active ? "0 4px 12px rgba(107,79,10,0.25)" : "none",
        }}>
        <Icon size={18} color={active ? "#FFFFFF" : "currentColor"} />
      </div>
      {/* Label */}
      {expanded && (
        <div className="min-w-0 overflow-hidden">
          <div className="font-sans text-sm font-medium whitespace-nowrap">{item.label}</div>
          <div className="font-sans text-[10px] whitespace-nowrap" style={{ color: "#B0B8C4" }}>{item.desc}</div>
        </div>
      )}
      {/* Tooltip saat collapsed */}
      {!expanded && (
        <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg font-sans text-xs font-medium
          text-white whitespace-nowrap pointer-events-none z-50
          opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ backgroundColor: "#1A1208", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
          {item.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
            style={{ borderRightColor: "#1A1208" }} />
        </div>
      )}
    </Link>
  )
}

export default function MemberLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [expanded,    setExpanded]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
          "Accept": "application/json",
        },
      })
    } catch {}
    logout()
    navigate("/login")
  }

  const activeLabel = menuItems.find(m => m.to === pathname)?.label || "Dashboard"

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── DESKTOP SIDEBAR ─────────────────── */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 h-full transition-all duration-300 ease-in-out overflow-hidden ${expanded ? "w-56" : "w-[72px]"}`}
        style={{ backgroundColor: "#1A1208", boxShadow: "4px 0 20px rgba(0,0,0,0.12)" }}>

        {/* Header — hamburger saat collapsed, logo saat expanded */}
        <div className="flex-shrink-0 flex items-center h-16 px-3"
          style={{ borderBottom: "1px solid rgba(196,151,62,0.15)" }}>
          {expanded ? (
            // Logo + nama saat expanded
            <div className="flex items-center justify-between w-full">
              <Link to="/" className="flex items-center gap-2.5 no-underline min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E)", boxShadow: "0 4px 12px rgba(107,79,10,0.4)" }}>
                  <span className="font-display text-sm text-white">SP</span>
                </div>
                <span className="font-display text-xs tracking-[0.12em] whitespace-nowrap text-[#E8D5A8]">
                  STRIVE
                </span>
              </Link>
              {/* Tombol collapse */}
              <button onClick={() => setExpanded(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                  border-none cursor-pointer transition-all duration-200"
                style={{ background: "rgba(196,151,62,0.15)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(196,151,62,0.25)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(196,151,62,0.15)"}>
                <IconX size={13} color="#C4973E" />
              </button>
            </div>
          ) : (
            // Hamburger saat collapsed
            <button onClick={() => setExpanded(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto
                border-none cursor-pointer transition-all duration-200"
              style={{ background: "rgba(196,151,62,0.12)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(196,151,62,0.22)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(196,151,62,0.12)"}>
              <IconMenu size={18} color="#C4973E" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 p-2 bg-white overflow-hidden">
          {menuItems.map(item => (
            <SidebarLink
              key={item.to}
              item={item}
              active={pathname === item.to}
              expanded={expanded}
            />
          ))}
        </nav>

        {/* User info saat expanded */}
        {expanded && (
          <div className="flex-shrink-0 px-3 py-2 bg-white" style={{ borderTop: "1px solid #F3F4F6" }}>
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl mb-1"
              style={{ backgroundColor: "#F9FAFB" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E)" }}>
                <span className="font-sans text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <div className="font-sans text-xs font-semibold text-warm-black truncate">{user?.name?.split(" ")[0]}</div>
                <div className="font-sans text-[10px] text-[#9CA3AF]">Member</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer — logout */}
        <div className="flex-shrink-0 p-2 bg-white" style={{ borderTop: "1px solid #F3F4F6" }}>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-2xl border-none cursor-pointer
              font-sans text-sm transition-all duration-200 group"
            style={{
              padding: expanded ? "10px 12px" : "10px 0",
              justifyContent: expanded ? "flex-start" : "center",
              color: "#9CA3AF",
              background: "transparent",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#FEF2F2"; e.currentTarget.style.color = "#EF4444" }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#9CA3AF" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
              <IconLogOut size={18} color="currentColor" />
            </div>
            {expanded && <span className="font-sans text-sm font-medium">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ── MOBILE SIDEBAR ──────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full flex flex-col z-10" style={{ backgroundColor: "#1A1208" }}>

            {/* Mobile header */}
            <div className="flex items-center justify-between h-16 px-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(196,151,62,0.15)" }}>
              <Link to="/" className="flex items-center gap-3 no-underline" onClick={() => setMobileOpen(false)}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E)" }}>
                  <span className="font-display text-sm text-white">SP</span>
                </div>
                <span className="font-display text-xs tracking-[0.12em] text-[#E8D5A8]">STRIVE PILATES</span>
              </Link>
              <button onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer"
                style={{ background: "rgba(255,255,255,0.08)" }}>
                <IconX size={16} color="#E8D5A8" />
              </button>
            </div>

            {/* Mobile nav */}
            <nav className="flex-1 flex flex-col gap-1 p-3 bg-white overflow-y-auto">
              {menuItems.map(item => (
                <SidebarLink
                  key={item.to}
                  item={item}
                  active={pathname === item.to}
                  expanded={true}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>

            {/* Mobile footer */}
            <div className="flex-shrink-0 p-3 bg-white" style={{ borderTop: "1px solid #F3F4F6" }}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-2"
                style={{ backgroundColor: "#F9FAFB" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E)" }}>
                  <span className="font-sans text-sm font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-sans text-sm font-semibold text-warm-black truncate">{user?.name}</div>
                  <div className="font-sans text-xs text-[#9CA3AF]">Member</div>
                </div>
              </div>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl border-none
                  cursor-pointer font-sans text-sm transition-all duration-200"
                style={{ color: "#9CA3AF", background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#FEF2F2"; e.currentTarget.style.color = "#EF4444" }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#9CA3AF" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <IconLogOut size={18} color="currentColor" />
                </div>
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN AREA ───────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex-shrink-0 h-16 flex items-center justify-between px-5 sm:px-7 bg-white"
          style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center
                border-none cursor-pointer transition-all duration-200"
              style={{ background: "transparent" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F3F4F6"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
              <IconMenu size={20} color="#1A1208" />
            </button>
            <div>
              <h1 className="font-sans text-sm sm:text-base font-semibold text-warm-black leading-tight">
                {activeLabel}
              </h1>
              <p className="font-sans text-xs hidden sm:block text-[#9CA3AF]">
                Member · Strive Pilates Bali
              </p>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200"
            style={{ backgroundColor: "#F9FAFB", border: "1px solid #F3F4F6" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#E8D5A8"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#F3F4F6"}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E)" }}>
              <span className="font-sans text-xs font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-sans text-sm font-medium text-warm-black hidden sm:block">
              {user?.name?.split(" ")[0]}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-5 sm:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
