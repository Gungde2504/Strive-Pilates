import { useState, useEffect } from "react"
import useApi from "../../hooks/useApi"
import LoadingSpinner from "../../components/LoadingSpinner"
import { Link } from "react-router-dom"
import {
  IconAward, IconClock, IconUsers, IconCalendar,
} from "../../components/icons/index"
import useInView from "../../hooks/useInView"
import useHover from "../../hooks/useHover"

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

// Map nama kelas → foto
const CLASS_PHOTOS = {
  "Core Reformer":           "/images/Core Reformer.jpg",
  "Full Body Reformer":      "/images/Full Body Reformer.jpg",
  "Full Body Mat":           "/images/fullbodymat.jpg",
  "Glutes Reformer":         "/images/Glutes Reformer.jpg",
  "Private Class Mat":       "/images/Private Class Mat.jpg",
  "Private Class Reformer":  "/images/Private Class Reformer.jpg",
  "Private Group Mat":       "/images/Private Group Mat.jpg",
  "Private Group Reformer":  "/images/Private Group Reformer.jpg",
}

function getClassPhoto(cls) {
  // Coba exact match dulu
  if (CLASS_PHOTOS[cls.name]) return CLASS_PHOTOS[cls.name]
  // Fallback berdasarkan tipe
  return cls.type === "reformer" ? "/images/kelas reformer.jpg" : "/images/kelas mat.jpg"
}

