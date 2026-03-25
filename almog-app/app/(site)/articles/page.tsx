'use client'

import { useState } from 'react'
import { ARTICLES, FEATURED_ARTICLE } from '@/lib/articles'

const filterLabels: Record<string, string> = {
  all: 'הכל', tax: 'מיסים', business: 'עסקים', pension: 'פרישה', salary: 'שכירים', realestate: 'נדל"ן',
}

const catCls: Record<string, string> = {
  tax: 'cat-tax', business: 'cat-business', pension: 'cat-pension',
  salary: 'cat-salary', realestate: 'cat-realestate',
}

export default function ArticlesPage() {
  const [articleFilter, setArticleFilter] = useState('all')

  const visibleArticles = articleFilter === 'all'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === articleFilter)

  return (
    <>
      {/* PAGE HEADER */}
      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)', padding: '100px 0 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(201,168,76,.07)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.55)', fontSize: '.88rem', fontWeight: 600, textDecoration: 'none', marginBottom: 28, transition: 'color .25s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--gold-light)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.55)'}
          >← חזרה לדף הבית</a>
          <div className="gold-line" />
          <h1 style={{ fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 900, color: 'var(--white)', marginBottom: 16, letterSpacing: '-.5px' }}>מאמרים ועדכונים</h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.68)', maxWidth: 560, lineHeight: 1.7 }}>מדריכים קצרים ומעשיים בנושאי מס, עסקים, פרישה ותכנון פיננסי — בשפה פשוטה</p>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="section section-light">
        <div className="container">
          {/* Filter */}
          <div className="articles-filter reveal">
            {Object.entries(filterLabels).map(([f, label]) => (
              <button
                key={f}
                className={`articles-filter-btn${articleFilter === f ? ' active' : ''}`}
                onClick={() => setArticleFilter(f)}
              >{label}</button>
            ))}
          </div>

          {/* Featured article */}
          {(articleFilter === 'all' || articleFilter === FEATURED_ARTICLE.category) && (
            <div className="articles-featured reveal">
              <div className="articles-featured-img article-img--fallback" />
              <div className="articles-featured-body">
                <span className={`article-cat-badge ${catCls[FEATURED_ARTICLE.category]}`}>{FEATURED_ARTICLE.categoryLabel}</span>
                <div className="article-meta-row">
                  <span>📅 {FEATURED_ARTICLE.date}</span>
                  <span>⏱ {FEATURED_ARTICLE.readTime}</span>
                  {FEATURED_ARTICLE.badge && <span>🔥 {FEATURED_ARTICLE.badge}</span>}
                </div>
                <h3>{FEATURED_ARTICLE.title}</h3>
                <p>{FEATURED_ARTICLE.excerpt}</p>
                <a href={FEATURED_ARTICLE.href} className="article-read-btn">קרא את המדריך המלא</a>
              </div>
            </div>
          )}

          {/* Articles grid */}
          <div className="articles-grid">
            {visibleArticles.map((article, i) => (
              <div key={article.slug} className={`article-card reveal${i > 0 && i < 4 ? ` reveal-delay-${i}` : ''}`}>
                <div className="article-img article-img--fallback" />
                <div className="article-body">
                  <div className="article-meta">
                    <span className={`article-cat-badge ${catCls[article.category]}`}>{article.categoryLabel}</span>
                    <span className="article-reading-time">⏱ {article.readTime}</span>
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <div className="article-footer">
                    <a href={article.href} className="article-read">קרא עוד ←</a>
                    <span className="article-date">{article.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="articles-cta-block reveal">
            <h3>יש שאלה?</h3>
            <p>לא מצאתם את מה שחיפשתם? שלחו לי — אענה ישירות</p>
            <a href="https://wa.me/972547312262" target="_blank" rel="noopener noreferrer" className="btn btn-primary">שלחו שאלה בוואטסאפ ←</a>
          </div>
        </div>
      </section>
    </>
  )
}
