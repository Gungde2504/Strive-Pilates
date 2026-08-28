import { useState, useEffect } from "react"
import useAuthStore from "../../stores/authStore"
import useApi from "../../hooks/useApi"
import LoadingSpinner from "../../components/LoadingSpinner"
import { Link } from "react-router-dom"
import { IconCheck } from "../../components/icons/index"
import useInView from "../../hooks/useInView"
import useHover from "../../hooks/useHover"

function Section({ children, className = "", direction = "up", delay = 0 }) {
  const [ref, inView] = useInView()
  const animClass = { up: "animate-fade-up", scale: "animate-scale-in" }[direction] || "animate-fade-up"
  return (
    <div ref={ref} className={`${inView ? `${animClass} ${delay ? `delay-${delay * 100}` : ""}` : "opacity-0"} ${className}`}>
      {children}
    </div>
  )
}

function PackageLink({ pkgId, featured, children }) {
  const { token } = useAuthStore()
  const to = token ? `/member/package/${pkgId}` : `/register?redirect=/member/package/${pkgId}`
  return (
    <Link to={to} className={`block text-center mt-5 py-3 rounded-xl font-sans text-sm font-medium no-underline transition-all duration-200 ${featured ? "btn-bronze text-white" : "text-bronze-base border border-bronze-light hover:bg-bronze-light hover:text-white"}`}>
      {children}
    </Link>
  )
}

