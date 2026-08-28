import { useState, useEffect, useRef } from "react"
import useApi from "../../hooks/useApi"
import { Link } from "react-router-dom"
import {
  IconChevronRight, IconCheck, IconMapPin, IconClock,
  IconUsers, IconCalendar, IconAward, IconStar,
} from "../../components/icons/index"
import useInView from "../../hooks/useInView"
import useHover from "../../hooks/useHover"
import useAuthStore from "../../stores/authStore"

function Section({ children, className = "", direction = "up", delay = 0 }) {
  const [ref, inView] = useInView()
  const animClass = { up: "animate-fade-up", left: "animate-fade-left", right: "animate-fade-right", scale: "animate-scale-in" }[direction] ?? "animate-fade-up"
  const delayClass = delay ? `delay-${delay * 100}` : ""
  return (
    <div ref={ref} className={`${inView ? `${animClass} ${delayClass}` : "opacity-0"} ${className}`}>
      {children}
    </div>
  )
}

function SkeletonCard({ className = "", height = "h-48" }) {
  return (
    <div className={`bg-ivory rounded-card overflow-hidden neu-raised animate-pulse ${className}`}>
      <div className={`bg-[#D8C8A8]/60 ${height}`} />
      <div className="p-5 space-y-2">
        <div className="h-3 bg-[#D8C8A8]/60 rounded-full w-3/4" />
        <div className="h-3 bg-[#D8C8A8]/40 rounded-full w-full" />
        <div className="h-3 bg-[#D8C8A8]/40 rounded-full w-2/3" />
        <div className="h-8 bg-[#D8C8A8]/60 rounded-xl mt-3" />
      </div>
    </div>
  )
}

function SkeletonPackageCard({ className = "" }) {
  return (
    <div className={`bg-ivory rounded-card p-6 neu-raised animate-pulse ${className}`}>
      <div className="h-3 bg-[#D8C8A8]/60 rounded-full w-1/2 mb-3" />
      <div className="h-8 bg-[#D8C8A8]/60 rounded-full w-3/4 mb-1" />
      <div className="h-3 bg-[#D8C8A8]/40 rounded-full w-1/3 mb-4" />
      <div className="h-px bg-[#D8C8A8]/40 mb-4" />
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-[#D8C8A8]/40 rounded-full w-full" />
        <div className="h-3 bg-[#D8C8A8]/40 rounded-full w-4/5" />
        <div className="h-3 bg-[#D8C8A8]/40 rounded-full w-3/4" />
      </div>
      <div className="h-10 bg-[#D8C8A8]/60 rounded-xl" />
    </div>
  )
}

function SkeletonScheduleRow() {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-white/5 border border-bronze-light/10 animate-pulse">
      <div className="flex items-center gap-5 flex-1">
        <div className="h-6 w-12 bg-bronze-light/20 rounded-lg" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-[rgba(232,213,168,0.15)] rounded-full w-32" />
          <div className="h-2.5 bg-[rgba(232,213,168,0.08)] rounded-full w-24" />
        </div>
      </div>
      <div className="h-6 w-16 bg-bronze-light/10 rounded-full" />
    </div>
  )
}

function SkeletonTestimonialCard() {
  return (
    <div className="bg-ivory rounded-card p-7 neu-raised animate-pulse">
      <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <div key={i} className="w-4 h-4 bg-[#D8C8A8]/60 rounded-full" />)}</div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-[#D8C8A8]/40 rounded-full w-full" />
        <div className="h-3 bg-[#D8C8A8]/40 rounded-full w-5/6" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#D8C8A8]/60 flex-shrink-0" />
        <div className="h-3 bg-[#D8C8A8]/60 rounded-full w-24" />
      </div>
    </div>
  )
}

