'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ArticleHeroImageProps {
  src: string
  alt: string
  /** Use priority for the first visible image (featured article) */
  priority?: boolean
  /** Aspect ratio as CSS value, e.g. "16/9" or "3/2". Defaults to "16/9" */
  aspectRatio?: string
  borderRadius?: number | string
}

/**
 * ArticleHeroImage
 * ─────────────────
 * Renders a brand-consistent article hero image with:
 * - Next.js Image optimization (WebP conversion, responsive srcset)
 * - Graceful fallback when image fails to load
 * - Subtle Ken Burns hover effect via CSS class on the parent
 * - Gradient overlay for text readability on dark-overlay variants
 *
 * Usage:
 *   <ArticleHeroImage src="/images/articles/article-foo.svg" alt="..." priority />
 */
export default function ArticleHeroImage({
  src,
  alt,
  priority = false,
  aspectRatio = '16/9',
  borderRadius = 0,
}: ArticleHeroImageProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio,
        overflow: 'hidden',
        borderRadius,
        background: 'linear-gradient(135deg, #EBF5FB 0%, #D4E6F1 100%)',
      }}
      className="article-hero-wrap"
    >
      {!failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority={priority}
          onError={() => setFailed(true)}
          className="article-hero-img"
        />
      ) : (
        /* Fallback: brand-consistent placeholder shown when image fails */
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
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
              opacity: 0.22,
            }}
          />
        </div>
      )}

      {/* Subtle bottom gradient for depth */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 55%, rgba(14,30,64,0.10))',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    </div>
  )
}
