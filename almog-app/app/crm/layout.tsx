'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const navItems = [
  { icon: '📊', label: 'דשבורד', href: '/crm' },
  { icon: '👥', label: 'לידים', href: '/crm/leads' },
  { icon: '✅', label: 'משימות', href: '/crm/tasks' },
  { icon: '⚙️', label: 'הגדרות', href: '/crm/settings' },
]

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && pathname !== '/crm/login') {
        router.replace('/crm/login')
        return
      }
      setUser(session?.user ?? null)
      setLoading(false)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/crm/login')
      } else if (session) {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/crm/login')
  }

  // Show login page without layout
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
        background: '#F7F9FC',
        fontFamily: 'Heebo, sans-serif',
      }}>
        <div style={{ textAlign: 'center', color: '#0E1E40' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
          <div style={{ fontWeight: 700 }}>טוען...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#F7F9FC',
      fontFamily: 'Heebo, sans-serif',
      direction: 'rtl',
    }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.5)',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: 'linear-gradient(180deg, #0E1E40 0%, #0c1c3a 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        boxShadow: '0 0 40px rgba(0,0,0,0.3)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(0)',
        transition: 'transform 0.3s ease',
      }}
      className="sidebar"
      >
        {/* Logo Area */}
        <div style={{
          padding: '28px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ color: '#E8C96A', fontWeight: 900, fontSize: '1.1rem', marginBottom: '4px' }}>
            CRM | אלמוג
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
            מערכת ניהול לקוחות
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '4px',
                  background: isActive ? 'rgba(201,168,76,0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(201,168,76,0.25)' : '1px solid transparent',
                  color: isActive ? '#E8C96A' : 'rgba(255,255,255,0.6)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '8px' }}>
            {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'Heebo, sans-serif',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(229,62,62,0.15)'
              el.style.borderColor = 'rgba(229,62,62,0.3)'
              el.style.color = '#FC8181'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(255,255,255,0.05)'
              el.style.borderColor = 'rgba(255,255,255,0.1)'
              el.style.color = 'rgba(255,255,255,0.5)'
            }}
          >
            🚪 התנתקות
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginRight: '240px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="crm-main"
      >
        {/* Top Header */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        }}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              fontSize: '1.2rem',
              color: '#0E1E40',
            }}
          >
            ☰
          </button>

          <div style={{ color: '#0E1E40', fontWeight: 700, fontSize: '1rem' }}>
            {navItems.find(n =>
              n.href === '/crm' ? pathname === '/crm' : pathname.startsWith(n.href)
            )?.label || 'CRM'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                color: '#4A5568',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                background: '#F7F9FC',
                border: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              🌐 לאתר הראשי
            </Link>
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#0E1E40', fontSize: '0.85rem',
            }}>
              א
            </div>
          </div>
        </header>

        <div style={{ flex: 1, padding: '28px 24px' }}>
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
