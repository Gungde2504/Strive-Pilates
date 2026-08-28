import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import useAuthStore from "../stores/authStore"
import {
  IconHome, IconBarChart, IconCheck, IconUser, IconUsers,
  IconPackage, IconBell, IconLogOut, IconMenu, IconX,
  IconBookmark, IconRefresh,
} from "../components/icons/index"

const menuItems = [
  { icon: IconHome,     label: "Dashboard",      to: "/owner/dashboard",          desc: "Ringkasan" },
  { icon: IconBarChart, label: "Lap. Keuangan",  to: "/owner/finance",            desc: "Laporan keuangan" },
  { icon: IconRefresh,  label: "Lap. Komparatif",to: "/owner/finance/compare",    desc: "Perbandingan" },
  { icon: IconUser,     label: "Kelola Admin",   to: "/owner/admins",             desc: "Data admin" },
  { icon: IconUsers,    label: "Data Member",    to: "/owner/members",            desc: "Semua member" },
  { icon: IconPackage,  label: "Voucher",        to: "/owner/vouchers",           desc: "Kelola voucher" },
  { icon: IconBell,     label: "Log WA",         to: "/owner/notification-logs",  desc: "Notifikasi terkirim" },
  { icon: IconBookmark, label: "Audit Trail",    to: "/owner/audit-trail",        desc: "Log aktivitas" },
]

function SidebarLink({ item, active, expanded, onClick }) {
  const Icon = item.icon
  return (
    <Link to={item.to} onClick={onClick}
      className="flex items-center gap-3 rounded-xl no-underline transition-all duration-200 relative group mb-0.5"
      style={{
        padding: expanded ? "8px 10px" : "8px 0",
        justifyContent: expanded ? "flex-start" : "center",
        backgroundColor: active ? "rgba(109,40,217,0.10)" : "transparent",
        color: active ? "#6D28D9" : "#6B7280",
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = "rgba(109,40,217,0.06)"; e.currentTarget.style.color = "#6D28D9" } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6B7280" } }}>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
          style={{ backgroundColor: "#7C3AED" }} />
      )}
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{
          background: active ? "linear-gradient(145deg,#1E0A3C,#6D28D9)" : "transparent",
          boxShadow: active ? "0 4px 12px rgba(109,40,217,0.25)" : "none",
        }}>
        <Icon size={15} color={active ? "#FFFFFF" : "currentColor"} />
      </div>
      {expanded && (
        <div className="min-w-0 overflow-hidden">
          <div className="font-sans text-xs font-medium whitespace-nowrap">{item.label}</div>
          <div className="font-sans text-[9px] whitespace-nowrap" style={{ color: "#9CA3AF" }}>{item.desc}</div>
        </div>
      )}
      {!expanded && (
        <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg font-sans text-xs font-medium
          text-white whitespace-nowrap pointer-events-none z-50
          opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ backgroundColor: "#1E0A3C", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
          {item.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
            style={{ borderRightColor: "#1E0A3C" }} />
        </div>
      )}
    </Link>
  )
}

