'use client'

import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'

interface ImageSlide { type: 'image'; src: string; alt: string }
interface TextSlide {
  type: 'text'
  name: string
  amount: string
  quote: string
  years: string
  emoji: string
}
type Slide = ImageSlide | TextSlide

// Placeholder cards shown until real feedback images are added
const PLACEHOLDER_TESTIMONIALS: TextSlide[] = [
  {
    type: 'text',
    name: 'מיכל ש.',
    amount: '6,200 ₪',
    quote: 'לא ידעתי בכלל שמגיע לי כסף. אלמוג בדקה ותוך שבועיים קיבלתי את הכסף לחשבון.',
    years: 'שכירה · 3 שנים אחורה',
    emoji: '💬',
  },
  {
    type: 'text',
    name: 'יוסי ק.',
    amount: '4,800 ₪',
    quote: 'עבדתי ב-2 מקומות באותה שנה ולא ידעתי שזה יוצר חוב מס. אלמוג סגרה את הכל בשבילי.',
    years: 'שכיר · 2 מעסיקים',
    emoji: '💬',
  },
  {
    type: 'text',
    name: 'שירה ל.',
    amount: '3,400 ₪',
    quote: 'חשבתי שזה מסובך, אבל התהליך היה פשוט ומהיר. ממליצה בחום לכולם לבדוק.',
    years: 'שכירה · זיכוי לימודים',
    emoji: '💬',
  },
  {
    type: 'text',
    name: 'אמיר ד.',
    amount: '7,100 ₪',
    quote: 'יצאתי מהצבא ולא ידעתי שמגיע לי החזר. קיבלתי כסף על 4 שנים אחורה.',
    years: 'משוחרר צבא · 4 שנים',
    emoji: '💬',
  },
  {
    type: 'text',
    name: 'נועה מ.',
    amount: '5,500 ₪',
    quote: 'הייתי בטוחה שאני לא זכאית. שלחתי פרטים, ואחרי 10 ימים הכסף אצלי.',
    years: 'שכירה + לימודים',
    emoji: '💬',
  },
]

interface Props {
  images: { src: string; alt: string }[]
}

