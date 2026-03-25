'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { label: 'דשבורד', href: '/crm' },
  { label: 'לידים', href: '/crm/leads' },
  { label: 'לקוחות', href: '/crm/clients' },
  { label: 'משימות', href: '/crm/tasks' },
  { label: 'פגישות', href: '/crm/meetings' },
  { label: 'מסמכים', href: '/crm/documents' },
  { label: 'הגדרות', href: '/crm/settings' },
]

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/crm/login') {
      setLoading(false)
      return
    }
    const auth = sessionStorage.getItem('crm_auth')
    if (!auth) {
      router.replace('/crm/login')
    } else {
      setLoading(false)
    }
  }, [pathname, router])

  const handleSignOut = () => {
    sessionStorage.removeItem('crm_auth')
    router.replace('/crm/login')
  }

  if (pathname === '/crm/login') {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6',
        fontFamily: 'Heebo, sans-serif',
      }}>
        <div style={{ color: '#374151', fontSize: '0.88rem' }}>טוען...</div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f3f4f6',
      fontFamily: 'Heebo, sans-serif',
      direction: 'rtl',
    }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.35)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          width: '200px',
          background: '#1c2b47',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{
          padding: '16px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.09)',
        }}>
          <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.02em' }}>
            אלמוג פיננסים
          </div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', marginTop: '2px' }}>
            מערכת ניהול לקוחות
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, paddingTop: '6px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = item.href === '/crm'
              ? pathname === '/crm'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'block',
                  padding: '9px 14px',
                  borderRight: isActive ? '3px solid #c9a84c' : '3px solid transparent',
                  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.48)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.09)',
        }}>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '8px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.14)',
              color: 'rgba(255,255,255,0.38)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontFamily: 'Heebo, sans-serif',
            }}
          >
            התנתקות
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="crm-main"
        style={{
          flex: 1,
          marginRight: '200px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Header */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 20px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              fontSize: '1rem',
              color: '#374151',
            }}
          >
            ☰
          </button>

          {/* Search */}
          <input
            type="text"
            placeholder="חיפוש..."
            style={{
              padding: '5px 10px',
              border: '1px solid #d1d5db',
              fontSize: '0.8rem',
              fontFamily: 'Heebo, sans-serif',
              direction: 'rtl',
              outline: 'none',
              width: '200px',
              color: '#374151',
              background: '#f9fafb',
            }}
          />

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.88rem', cursor: 'pointer' }}>
              🔔
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '26px', height: '26px',
                background: '#1c2b47',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, color: 'white', fontSize: '0.76rem',
              }}>
                א
              </div>
              <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>
                אלמוג
              </span>
            </div>
            <Link
              href="/"
              style={{
                padding: '4px 10px',
                color: '#6b7280',
                fontSize: '0.75rem',
                textDecoration: 'none',
                border: '1px solid #e5e7eb',
              }}
            >
              לאתר הראשי
            </Link>
          </div>
        </header>

        <div style={{ flex: 1, padding: '20px' }}>
          {children}
        </div>
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(${sidebarOpen ? '0' : '100%'}) !important; }
          .crm-main { margin-right: 0 !important; }
          .sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