function PackageCard({ pkg }) {
  const [hovered, handlers] = useHover()
  return (
    <div {...handlers} className="rounded-2xl p-6 sm:p-7 relative transition-all duration-300"
      style={{ backgroundColor: pkg.is_featured ? "#1A1208" : "#F5F0EA", transform: hovered ? "translateY(-8px)" : pkg.is_featured ? "translateY(-4px)" : "translateY(0)", boxShadow: hovered ? pkg.is_featured ? "0 32px 80px rgba(0,0,0,0.45)" : "14px 18px 36px #C8BFB4, -10px -10px 24px #FFFFFF" : pkg.is_featured ? "0 20px 50px rgba(0,0,0,0.3)" : "8px 8px 20px #D9D1C5, -8px -8px 20px #FFFFFF" }}>
      {pkg.is_featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-sans text-[10px] font-bold text-white whitespace-nowrap btn-bronze">TERPOPULER</div>
      )}
      <div className={`font-sans text-[11px] font-bold uppercase tracking-wider mb-2 ${pkg.is_featured ? "text-bronze-light" : "text-bronze-base"}`}>{pkg.name}</div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <div className={`font-display font-normal leading-none text-[clamp(28px,5vw,40px)] ${pkg.is_featured ? "text-white" : "text-warm-black"}`}>{parseInt(pkg.price).toLocaleString("id-ID")}</div>
        <div className={`font-sans text-xs font-medium ${pkg.is_featured ? "text-[rgba(232,213,168,0.55)]" : "text-[#A89478]"}`}>/pax</div>
      </div>
      <div className={`font-sans text-xs mb-4 ${pkg.is_featured ? "text-[rgba(232,213,168,0.55)]" : "text-[#A89478]"}`}>IDR · {pkg.validity_days} hari berlaku</div>
      <div className={`h-px mb-4 ${pkg.is_featured ? "bg-[rgba(196,151,62,0.2)]" : "bg-[rgba(139,105,20,0.12)]"}`} />
      <div className={`font-sans text-sm mb-4 ${pkg.is_featured ? "text-[rgba(232,213,168,0.8)]" : "text-warm-text"}`}>
        {pkg.session_count >= 999 ? "Tidak terbatas" : `${pkg.session_count} sesi`}
      </div>
      {pkg.description && (
        <div className={`font-sans text-xs mb-4 ${pkg.is_featured ? "text-[rgba(232,213,168,0.55)]" : "text-[#A89478]"}`}>{pkg.description}</div>
      )}
      {(pkg.benefits || []).map((b, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <IconCheck size={12} color={pkg.is_featured ? "#C4973E" : "#8B6914"} />
          <span className={`font-sans text-sm ${pkg.is_featured ? "text-[rgba(232,213,168,0.8)]" : "text-warm-text"}`}>{b}</span>
        </div>
      ))}
      <PackageLink pkgId={pkg.id} featured={pkg.is_featured}>Pilih Paket Ini</PackageLink>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-ivory rounded-2xl overflow-hidden transition-all duration-200 neu-raised">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center p-5 bg-transparent border-none cursor-pointer text-left gap-3">
        <span className="font-sans text-sm font-semibold text-warm-black flex-1">{q}</span>
        <span className="font-sans text-lg flex-shrink-0 text-bronze-light transition-transform duration-200" style={{ transform: open ? "rotate(45deg)" : "rotate(0)" }}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="font-sans text-sm text-warm-text leading-relaxed m-0">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function PackagesPage() {
  const { data: packagesData, loading } = useApi("/api/packages")
  const { data: faqsData }              = useApi("/api/cms/faqs")
  const [packages, setPackages] = useState([])
  const [faqs,     setFaqs]     = useState([])

  useEffect(() => { if (packagesData) setPackages(Array.isArray(packagesData) ? packagesData : []) }, [packagesData])
  useEffect(() => { if (faqsData)     setFaqs(Array.isArray(faqsData) ? faqsData : []) },             [faqsData])

  return (
    <div className="bg-ivory min-h-screen">

      {/* ── HERO dengan video background ─────────────────────────────────── */}
      <section className="relative overflow-hidden flex items-center justify-center bg-warm-black"
        style={{ minHeight: "clamp(280px,40vw,400px)" }}>
        <video autoPlay muted loop playsInline
          poster="/images/kelas mat.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-40">
          <source src="/videos/hero banner.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,rgba(26,18,8,0.75)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(139,105,20,0.15)_0%,transparent_70%)]" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-5 py-16">
          <p className="animate-fade-up delay-100 font-sans text-xs tracking-[0.15em] uppercase mb-3 text-bronze-light">HARGA & PAKET</p>
          <h1 className="animate-fade-up delay-200 font-display font-normal text-white m-0 mb-4 text-[clamp(32px,8vw,60px)]">
            Pilih Paket Kamu
          </h1>
          <div className="animate-fade-up delay-300 divider-gold w-12 mx-auto mb-4" />
          <p className="animate-fade-up delay-400 font-sans text-sm sm:text-base m-0 text-[rgba(232,213,168,0.7)]">
            Fleksibel sesuai kebutuhan. Berlaku untuk semua jenis kelas.
          </p>
        </div>
      </section>
      <div className="divider-gold" />

      {/* ── PACKAGES ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <LoadingSpinner text="Memuat paket..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
              {packages.map((pkg, i) => (
                <Section key={pkg.id} delay={i + 1} direction="scale"><PackageCard pkg={pkg} /></Section>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <Section className="text-center mb-10">
            <p className="font-sans text-xs tracking-[0.12em] uppercase mb-2 text-bronze-bright">FAQ</p>
            <h2 className="font-display font-normal text-warm-black m-0 text-[clamp(28px,5vw,40px)]">Pertanyaan Umum</h2>
          </Section>
          {faqs.length === 0 ? (
            <div className="text-center py-10 font-sans text-sm text-[#94A3B8]">Belum ada pertanyaan yang ditambahkan</div>
          ) : (
            <div className="flex flex-col gap-3">
              {faqs.map((faq, i) => (
                <Section key={faq.id} delay={i + 1}><FaqItem q={faq.question} a={faq.answer} /></Section>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-5 text-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/alat reformer.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(26,18,8,0.92)_0%,rgba(61,42,16,0.88)_100%)]" />
        </div>
        <div className="relative z-10">
          <Section>
            <h2 className="font-display font-normal mb-4 text-[#E8D5A8] text-[clamp(28px,5vw,40px)]">Ada Pertanyaan?</h2>
            <p className="font-sans text-sm mb-7 text-[rgba(232,213,168,0.6)]">Hubungi kami via WhatsApp atau kunjungi studio langsung di Seminyak, Bali.</p>
            <a href="https://wa.me/6289672971557" className="btn-bronze hover-bronze inline-block px-8 py-3.5 rounded-xl font-sans text-sm font-medium text-white no-underline">
              Chat WhatsApp
            </a>
          </Section>
        </div>
      </section>

    </div>
  )
}
