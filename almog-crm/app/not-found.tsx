import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0E1E40, #1B3358)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Heebo', sans-serif", direction: 'rtl', textAlign: 'center',
      padding: '40px 20px',
    }}>
      <div>
        <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🔍</div>
        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 900, marginBottom: '12px' }}>
          הדף לא נמצא
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', marginBottom: '32px', fontSize: '1rem' }}>
          הדף שחיפשת לא קיים.
        </p>
        <Link href="/hazarat-mas" style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
          color: '#0E1E40', padding: '14px 32px', borderRadius: '50px',
          fontWeight: 800, textDecoration: 'none',
        }}>
          חזרה לדף הבית
        </Link>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;800;900&display=swap');`}</style>
    </div>
  )
}
