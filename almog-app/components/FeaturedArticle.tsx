'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { type Article, CATEGORY_STYLES } from '@/lib/articles'

interface FeaturedArticleProps {
  article: Article
}

/**
 * FeaturedArticle
 * ────────────────
 * Two-column editorial card for the primary featured article.
 *
 * Layout:
 *   Desktop RTL: [text | image]  (image fills the left column)
 *   Mobile:      [image on top] → [text below]
 *
 * Design decisions:
 * - Image is `position: absolute; inset: 0` so it fully fills its column
 *   at any height — no cropping, just object-fit cover.
 * - Gold gradient overlay on image for editorial depth.
 * - Hover lifts the card subtly; image zooms in gently (Ken Burns lite).
 * - No emojis, no decorative icons.
 */
export default function FeaturedArticle({ article }: FeaturedArticleProps) {
  const [hovered, setHovered] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const cat = CATEGORY_STYLES[article.category]

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${hovered ? 'rgba(201,168,76,0.20)' : '#E2E8F0'}`,
        boxShadow: hovered
          ? '0 24px 64px rgba(14,30,64,0.13)'
          : '0 4px 24px rgba(14,30,64,0.07)',
        transition: 'transform 0.40s cubic-bezier(.16,1,.3,1), box-shadow 0.40s cubic-bezier(.16,1,.3,1), border-color 0.30s ease',
        transform: hovered ? 'translateY(-4px)' : 'none',
      }}
      className="featured-article"
    >
      {/* ── Text side (right in RTL) ── */}
      <div
        style={{
          padding: '44px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          order: 2,
        }}
      >
        {/* Category + meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.3px',
              padding: '4px 12px',
              borderRadius: 50,
              background: cat.bg,
              color: cat.color,
            }}
          >
            {article.categoryLabel}
          </span>
          {article.badge && (
            <span
              style={{
                fontSize: '0.70rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 50,
                background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(232,201,106,0.20))',
                color: '#8B6914',
                letterSpacing: '0.2px',
              }}
            >
              {article.badge}
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 16,
            fontSize: '0.80rem',
            color: '#94A3B8',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {article.date}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {article.readTime}
          </span>
        </div>

        <h2
          style={{
            fontSize: '1.55rem',
            fontWeight: 800,
            color: '#0E1E40',
            lineHeight: 1.35,
            marginBottom: 14,
            letterSpacing: '-0.2px',
          }}
        >
          {article.title}
        </h2>

        <p
          style={{
            fontSize: '0.96rem',
            color: '#4A5568',
            lineHeight: 1.85,
            marginBottom: 28,
          }}
        >
          {article.excerpt}
        </p>

        <Link
          href={article.href}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '13px 28px',
            borderRadius: 50,
            background: '#0E1E40',
            color: '#FFFFFF',
            fontFamily: 'inherit',
            fontSize: '0.92rem',
            fontWeight: 700,
            textDecoration: 'none',
            alignSelf: 'flex-start',
            transition: 'background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = '#1B3358'
            el.style.transform = 'translateY(-2px)'
            el.style.boxShadow = '0 8px 24px rgba(14,30,64,0.22)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = '#0E1E40'
            el.style.transform = ''
            el.style.boxShadow = ''
          }}
        >
          קרא את המדריך המלא
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M10 7H4M7 4l-3 3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      {/* ── Image side (left in RTL) ── */}
      <div
        style={{
          position: 'relative',
          minHeight: 320,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #EBF5FB 0%, #D4E6F1 100%)',
          order: 1,
        }}
      >
        {!imgFailed ? (
          <Image
            src={article.image}
            alt={article.imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              transition: 'transform 0.70s cubic-bezier(.16,1,.3,1)',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
            priority
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
                opacity: 0.20,
              }}
            />
          </div>
        )}

        {/* Gradient overlay — editorial depth */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, transparent 40%, rgba(14,30,64,0.16))',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      </div>
    </article>
  )
}
