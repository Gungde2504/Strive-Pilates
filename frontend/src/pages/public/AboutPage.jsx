import { useState } from "react"
import { Link } from "react-router-dom"
import {
  IconCheck, IconAward, IconUsers, IconClock, IconStar,
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

function HoverCard({ children, className = "" }) {
  const [hovered, handlers] = useHover()
  return (
    <div {...handlers} className={`transition-all duration-300 ${className}`}
      style={{ transform: hovered ? "translateY(-6px)" : "translateY(0)", boxShadow: hovered ? "14px 18px 36px #C8BFB4, -10px -10px 24px #FFFFFF" : "8px 8px 20px #D9D1C5, -8px -8px 20px #FFFFFF" }}>
      {children}
    </div>
  )
}

function ValueCard({ icon: Icon, title, desc }) {
  const [hovered, handlers] = useHover()
  return (
    <div {...handlers} className="rounded-2xl p-6 transition-all duration-300"
      style={{ backgroundColor: hovered ? "rgba(196,151,62,0.08)" : "rgba(255,255,255,0.05)", border: `1px solid ${hovered ? "rgba(196,151,62,0.35)" : "rgba(196,151,62,0.12)"}`, transform: hovered ? "translateY(-4px)" : "translateY(0)" }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 btn-bronze"><Icon size={20} color="#FFFFFF" /></div>
      <h3 className="font-sans text-sm font-semibold mb-2 text-[#E8D5A8]">{title}</h3>
      <p className="font-sans text-[13px] leading-relaxed m-0 text-[rgba(232,213,168,0.55)]">{desc}</p>
    </div>
  )
}

function InstructorCard({ instr }) {
  const [hovered, handlers] = useHover()
  return (
    <div {...handlers} className="bg-ivory rounded-2xl overflow-hidden transition-all duration-300"
      style={{ boxShadow: hovered ? "14px 18px 36px #C8BFB4, -10px -10px 24px #FFFFFF" : "8px 8px 20px #D9D1C5, -8px -8px 20px #FFFFFF", transform: hovered ? "translateY(-6px)" : "translateY(0)" }}>
      <div className="relative overflow-hidden flex items-center justify-center h-[200px] bg-[#D8C8A8]">
        {instr.photo
          ? <img src={instr.photo} alt={instr.name} className="absolute inset-0 w-full h-full object-cover object-top" />
          : <span className="font-sans text-sm text-bronze-base">{instr.name}</span>}
        <div className="absolute inset-0 flex items-end p-4 transition-opacity duration-300"
          style={{ background: "linear-gradient(to top, rgba(26,18,8,0.6), transparent)", opacity: hovered ? 1 : 0 }}>
          <span className="font-sans text-xs tracking-wide text-[#E8D5A8]">Lihat Profil →</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-sans text-lg font-semibold text-warm-black mb-1">{instr.name}</h3>
        <p className="font-sans text-sm mb-2 text-bronze-base">{instr.specialty}</p>
        <p className="font-sans text-xs text-warm-text/60 mb-3">Pengalaman {instr.exp}</p>
        <div className="flex flex-wrap gap-1.5">
          {instr.certs.map(cert => (
            <span key={cert} className="font-sans text-[11px] px-2.5 py-0.5 rounded-full bg-bronze-pale text-bronze-deep">{cert}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function GalleryItem({ label, photo = "", className = "", style = {} }) {
  const [hovered, handlers] = useHover()
  return (
    <div {...handlers} className={`rounded-2xl overflow-hidden relative cursor-pointer transition-all duration-300 ${className}`}
      style={{ transform: hovered ? "scale(1.02)" : "scale(1)", boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.18)" : "0 4px 16px rgba(0,0,0,0.08)", ...style }}>
      {photo
        ? <img src={photo} alt={label} className="absolute inset-0 w-full h-full object-cover" onError={e => { e.target.style.display="none" }} />
        : <div className="absolute inset-0 bg-[#D8C8A8] flex items-center justify-center"><span className="font-sans text-sm text-bronze-base">{label}</span></div>}
      <div className="absolute inset-0 flex items-end p-5 transition-opacity duration-300"
        style={{ background: "linear-gradient(to top, rgba(26,18,8,0.75) 0%, rgba(26,18,8,0.2) 50%, transparent 100%)", opacity: hovered ? 1 : 0 }}>
        <div>
          <div className="font-display text-lg text-white mb-0.5">{label}</div>
          <div className="font-sans text-[11px] tracking-wide text-bronze-light">STRIVE PILATES BALI</div>
        </div>
      </div>
    </div>
  )
}

function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  return (
    <section className="relative overflow-hidden flex items-center justify-center bg-warm-black"
      style={{ minHeight: "clamp(320px,50vw,480px)" }}>
      {/* Fallback image — tampil saat video belum load */}
      {!videoLoaded && (
        <img src="/images/suasana studio bali.jpg" alt="Strive Pilates Bali"
          className="absolute inset-0 w-full h-full object-cover opacity-40" />
      )}
      {/* Video */}
      <video autoPlay muted loop playsInline
        onCanPlay={() => setVideoLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{ opacity: videoLoaded ? 0.5 : 0 }}>
        <source src="/videos/hero banner.mp4" type="video/mp4" />
      </video>
      {/* Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,rgba(26,18,8,0.75)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(139,105,20,0.15)_0%,transparent_70%)]" />
      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center px-5 py-20">
        <p className="animate-fade-up delay-100 font-sans text-xs tracking-[0.15em] uppercase mb-3 text-bronze-light">TENTANG KAMI</p>
        <h1 className="animate-fade-up delay-200 font-display font-normal text-white m-0 mb-4 text-[clamp(36px,8vw,60px)]">
          Strive Pilates Bali
        </h1>
        <div className="animate-fade-up delay-300 divider-gold w-12 mx-auto mb-4" />
        <p className="animate-fade-up delay-400 font-sans text-base m-0 text-[rgba(232,213,168,0.7)]">
          Studio pilates premium di jantung Seminyak, Bali.
        </p>
      </div>
    </section>
  )
}

export default function AboutPage() {
  const instructors = [
    { name: "Ani Wijayanti",  specialty: "Full Body & Core",    exp: "5 tahun", certs: ["Pilates Method Alliance", "BASI Pilates"], photo: "/images/instruktur 1.jpg" },
    { name: "Bima Santoso",   specialty: "Reformer Specialist",  exp: "4 tahun", certs: ["Stott Pilates", "ACE Certified"],          photo: "/images/instruktur 2.jpg" },
    { name: "Citra Pertiwi",  specialty: "Glutes & Reformer",    exp: "3 tahun", certs: ["Polestar Pilates"],                         photo: "/images/instruktur 3.jpg" },
    { name: "Deni Rahayu",    specialty: "Full Body Reformer",   exp: "6 tahun", certs: ["BASI Pilates", "Yoga Alliance"],            photo: "/images/instruktur 4.jpg" },
  ]

  const galleryPhotos = {
    studioUtama:       "/images/about.jpg",
    kelasReformer:     "/images/kelas reformer.jpg",
    kelasMat:          "/images/kelas mat.jpg",
    peralatanReformer: "/images/alat reformer.jpg",
    sesiPrivate:       "/images/Private Class Mat.jpg",
    suasanaStudio:     "/images/suasana studio bali.jpg",
  }

  const values = [
    { icon: IconAward, title: "Bersertifikat Internasional", desc: "Semua instruktur kami bersertifikat dari lembaga pilates internasional terkemuka." },
    { icon: IconUsers, title: "Kelas Kecil & Personal",      desc: "Kapasitas terbatas untuk memastikan setiap member mendapat perhatian penuh." },
    { icon: IconClock, title: "Jadwal Fleksibel",            desc: "10 slot kelas setiap hari dari pukul 07:00 hingga 19:00 tanpa hari libur." },
    { icon: IconStar,  title: "Fasilitas Premium",           desc: "Mesin Reformer Pilates impor dengan standar studio internasional." },
  ]

  const timeline = [
    { year: "2021", title: "Studio Dibuka",  desc: "Strive Pilates Bali resmi dibuka di Seminyak dengan 2 mesin Reformer dan 1 instruktur." },
    { year: "2022", title: "Ekspansi Kelas", desc: "Menambah kelas Mat Pilates dan merekrut 2 instruktur bersertifikat internasional." },
    { year: "2023", title: "100+ Member",    desc: "Mencapai milestone 100 member aktif dan menambah 4 mesin Reformer baru." },
    { year: "2024", title: "500+ Member",    desc: "Berkembang menjadi studio pilates pilihan dengan 500+ member aktif di Bali." },
  ]

  return (
    <div className="bg-ivory min-h-screen">

      <HeroSection />
      <div className="divider-gold" />

      {/* ── CERITA KAMI ──────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <Section direction="left">
            <p className="font-sans text-xs tracking-[0.12em] uppercase mb-3 text-bronze-bright">CERITA KAMI</p>
            <h2 className="font-sans font-medium text-warm-black mb-5 leading-tight text-[clamp(22px,4vw,36px)]">
              Didirikan dengan Passion, Dijalankan dengan Dedikasi
            </h2>
            <p className="font-sans text-sm sm:text-base text-warm-text leading-loose mb-4">
              Strive Pilates Bali hadir untuk membawa pengalaman pilates kelas dunia ke Indonesia. Kami percaya bahwa gerakan yang tepat, dilakukan dengan konsisten, dapat mentransformasi tubuh dan pikiran.
            </p>
            <p className="font-sans text-sm sm:text-base text-warm-text leading-loose mb-6">
              Dengan instruktur bersertifikat internasional dan fasilitas premium termasuk mesin Reformer Pilates impor, setiap sesi dirancang untuk memberikan hasil terbaik.
            </p>
            {["Instruktur bersertifikat internasional", "Mat & Reformer Pilates tersedia", "Kelas setiap hari 07:00 – 19:00", "Kapasitas kecil untuk perhatian personal"].map(f => (
              <div key={f} className="flex items-center gap-2.5 mb-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 btn-bronze"><IconCheck size={11} color="#fff" /></div>
                <span className="font-sans text-sm text-warm-text">{f}</span>
              </div>
            ))}
          </Section>
          <Section direction="right">
            <HoverCard className="rounded-3xl p-3 bg-ivory">
              <div className="rounded-2xl overflow-hidden" style={{ height: "420px" }}>
                <img src="/images/about.jpg" alt="Studio Strive Pilates Bali"
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex" }} />
                <div className="hidden w-full h-full items-center justify-center bg-[#D8C8A8]">
                  <span className="font-sans text-sm text-bronze-base">Foto Studio</span>
                </div>
              </div>
            </HoverCard>
          </Section>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="bg-ivory py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[["500+","Member Aktif"],["4","Instruktur Bersertifikat"],["10","Slot Kelas/Hari"],["3+","Tahun Berpengalaman"]].map(([num, label], i) => (
              <Section key={label} delay={i + 1} direction="scale">
                <HoverCard className="bg-ivory rounded-2xl p-7 text-center">
                  <div className="font-display font-normal text-bronze-base mb-2 text-[clamp(36px,6vw,52px)]">{num}</div>
                  <div className="font-sans text-xs sm:text-sm text-warm-text leading-snug">{label}</div>
                </HoverCard>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── NILAI KAMI ───────────────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-warm-black">
        <div className="max-w-6xl mx-auto">
          <Section className="text-center mb-12">
            <p className="font-sans text-xs tracking-[0.12em] uppercase mb-2 text-bronze-light">MENGAPA KAMI</p>
            <h2 className="font-display font-normal m-0 text-[#E8D5A8] text-[clamp(28px,5vw,40px)]">Nilai yang Kami Pegang</h2>
          </Section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((v, i) => (
              <Section key={v.title} delay={i + 1} direction="scale"><ValueCard {...v} /></Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <Section className="text-center mb-14">
            <p className="font-sans text-xs tracking-[0.12em] uppercase mb-2 text-bronze-bright">PERJALANAN KAMI</p>
            <h2 className="font-display font-normal text-warm-black m-0 text-[clamp(28px,5vw,40px)]">Dari Mimpi ke Kenyataan</h2>
          </Section>
          <div className="relative hidden md:block">
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,transparent,#C4973E,transparent)]" />
            {timeline.map((item, i) => (
              <Section key={item.year} delay={i + 1} direction={i % 2 === 0 ? "left" : "right"}>
                <div className={`flex items-center gap-7 mb-10 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                    <div className="font-display text-sm mb-1 tracking-wide text-bronze-base">{item.year}</div>
                    <h3 className="font-sans text-base font-semibold text-warm-black mb-1.5">{item.title}</h3>
                    <p className="font-sans text-sm text-warm-text leading-relaxed m-0">{item.desc}</p>
                  </div>
                  <div className="w-3 h-3 rounded-full flex-shrink-0 z-10 btn-bronze shadow-[0_0_0_4px_rgba(196,151,62,0.2)]" />
                  <div className="flex-1" />
                </div>
              </Section>
            ))}
          </div>
          <div className="relative md:hidden pl-7">
            <div className="absolute left-1.5 top-0 bottom-0 w-px bg-[linear-gradient(to_bottom,transparent,#C4973E,transparent)]" />
            {timeline.map((item, i) => (
              <Section key={item.year} delay={i + 1}>
                <div className="relative mb-8">
                  <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full btn-bronze shadow-[0_0_0_3px_rgba(196,151,62,0.2)]" />
                  <div className="font-display text-xs mb-1 text-bronze-base">{item.year}</div>
                  <h3 className="font-sans text-sm font-semibold text-warm-black mb-1">{item.title}</h3>
                  <p className="font-sans text-sm text-warm-text leading-relaxed m-0">{item.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTRUKTUR ───────────────────────────────────────────────────── */}
      <section className="bg-ivory py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <Section className="text-center mb-12">
            <p className="font-sans text-xs tracking-[0.12em] uppercase mb-2 text-bronze-bright">TIM KAMI</p>
            <h2 className="font-display font-normal text-warm-black m-0 text-[clamp(28px,5vw,40px)]">Instruktur Kami</h2>
          </Section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {instructors.map((instr, i) => (
              <Section key={instr.name} delay={i + 1} direction="scale"><InstructorCard instr={instr} /></Section>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALERI ───────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <Section className="text-center mb-12">
            <p className="font-sans text-xs tracking-[0.12em] uppercase mb-2 text-bronze-bright">GALERI</p>
            <h2 className="font-display font-normal text-warm-black m-0 text-[clamp(28px,5vw,40px)]">Studio & Kelas Kami</h2>
          </Section>
          <div className="hidden sm:grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <GalleryItem label="Studio Utama"       photo={galleryPhotos.studioUtama}       style={{ gridRow: "span 2", height: "420px" }} />
            <GalleryItem label="Kelas Reformer"     photo={galleryPhotos.kelasReformer}     style={{ height: "200px" }} />
            <GalleryItem label="Kelas Mat"           photo={galleryPhotos.kelasMat}           style={{ height: "200px" }} />
            <GalleryItem label="Peralatan Reformer"  photo={galleryPhotos.peralatanReformer}  style={{ height: "200px" }} />
            <GalleryItem label="Sesi Private"        photo={galleryPhotos.sesiPrivate}        style={{ height: "200px" }} />
            <GalleryItem label="Suasana Studio"      photo={galleryPhotos.suasanaStudio}      style={{ gridColumn: "span 3", height: "220px" }} />
          </div>
          <div className="sm:hidden grid grid-cols-2 gap-2.5">
            <GalleryItem label="Studio Utama"       photo={galleryPhotos.studioUtama}       style={{ gridColumn: "span 2", height: "200px" }} />
            <GalleryItem label="Kelas Reformer"     photo={galleryPhotos.kelasReformer}     style={{ height: "150px" }} />
            <GalleryItem label="Kelas Mat"           photo={galleryPhotos.kelasMat}           style={{ height: "150px" }} />
            <GalleryItem label="Peralatan Reformer"  photo={galleryPhotos.peralatanReformer}  style={{ height: "150px" }} />
            <GalleryItem label="Sesi Private"        photo={galleryPhotos.sesiPrivate}        style={{ height: "150px" }} />
            <GalleryItem label="Suasana Studio"      photo={galleryPhotos.suasanaStudio}      style={{ gridColumn: "span 2", height: "160px" }} />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-5 text-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/kelas reformer.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(26,18,8,0.92)_0%,rgba(61,42,16,0.88)_100%)]" />
        </div>
        <div className="relative z-10">
          <Section>
            <h2 className="font-display font-normal mb-4 text-[#E8D5A8] text-[clamp(28px,5vw,44px)]">Mulai Perjalanan Kamu</h2>
            <p className="font-sans text-sm mb-8 text-[rgba(232,213,168,0.6)]">Bergabung dengan ratusan member yang sudah merasakan manfaatnya.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/register" className="btn-bronze hover-bronze px-7 py-3.5 rounded-xl font-sans text-sm font-medium text-white no-underline">Daftar Sekarang</Link>
              <Link to="/schedule" className="px-7 py-3.5 rounded-xl font-sans text-sm no-underline text-[#E8D5A8] border border-bronze-light/40 hover:-translate-y-0.5 transition-all duration-200">Lihat Jadwal</Link>
            </div>
          </Section>
        </div>
      </section>

    </div>
  )
}