function HomeBookingButton({ slotId }) {
  const { token } = useAuthStore()
  const to = token ? `/member/booking/${slotId}` : `/register?redirect=/member/booking/${slotId}`
  return (
    <Link to={to} className="btn-bronze hover-bronze px-4 py-2 rounded-lg font-sans text-xs sm:text-sm font-medium no-underline text-white">
      Booking
    </Link>
  )
}

function PackageLink({ pkgId, featured, children }) {
  const { token } = useAuthStore()
  const to = token ? `/member/package/${pkgId}` : `/register?redirect=/member/package/${pkgId}`
  return (
    <Link to={to} className={`block text-center mt-5 py-2.5 rounded-xl font-sans text-sm font-medium no-underline transition-all duration-200 ${featured ? "btn-bronze text-white" : "text-bronze-base border border-bronze-light hover:bg-bronze-light hover:text-white"}`}>
      {children}
    </Link>
  )
}

function StatCard({ icon: Icon, num, label }) {
  const [hovered, handlers] = useHover()
  return (
    <div {...handlers} className="bg-ivory rounded-card p-6 sm:p-7 text-center transition-all duration-300"
      style={{ boxShadow: hovered ? "12px 14px 28px #C8BFB4, -8px -8px 20px #FFFFFF" : "6px 6px 16px #D9D1C5, -6px -6px 16px #FFFFFF", transform: hovered ? "translateY(-5px)" : "translateY(0)" }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 btn-bronze">
        <Icon size={22} color="#FFFFFF" />
      </div>
      <div className="font-display font-normal text-bronze-light leading-none mb-2 text-[clamp(32px,5vw,44px)]">{num}</div>
      <div className="font-sans text-xs sm:text-sm text-warm-text leading-snug">{label}</div>
    </div>
  )
}

function ScheduleRow({ slot, st }) {
  const [hovered, handlers] = useHover()
  return (
    <div {...handlers} className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 rounded-2xl transition-all duration-200"
      style={{ backgroundColor: hovered ? "rgba(196,151,62,0.08)" : "rgba(255,255,255,0.05)", border: `1px solid ${hovered ? "rgba(196,151,62,0.35)" : "rgba(196,151,62,0.15)"}` }}>
      <div className="flex items-center gap-5">
        <span className="font-sans text-lg sm:text-xl font-bold min-w-[50px] text-bronze-light">{slot.start_time.substring(0, 5)}</span>
        <div>
          <div className="font-sans text-sm sm:text-base font-semibold text-[#E8D5A8]">{slot.class_name}</div>
          <div className="font-sans text-xs text-[rgba(232,213,168,0.55)]">{slot.instructor_name} · {slot.available_slots}/{slot.capacity} slot</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="px-3 py-0.5 rounded-full font-sans text-[11px] font-semibold" style={{ backgroundColor: st.bg, color: st.text }}>{st.label}</span>
        {slot.status_label !== "full" && <HomeBookingButton slotId={slot.id} />}
      </div>
    </div>
  )
}

function ClassCard({ cls }) {
  const [hovered, handlers] = useHover()
  const imgMap = {
    "core reformer":           "/images/Core Reformer.jpg",
    "full body reformer":      "/images/Full Body Reformer.jpg",
    "full body mat":           "/images/fullbodymat.jpg",
    "glutes reformer":         "/images/Glutes Reformer.jpg",
    "private class mat":       "/images/Private Class Mat.jpg",
    "private class reformer":  "/images/Private Class Reformer.jpg",
    "private group mat":       "/images/Private Group Mat.jpg",
    "private group reformer":  "/images/Private Group Reformer.jpg",
    "kelas mat":               "/images/kelas mat.jpg",
    "kelas reformer":          "/images/kelas reformer.jpg",
  }
  const imgSrc = imgMap[cls.name?.toLowerCase()] || (cls.type === "reformer" ? "/images/kelas reformer.jpg" : "/images/kelas mat.jpg")
  return (
    <div {...handlers} className="bg-ivory rounded-card overflow-hidden transition-all duration-300"
      style={{ boxShadow: hovered ? "14px 18px 36px #C8BFB4, -10px -10px 24px #FFFFFF" : "8px 8px 20px #D9D1C5, -8px -8px 20px #FFFFFF", transform: hovered ? "translateY(-6px)" : "translateY(0)" }}>
      <div className="relative h-40 overflow-hidden">
        <img src={imgSrc} alt={cls.name} className="w-full h-full object-cover transition-transform duration-500" style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }} onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex" }} />
        <div className="hidden w-full h-full items-center justify-center bg-[#D8C8A8]">
          <span className="font-sans text-xs text-bronze-base">{cls.name}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full font-sans text-[10px] font-bold tracking-wide"
          style={{ backgroundColor: cls.type === "mat" ? "#E8D5A8" : "#1A1208", color: cls.type === "mat" ? "#6B4F0A" : "#E8D5A8" }}>
          {cls.type?.toUpperCase()}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-sans text-sm sm:text-base font-semibold text-warm-black mb-1.5">{cls.name}</h3>
        <p className="font-sans text-xs sm:text-[13px] text-warm-text leading-relaxed mb-3 line-clamp-2">{cls.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-baseline gap-1">
            <span className="font-sans text-sm font-semibold text-bronze-base">Rp {parseInt(cls.price).toLocaleString("id-ID")}</span>
            <span className="font-sans text-xs text-warm-text/60">/pax</span>
          </div>
          <Link to="/schedule" className="font-sans text-xs text-bronze-base font-medium no-underline hover:text-bronze-light transition-colors duration-200">Jadwal →</Link>
        </div>
      </div>
    </div>
  )
}

