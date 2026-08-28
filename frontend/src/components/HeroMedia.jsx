/**
 * HeroMedia — komponen reusable untuk background video/GIF di hero section.
 *
 * CARA GANTI MEDIA:
 * 1. Untuk VIDEO (.mp4): isi `src` dengan URL video, set type="video"
 * 2. Untuk GIF: isi `src` dengan URL gif, set type="gif"
 * 3. Kalau belum ada media, biarkan src kosong ("") — otomatis fallback ke gradient polos
 *
 * Letakkan file video/gif di /public/media/ folder React, atau pakai URL CDN eksternal.
 *
 * Contoh pemakaian di halaman:
 *   <HeroMedia src="/media/hero-home.mp4" type="video" />
 *   <HeroMedia src="/media/hero-about.gif" type="gif" />
 *   <HeroMedia src="" /> // fallback gradient saja, belum ada media
 */
export default function HeroMedia({ src = "", type = "video", overlayOpacity = 0.55 }) {
  if (!src) return null // fallback ke gradient default di parent

  return (
    <div className="absolute inset-0 overflow-hidden">
      {type === "video" ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <img
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Overlay gelap supaya teks tetap terbaca di atas video/gif */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(26,18,8,${overlayOpacity})` }}
      />
    </div>
  )
}
