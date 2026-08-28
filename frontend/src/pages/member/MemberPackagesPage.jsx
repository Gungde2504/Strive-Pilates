import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { IconPackage, IconCheck, IconClock, IconChevronRight } from "../../components/icons/index"
import useInView from "../../hooks/useInView"

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView()
  return (
    <div ref={ref}
      className={`transition-all duration-500 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// ─── Package card (beli) ──────────────────────────────────────────────────────
function PkgCard({ pkg, delay }) {
  const [hovered, setHovered] = useState(false)
  return (
    <FadeIn delay={delay}>
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        className="rounded-2xl p-5 relative flex flex-col transition-all duration-300"
        style={{
          backgroundColor: pkg.is_featured ? "#1A1208" : "#FAFAFA",
          border: `1.5px solid ${hovered ? "#C4973E" : pkg.is_featured ? "rgba(196,151,62,0.25)" : "#EFEFEF"}`,
          transform: hovered ? "translateY(-4px)" : pkg.is_featured ? "translateY(-2px)" : "translateY(0)",
          boxShadow: hovered
            ? pkg.is_featured
              ? "0 20px 48px rgba(0,0,0,0.30)"
              : "0 12px 32px rgba(0,0,0,0.10)"
            : pkg.is_featured
              ? "0 10px 28px rgba(0,0,0,0.18)"
              : "none",
        }}>

        {pkg.is_featured && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full
            font-sans text-[10px] font-bold text-white whitespace-nowrap"
            style={{ background: "linear-gradient(145deg, #7A5C0E, #C4973E)" }}>
            TERPOPULER
          </div>
        )}

        {/* Name */}
        <div className="font-sans text-[10px] font-bold uppercase tracking-wider mb-2"
          style={{ color: pkg.is_featured ? "#C4973E" : "#8B6914" }}>
          {pkg.name}
        </div>

        {/* Price */}
        <div className="font-display font-normal leading-none mb-0.5"
          style={{ fontSize: "22px", color: pkg.is_featured ? "#FFFFFF" : "#1A1208" }}>
          {parseInt(pkg.price).toLocaleString("id-ID")}
        </div>
        <div className="font-sans text-[10px] mb-4"
          style={{ color: pkg.is_featured ? "rgba(232,213,168,0.4)" : "#9CA3AF" }}>
          IDR · {pkg.validity_days} hari
        </div>

        {/* Divider */}
        <div className="h-px mb-3"
          style={{ backgroundColor: pkg.is_featured ? "rgba(196,151,62,0.15)" : "#F0F0F0" }} />

        {/* Benefits */}
        <div className="flex-1 space-y-1.5 mb-4">
          {(pkg.benefits || []).slice(0, 3).map((b, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <IconCheck size={10} color={pkg.is_featured ? "#C4973E" : "#8B6914"} />
              <span className="font-sans text-[11px] leading-snug"
                style={{ color: pkg.is_featured ? "rgba(232,213,168,0.65)" : "#6B5E4A" }}>
                {b}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link to={`/member/package/${pkg.id}`}
          className="block text-center py-2.5 rounded-xl font-sans text-xs font-semibold
            no-underline transition-all duration-200"
          style={{
            background: pkg.is_featured ? "linear-gradient(145deg, #7A5C0E, #C4973E)" : "transparent",
            color: pkg.is_featured ? "#FFFFFF" : "#8B6914",
            border: pkg.is_featured ? "none" : "1.5px solid #C4973E",
            boxShadow: pkg.is_featured ? "0 4px 12px rgba(107,79,10,0.25)" : "none",
          }}>
          Pilih Paket
        </Link>
      </div>
    </FadeIn>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MemberPackagesPage() {
  const [memberPackages, setMemberPackages] = useState([])
  const [packages,       setPackages]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const token   = localStorage.getItem("auth_token")
  const headers = { "Authorization": `Bearer ${token}`, "Accept": "application/json" }

  useEffect(() => {
    Promise.all([
      fetch("/api/packages",              { headers }).then(r => r.json()),
      fetch("/api/member/packages/active",{ headers }).then(r => r.json()),
    ]).then(([pkgData, activeData]) => {
      setPackages(pkgData.data || [])
      if (activeData.data) setMemberPackages([activeData.data])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const active      = memberPackages[0]
  const sessionsUsed = active ? (active.sessions_total - active.sessions_remaining) : 0
  const progressPct  = active ? Math.round((sessionsUsed / active.sessions_total) * 100) : 0

  const daysLeft = active?.expired_at
    ? Math.max(0, Math.ceil((new Date(active.expired_at) - new Date()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <FadeIn>
        <div className="mb-6">
          <h2 className="font-sans text-xl font-semibold text-warm-black mb-1">Paket Saya</h2>
          <p className="font-sans text-sm text-warm-text/60">Kelola paket kelas pilates kamu</p>
        </div>
      </FadeIn>

      {/* ── ACTIVE PACKAGE BANNER ──────────────────────────────────────── */}
      <FadeIn delay={100}>
        <div className="relative rounded-3xl overflow-hidden mb-6"
          style={{ background: "linear-gradient(135deg, #1A1208 0%, #2D1F08 55%, #3D2A10 100%)" }}>
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 85% 20%, rgba(196,151,62,0.18), transparent 55%)" }} />
          {/* Decorative rings */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ border: "1px solid rgba(196,151,62,0.07)" }} />
          <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full pointer-events-none"
            style={{ border: "1px solid rgba(196,151,62,0.10)" }} />

          <div className="relative p-6 sm:p-7">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(196,151,62,0.18)" }}>
                <IconPackage size={13} color="#C4973E" />
              </div>
              <p className="font-sans text-[10px] tracking-[0.18em] uppercase text-bronze-light">
                PAKET AKTIF
              </p>
            </div>

            {!active ? (
              /* ── No active package ── */
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-display text-2xl text-white mb-1.5">Belum ada paket aktif</h3>
                  <p className="font-sans text-sm text-[rgba(232,213,168,0.50)]">
                    Beli paket untuk mulai booking kelas pilates
                  </p>
                </div>
                <Link to="/packages"
                  className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl
                    font-sans text-sm font-semibold text-white no-underline
                    transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(145deg, #7A5C0E, #C4973E)",
                    boxShadow: "0 6px 18px rgba(107,79,10,0.35)",
                  }}>
                  <IconPackage size={15} color="white" />
                  Beli Paket
                </Link>
              </div>
            ) : (
              /* ── Has active package ── */
              <div>
                <h3 className="font-display text-2xl text-white mb-4">{active.package?.name}</h3>

                {/* Stats row */}
                <div className="flex items-center gap-6 flex-wrap mb-5">
                  <div>
                    <div className="font-sans text-3xl font-bold text-white leading-none">
                      {active.sessions_remaining}
                    </div>
                    <div className="font-sans text-[11px] mt-1 text-[rgba(232,213,168,0.45)]">Sesi tersisa</div>
                  </div>
                  <div className="h-8 w-px bg-[rgba(196,151,62,0.2)]" />
                  <div>
                    <div className="font-sans text-3xl font-bold text-[rgba(232,213,168,0.35)] leading-none">
                      {active.sessions_total}
                    </div>
                    <div className="font-sans text-[11px] mt-1 text-[rgba(232,213,168,0.30)]">Total sesi</div>
                  </div>
                  <div className="h-8 w-px bg-[rgba(196,151,62,0.2)]" />
                  <div>
                    <div className="font-sans text-sm font-semibold text-bronze-light leading-none">
                      {daysLeft !== null ? `${daysLeft} hari lagi` : "-"}
                    </div>
                    <div className="font-sans text-[11px] mt-1 text-[rgba(232,213,168,0.30)]">
                      {active.expired_at
                        ? new Date(active.expired_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                        : "Berlaku hingga"}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans text-[11px] text-[rgba(232,213,168,0.50)]">
                      {sessionsUsed} dari {active.sessions_total} sesi digunakan
                    </span>
                    <span className="font-sans text-[11px] font-semibold text-bronze-light">
                      {progressPct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)]">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${progressPct}%`,
                        background: "linear-gradient(90deg, #7A5C0E, #C4973E)",
                        boxShadow: "0 0 8px rgba(196,151,62,0.40)",
                      }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </FadeIn>

      {/* ── AVAILABLE PACKAGES ─────────────────────────────────────────── */}
      <FadeIn delay={200}>
        <div className="bg-white rounded-2xl p-6 mb-5"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #F3F4F6" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-sans text-base font-semibold text-warm-black">Pilih Paket</h3>
            <Link to="/packages"
              className="flex items-center gap-1 font-sans text-xs font-medium no-underline
                text-bronze-base hover:text-bronze-light transition-colors duration-200">
              Lihat semua <IconChevronRight size={13} color="currentColor" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-44 rounded-2xl animate-pulse bg-slate-100" />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="py-10 text-center font-sans text-sm text-warm-text/50">
              Tidak ada paket tersedia
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.slice(0, 4).map((pkg, i) => (
                <PkgCard key={pkg.id} pkg={pkg} delay={i * 60} />
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      {/* ── KETENTUAN ──────────────────────────────────────────────────── */}
      <FadeIn delay={300}>
        <div className="rounded-2xl p-5"
          style={{ backgroundColor: "#FFFBEB", border: "1px solid #FEF3C7" }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#FEF3C7" }}>
              <IconClock size={15} color="#B45309" />
            </div>
            <div>
              <p className="font-sans text-sm font-semibold mb-2" style={{ color: "#B45309" }}>
                Ketentuan Paket
              </p>
              <ul className="font-sans text-xs space-y-1.5" style={{ color: "#92400E" }}>
                {[
                  "Paket berlaku sesuai masa aktif yang tertera",
                  "Sesi tidak dapat dipindahtangankan",
                  "Pembatalan booking minimal 2 jam sebelum kelas",
                  "Paket dapat digunakan untuk semua jenis kelas",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-0.5 flex-shrink-0">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
