'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const WHATSAPP_URL = 'https://wa.me/972547312262'

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = [
    { label: 'ראשי', href: '/' },
    {
      label: 'שירותים',
      href: '#',
      dropdown: [
        { label: 'החזרי מס', href: '/tax-refund', icon: '💰' },
        { label: 'פתיחת עסק', href: '/service-business', icon: '🚀' },
        { label: 'תכנון פרישה', href: '/service-retirement', icon: '🌅' },
        { label: 'שאלון החזר מס', href: '/sheelon', icon: '🧾' },
      ],
    },
    { label: 'סוכני AI', href: '/#agents' },
    { label: 'יצירת קשר', href: '/#contact' },
  ]

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: 0,
          zIndex: 1000,
          transition: 'all 0.35s ease',
          background: scrolled
            ? 'rgba(255,255,255,0.97)'
            : 'transparent',
          boxShadow: scrolled ? '0 2px 20px rgba(14,30,64,0.1)' : 'none',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: scrolled ? '68px' : '80px',
            transition: 'height 0.35s ease',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(201,168,76,0.3)',
              flexShrink: 0,
              background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 900,
              color: '#0E1E40',
            }}>
              א
            </div>
            <div>
              <div style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: scrolled ? '#0E1E40' : '#FFFFFF',
                lineHeight: 1.2,
                transition: 'color 0.35s ease',
              }}>
                אלמוג בן דוד
              </div>
              <div style={{
                fontSize: '0.72rem',
                color: scrolled ? '#C9A84C' : 'rgba(201,168,76,0.9)',
                fontWeight: 600,
                transition: 'color 0.35s ease',
              }}>
                רואת חשבון מוסמכת
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className="hidden-mobile"
          >
            {navLinks.map((link) =>
              link.dropdown ? (
                <div
                  key={link.label}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: scrolled ? '#0E1E40' : 'rgba(255,255,255,0.9)',
                      transition: 'color 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontFamily: 'Heebo, sans-serif',
                      borderRadius: '8px',
                    }}
                  >
                    {link.label}
                    <span style={{
                      fontSize: '0.7rem',
                      transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}>▼</span>
                  </button>
                  {servicesOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: 'white',
                      borderRadius: '16px',
                      boxShadow: '0 16px 48px rgba(14,30,64,0.16)',
                      border: '1px solid #E2E8F0',
                      padding: '8px',
                      minWidth: '200px',
                      animation: 'fadeIn 0.2s ease',
                    }}>
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            color: '#0E1E40',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            textDecoration: 'none',
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLElement
                            el.style.background = '#F7F9FC'
                            el.style.color = '#C9A84C'
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLElement
                            el.style.background = 'transparent'
                            el.style.color = '#0E1E40'
                          }}
                        >
                          <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    padding: '10px 16px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: scrolled ? '#0E1E40' : 'rgba(255,255,255,0.9)',
                    transition: 'color 0.3s ease',
                    borderRadius: '8px',
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </Link>
              )
            )}

            <Link
              href="/sheelon"
              style={{
                marginRight: '4px',
                padding: '11px 22px',
                background: scrolled ? 'rgba(14,30,64,0.06)' : 'rgba(255,255,255,0.1)',
                border: `1.5px solid ${scrolled ? '#E2E8F0' : 'rgba(255,255,255,0.25)'}`,
                color: scrolled ? '#0E1E40' : 'rgba(255,255,255,0.9)',
                fontWeight: 700,
                fontSize: '0.88rem',
                borderRadius: '50px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = scrolled ? '#F7F9FC' : 'rgba(255,255,255,0.18)'
                el.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.background = scrolled ? 'rgba(14,30,64,0.06)' : 'rgba(255,255,255,0.1)'
                el.style.transform = ''
              }}
            >
              🧾 שאלון מס
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginRight: '4px',
                padding: '11px 24px',
                background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
                color: '#0E1E40',
                fontWeight: 700,
                fontSize: '0.9rem',
                borderRadius: '50px',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(201,168,76,0.3)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = '0 8px 24px rgba(201,168,76,0.45)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = ''
                el.style.boxShadow = '0 4px 16px rgba(201,168,76,0.3)'
              }}
            >
              <span>💬</span> ייעוץ חינם
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="show-mobile"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'none',
              flexDirection: 'column',
              gap: '5px',
              borderRadius: '8px',
            }}
            aria-label="תפריט"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: 'block',
                  width: '24px',
                  height: '2px',
                  background: scrolled ? '#0E1E40' : '#FFFFFF',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease',
                  transform: menuOpen
                    ? i === 0 ? 'rotate(45deg) translate(5px, 5px)'
                    : i === 1 ? 'opacity: 0'
                    : 'rotate(-45deg) translate(5px, -5px)'
                    : '',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(14,30,64,0.98)',
            display: 'flex',
            flexDirection: 'column',
            padding: '100px 32px 40px',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {navLinks.map((link, i) => (
              <div key={link.label}>
                {link.dropdown ? (
                  <>
                    <div style={{
                      padding: '16px 0',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.5)',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}>
                      {link.label}
                    </div>
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 16px',
                          color: 'rgba(255,255,255,0.85)',
                          fontSize: '1rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          borderRadius: '10px',
                          transition: 'background 0.2s ease',
                        }}
                      >
                        <span>{item.icon}</span> {item.label}
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '16px 0',
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      color: 'white',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      textDecoration: 'none',
                      animation: `fadeIn 0.3s ease ${i * 0.07}s both`,
                    }}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
            <Link
              href="/sheelon"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '16px', background: 'rgba(255,255,255,0.08)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                color: 'white', fontWeight: 700, fontSize: '1rem',
                borderRadius: '50px', textDecoration: 'none',
              }}
            >
              🧾 שאלון החזר מס חינמי
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '18px', background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
                color: '#0E1E40', fontWeight: 800, fontSize: '1.1rem',
                borderRadius: '50px', textDecoration: 'none',
              }}
            >
              💬 ייעוץ ראשוני חינם
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 1023px) {
          .hidden-mobile {
            display: none !important;
          }
          .show-mobile {
            display: flex !important;
          }
        }
        @media (min-width: 1024px) {
          .show-mobile {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}
