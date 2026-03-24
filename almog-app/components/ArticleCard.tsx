'use client'

import Link from 'next/link'
import { useState } from 'react'
import ArticleHeroImage from './ArticleHeroImage'
import { type Article, CATEGORY_STYLES } from '@/lib/articles'

interface ArticleCardProps {
  article: Article
}

/**
 * ArticleCard
 * ────────────
 * Grid card for article listings. Follows Almog's design system:
 * - navy / gold / light-blue palette
 * - Heebo font (inherited from globals)
 * - RTL Hebrew layout
 * - Hover: gentle lift + gold border accent + image zoom
 * - No emojis — image-first visual hierarchy
 */
export default function ArticleCard({ article }: ArticleCardProps) {
  const [hovered, setHovered] = useState(false)
  const cat = CATEGORY_STYLES[article.category]

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        borderRadius: 20,
        border: `1px solid ${hovered ? 'rgba(201,168,76,0.22)' : '#E2E8F0'}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.40s cubic-bezier(.16,1,.3,1), box-shadow 0.40s cubic-bezier(.16,1,.3,1), border-color 0.30s ease',
        transform: hovered ? 'translateY(-7px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 20px 56px rgba(14,30,64,0.13), 0 0 0 1px rgba(201,168,76,0.10)'
          : '0 2px 16px rgba(14,30,64,0.06)',
      }}
    >
      {/* Gold top-edge accent on hover */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #C9A84C, #E8C96A)',
          borderRadius: '20px 20px 0 0',
          transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'right',
          transition: 'transform 0.38s cubic-bezier(.16,1,.3,1)',
          zIndex: 2,
        }}
      />

      {/* Image area */}
      <div
        style={{
          height: 192,
          overflow: 'hidden',
          flexShrink: 0,
        }}
        className={hovered ? 'article-card-img-wrap hovered' : 'article-card-img-wrap'}
      >
        <div
          style={{
            height: '100%',
            transition: 'transform 0.60s cubic-bezier(.16,1,.3,1)',
            transform: hovered ? 'scale(1.07)' : 'scale(1)',
          }}
        >
          <ArticleHeroImage
            src={article.image}
            alt={article.imageAlt}
            aspectRatio="unset"
            borderRadius={0}
          />
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: '22px 24px 24px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {/* Meta row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.3px',
              padding: '4px 10px',
              borderRadius: 50,
              background: cat.bg,
              color: cat.color,
            }}
          >
            {article.categoryLabel}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {article.readTime}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: '#0E1E40',
            lineHeight: 1.4,
            marginBottom: 10,
            letterSpacing: '-0.1px',
          }}
        >
          {article.title}
        </h3>

        {/* Excerpt */}
        <p
          style={{
            fontSize: '0.88rem',
            color: '#64748B',
            lineHeight: 1.75,
            flex: 1,
            marginBottom: 18,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.excerpt}
        </p>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(14,30,64,0.06)',
            paddingTop: 14,
          }}
        >
          <Link
            href={article.href}
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#C9A84C',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'gap 0.2s ease',
            }}
          >
            קרא עוד
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M10 7H4M7 4l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{article.date}</span>
        </div>
      </div>
    </article>
  )
}