export default function OwnerLayout() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const { user, logout } = useAuthStore()
  const [expanded,   setExpanded]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}`, Accept: "application/json" },
      })
    } catch {}
    logout(); navigate("/login")
  }

  const isActive    = (to) => pathname === to
  const activeLabel = menuItems.find(m => isActive(m.to))?.label || "Dashboard"

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#F8F5FF" }}>

      {/* ── DESKTOP SIDEBAR ─────────────────── */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 h-full transition-all duration-300 ease-in-out overflow-hidden ${expanded ? "w-56" : "w-[72px]"}`}
        style={{ backgroundColor: "#1E0A3C", boxShadow: "4px 0 20px rgba(0,0,0,0.15)" }}>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center h-14 px-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {expanded ? (
            <div className="flex items-center justify-between w-full">
              <Link to="/" className="flex items-center gap-2.5 no-underline min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(145deg,#6D28D9,#A78BFA)", boxShadow: "0 4px 12px rgba(109,40,217,0.35)" }}>
                  <span className="font-display text-xs text-white">SP</span>
                </div>
                <span className="font-display text-xs tracking-[0.1em] whitespace-nowrap" style={{ color: "#EDE9FE" }}>
                  OWNER
                </span>
              </Link>
              <button onClick={() => setExpanded(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border-none cursor-pointer transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.08)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
                <IconX size={13} color="#A78BFA" />
              </button>
            </div>
          ) : (
            <button onClick={() => setExpanded(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto border-none cursor-pointer transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.06)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}>
              <IconMenu size={18} color="#A78BFA" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col p-1.5 pt-2 bg-white overflow-hidden">
          {menuItems.map(item => (
            <SidebarLink key={item.to} item={item} active={isActive(item.to)} expanded={expanded} />
          ))}
        </nav>

        {/* User info saat expanded */}
        {expanded && (
          <div className="flex-shrink-0 px-2 py-2 bg-white" style={{ borderTop: "1px solid #F3F4F6" }}>
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl" style={{ backgroundColor: "#F9FAFB" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(145deg,#6D28D9,#A78BFA)" }}>
                <span className="font-sans text-xs font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <div className="font-sans text-xs font-semibold truncate" style={{ color: "#0F172A" }}>{user?.name?.split(" ")[0]}</div>
                <div className="font-sans text-[10px]" style={{ color: "#9CA3AF" }}>Owner</div>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="flex-shrink-0 p-1.5 bg-white" style={{ borderTop: "1px solid #F3F4F6" }}>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl border-none cursor-pointer transition-all duration-200"
            style={{
              padding: expanded ? "8px 10px" : "8px 0",
              justifyContent: expanded ? "flex-start" : "center",
              color: "#9CA3AF", background: "transparent",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#FEF2F2"; e.currentTarget.style.color = "#EF4444" }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#9CA3AF" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0">
              <IconLogOut size={15} color="currentColor" />
            </div>
            {expanded && <span className="font-sans text-xs font-medium">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ── MOBILE SIDEBAR ──────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full flex flex-col z-10" style={{ backgroundColor: "#1E0A3C" }}>
            <div className="flex items-center justify-between h-16 px-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <Link to="/" className="flex items-center gap-2.5 no-underline" onClick={() => setMobileOpen(false)}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(145deg,#6D28D9,#A78BFA)" }}>
                  <span className="font-display text-xs text-white">SP</span>
                </div>
                <span className="font-display text-sm tracking-[0.1em]" style={{ color: "#EDE9FE" }}>OWNER PANEL</span>
              </Link>
              <button onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer"
                style={{ background: "rgba(255,255,255,0.08)" }}>
                <IconX size={16} color="#A78BFA" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-0.5 p-2 bg-white overflow-y-auto">
              {menuItems.map(item => (
                <SidebarLink key={item.to} item={item} active={isActive(item.to)} expanded={true} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
            <div className="flex-shrink-0 p-3 bg-white" style={{ borderTop: "1px solid #F3F4F6" }}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2" style={{ backgroundColor: "#F9FAFB" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(145deg,#6D28D9,#A78BFA)" }}>
                  <span className="font-sans text-sm font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <div className="font-sans text-sm font-semibold truncate" style={{ color: "#0F172A" }}>{user?.name}</div>
                  <div className="font-sans text-xs" style={{ color: "#9CA3AF" }}>Owner</div>
                </div>
              </div>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-none cursor-pointer transition-all duration-200"
                style={{ color: "#9CA3AF", background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#FEF2F2"; e.currentTarget.style.color = "#EF4444" }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#9CA3AF" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"><IconLogOut size={15} color="currentColor" /></div>
                <span className="font-sans text-sm">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex-shrink-0 h-14 flex items-center justify-between px-5 sm:px-7 bg-white"
          style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all duration-200"
              onClick={() => setMobileOpen(true)}
              style={{ background: "transparent" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F5F3FF"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
              <IconMenu size={20} color="#1E0A3C" />
            </button>
            <div>
              <h1 className="font-sans text-sm sm:text-base font-semibold leading-tight" style={{ color: "#0F172A" }}>
                {activeLabel}
              </h1>
              <p className="font-sans text-xs hidden sm:block" style={{ color: "#94A3B8" }}>
                Owner · Strive Pilates Bali
              </p>
            </div>
          </div>

          {/* Avatar — full rounded, purple */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200"
            style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#A78BFA"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(145deg,#6D28D9,#A78BFA)" }}>
              <span className="font-sans text-xs font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <span className="font-sans text-sm font-medium hidden sm:block" style={{ color: "#0F172A" }}>
              {user?.name?.split(" ")[0]}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-5 sm:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