export default function TestimonialsCarousel({ images }: Props) {
  const slides: Slide[] = images.length > 0
    ? images.map(img => ({ type: 'image' as const, ...img }))
    : PLACEHOLDER_TESTIMONIALS

  const [current, setCurrent] = useState(0)
  const [slidesPerView, setSlidesPerView] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragDelta = useRef(0)
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = slides.length
  const maxIndex = Math.max(0, total - slidesPerView)

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setSlidesPerView(Math.min(3, total))
      else if (window.innerWidth >= 640) setSlidesPerView(Math.min(2, total))
      else setSlidesPerView(1)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [total])

  useEffect(() => {
    if (current > maxIndex) setCurrent(maxIndex)
  }, [maxIndex, current])

  const prev = useCallback(() => setCurrent(c => (c <= 0 ? maxIndex : c - 1)), [maxIndex])
  const next = useCallback(() => setCurrent(c => (c >= maxIndex ? 0 : c + 1)), [maxIndex])

  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    if (total > slidesPerView) autoplayRef.current = setInterval(next, 4500)
  }, [next, total, slidesPerView])

  useEffect(() => {
    resetAutoplay()
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current) }
  }, [resetAutoplay])

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX; dragDelta.current = 0; setIsDragging(true)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (isDragging) dragDelta.current = e.clientX - dragStartX.current
  }
  const onPointerUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragDelta.current > 50) { prev(); resetAutoplay() }
    else if (dragDelta.current < -50) { next(); resetAutoplay() }
    dragDelta.current = 0
  }

  const gapPx = 16
  const slideWidthPct = 100 / slidesPerView

  return (
    <section style={{ background: '#F7F9FC', padding: 'clamp(56px, 9vw, 96px) 24px', direction: 'rtl' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>

        <h2 style={{
          textAlign: 'center',
          fontSize: 'clamp(1.3rem, 3.5vw, 1.9rem)',
          fontWeight: 900,
          color: '#0E1E40',
          marginBottom: '8px',
          letterSpacing: '-0.3px',
        }}>
          לקוחות שכבר גילו שמגיע להם החזר
        </h2>
        <p style={{
          textAlign: 'center',
          color: '#C9A84C',
          fontWeight: 700,
          fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
          marginBottom: '40px',
        }}>
          תוצאות אמיתיות של לקוחות שפנו אלינו
        </p>

        <div style={{ position: 'relative', padding: '0 28px' }}>

          {total > slidesPerView && (
            <button onClick={() => { prev(); resetAutoplay() }} aria-label="הקודם" style={arrowStyle('right')}>›</button>
          )}
          {total > slidesPerView && (
            <button onClick={() => { next(); resetAutoplay() }} aria-label="הבא" style={arrowStyle('left')}>‹</button>
          )}

          <div
            style={{ overflow: 'hidden' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <div style={{
              display: 'flex',
              gap: `${gapPx}px`,
              transform: `translateX(calc(${current} * (-${slideWidthPct}% - ${gapPx / slidesPerView}px)))`,
              transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              willChange: 'transform',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
            }}>
              {slides.map((slide, i) => (
                <div
                  key={i}
                  style={{
                    minWidth: `calc(${slideWidthPct}% - ${gapPx * (slidesPerView - 1) / slidesPerView}px)`,
                    flexShrink: 0,
                  }}
                >
                  {slide.type === 'image' ? (
                    <div style={{
                      borderRadius: '14px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 24px rgba(14,30,64,0.10)',
                      background: '#FFFFFF',
                      border: '1px solid #E8EDF5',
                      aspectRatio: '4/5',
                      position: 'relative',
                    }}>
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                        style={{ objectFit: 'cover', objectPosition: 'top' }}
                        loading="lazy"
                        draggable={false}
                      />
                    </div>
                  ) : (
                    <TextCard slide={slide} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {total > slidesPerView && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); resetAutoplay() }}
                aria-label={`שקף ${i + 1}`}
                style={{
                  width: i === current ? '22px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === current ? '#C9A84C' : '#CBD5E0',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        )}

        <p style={{
          textAlign: 'center',
          marginTop: '32px',
          color: '#718096',
          fontSize: '0.88rem',
          fontWeight: 500,
        }}>
          כל בדיקה נבדקת אישית — לא אלגוריתם, לא ניחוש
        </p>
      </div>
    </section>
  )
}

function TextCard({ slide }: { slide: TextSlide }) {
  return (
    <div style={{
      borderRadius: '16px',
      background: '#FFFFFF',
      border: '1px solid #E8EDF5',
      boxShadow: '0 4px 24px rgba(14,30,64,0.08)',
      padding: '28px 24px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      minHeight: '240px',
    }}>
      {/* Quote mark */}
      <div style={{ fontSize: '2.5rem', lineHeight: 1, color: '#C9A84C', fontFamily: 'Georgia, serif' }}>"</div>

      {/* Quote text */}
      <p style={{
        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
        color: '#2D3748',
        lineHeight: 1.7,
        fontWeight: 500,
        flex: 1,
        margin: 0,
      }}>
        {slide.quote}
      </p>

      {/* Divider */}
      <div style={{ height: '1px', background: '#EDF2F7' }} />

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0E1E40' }}>{slide.name}</div>
          <div style={{ fontSize: '0.78rem', color: '#718096', marginTop: '2px' }}>{slide.years}</div>
        </div>
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '20px',
          padding: '6px 14px',
          fontWeight: 900,
          fontSize: '0.95rem',
          color: '#16A34A',
        }}>
          +{slide.amount}
        </div>
      </div>
    </div>
  )
}

function arrowStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    [side]: '-4px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    color: '#0E1E40',
    lineHeight: 1,
  }
}
