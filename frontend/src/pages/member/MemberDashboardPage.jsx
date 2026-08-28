import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import useAuthStore from "../../stores/authStore"
import {
  IconCalendar, IconPackage, IconCheck, IconClock,
  IconChevronRight, IconUsers, IconAward, IconStar,
} from "../../components/icons/index"
import useInView from "../../hooks/useInView"

// ─── Scroll-reveal ────────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView()
  return (
    <div ref={ref}
      className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// ─── Stat themes — 4 warna berbeda, tetap selaras earth/warm tone ────────────
const STAT_THEMES = [
  {
    // Amber gold — paling terang
    gradient: "linear-gradient(135deg, #B8860B 0%, #DAA520 60%, #C4973E 100%)",
    glow: "rgba(218,165,32,0.45)",
    shine: "rgba(255,235,150,0.30)",
  },
  {
    // Terracotta / burnt orange
    gradient: "linear-gradient(135deg, #8B3A1A 0%, #C0522A 60%, #D4724A 100%)",
    glow: "rgba(192,82,42,0.40)",
    shine: "rgba(255,180,130,0.25)",
  },
  {
    // Olive / warm green-brown
    gradient: "linear-gradient(135deg, #4A5A1A 0%, #6B7C2A 60%, #8A9A3E 100%)",
    glow: "rgba(107,124,42,0.40)",
    shine: "rgba(200,220,120,0.20)",
  },
  {
    // Dusty rose / mauve — warm tapi berbeda dari coklat
    gradient: "linear-gradient(135deg, #7C3A4A 0%, #A85268 60%, #C4728A 100%)",
    glow: "rgba(168,82,104,0.42)",
    shine: "rgba(255,180,200,0.22)",
  },
]

function StatCard({ icon: Icon, label, value, sub, themeIndex = 0, delay = 0 }) {
  const [hovered, setHovered] = useState(false)
  const theme = STAT_THEMES[themeIndex]
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative rounded-2xl overflow-hidden cursor-default"
        style={{
          background: theme.gradient,
          padding: "20px",
          transform: hovered ? "translateY(-5px) scale(1.015)" : "translateY(0) scale(1)",
          boxShadow: hovered
            ? `0 20px 40px ${theme.glow}, 0 6px 16px rgba(0,0,0,0.15)`
            : `0 6px 20px ${theme.glow}, 0 2px 6px rgba(0,0,0,0.10)`,
          transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}>
        {/* Shine */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 10% 10%, ${theme.shine} 0%, transparent 60%)`,
            opacity: hovered ? 1 : 0.6,
            transition: "opacity 0.35s ease",
          }} />
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-1/2 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.18), transparent)" }} />

        <div className="relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}>
            <Icon size={18} color="#FFFFFF" />
          </div>
          <div className="font-sans font-bold text-white leading-none mb-1"
            style={{ fontSize: "clamp(24px, 3vw, 30px)" }}>
            {value}
          </div>
          <div className="font-sans text-xs font-semibold text-white/85 mb-0.5">{label}</div>
          <div className="font-sans text-[10px] text-white/50">{sub}</div>
        </div>
      </div>
    </FadeIn>
  )
}

// ─── Booking row ──────────────────────────────────────────────────────────────
function BookingRow({ booking, st }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 cursor-default"
      style={{
        backgroundColor: hovered ? "#F9F6F0" : "#FAFAFA",
        border: `1px solid ${hovered ? "#E8D5A8" : "#F3F4F6"}`,
        transform: hovered ? "translateX(4px)" : "translateX(0)",
      }}>
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E)", boxShadow: "0 4px 10px rgba(107,79,10,0.25)" }}>
          <IconCalendar size={16} color="#FFFFFF" />
        </div>
        <div className="min-w-0">
          <div className="font-sans text-sm font-semibold text-warm-black truncate">{booking.class_name}</div>
          <div className="font-sans text-xs text-warm-text/55 mt-0.5">
            {booking.date
              ? new Date(booking.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })
              : "-"
            } · {booking.start_time?.substring(0, 5)}
          </div>
        </div>
      </div>
      <span className="px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold flex-shrink-0 ml-3"
        style={{ backgroundColor: st.bg, color: st.text }}>
        {st.label}
      </span>
    </div>
  )
}

// ─── Quick action ─────────────────────────────────────────────────────────────
function QuickAction({ to, icon: Icon, label, primary = false }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3 p-4 rounded-xl no-underline transition-all duration-200"
      style={primary ? {
        background: hovered
          ? "linear-gradient(145deg, #6B4F0A, #B08530, #7A5C0E)"
          : "linear-gradient(145deg, #7A5C0E, #C4973E, #A0792A)",
        boxShadow: hovered
          ? "0 12px 28px rgba(107,79,10,0.50), inset 0 1px 0 rgba(255,240,180,0.3)"
          : "0 6px 18px rgba(107,79,10,0.30), inset 0 1px 0 rgba(255,240,180,0.2)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      } : {
        backgroundColor: hovered ? "#F9F6F0" : "#F9FAFB",
        border: `1px solid ${hovered ? "#E8D5A8" : "#EFEFEF"}`,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? "0 6px 16px rgba(0,0,0,0.07)" : "none",
      }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: primary ? "rgba(255,255,255,0.18)" : "rgba(139,105,20,0.1)" }}>
        <Icon size={16} color={primary ? "#FFFFFF" : "#8B6914"} />
      </div>
      <span className={`font-sans text-sm font-medium ${primary ? "text-white" : "text-warm-black"}`}>
        {label}
      </span>
      <div className="ml-auto">
        <IconChevronRight size={14} color={primary ? "rgba(255,255,255,0.6)" : "#C4973E"} />
      </div>
    </Link>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MemberDashboardPage() {
  const { user } = useAuthStore()
  const [bookings,  setBookings]  = useState([])
  const [activePkg, setActivePkg] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const token   = localStorage.getItem("auth_token")
  const headers = { "Authorization": `Bearer ${token}`, "Accept": "application/json" }

  useEffect(() => {
    Promise.all([
      fetch("/api/member/bookings",        { headers }).then(r => r.json()),
      fetch("/api/member/packages/active", { headers }).then(r => r.json()),
    ]).then(([bookingData, pkgData]) => {
      setBookings(bookingData.data || [])
      setActivePkg(pkgData.data || null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const upcoming  = bookings.filter(b => ["confirmed", "pending", "pending_payment"].includes(b.status))
  const completed = bookings.filter(b => b.status === "attended")

  const statusStyle = {
    pending:         { bg: "#FEF9EE", text: "#B45309", label: "Menunggu" },
    pending_payment: { bg: "#FEF9EE", text: "#B45309", label: "Belum Bayar" },
    confirmed:       { bg: "#F0FDF4", text: "#15803D", label: "Dikonfirmasi" },
    attended:        { bg: "#F5F0EA", text: "#6B4F0A", label: "Selesai" },
    cancelled:       { bg: "#FEF2F2", text: "#B91C1C", label: "Dibatalkan" },
  }

  const stats = [
    { icon: IconCalendar, label: "Booking Aktif", value: upcoming.length,                      sub: "Sesi mendatang",   themeIndex: 0 },
    { icon: IconCheck,    label: "Sesi Selesai",  value: completed.length,                     sub: "Total hadir",      themeIndex: 1 },
    { icon: IconPackage,  label: "Sesi Tersisa",  value: activePkg?.sessions_remaining ?? "–", sub: "Dari paket aktif", themeIndex: 2 },
    { icon: IconUsers,    label: "Total Booking", value: bookings.length,                      sub: "Sepanjang waktu",  themeIndex: 3 },
  ]

  return (
    <div className="min-h-full space-y-6">

      {/* ── WELCOME BANNER ───────────────────────────────────────────────── */}
      <FadeIn>
        <div className="relative rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1A1208 0%, #2D1F08 50%, #3D2A10 100%)" }}>
          {/* Glow accents */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 15% 60%, rgba(196,151,62,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(139,105,20,0.12) 0%, transparent 50%)" }} />
          {/* Grid texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg,#C4973E 0,#C4973E 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#C4973E 0,#C4973E 1px,transparent 1px,transparent 40px)" }} />

          <div className="relative p-6 sm:p-8">
            <div className="flex items-start gap-5">
              {/* Avatar icon */}
              <div className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, #7A5C0E, #C4973E)",
                  boxShadow: "0 8px 24px rgba(107,79,10,0.45), inset 0 1px 0 rgba(255,240,180,0.3)",
                }}>
                <IconAward size={26} color="#FFFFFF" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-sans text-[10px] tracking-[0.18em] uppercase mb-1.5 text-bronze-light">
                  SELAMAT DATANG KEMBALI
                </p>
                <h2 className="font-display font-normal text-white leading-tight mb-2"
                  style={{ fontSize: "clamp(20px, 3vw, 28px)" }}>
                  {user?.name}
                </h2>
                <p className="font-sans text-xs text-[rgba(232,213,168,0.50)] leading-relaxed">
                  Tubuh yang kuat dimulai dari konsistensi.<br className="hidden sm:block" />
                  Yuk lanjutkan perjalanan pilates kamu hari ini.
                </p>
              </div>

              {/* Decorative star — pojok kanan atas */}
              <div className="hidden sm:flex flex-col items-center gap-1 flex-shrink-0 opacity-25">
                <IconStar size={18} color="#C4973E" filled />
                <IconStar size={12} color="#C4973E" filled />
                <IconStar size={8}  color="#C4973E" filled />
              </div>
            </div>

            {/* Divider gold */}
            <div className="divider-gold mt-5 mb-4" />

            {/* Quick stats row */}
            <div className="flex gap-6 flex-wrap">
              {[
                { label: "Booking aktif",  value: loading ? "–" : upcoming.length },
                { label: "Sesi selesai",   value: loading ? "–" : completed.length },
                { label: "Sisa sesi paket", value: loading ? "–" : activePkg?.sessions_remaining ?? "–" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="font-sans text-lg font-bold text-white leading-none">{s.value}</div>
                  <div className="font-sans text-[10px] text-[rgba(232,213,168,0.45)] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── STAT CARDS ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse bg-slate-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 70} />
          ))}
        </div>
      )}

      {/* ── CONTENT GRID ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Booking mendatang */}
        <FadeIn delay={200} className="lg:col-span-2">
          <div className="bg-white rounded-2xl h-full overflow-hidden"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid #F5F5F5" }}>
              <div>
                <h3 className="font-sans text-sm font-semibold text-warm-black">Booking Mendatang</h3>
                <p className="font-sans text-[11px] text-warm-text/50 mt-0.5">{upcoming.length} sesi aktif</p>
              </div>
              <Link to="/member/bookings"
                className="flex items-center gap-1 font-sans text-xs font-medium no-underline
                  text-bronze-base hover:text-bronze-light transition-colors duration-200">
                Lihat semua <IconChevronRight size={13} color="currentColor" />
              </Link>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 rounded-2xl animate-pulse bg-slate-100" />
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "linear-gradient(145deg, rgba(139,105,20,0.08), rgba(196,151,62,0.12))" }}>
                    <IconCalendar size={24} color="#C4973E" />
                  </div>
                  <p className="font-sans text-sm font-semibold text-warm-black mb-1">Belum ada booking aktif</p>
                  <p className="font-sans text-xs text-warm-text/50 mb-5 max-w-xs leading-relaxed">
                    Yuk booking kelas pilates dan mulai perjalananmu!
                  </p>
                  <Link to="/schedule"
                    className="px-5 py-2.5 rounded-xl font-sans text-xs font-medium text-white
                      no-underline transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: "linear-gradient(145deg, #7A5C0E, #C4973E, #A0792A)",
                      boxShadow: "0 6px 18px rgba(107,79,10,0.30)",
                    }}>
                    Lihat Jadwal
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcoming.slice(0, 4).map(booking => {
                    const st = statusStyle[booking.status] || statusStyle.pending
                    return <BookingRow key={booking.id} booking={booking} st={st} />
                  })}
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Right column */}
        <div className="space-y-4">

          {/* Quick actions */}
          <FadeIn delay={300}>
            <div className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
              <div className="px-5 pt-4 pb-3" style={{ borderBottom: "1px solid #F5F5F5" }}>
                <h3 className="font-sans text-sm font-semibold text-warm-black">Aksi Cepat</h3>
              </div>
              <div className="p-3 space-y-1.5">
                <QuickAction to="/schedule"        icon={IconCalendar} label="Booking Kelas Baru" primary />
                <QuickAction to="/member/bookings" icon={IconClock}    label="Riwayat Booking" />
                <QuickAction to="/packages"        icon={IconPackage}  label="Beli Paket" />
              </div>
            </div>
          </FadeIn>

          {/* Active package */}
          <FadeIn delay={400}>
            <div className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: "linear-gradient(145deg, #1A1208 0%, #2C1E07 60%, #1A1208 100%)" }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 85% 15%, rgba(196,151,62,0.18), transparent 55%)" }} />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                style={{ border: "1px solid rgba(196,151,62,0.08)" }} />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full pointer-events-none"
                style={{ border: "1px solid rgba(196,151,62,0.12)" }} />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(196,151,62,0.18)" }}>
                    <IconPackage size={13} color="#C4973E" />
                  </div>
                  <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-bronze-light">PAKET AKTIF</p>
                </div>

                {activePkg ? (
                  <>
                    <div className="font-display text-white text-base mb-1 leading-tight">{activePkg.package?.name}</div>
                    <div className="my-3">
                      <div className="flex justify-between mb-1.5">
                        <span className="font-sans text-[11px] text-[rgba(232,213,168,0.55)]">Sisa sesi</span>
                        <span className="font-sans text-[11px] font-semibold text-bronze-light">
                          {activePkg.sessions_remaining}/{activePkg.sessions_total}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-[rgba(255,255,255,0.08)]">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(activePkg.sessions_remaining / activePkg.sessions_total) * 100}%`,
                            background: "linear-gradient(90deg, #7A5C0E, #C4973E)",
                            boxShadow: "0 0 8px rgba(196,151,62,0.4)",
                          }} />
                      </div>
                    </div>
                    <p className="font-sans text-[11px] mb-4 text-[rgba(232,213,168,0.40)]">
                      Hingga {activePkg.expired_at
                        ? new Date(activePkg.expired_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                        : "-"}
                    </p>
                    <Link to="/member/packages"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-sans
                        text-xs font-semibold text-white no-underline transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E)", boxShadow: "0 6px 16px rgba(107,79,10,0.35)" }}>
                      Lihat Detail <IconChevronRight size={12} color="white" />
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="font-display text-white text-base mb-1">Belum ada paket</div>
                    <p className="font-sans text-[11px] mb-4 text-[rgba(232,213,168,0.40)] leading-relaxed">
                      Beli paket untuk mulai booking kelas
                    </p>
                    <Link to="/packages"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-sans
                        text-xs font-semibold text-white no-underline transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E)", boxShadow: "0 6px 16px rgba(107,79,10,0.35)" }}>
                      Beli Paket <IconChevronRight size={12} color="white" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
