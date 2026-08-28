import { useState, useEffect } from "react"
import LoadingSpinner from "../../components/LoadingSpinner"
import { Link } from "react-router-dom"
import { IconChevronLeft, IconChevronRight } from "../../components/icons/index"
import useInView from "../../hooks/useInView"
import useHover from "../../hooks/useHover"
import useAuthStore from "../../stores/authStore"

function Section({ children, className = "", direction = "up", delay = 0 }) {
  const [ref, inView] = useInView()
  const animClass = { up: "animate-fade-up", scale: "animate-scale-in" }[direction] || "animate-fade-up"
  return (
    <div ref={ref} className={`${inView ? `${animClass} ${delay ? `delay-${delay * 100}` : ""}` : "opacity-0"} ${className}`}>
      {children}
    </div>
  )
}

function BookingButton({ slotId }) {
  const { token } = useAuthStore()
  const to = token ? `/member/booking/${slotId}` : `/register?redirect=/member/booking/${slotId}`
  return (
    <Link to={to} className="btn-bronze hover-bronze px-3 py-1 rounded-lg font-sans text-[11px] font-medium text-white no-underline">
      Booking
    </Link>
  )
}

function SlotCard({ slot, st }) {
  const [hovered, handlers] = useHover()
  return (
    <div {...handlers} className="bg-ivory rounded-2xl p-4 flex items-center justify-between gap-3 transition-all duration-200"
      style={{ boxShadow: hovered ? "8px 10px 20px #C8BFB4, -6px -6px 16px #FFFFFF" : "5px 5px 14px #D9D1C5, -5px -5px 14px #FFFFFF", transform: hovered ? "translateY(-3px)" : "translateY(0)" }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="font-sans text-lg font-bold text-warm-black">{slot.start_time.substring(0, 5)}</span>
          <span className="font-sans text-xs text-warm-text/50">- {slot.end_time.substring(0, 5)}</span>
        </div>
        <div className="font-sans text-sm font-semibold text-warm-black mb-0.5 truncate">{slot.class_name}</div>
        <div className="font-sans text-xs text-warm-text/60 truncate">{slot.instructor_name}</div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="px-2.5 py-0.5 rounded-full font-sans text-[10px] font-semibold whitespace-nowrap"
          style={{ backgroundColor: st.bg, color: st.text }}>{st.label}</span>
        <span className="font-sans text-[10px] text-warm-text/50">{slot.available_slots}/{slot.capacity}</span>
        {slot.status_label !== "full" && <BookingButton slotId={slot.id} />}
      </div>
    </div>
  )
}

function toYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getWeekStart(date) {
  const d = new Date(date), day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}

export default function SchedulePage() {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [weekAnchor, setWeekAnchor] = useState(() => getWeekStart(today))
  const [schedules,  setSchedules]  = useState({})
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState("all")

  useEffect(() => {
    setLoading(true)
    fetch(`/api/schedules?date=${toYMD(weekAnchor)}`)
      .then(r => r.json())
      .then(d => { setSchedules(d.data || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [weekAnchor])

  const isCurrentWeek = weekAnchor <= getWeekStart(today)
  const prevWeek = () => { if (isCurrentWeek) return; setWeekAnchor(prev => addDays(prev, -7)) }
  const nextWeek = () => setWeekAnchor(prev => addDays(prev, 7))
  const goToday  = () => setWeekAnchor(getWeekStart(today))

  const weekEnd    = addDays(weekAnchor, 6)
  const monthLabel = weekAnchor.getMonth() === weekEnd.getMonth()
    ? weekAnchor.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : `${weekAnchor.toLocaleDateString("id-ID", { month: "long" })} – ${weekEnd.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`

  const allSchedules = Object.values(schedules).flat()
  const filtered = filter === "all" ? schedules
    : Object.fromEntries(Object.entries(schedules).map(([d, slots]) => [d, slots.filter(s => s.class_type === filter)]).filter(([, slots]) => slots.length > 0))

  const statusStyle = {
    available:   { bg: "#D5EDD8", text: "#1A6B2A", label: "Tersedia" },
    almost_full: { bg: "#F5E8C0", text: "#8B6500", label: "Hampir Penuh" },
    full:        { bg: "#F0D4D4", text: "#8B1A1A", label: "Penuh" },
  }

  const formatDate      = d => new Date(d + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long",  day: "numeric", month: "long" })
  const formatDateShort = d => new Date(d + "T00:00:00").toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })
  const isToday         = d => d === toYMD(today)

  return (
    <div className="bg-ivory min-h-screen">

      {/* ── HERO dengan video background ─────────────────────────────────── */}
      <section className="relative overflow-hidden flex items-center justify-center bg-warm-black"
        style={{ minHeight: "clamp(280px,40vw,400px)" }}>
        <video autoPlay muted loop playsInline
          poster="/images/suasana studio bali.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-40">
          <source src="/videos/hero banner.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,rgba(26,18,8,0.75)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(139,105,20,0.15)_0%,transparent_70%)]" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-5 py-16">
          <p className="animate-fade-up delay-100 font-sans text-xs tracking-[0.15em] uppercase mb-3 text-bronze-light">JADWAL KELAS</p>
          <h1 className="animate-fade-up delay-200 font-display font-normal text-white tracking-wide m-0 mb-4 text-[clamp(32px,8vw,60px)]">
            Pilih Jadwal Kamu
          </h1>
          <div className="animate-fade-up delay-300 divider-gold w-12 mx-auto mb-4" />
          <p className="animate-fade-up delay-400 font-sans text-sm sm:text-base m-0 text-[rgba(232,213,168,0.7)]">
            Kelas tersedia setiap hari pukul 07:00 – 19:00. Booking mudah, bayar online.
          </p>
        </div>
      </section>
      <div className="divider-gold" />

      {/* ── CONTROLS ─────────────────────────────────────────────────────── */}
      <section className="pt-7 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <button onClick={prevWeek} disabled={isCurrentWeek}
              className="flex items-center gap-1.5 px-3 sm:px-5 py-2.5 rounded-xl border-none cursor-pointer font-sans text-sm text-warm-text bg-ivory neu-raised hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0"
              style={{ opacity: isCurrentWeek ? 0.35 : 1, cursor: isCurrentWeek ? "not-allowed" : "pointer" }}>
              <IconChevronLeft size={15} color="#6B5E4A" />
              <span className="hidden sm:inline">Minggu Lalu</span>
            </button>
            <div className="text-center flex-1">
              <div className="font-display text-lg sm:text-xl text-warm-black capitalize">{monthLabel}</div>
              <div className="font-sans text-xs text-warm-text/50 mt-0.5">{allSchedules.length} sesi tersedia minggu ini</div>
              {!isCurrentWeek && (
                <button onClick={goToday} className="mt-1.5 px-3 py-1 rounded-full font-sans text-[10px] font-semibold border-none cursor-pointer transition-all duration-200"
                  style={{ backgroundColor: "#F5E8C0", color: "#8B6500" }}>
                  ↩ Kembali ke Minggu Ini
                </button>
              )}
            </div>
            <button onClick={nextWeek} className="flex items-center gap-1.5 px-3 sm:px-5 py-2.5 rounded-xl border-none cursor-pointer font-sans text-sm text-warm-text bg-ivory neu-raised hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0">
              <span className="hidden sm:inline">Minggu Depan</span>
              <IconChevronRight size={15} color="#6B5E4A" />
            </button>
          </div>
          <div className="flex gap-2 justify-center flex-wrap mb-6">
            {[["all","Semua"],["mat","Mat"],["reformer","Reformer"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className="px-4 py-2 rounded-full border-none cursor-pointer font-sans text-sm font-medium transition-all duration-200"
                style={{ background: filter === val ? "linear-gradient(145deg,#7A5C0E,#C4973E,#A0792A)" : "#F5F0EA", color: filter === val ? "#FFFFFF" : "#6B5E4A", boxShadow: filter === val ? "none" : "3px 3px 8px #D9D1C5, -3px -3px 8px #FFFFFF" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCHEDULE LIST ────────────────────────────────────────────────── */}
      <section className="px-5 pb-20">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <LoadingSpinner text="Memuat jadwal..." />
          ) : Object.keys(filtered).length === 0 ? (
            <div className="text-center py-20 font-sans text-warm-text/50">Tidak ada jadwal untuk minggu ini.</div>
          ) : (
            Object.entries(filtered).map(([date, slots]) => (
              <div key={date} className="mb-7">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="font-sans text-sm font-semibold text-warm-black capitalize">
                      <span className="hidden sm:inline">{formatDate(date)}</span>
                      <span className="sm:hidden">{formatDateShort(date)}</span>
                    </div>
                    {isToday(date) && (
                      <span className="px-2 py-0.5 rounded-full font-sans text-[9px] font-bold text-white"
                        style={{ background: "linear-gradient(145deg,#7A5C0E,#C4973E)" }}>
                        HARI INI
                      </span>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-[linear-gradient(90deg,rgba(196,151,62,0.3),transparent)]" />
                  <div className="font-sans text-xs text-warm-text/50 whitespace-nowrap">{slots.length} sesi</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {slots.map(slot => {
                    const st = statusStyle[slot.status_label] || statusStyle.available
                    return <Section key={slot.id}><SlotCard slot={slot} st={st} /></Section>
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