function PackageCard({ pkg }) {
  const [hovered, handlers] = useHover()
  return (
    <div {...handlers} className="rounded-card p-6 relative transition-all duration-300"
      style={{ backgroundColor: pkg.is_featured ? "#1A1208" : "#F5F0EA", transform: hovered ? "translateY(-8px)" : pkg.is_featured ? "translateY(-4px)" : "translateY(0)", boxShadow: hovered ? pkg.is_featured ? "0 32px 80px rgba(0,0,0,0.45)" : "14px 18px 36px #C8BFB4, -10px -10px 24px #FFFFFF" : pkg.is_featured ? "0 20px 50px rgba(0,0,0,0.3)" : "8px 8px 20px #D9D1C5, -8px -8px 20px #FFFFFF" }}>
      {pkg.is_featured && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full font-sans text-[10px] font-bold text-white whitespace-nowrap btn-bronze">TERPOPULER</div>}
      <div className={`font-sans text-[11px] font-bold uppercase tracking-wider mb-1.5 ${pkg.is_featured ? "text-bronze-light" : "text-bronze-base"}`}>{pkg.name}</div>
      <div className="flex items-baseline gap-1 mb-1">
        <div className={`font-display font-normal leading-none text-[clamp(24px,4vw,36px)] ${pkg.is_featured ? "text-white" : "text-warm-black"}`}>{parseInt(pkg.price).toLocaleString("id-ID")}</div>
        <span className={`font-sans text-xs ${pkg.is_featured ? "text-[rgba(232,213,168,0.55)]" : "text-[#A89478]"}`}>/pax</span>
      </div>
      <div className={`font-sans text-xs mb-4 ${pkg.is_featured ? "text-[rgba(232,213,168,0.55)]" : "text-[#A89478]"}`}>IDR · {pkg.validity_days} hari</div>
      <div className={`h-px mb-3.5 ${pkg.is_featured ? "bg-[rgba(196,151,62,0.2)]" : "bg-[rgba(139,105,20,0.12)]"}`} />
      {(pkg.benefits || []).slice(0, 3).map((b, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <IconCheck size={12} color={pkg.is_featured ? "#C4973E" : "#8B6914"} />
          <span className={`font-sans text-xs sm:text-sm ${pkg.is_featured ? "text-[rgba(232,213,168,0.75)]" : "text-warm-text"}`}>{b}</span>
        </div>
      ))}
      <PackageLink pkgId={pkg.id} featured={pkg.is_featured}>Pilih Paket</PackageLink>
    </div>
  )
}

function TestimonialCard({ t }) {
  const [hovered, handlers] = useHover()
  return (
    <div {...handlers} className="bg-ivory rounded-card p-7 transition-all duration-300"
      style={{ boxShadow: hovered ? "14px 18px 36px #C8BFB4, -10px -10px 24px #FFFFFF" : "8px 8px 20px #D9D1C5, -8px -8px 20px #FFFFFF", transform: hovered ? "translateY(-6px)" : "translateY(0)" }}>
      <div className="flex gap-1 mb-4">{[...Array(t.rating || 5)].map((_, j) => <IconStar key={j} size={16} color="#C4973E" filled />)}</div>
      <p className="font-sans text-sm text-warm-text leading-relaxed mb-4 italic">"{t.content}"</p>
      <div className="flex items-center gap-3">
        {t.photo && <img src={t.photo} alt={t.member_name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />}
        <div className="font-sans text-sm font-semibold text-warm-black">{t.member_name}</div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data: classesData,      loading: loadingClasses }      = useApi("/api/classes")
  const { data: schedulesData,    loading: loadingSchedules }    = useApi("/api/schedules/today")
  const { data: packagesData,     loading: loadingPackages }     = useApi("/api/packages")
  const { data: testimonialsData, loading: loadingTestimonials } = useApi("/api/cms/testimonials")

  const [classes,        setClasses]        = useState([])
  const [todaySchedules, setTodaySchedules] = useState([])
  const [packages,       setPackages]       = useState([])
  const [testimonials,   setTestimonials]   = useState([])
  const [videoLoaded,    setVideoLoaded]    = useState(false)
  const videoRef = useRef(null)

  useEffect(() => { if (classesData)      setClasses(Array.isArray(classesData) ? classesData.slice(0, 4) : []) },      [classesData])
  useEffect(() => { if (schedulesData)    setTodaySchedules((Array.isArray(schedulesData) ? schedulesData : []).slice(0, 5)) }, [schedulesData])
  useEffect(() => { if (packagesData)     setPackages(Array.isArray(packagesData) ? packagesData.slice(0, 4) : []) },    [packagesData])
  useEffect(() => { if (testimonialsData) setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : []) },   [testimonialsData])

  const statusStyle = {
    available:   { bg: "#D5EDD8", text: "#1A6B2A", label: "Tersedia" },
    almost_full: { bg: "#F5E8C0", text: "#8B6500", label: "Hampir Penuh" },
    full:        { bg: "#F0D4D4", text: "#8B1A1A", label: "Penuh" },
  }

  const stats = [
    { icon: IconUsers,    num: "500+", label: "Member Aktif" },
    { icon: IconCalendar, num: "10",   label: "Sesi per Hari" },
    { icon: IconAward,    num: "4",    label: "Instruktur Bersertifikat" },
    { icon: IconStar,     num: "3+",   label: "Tahun Pengalaman" },
  ]

  return (
    <div>

      {/* ── HERO dengan Video Background ─────────────────────────────────── */}
      <section className="relative overflow-hidden flex items-center justify-center min-h-screen bg-warm-black">

        {/* Video background */}
        <video ref={videoRef} autoPlay muted loop playsInline
          onCanPlay={() => setVideoLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: videoLoaded ? 1 : 0 }}>
          <source src="/videos/hero banner.mp4" type="video/mp4" />
        </video>

        {/* Fallback image kalau video gagal load */}
        <div className="absolute inset-0 bg-warm-black"
          style={{ opacity: videoLoaded ? 0 : 1, transition: "opacity 1s ease" }}>
          <img src="/images/suasana studio bali.jpg" alt="Strive Pilates Bali"
            className="w-full h-full object-cover opacity-60" />
        </div>

        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.3)_50%,rgba(0,0,0,0.6)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(139,105,20,0.15)_0%,transparent_60%)]" />

        {/* Content */}
        <div className="relative z-10 text-center px-5 max-w-3xl mx-auto py-20">
          <div className="animate-fade-up delay-100 inline-block px-4 py-1.5 rounded-full mb-7 bg-white/10 border border-white/25 backdrop-blur-sm">
            <span className="font-sans text-[11px] text-white tracking-[0.15em] uppercase">STRIVE PILATES BALI</span>
          </div>
          <h1 className="animate-fade-up delay-200 font-display font-normal text-white tracking-wide leading-tight m-0 mb-5 text-[clamp(38px,7vw,68px)] [text-shadow:0_2px_20px_rgba(0,0,0,0.35)]">
            Transform Your Body,<br />Elevate Your Mind
          </h1>
          <div className="animate-fade-up delay-300 divider-gold w-14 mx-auto mb-5" />
          <p className="animate-fade-up delay-400 font-sans text-base sm:text-lg mb-10 text-white/80">
            Mat & Reformer Pilates · 50 menit per sesi · Setiap hari 07:00 – 19:00
          </p>
          <div className="animate-fade-up delay-500 flex gap-3 sm:gap-4 justify-center flex-wrap">
            <Link to="/register" className="btn-bronze hover-bronze inline-block px-7 sm:px-9 py-3.5 rounded-xl font-sans text-sm sm:text-base font-medium text-white no-underline">
              Booking Sekarang
            </Link>
            <Link to="/schedule" className="inline-block px-7 sm:px-9 py-3.5 rounded-xl font-sans text-sm sm:text-base font-medium text-white no-underline border border-white/35 hover:bg-white/10 transition-all duration-200">
              Lihat Jadwal
            </Link>
          </div>
        </div>
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 font-sans text-xs tracking-[0.08em] text-white/35">SCROLL ↓</div>
      </section>

      {/* ── TENTANG STUDIO ───────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center mb-14 sm:mb-20">
            <Section direction="left">
              <p className="font-sans text-xs tracking-[0.12em] uppercase mb-3 text-bronze-bright">TENTANG KAMI</p>
              <h2 className="font-sans font-medium text-warm-black mb-5 leading-tight text-[clamp(24px,4vw,38px)]">
                Studio Pilates Premium di Bali
              </h2>
              <p className="font-sans text-sm sm:text-base text-warm-text leading-loose mb-4">
                Kami hadir untuk membawa pengalaman pilates kelas dunia ke Bali. Dengan instruktur bersertifikat internasional dan fasilitas premium, setiap sesi dirancang untuk hasil terbaik.
              </p>
              <p className="font-sans text-sm sm:text-base text-warm-text leading-loose mb-6">
                Tersedia kelas Mat dan Reformer Pilates setiap hari tanpa libur, dengan slot pagi hingga malam.
              </p>
              {["Instruktur bersertifikat internasional", "Mat & Reformer Pilates tersedia", "Kelas setiap hari 07:00 – 19:00", "Kapasitas kecil untuk perhatian personal"].map(f => (
                <div key={f} className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 btn-bronze"><IconCheck size={11} color="#fff" /></div>
                  <span className="font-sans text-sm text-warm-text">{f}</span>
                </div>
              ))}
              <Link to="/about" className="inline-flex items-center gap-1.5 mt-6 font-sans text-sm font-medium no-underline text-bronze-base hover:gap-3 transition-all duration-200">
                Pelajari Lebih Lanjut <IconChevronRight size={16} color="#8B6914" />
              </Link>
            </Section>
            <Section direction="right">
              <div className="rounded-3xl p-3 bg-ivory neu-raised hover-lift transition-all duration-300">
                <div className="rounded-2xl overflow-hidden" style={{ height: "clamp(280px,40vw,420px)" }}>
                  <img src="/images/about.jpg" alt="Suasana Studio Strive Pilates Bali"
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex" }} />
                  <div className="hidden w-full h-full items-center justify-center bg-[#D8C8A8]">
                    <span className="font-sans text-sm text-bronze-base">Foto Interior Studio</span>
                  </div>
                </div>
              </div>
            </Section>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <Section key={s.label} delay={i + 1} direction="scale"><StatCard {...s} /></Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── KELAS ────────────────────────────────────────────────────────── */}
      <section className="bg-ivory py-16 sm:py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <Section className="text-center mb-12">
            <p className="font-sans text-xs tracking-[0.12em] uppercase mb-2 text-bronze-bright">PROGRAM KAMI</p>
            <h2 className="font-display font-normal text-warm-black m-0 mb-3 text-[clamp(30px,5vw,44px)]">Kelas Pilates</h2>
            <p className="font-sans text-sm text-warm-text">Mat & Reformer untuk semua level — pemula hingga advanced.</p>
          </Section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loadingClasses ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) : classes.map((cls, i) => (
              <Section key={cls.id} delay={i + 1} direction="scale"><ClassCard cls={cls} /></Section>
            ))}
          </div>
          <Section className="text-center mt-9">
            <Link to="/classes" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-sans text-sm font-medium no-underline text-bronze-base border border-bronze-light neu-raised hover:bg-bronze-light hover:text-white hover:-translate-y-0.5 transition-all duration-200">
              Lihat Semua Kelas <IconChevronRight size={15} color="currentColor" />
            </Link>
          </Section>
        </div>
      </section>

      {/* ── JADWAL HARI INI ──────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-5 bg-warm-black">
        <div className="max-w-3xl mx-auto">
          <Section className="text-center mb-10">
            <p className="font-sans text-xs tracking-[0.12em] uppercase mb-2 text-bronze-light">HARI INI</p>
            <h2 className="font-display font-normal text-[#E8D5A8] m-0 text-[clamp(28px,5vw,40px)]">Jadwal Tersedia</h2>
          </Section>
          <div className="flex flex-col gap-3">
            {loadingSchedules ? [...Array(3)].map((_, i) => <SkeletonScheduleRow key={i} />) : todaySchedules.length === 0 ? (
              <div className="text-center py-10 font-sans text-sm text-[rgba(232,213,168,0.4)]">Tidak ada jadwal hari ini</div>
            ) : todaySchedules.map((slot, i) => {
              const st = statusStyle[slot.status_label] || statusStyle.available
              return <Section key={slot.id} delay={i + 1}><ScheduleRow slot={slot} st={st} /></Section>
            })}
          </div>
          <Section className="text-center mt-7">
            <Link to="/schedule" className="font-sans text-sm no-underline text-bronze-light hover:text-[#E8D5A8] transition-colors duration-200">Lihat Jadwal Lengkap →</Link>
          </Section>
        </div>
      </section>

      {/* ── STUDIO GALLERY STRIP ─────────────────────────────────────────── */}
      <section className="bg-white py-12 px-5 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <Section className="text-center mb-8">
            <p className="font-sans text-xs tracking-[0.12em] uppercase mb-2 text-bronze-bright">GALERI</p>
            <h2 className="font-display font-normal text-warm-black m-0 text-[clamp(24px,4vw,36px)]">Suasana Studio</h2>
          </Section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { src: "/images/suasana studio bali.jpg", label: "Studio Bali" },
              { src: "/images/alat reformer.jpg",       label: "Alat Reformer" },
              { src: "/images/kelas mat.jpg",           label: "Kelas Mat" },
              { src: "/images/kelas reformer.jpg",      label: "Kelas Reformer" },
            ].map((img, i) => (
              <Section key={i} delay={i + 1} direction="scale">
                <div className="relative rounded-2xl overflow-hidden group cursor-pointer"
                  style={{ aspectRatio: "4/3" }}>
                  <img src={img.src} alt={img.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={e => { e.target.parentElement.style.backgroundColor = "#D8C8A8" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 font-sans text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {img.label}
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAKET HARGA ──────────────────────────────────────────────────── */}
      <section className="bg-ivory py-16 sm:py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <Section className="text-center mb-12">
            <p className="font-sans text-xs tracking-[0.12em] uppercase mb-2 text-bronze-bright">INVESTASI</p>
            <h2 className="font-display font-normal text-warm-black m-0 mb-3 text-[clamp(30px,5vw,44px)]">Harga & Paket</h2>
            <p className="font-sans text-sm text-warm-text">Fleksibel sesuai kebutuhan. Semua paket berlaku untuk Mat & Reformer.</p>
          </Section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {loadingPackages ? [...Array(4)].map((_, i) => <SkeletonPackageCard key={i} />) : packages.map((pkg, i) => (
              <Section key={pkg.id} delay={i + 1} direction="scale"><PackageCard pkg={pkg} /></Section>
            ))}
          </div>
          <Section className="text-center mt-8">
            <Link to="/packages" className="font-sans text-sm no-underline text-bronze-base hover:text-bronze-light transition-colors duration-200">Lihat Detail Paket →</Link>
          </Section>
        </div>
      </section>

      {/* ── TESTIMONI ────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <Section className="text-center mb-12">
            <p className="font-sans text-xs tracking-[0.12em] uppercase mb-2 text-bronze-bright">TESTIMONI</p>
            <h2 className="font-display font-normal text-warm-black m-0 text-[clamp(30px,5vw,44px)]">Kata Member Kami</h2>
          </Section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {loadingTestimonials ? [...Array(3)].map((_, i) => <SkeletonTestimonialCard key={i} />) : testimonials.length === 0 ? (
              <div className="col-span-3 text-center py-10 font-sans text-sm text-[#94A3B8]">Belum ada testimoni</div>
            ) : testimonials.slice(0, 3).map((t, i) => (
              <Section key={t.id} delay={i + 1} direction="scale"><TestimonialCard t={t} /></Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-24 px-5 text-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/suasana studio bali.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(26,18,8,0.92)_0%,rgba(61,42,16,0.88)_100%)]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <Section>
            <p className="font-sans text-xs tracking-[0.15em] uppercase mb-4 text-bronze-light">MULAI SEKARANG</p>
            <h2 className="font-display font-normal text-white m-0 mb-4 text-[clamp(28px,5vw,52px)]">Siap Memulai Perjalanan Pilates Kamu?</h2>
            <div className="divider-gold w-14 mx-auto mb-5" />
            <p className="font-sans text-sm sm:text-base mb-9 text-white/65">Bergabung dengan 500+ member aktif. Daftar sekarang dan mulai transformasi tubuhmu.</p>
            <div className="flex gap-3 sm:gap-4 justify-center flex-wrap mb-9">
              <Link to="/register" className="btn-bronze hover-bronze inline-block px-7 sm:px-9 py-3.5 rounded-xl font-sans text-sm sm:text-base font-medium text-white no-underline">Daftar Gratis</Link>
              <a href="https://wa.me/6289672971557" className="inline-block px-7 sm:px-9 py-3.5 rounded-xl font-sans text-sm sm:text-base font-medium text-white no-underline border border-white/35 hover:bg-white/10 transition-all duration-200">Hubungi Kami</a>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <IconMapPin size={14} color="rgba(255,255,255,0.35)" />
              <span className="font-sans text-xs text-white/35">Seminyak, Bali</span>
              <span className="text-white/20">·</span>
              <IconClock size={14} color="rgba(255,255,255,0.35)" />
              <span className="font-sans text-xs text-white/35">07:00 – 19:00 Setiap Hari</span>
            </div>
          </Section>
        </div>
      </section>

    </div>
  )
}
