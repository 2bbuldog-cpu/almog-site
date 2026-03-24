'use client'

import { useState } from 'react'
import ArticleCard from './ArticleCard'
import FeaturedArticle from './FeaturedArticle'
import { FEATURED_ARTICLE, ARTICLES, type ArticleCategory } from '@/lib/articles'

const FILTERS: { id: ArticleCategory | 'all'; label: string }[] = [
  { id: 'all',        label: 'הכל' },
  { id: 'tax',        label: 'מס הכנסה' },
  { id: 'salary',     label: 'שכירים' },
  { id: 'business',   label: 'עסקים' },
  { id: 'pension',    label: 'פרישה' },
  { id: 'realestate', label: 'נדל"ן' },
]

/**
 * ArticlesSection
 * ────────────────
 * Full articles section including:
 * - Section header
 * - Category filter tabs
 * - FeaturedArticle hero card
 * - ArticleCard grid (3-col → 2 → 1)
 * - CTA block
 *
 * Drop this into page.tsx where the articles section should appear.
 */
export default function ArticlesSection() {
  const [active, setActive] = useState<ArticleCategory | 'all'>('all')

  const filtered = active === 'all'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === active)

  const showFeatured =
    active === 'all' || active === FEATURED_ARTICLE.category

  return (
    <section
      id="articles"
      style={{ padding: '100px 24px', background: '#F7F9FC' }}
      dir="rtl"
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <div
            style={{
              width: 40,
              height: 3,
              background: 'linear-gradient(90deg, #C9A84C, #E8C96A)',
              borderRadius: 2,
              margin: '0 auto 18px',
            }}
          />
          <h2
            style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
              fontWeight: 800,
              color: '#0E1E40',
              marginBottom: 10,
            }}
          >
            מדריכים ומאמרים
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748B', maxWidth: 480, margin: '0 auto' }}>
            תוכן מקצועי שעוזר לכם לקבל החלטות פיננסיות נכונות
          </p>
        </div>

        {/* ── Filter tabs ── */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 40,
            justifyContent: 'center',
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              style={{
                padding: '8px 18px',
                borderRadius: 50,
                border: active === f.id ? 'none' : '1px solid #E2E8F0',
                background: active === f.id
                  ? 'linear-gradient(135deg, #0E1E40, #1B3358)'
                  : '#FFFFFF',
                color: active === f.id ? '#FFFFFF' : '#4A5568',
                fontFamily: 'inherit',
                fontSize: '0.88rem',
                fontWeight: active === f.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                boxShadow: active === f.id
                  ? '0 4px 14px rgba(14,30,64,0.18)'
                  : '0 1px 4px rgba(14,30,64,0.05)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Featured article ── */}
        {showFeatured && (
          <div style={{ marginBottom: 36 }}>
            <FeaturedArticle article={FEATURED_ARTICLE} />
          </div>
        )}

        {/* ── Articles grid ── */}
        {filtered.length > 0 ? (
          <div className="articles-grid-react">
            {filtered.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              color: '#94A3B8',
              fontSize: '0.95rem',
            }}
          >
            אין מאמרים בקטגוריה זו עדיין.
          </div>
        )}

        {/* ── CTA block ── */}
        <div
          style={{
            marginTop: 52,
            padding: '36px 40px',
            background: 'linear-gradient(135deg, rgba(14,30,64,0.04), rgba(201,168,76,0.06))',
            borderRadius: 20,
            border: '1px solid rgba(201,168,76,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#0E1E40',
                marginBottom: 6,
              }}
            >
              יש שאלה?
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#4A5568', margin: 0 }}>
              לא מצאתם את מה שחיפשתם? שלחו לי — אענה ישירות
            </p>
          </div>
          <a
            href="#contact"
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
              flexShrink: 0,
            }}
          >
            שלחו שאלה ←
          </a>
        </div>

      </div>
    </section>
  )
}