function ClassCard({ cls, focusLabel, typeColor }) {
  const [hovered, handlers] = useHover()
  const photo = getClassPhoto(cls)

  return (
    <div {...handlers} className="rounded-card overflow-hidden bg-ivory transition-all duration-300"
      style={{ boxShadow: hovered ? "14px 18px 36px #C8BFB4, -10px -10px 24px #FFFFFF" : "8px 8px 20px #D9D1C5, -8px -8px 20px #FFFFFF", transform: hovered ? "translateY(-6px)" : "translateY(0)" }}>
      {/* Image */}
      <div className="relative overflow-hidden h-[200px] bg-[#D8C8A8]">
        <img src={photo} alt={cls.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
          onError={e => { e.target.style.display="none" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide"
          style={{ backgroundColor: typeColor[cls.type]?.bg, color: typeColor[cls.type]?.text }}>
          {typeColor[cls.type]?.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-sans text-base font-semibold text-warm-black m-0">{cls.name}</h3>
          <span className="font-sans text-[10px] text-bronze-base bg-bronze-pale px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap">
            {focusLabel[cls.focus_area]}
          </span>
        </div>
        <p className="font-sans text-[13px] text-warm-text leading-relaxed mb-3">{cls.description}</p>
        <div className="flex gap-3 mb-4 p-3 rounded-xl transition-colors duration-200"
          style={{ backgroundColor: hovered ? "rgba(139,105,20,0.06)" : "transparent" }}>
          {[
            ["DURASI",    "50 menit"],
            ["KAPASITAS", `${cls.capacity} org`],
            ["HARGA",     cls.name === "Private Group Reformer" ? "Variatif" : `Rp ${parseInt(cls.price).toLocaleString("id-ID")}`],
          ].map(([label, val], i) => (
            <div key={label} className="flex-1 text-center">
              <div className="font-sans text-[9px] text-warm-text/60 mb-0.5 tracking-wide">{label}</div>
              <div className={`font-sans text-xs font-semibold ${i === 2 ? "text-bronze-base" : "text-warm-black"}`}>
                {val}
                {i === 2 && <div className="font-sans text-[9px] font-normal text-warm-text/60">/pax</div>}
              </div>
            </div>
          ))}
        </div>
        <Link to="/schedule" className="block text-center py-2.5 rounded-xl font-sans text-sm font-medium text-white no-underline btn-bronze transition-all duration-200"
          style={{ boxShadow: hovered ? "4px 4px 18px rgba(107,79,10,0.50)" : "4px 4px 12px rgba(107,79,10,0.30)" }}>
          Lihat Jadwal →
        </Link>
      </div>
    </div>
  )
}

function BenefitCard({ icon: Icon, title, desc }) {
  const [hovered, handlers] = useHover()
  return (
    <div {...handlers} className="bg-ivory rounded-2xl p-6 transition-all duration-300"
      style={{ boxShadow: hovered ? "12px 14px 28px #C8BFB4, -8px -8px 20px #FFFFFF" : "6px 6px 16px #D9D1C5, -6px -6px 16px #FFFFFF", transform: hovered ? "translateY(-4px)" : "translateY(0)" }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 btn-bronze shadow-[3px_3px_10px_rgba(107,79,10,0.30)]">
        <Icon size={20} color="#FFFFFF" />
      </div>
      <h3 className="font-sans text-sm font-semibold text-warm-black mb-1.5">{title}</h3>
      <p className="font-sans text-[13px] text-warm-text leading-relaxed m-0">{desc}</p>
    </div>
  )
}

function FilterButton({ active, onClick, label }) {
  const [hovered, handlers] = useHover()
  return (
    <button onClick={onClick} {...handlers} className="px-5 py-2.5 rounded-full font-sans text-sm font-medium cursor-pointer border-none transition-all duration-200"
      style={{ background: active ? "linear-gradient(145deg, #7A5C0E, #C4973E, #A0792A)" : "#F5F0EA", color: active ? "#FFFFFF" : hovered ? "#8B6914" : "#6B5E4A", boxShadow: active ? "4px 4px 14px rgba(107,79,10,0.35)" : "4px 4px 12px #D9D1C5, -4px -4px 12px #FFFFFF", transform: hovered && !active ? "translateY(-2px)" : "translateY(0)" }}>
      {label}
    </button>
  )
}

function CompareCard({ title, color, items }) {
  const [hovered, handlers] = useHover()
  return (
    <div {...handlers} className="rounded-2xl p-6 sm:p-8 transition-all duration-300 bg-white/5"
      style={{ border: `1px solid ${hovered ? color : "rgba(196,151,62,0.15)"}`, transform: hovered ? "translateY(-4px)" : "translateY(0)" }}>
      <div className="font-display text-xl sm:text-2xl mb-5" style={{ color }}>{title}</div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="font-sans text-sm text-[rgba(232,213,168,0.75)]">{item}</span>
        </div>
      ))}
    </div>
  )
}

export default function ClassesPage() {
  const { data: classesData, loading } = useApi("/api/classes")
  const [classes, setClasses] = useState([])
  const [filter,  setFilter]  = useState("all")

  useEffect(() => {
    if (classesData) setClasses(Array.isArray(classesData) ? classesData : [])
  }, [classesData])

  const filtered   = filter === "all" ? classes : classes.filter(c => c.type === filter)
  const focusLabel = { full_body: "Full Body", core: "Core", glutes: "Glutes" }
  const typeColor  = {
    mat:      { bg: "#E8D5A8", text: "#6B4F0A", label: "MAT" },
    reformer: { bg: "#1A1208", text: "#E8D5A8", label: "REFORMER" },
  }
  const benefits = [
    { icon: IconAward,    title: "Semua Level",       desc: "Dari pemula hingga advanced, semua kelas bisa diikuti." },
    { icon: IconClock,    title: "50 Menit Efektif",  desc: "Setiap sesi dirancang padat dan efisien untuk hasil maksimal." },
    { icon: IconUsers,    title: "Kelas Kecil",       desc: "Maksimal 10 orang per kelas untuk perhatian personal dari instruktur." },
    { icon: IconCalendar, title: "Jadwal Fleksibel",  desc: "10 slot per hari, dari pagi 07:00 hingga malam 19:00." },
  ]

  return (
    <div className="bg-ivory min-h-screen">

      {/* ── HERO dengan video background ─────────────────────────────────── */}
      <section className="relative overflow-hidden flex items-center justify-center bg-warm-black"
        style={{ minHeight: "clamp(320px,50vw,480px)" }}>
        <video autoPlay muted loop playsInline
          poster="/images/kelas reformer.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-40">
          <source src="/videos/hero banner.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,rgba(26,18,8,0.75)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(139,105,20,0.15)_0%,transparent_70%)]" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-5 py-20">
          <p className="animate-fade-up delay-100 font-sans text-xs tracking-[0.15em] uppercase mb-3 text-bronze-light">PROGRAM KAMI</p>
          <h1 className="animate-fade-up delay-200 font-display font-normal text-white tracking-wide m-0 mb-4 text-[clamp(36px,8vw,60px)]">
            Kelas Pilates
          </h1>
          <div className="animate-fade-up delay-300 divider-gold w-12 mx-auto mb-4" />
          <p className="animate-fade-up delay-400 font-sans text-base m-0 text-[rgba(232,213,168,0.7)]">
            Mat & Reformer Pilates untuk semua level — dari pemula hingga advanced.
          </p>
        </div>
      </section>
      <div className="divider-gold" />

      {/* ── BENEFITS ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-14 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((b, i) => (
              <Section key={b.title} delay={i + 1} direction="scale"><BenefitCard {...b} /></Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTER ───────────────────────────────────────────────────────── */}
      <section className="pt-8 px-5">
        <div className="max-w-5xl mx-auto flex gap-2.5 justify-center flex-wrap">
          {[["all","Semua Kelas"],["mat","Mat Pilates"],["reformer","Reformer Pilates"]].map(([val, label]) => (
            <FilterButton key={val} active={filter === val} onClick={() => setFilter(val)} label={label} />
          ))}
        </div>
      </section>

      {/* ── CLASSES GRID ─────────────────────────────────────────────────── */}
      <section className="px-5 pt-8 pb-20">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <LoadingSpinner text="Memuat kelas..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((cls, i) => (
                <Section key={cls.id} delay={i + 1} direction="scale">
                  <ClassCard cls={cls} focusLabel={focusLabel} typeColor={typeColor} />
                </Section>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── MAT VS REFORMER ──────────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-warm-black">
        <div className="max-w-4xl mx-auto">
          <Section className="text-center mb-12">
            <p className="font-sans text-xs tracking-[0.12em] uppercase mb-2 text-bronze-light">PERBANDINGAN</p>
            <h2 className="font-display font-normal m-0 text-[#E8D5A8] text-[clamp(28px,5vw,40px)]">Mat vs Reformer</h2>
          </Section>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Mat Pilates",      color: "#E8D5A8", items: ["Tanpa peralatan khusus", "Cocok untuk semua level", "Fokus kontrol tubuh & napas", "Kapasitas 10 orang"] },
              { title: "Reformer Pilates", color: "#C4973E", items: ["Menggunakan mesin Reformer", "Resistance adjustable", "Lebih intens & presisi", "Kapasitas 10 orang"] },
            ].map((item, i) => (
              <Section key={item.title} delay={i + 1} direction={i === 0 ? "left" : "right"}>
                <CompareCard {...item} />
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-5 text-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/alat reformer.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(245,240,234,0.96)_0%,rgba(245,240,234,0.92)_100%)]" />
        </div>
        <div className="relative z-10">
          <Section>
            <p className="font-sans text-xs tracking-[0.12em] uppercase mb-3 text-bronze-bright">MULAI SEKARANG</p>
            <h2 className="font-display font-normal text-warm-black mb-4 text-[clamp(28px,5vw,40px)]">Siap Mencoba?</h2>
            <p className="font-sans text-sm text-warm-text mb-8">Lihat jadwal kelas yang tersedia dan booking sekarang.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/schedule" className="btn-bronze hover-bronze px-7 py-3.5 rounded-xl font-sans text-sm font-medium text-white no-underline">Lihat Jadwal</Link>
              <Link to="/packages" className="px-7 py-3.5 rounded-xl font-sans text-sm text-bronze-base no-underline border border-bronze-light neu-raised hover:-translate-y-0.5 transition-all duration-200">Lihat Paket Harga</Link>
            </div>
          </Section>
        </div>
      </section>

    </div>
  )
}
