import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F0EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '48px', borderRadius: '28px', boxShadow: '16px 16px 40px #D9D1C5, -16px -16px 40px #FFFFFF', backgroundColor: '#F5F0EA' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '80px', color: '#8B6914', margin: 0, lineHeight: 1 }}>404</p>
        <p style={{ fontSize: '18px', color: '#1A1208', fontWeight: 500, margin: '12px 0 8px' }}>Halaman tidak ditemukan</p>
        <p style={{ fontSize: '14px', color: '#6B5E4A', marginBottom: '28px' }}>Halaman yang kamu cari tidak ada.</p>
        <Link to="/" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '12px', color: '#FFFFFF', textDecoration: 'none', background: 'linear-gradient(145deg, #7A5C0E 0%, #C4973E 45%, #A0792A 65%, #6B4F0A 100%)', fontWeight: 500, fontSize: '14px' }}>
          Kembali ke Home
        </Link>
      </div>
    </div>
  )
}