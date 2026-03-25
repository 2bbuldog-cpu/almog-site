'use client'

import { useState, useEffect, useRef } from 'react'

// ─── MAIN COMPONENT ───
export default function HomePage() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [testiCurrent, setTestiCurrent] = useState(0)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formSending, setFormSending] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackTop, setShowBackTop] = useState(false)
  const [loaderHidden, setLoaderHidden] = useState(false)
  const testiIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const TESTI_COUNT = 12

  const goTesti = (i: number) => setTestiCurrent(((i % TESTI_COUNT) + TESTI_COUNT) % TESTI_COUNT)
  const resetAutoAdvance = (i: number) => {
    if (testiIntervalRef.current) clearInterval(testiIntervalRef.current)
    goTesti(i)
    testiIntervalRef.current = setInterval(() => setTestiCurrent(c => (c + 1) % TESTI_COUNT), 5000)
  }

  useEffect(() => {
    const t = setTimeout(() => setLoaderHidden(true), 1000)
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
      setShowBackTop(scrollTop > 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => revealObserver.observe(el))
    let countersStarted = false
    const heroCounterObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !countersStarted) {
        countersStarted = true
        document.querySelectorAll<HTMLElement>('[data-target]').forEach(el => {
          const target = parseInt(el.dataset.target || '0')
          const suffix = el.dataset.suffix || ''
          let current = 0; const step = target / 60
          const timer = setInterval(() => {
            current = Math.min(current + step, target)
            el.textContent = suffix ? (current >= target ? target + suffix : Math.floor(current) + suffix) : '+' + Math.floor(current)
            if (current >= target) clearInterval(timer)
          }, 25)
        })
      }
    }, { threshold: 0.5 })
    const heroStats = document.querySelector('.hero-stats')
    if (heroStats) heroCounterObserver.observe(heroStats)
    const container = document.getElementById('processParticles')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (container && !prefersReducedMotion) {
      for (let i = 0; i < 20; i++) {
        const p = document.createElement('div'); p.className = 'particle'
        p.style.left = Math.random() * 100 + '%'
        p.style.width = p.style.height = (2 + Math.random() * 4) + 'px'
        p.style.animationDuration = (8 + Math.random() * 12) + 's'
        p.style.animationDelay = Math.random() * 10 + 's'
        container.appendChild(p)
      }
    }
    if (!prefersReducedMotion) {
      const handleParallax = () => {
        const photo = document.querySelector<HTMLElement>('.hero-photo')
        if (photo) photo.style.transform = `translateY(${window.scrollY * 0.18}px)`
      }
      window.addEventListener('scroll', handleParallax, { passive: true })
    }
    testiIntervalRef.current = setInterval(() => setTestiCurrent(c => (c + 1) % TESTI_COUNT), 5000)
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', handleScroll)
      revealObserver.disconnect(); heroCounterObserver.disconnect()
      if (testiIntervalRef.current) clearInterval(testiIntervalRef.current)
    }
  }, [])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setFormSending(true)
    setTimeout(() => { setFormSending(false); setFormSubmitted(true) }, 800)
  }

  const audienceCards = [
    {
      title: 'עצמאים ושותפויות',
      tagline: 'פתחתם עסק? מגיע לכם להתחיל נכון ולשלם כמה שפחות מס — בלי לבזבז שעות על ניירת.',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}><rect x="2" y="7" width="20" height="14" rx="2.5" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>,
      services: [{ t: 'עוסק פטור / מורשה', d: 'פותחים עסק? נבחר יחד את הסטטוס הנכון ונוודא שמתחילים על הצד הנכון' }, { t: 'ייעוץ עסקי', d: 'שאלות על עסק? מהרחבה ועד כניסה לשותפות — תקבלו תשובה ישרה' }, { t: 'הצהרת הון', d: 'מדווחים על הון ורכוש בדיוק כנדרש — בלי להפיל עניינים בפיקוח' }, { t: 'חשבות שכר', d: 'מחשבים ומדווחים שכר בזמן, בלי טעויות שמביאות קנסות' }],
    },
    {
      title: 'חברות ועמותות',
      tagline: 'חשבונאות שרואה את התמונה הגדולה — לא רק את המספרים בטבלה.',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}><rect x="3" y="4" width="18" height="17" rx="2.5" /><path d="M3 9h18M8 21V9M16 21V9" /></svg>,
      services: [{ t: 'הנהלת חשבונות', d: 'יודעים בכל רגע כמה נכנס, כמה יצא — ומה הרווח האמיתי' }, { t: 'דוחות מס וביקורת', d: 'גישה מסודרת לדוחות ולביקורת — מיסוי חוקי ומינימלי' }, { t: 'ייעוץ פיננסי', d: 'לא רק מחשבים — גם חושבים קדימה על הרווחיות שלכם' }, { t: 'חשבות שכר', d: 'שכר לכל העובדים, בזמן, מסודר — בלי כאבי ראש חודשיים' }],
    },
    {
      title: 'פורשים',
      tagline: 'יוצאים לפרישה? השלב הזה שווה הרבה מאוד כסף — בתנאי שמתכננים אותו נכון.',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>,
      services: [{ t: 'קיבוע זכויות', d: 'כל השנים שעבדתם? מוציאים מהן את המקסימום שמגיע לכם' }, { t: 'תכנון פרישה', d: 'בונים תוכנית שמתחשבת בפנסיה, מיסים וכל ההכנסות ביחד' }, { t: 'החזרי מס', d: 'כן, גם פורשים יכולים לקבל החזרי מס — כדאי לבדוק' }, { t: 'משיכת פיצויים', d: 'איך ומתי משיכים פיצויים — ההחלטה הזו שווה הרבה כסף' }],
    },
    {
      title: 'שכירים',
      tagline: 'רוב השכירים לא יודעים שמגיע להם כסף בחזרה. כדאי לבדוק.',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
      services: [{ t: 'תיאומי מס', d: 'מונעים ניכוי מס מיותר מהמשכורת שלכם — כבר בחודש הבא' }, { t: 'החזרי מס', d: 'בודקים אם מגיע לכם כסף בחזרה — ממוצע 8,000–25,000 ₪' }, { t: 'משיכת פיצויים', d: 'יצאתם ממקום עבודה? נוודא שמושכים פיצויים הכי חכם שאפשר' }, { t: 'דוח שנתי לשכירים', d: 'מגישים את הדוח בשבילכם — בלי שתצטרכו להבין בזה כלום' }, { t: 'הכנסות משכר דירה', d: 'מחשבים איזה מסלול מס על שכירות עדיף לכם' }, { t: 'רווחי הון', d: 'מכרתם מניות או דירה? מחשבים ומקטינים את חבות המס' }],
    },
  ]

  const faqItems = [
    { q: 'כמה עולה ייעוץ ראשוני?', a: 'שיחת ייכרות ראשונה — חינם לחלוטין, ללא שום התחייבות. אחרי שנבין מה אתם צריכים, אני אגיד לכם בדיוק כמה זה עולה לפני שמתחילים. אין הפתעות.' },
    { q: 'האם אני צריך להגיע פיזית למשרד?', a: 'לא. הכל דיגיטלי — שולחים מסמכים בוואטסאפ או מייל, חותמים דיגיטלית, ומסיימים. יש לקוחות שמעולם לא ראיתי אותם פנים אל פנים ואנחנו עובדים ביחד כבר שנים.' },
    { q: 'כמה זמן לוקח לקבל החזר מס?', a: 'אחרי הגשת הבקשה — בדרך כלל 3–6 חודשים. אני מגישה, עוקבת ומעדכנת אתכם כשיש חדשות. שימו לב: אפשר לתבוע עד 6 שנים אחורה, אז לא מאוחר מדי.' },
    { q: 'מה ההבדל בין עוסק פטור לעוסק מורשה?', a: 'קצר: פטור — עד כ-120K בשנה, לא גובים מע"מ, פחות ניהול. מורשה — אין תקרה, גובים מע"מ אבל גם מקזזים על הוצאות. התשובה האמיתית תלויה בסוג הלקוחות שלכם ובצפי ההכנסות — נבדוק ביחד.' },
    { q: 'האם גם שכירים יכולים לקבל החזר מס?', a: 'כן — ורבים לא יודעים. החלפת עבודה, חל"ד, סיום תואר, ילדים, נכות, תרומות — כל אחד מהאלה יכול לייצר החזר. הממוצע שאני רואה הוא בין 8,000 ל-25,000 ₪. שווה לבדוק.' },
    { q: 'מה כולל שירות הנהלת חשבונות חודשי?', a: 'ספרי חשבונות, דיווחי מע"מ, דיווחי ניכויים, דוח שנתי, ייעוץ שוטף וטיפול מול רשות המסים — הכל. ואני זמינה לשאלות גם בין לבין, לא רק בסוף השנה.' },
  ]

  const testimonials = [
    { avatar: 'ע', name: 'עמית מויאל', text: 'רואת חשבון מספר אחת, עונה לי כל פעם שאני צריך ותמיד בקשר בשוטף, מקצועית ויודעת להגדיל ראש בכל מה שקשור לכסף. מעוסק פטור ועד חברה בע"מ, תודה אלמוג.' },
    { avatar: 'ס', name: 'סופיה אטליס', text: 'חיפשתי רואת חשבון שתהיה דיגיטלית ומתקדמת, אבל לא פחות חשוב - שתדע להסביר לי הכל בסבלנות ובגובה העיניים. אלמוג היא בול הכתובת! היא מקצועית בטירוף, הופכת את כל הביורוקרטיה לפשוטה ונעימה, ותמיד זמינה לכל שאלה. ממליצה עליה מכל הלב.' },
    { avatar: 'נ', name: 'נדב ניר', text: 'אלמוג המהממת! הכי מקצועית שיש זמינה באמת כל הזמן, עוזרת בהכל עם חיוך והמון סבלנות! בתור לקוח שלה אני ישן בראש שקט שהכל מטוקטק ומסודר. באמת אחת ויחידה.' },
    { avatar: 'נ', name: 'נתנאל דביקר ואקנין', text: 'הגעתי לאלמוג דרך המלצה של חבר, אלמוג עזרה לי בכל מה שהייתי צריך, טיפלה בכל המסמכים ביסודיות ובאהבה רבה. תודה לאלמוג על הסבלנות. שירות מומלץ מאוד.' },
    { avatar: 'ח', name: 'חיים יעקבזון', text: 'אין על אלמוג האלופה. סופר מקצועית הכל מתוקתק בזמן כמו שעון כולל לתכנוני מס ואכפתיות כאילו היא שותפה בעסק. תודה אלמוג.' },
    { avatar: 'ע', name: 'עודד רוזן', text: 'אין כמו אלמוג. שירות מדהים ויחס שלא רואים כל יום מקצועית בטירוף סבלנית וזמינה לכל שאלה. ממליץ מכל הלב.' },
    { avatar: 'Y', name: 'Yosef "momo" Moyal', text: 'לא האמנתי שאפשר לסדר את כל עניני הפנסיה והמיסים כל כך בקלות – עד שפגשתי את אלמוג בן-דוד מקצועית אמיתית עם לב גדול.' },
    { avatar: 'S', name: 'Shira Maor', text: 'תמיד זמינה לכל שאלה ובהמון סבלנות! מקצועית מאוד! ממליצה.' },
    { avatar: 'ר', name: 'רוני לב ארי', text: 'אלמוג מקצועית, קשובה ואכפתית, מניקה מעל ומעבר. ממליץ מאוד לעבוד איתה.' },
    { avatar: 'N', name: 'Nadav Czeiger', text: 'שירות מעולה. נתנה יחס מאוד אישי וצמצמה לי את חבות המס.' },
    { avatar: 'ס', name: 'סמדר בן דוד', text: 'ממליצה בחום. טיפלה לי בתכנון פרישה והחזרי מס. מקצועית. אדיבה. תודה אלמוג.' },
    { avatar: 'T', name: 'Tal Re', text: 'מקצועית ברמה הגבוהה ביותר. שירות מצוין זמינות לכל שאלה ופתרון לכל בעיה ממליץ!' },
  ]
  const testiSlides: typeof testimonials[] = []
  for (let i = 0; i < testimonials.length; i += 2) testiSlides.push(testimonials.slice(i, i + 2))

  return (
    <>
      {/* LOADING SCREEN */}
      <div className="loader-screen" style={{ opacity: loaderHidden ? 0 : 1, visibility: loaderHidden ? 'hidden' : 'visible', pointerEvents: loaderHidden ? 'none' : 'auto', transition: 'opacity .6s ease, visibility .6s ease' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo3d.png" alt="" className="loader-logo" />
        <div className="loader-bar"><div className="loader-bar-fill" /></div>
      </div>

      {/* SCROLL PROGRESS */}
      <div className="scroll-progress" style={{ width: scrollProgress + '%' }} />

      {/* BACK TO TOP */}
      <button className={`back-to-top${showBackTop ? ' visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="חזרה למעלה">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
      </button>

      {/* WHATSAPP FAB */}
      <a href="https://wa.me/972547312262" target="_blank" rel="noopener noreferrer" className="whatsapp-fab" title="WhatsApp">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>

      {/* MOBILE CTA BAR */}
      <div className="mobile-cta-bar">
        <a href="#contact" className="btn btn-primary">📞 ייעוץ חינמי</a>
        <a href="https://wa.me/972547312262" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 700, fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>WhatsApp ↗</a>
      </div>

      {/* ══ HERO ══ */}
      <section className="hero" id="home">
        <div className="hero-photo-panel">
          <div className="hero-glow" />
          <div className="hero-portrait-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/H2_04375.jpg" className="hero-photo" alt="אלמוג בן דוד – רואה חשבון" />
          </div>
        </div>
        <div className="hero-shapes"><div className="hero-shape" /><div className="hero-shape" /><div className="hero-shape" /></div>
        <div className="container">
          <div className="hero-content-col">
            <div className="hero-badge">רואה חשבון מוסמך | באר שבע</div>
            <h1>אלמוג בן דוד</h1>
            <p className="hero-sub">ייעוץ מס, הנהלת חשבונות ותכנון פיננסי — <span className="hero-highlight">שירות דיגיטלי מלא</span> לכל רחבי הארץ</p>
            <p className="hero-body">בוגרת כלכלה וחשבונאות מבן גוריון, עם תמחות ב-EY — אחת מחברות הביג 4. עבדתי גם כעוזרת חשב במכתשים אגן לפני שפתחתי את המשרד.</p>
            <p className="hero-body">עובדת עם עצמאיים, חברות, שכירים ופורשים מכל הארץ. הכל דיגיטלי — שולחים מסמך בוואטסאפ, אני מטפלת, ואתם לא צריכים לנסוע לאף מקום.</p>
            <div className="hero-btns">
              <a href="#contact" className="btn btn-primary">קבעו שיחת ייעוץ ללא התחייבות</a>
              <a href="#services" className="hero-btn-secondary">גלו את השירותים ←</a>
            </div>
            <div className="hero-stats">
              {[{ icon: '👥', target: '200', label: 'לקוחות מרוצים' }, { icon: '🏆', target: '5', label: 'שנות ניסיון' }, { icon: '💰', target: '1', label: 'מיליון ₪ הוחזרו' }, { icon: '⭐', target: '5', suffix: '.0', label: 'דירוג Google' }].map((s, i) => (
                <div key={i} className="hero-stat">
                  <span className="hero-stat-icon">{s.icon}</span>
                  <div className="hero-stat-num" data-target={s.target} data-suffix={s.suffix || ''}>0</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-scroll"><span>גלול למטה</span><div className="hero-scroll-dot" /></div>
      </section>

      {/* ══ TRUST STRIP ══ */}
      <div className="trust-strip reveal">
        <div className="container">
          <div className="trust-strip-inner">
            {[{ icon: '🎓', text: 'B.A כלכלה וחשבונאות', sub: 'אוניברסיטת בן גוריון' }, { icon: '🏢', text: 'התמחות EY', sub: 'Big 4 — רואי חשבון' }, { icon: '📋', text: 'רישיון רו"ח', sub: 'מוסמכת מטעם המדינה' }, { icon: '💻', text: 'שירות דיגיטלי 100%', sub: 'ללא הגעה פיזית' }, { icon: '⭐', text: '5.0 בגוגל', sub: '200+ לקוחות מרוצים' }].map((item, i) => (
              <div key={i} className="trust-strip-item">
                <span className="trust-strip-icon">{item.icon}</span>
                <div><div className="trust-strip-text">{item.text}</div><div className="trust-strip-sub">{item.sub}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ABOUT ══ */}
      <section className="section" id="about" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg,#ffffff 55%,#fdf8ed 100%)' }}>
        <div className="deco-circle" style={{ width: 300, height: 300, position: 'absolute', top: -80, left: -80 }} />
        <div className="deco-circle" style={{ width: 200, height: 200, position: 'absolute', bottom: -60, right: -60, animationDirection: 'reverse' }} />
        <div className="container">
          <div className="about-grid">
            <div className="about-image-wrap reveal-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/H2_04375.jpg" className="about-image" alt="אלמוג בן דוד – רואה חשבון מוסמך" />
              <div className="about-badge"><span className="about-badge-num">+5</span><span className="about-badge-txt">שנות ניסיון</span></div>
            </div>
            <div className="about-content reveal-right">
              <div className="gold-line" />
              <h2 className="section-title">הסיפור שלי</h2>
              <p className="about-text">אני אלמוג, רואת חשבון מבאר שבע. התחלתי את הדרך בתמחות ב-EY ואז עברתי לעבוד בחברה גדולה, אבל תמיד רציתי לעבוד ישירות עם אנשים — בלי ביורוקרטיה פנימית. ב-2021 פתחתי את המשרד, דיגיטלי לחלוטין, ומאז עובדת עם לקוחות מכל הארץ. אגיב לוואטסאפ גם בערב — זה פשוט החלק של העבודה שאני אוהבת.</p>
              <div className="about-timeline">
                {[{ year: '2018', title: 'תואר ראשון בכלכלה וחשבונאות', desc: 'אוניברסיטת בן גוריון בנגב', d: 'reveal-delay-1' }, { year: '2019', title: 'התמחות ב-EY (Ernst & Young)', desc: 'ביג 4 — ביקורת ומיסים', d: 'reveal-delay-2' }, { year: '2020', title: 'עוזרת חשב — מכתשים אגן', desc: 'ניסיון בניהול פיננסי בתאגיד בינלאומי', d: 'reveal-delay-3' }, { year: '2021', title: 'הקמת המשרד — אלמוג בן דוד רו"ח', desc: 'משרד דיגיטלי, שירות אישי, לקוחות מכל הארץ', d: 'reveal-delay-4' }].map((item, i) => (
                  <div key={i} className={`about-tl-item reveal ${item.d}`}>
                    <div className="about-tl-dot" />
                    <div className="about-tl-year">{item.year}</div>
                    <div className="about-tl-title">{item.title}</div>
                    <div className="about-tl-desc">{item.desc}</div>
                  </div>
                ))}
              </div>
              <div className="about-credentials">
                {[{ icon: '🛡️', text: 'רישיון רו"ח ממדינת ישראל', sub: 'חברה בלשכת רו"ח', d: 'reveal-delay-2' }, { icon: '🌐', text: 'שירות ארצי', sub: '100% דיגיטלי', d: 'reveal-delay-3' }, { icon: '📱', text: 'זמינות מלאה', sub: 'וואטסאפ, מייל, טלפון', d: 'reveal-delay-4' }].map((c, i) => (
                  <div key={i} className={`about-credential reveal ${c.d}`}>
                    <span className="about-credential-icon">{c.icon}</span>
                    <div><div className="about-credential-text">{c.text}</div><div className="about-credential-sub">{c.sub}</div></div>
                  </div>
                ))}
              </div>
              <div className="about-btns">
                <a href="#contact" className="btn btn-primary">בואו נדבר ←</a>
                <a href="#services" style={{ padding: '16px 36px', borderRadius: 50, fontFamily: 'Heebo,sans-serif', fontSize: '1rem', fontWeight: 700, textDecoration: 'none', background: 'transparent', border: '1.5px solid rgba(14,30,64,.2)', color: 'var(--navy-mid)', transition: 'var(--transition)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>לשירותים שלי ↓</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section className="section section-light" id="services">
        <div className="container">
          <div className="audience-section-header">
            <div>
              <div className="gold-line" />
              <h2 className="section-title">לאיזה קטגוריה אתם שייכים?</h2>
              <p className="section-sub" style={{ marginBottom: 0 }}>בחרו את הקטגוריה שלכם וראו מה רלוונטי אליכם</p>
            </div>
          </div>
          <div className="audience-grid reveal">
            {audienceCards.map((card, idx) => (
              <div key={idx} className={`audience-card${expandedCard === idx ? ' expanded' : ''}`} onClick={() => setExpandedCard(expandedCard === idx ? null : idx)}>
                <div className="audience-card-header">
                  <div className="audience-icon">{card.icon}</div>
                  <div className="audience-card-title">{card.title}</div>
                  <div className="audience-card-tagline">{card.tagline}</div>
                  <div className="audience-toggle-row">
                    <span className="audience-toggle-label">לגילוי השירותים</span>
                    <span className="audience-toggle-icon"><svg viewBox="0 0 14 14" fill="none" strokeWidth="2" strokeLinecap="round" stroke="var(--gold)"><line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" /></svg></span>
                  </div>
                </div>
                <div className="audience-services">
                  {card.services.map((s, j) => (
                    <div key={j} className="audience-service-item">
                      <span className="audience-service-dot" />
                      <span className="audience-service-text"><strong>{s.t}</strong>{s.d}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="services-cta-block reveal reveal-delay-1">
            <h3>לא בטוחים מה אתם צריכים?</h3>
            <p>שאלו אותי — ייעוץ ראשוני בחינם, בלי שום התחייבות</p>
            <a href="#contact" className="btn btn-primary">לשיחת ייעוץ חינמית ←</a>
          </div>
        </div>
      </section>

      {/* ══ PROCESS ══ */}
      <section className="section process-section" id="process">
        <div className="particles" id="processParticles" />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="gold-line center" />
            <h2 className="section-title reveal">איך זה עובד?</h2>
            <p className="section-sub reveal reveal-delay-1" style={{ margin: '0 auto 64px', textAlign: 'center' }}>פשוט ומהיר — כך זה עובד בפועל</p>
          </div>
          <div className="process-grid">
            {[{ icon: '📞', title: 'שיחת היכרות', desc: '10–15 דקות בטלפון — מבינים מה צריך ועונים על שאלות ראשוניות, חינם', d: 'reveal-delay-1' }, { icon: '📋', title: 'שולחים מסמכים', desc: 'שולחים לי טפסים ומסמכים רלוונטיים בוואטסאפ — בלי להגיע לאף מקום', d: 'reveal-delay-2' }, { icon: '⚡', title: 'אני מטפלת', desc: 'מגישה, רודפת ומתקשרת עם הרשויות — אתם לא צריכים להיות מעורבים', d: 'reveal-delay-3' }, { icon: '🎯', title: 'מקבלים תוצאה', desc: 'מקבלים את הכסף, האישור, או הדוח — ויכולים לשכוח מזה', d: 'reveal-delay-4' }].map((step, i) => (
              <div key={i} className={`process-step reveal ${step.d}`}>
                <div className="process-num"><span className="process-icon">{step.icon}</span></div>
                <div className="process-title">{step.title}</div>
                <div className="process-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CALCULATORS ══ */}
      <section className="section" id="calculators">
        <div className="container">
          <div className="gold-line" />
          <h2 className="section-title reveal">מחשבונים פיננסיים</h2>
          <p className="section-sub reveal reveal-delay-1">מחשבים, מקבלים הערכה ראשונית — בלי להצטרך לשאול אף אחד</p>
          <div className="audience-grid reveal" style={{ marginBottom: 48 }}>
            <div className="audience-card reveal">
              <div className="audience-icon">🧾</div>
              <h3>מחשבון מס הכנסה</h3>
              <p>חשב כמה מס תשלם השנה לפי מדרגות המס הרשמיות — ותגלה אם מגיע לך החזר</p>
            </div>
            <div className="audience-card reveal reveal-delay-1">
              <div className="audience-icon">💰</div>
              <h3>מחשבון החזר מס</h3>
              <p>ניתן לתבוע עד 6 שנים אחורה. כמה כסף מגיע לך בחזרה?</p>
            </div>
            <div className="audience-card reveal reveal-delay-2">
              <div className="audience-icon">💼</div>
              <h3>מחשבון שכר נטו</h3>
              <p>מחשב מה יישאר לך בפועל מהשכר ברוטו — עם פירוט ניכויים מלא</p>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <a href="/calculators" className="btn btn-primary reveal">פתח את כל המחשבונים ←</a>
          </div>
        </div>
      </section>

      {/* ══ ARTICLES ══ */}
      <section className="section section-light" id="articles">
        <div className="container">
          <div className="gold-line center" style={{ margin: '0 auto 20px' }} />
          <h2 className="section-title reveal" style={{ textAlign: 'center' }}>מאמרים ועדכונים</h2>
          <p className="section-sub reveal reveal-delay-1" style={{ margin: '0 auto 32px', textAlign: 'center' }}>מדריכים קצרים בנושאים שהכי שואלים עליהם</p>
          <div className="articles-grid" style={{ marginBottom: 48 }}>
            <div className="article-card reveal">
              <div className="article-img article-img--fallback" />
              <div className="article-body">
                <div className="article-meta"><span className="article-cat-badge cat-tax">החזרי מס</span><span className="article-reading-time">⏱ 7 דק׳</span></div>
                <h3>המדריך המלא להחזרי מס 2026</h3>
                <p>ניתן לתבוע עד 6 שנים אחורה. הממוצע עומד על 8,000–25,000 ₪.</p>
                <div className="article-footer"><a href="/articles" className="article-read">קרא עוד ←</a><span className="article-date">2026</span></div>
              </div>
            </div>
            <div className="article-card reveal reveal-delay-1">
              <div className="article-img article-img--fallback" />
              <div className="article-body">
                <div className="article-meta"><span className="article-cat-badge cat-business">פתיחת עסק</span><span className="article-reading-time">⏱ 6 דק׳</span></div>
                <h3>פתיחת עסק ב-2026 — כל הצעדים</h3>
                <p>עוסק פטור, מורשה או חברה? ההבדלים, התקרות ושיקולי המס.</p>
                <div className="article-footer"><a href="/articles" className="article-read">קרא עוד ←</a><span className="article-date">2026</span></div>
              </div>
            </div>
            <div className="article-card reveal reveal-delay-2">
              <div className="article-img article-img--fallback" />
              <div className="article-body">
                <div className="article-meta"><span className="article-cat-badge cat-pension">פרישה</span><span className="article-reading-time">⏱ 5 דק׳</span></div>
                <h3>תכנון פרישה: למה כל שנה עולה ביוקר</h3>
                <p>כוח הריבית דריבית עובד נגדכם כשמחכים. מהגיל 40 אפשר כבר לתכנן.</p>
                <div className="article-footer"><a href="/articles" className="article-read">קרא עוד ←</a><span className="article-date">2026</span></div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <a href="/articles" className="btn btn-primary reveal">לכל המאמרים ←</a>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="section" id="faq">
        <div className="container">
          <div style={{ textAlign: 'center' }}><div className="gold-line center" /><h2 className="section-title reveal">שאלות נפוצות</h2><p className="section-sub reveal reveal-delay-1" style={{ margin: '0 auto 56px', textAlign: 'center' }}>השאלות שמגיעות הכי הרבה</p></div>
          <div className="faq-grid">
            {faqItems.map((item, i) => (
              <div key={i} className={`faq-item reveal${i > 0 ? ` reveal-delay-${Math.min(i, 5)}` : ''}${openFaq === i ? ' open' : ''}`}>
                <div className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <h3>{item.q}</h3>
                  <span className="faq-toggle"><svg viewBox="0 0 14 14" fill="none" strokeWidth="2" strokeLinecap="round" stroke={openFaq === i ? 'var(--navy)' : 'var(--gold)'}><line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" /></svg></span>
                </div>
                <div className="faq-answer"><p>{item.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="section section-light" id="testimonials">
        <div className="container">
          <div className="gold-line center" />
          <h2 className="section-title" style={{ textAlign: 'center' }}>מה הלקוחות אומרים</h2>
          <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto 24px' }}>ביקורות אמיתיות מגוגל — בלי סינון</p>
          <div className="google-rating reveal">
            <span style={{ fontWeight: 900, fontSize: '1.5rem', color: '#4285F4' }}>G</span>
            <span className="google-rating-score">5.0</span>
            <span className="google-rating-stars">★★★★★</span>
            <span className="google-rating-text">דירוג מושלם בגוגל</span>
          </div>
          <div className="testimonials-wrap">
            <div className="testimonials-track">
              <div className="testimonials-inner" style={{ transform: `translateX(${testiCurrent * 100}%)` }}>
                {testiSlides.map((slide, slideIdx) => (
                  <div key={slideIdx} className="testimonial-slide">
                    <div className="testimonials-cards">
                      {slide.map((t, j) => (
                        <div key={j} className="testimonial-card">
                          <span className="testimonial-stars-top">★★★★★</span>
                          <div className="testimonial-quote">&ldquo;</div>
                          <p className="testimonial-text">{t.text}</p>
                          <div className="testimonial-footer">
                            <div className="testimonial-avatar">{t.avatar}</div>
                            <div><div className="testimonial-name">{t.name}</div><div className="testimonial-role">ביקורת Google</div></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="testimonials-nav">
              {testiSlides.map((_, i) => (
                <button key={i} className={`testi-dot${testiCurrent === i ? ' active' : ''}`} onClick={() => resetAutoAdvance(i)} />
              ))}
            </div>
            <div className="testimonials-arrows">
              <button className="testi-arrow" onClick={() => resetAutoAdvance(testiCurrent + 1)}>→</button>
              <button className="testi-arrow" onClick={() => resetAutoAdvance(testiCurrent - 1)}>←</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section className="section" id="contact">
        <div className="container">
          <div className="contact-grid">
            <div className="reveal">
              <div className="gold-line" /><h2 className="section-title">בואו נדבר</h2>
              <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 36 }}>שלחו לי הודעה, ספרו לי מה המצב — ואחזור אליכם בתוך שעות. הייעוץ הראשון חינם.</p>
              <div className="contact-item"><div className="contact-icon">📍</div><div><div className="contact-label">כתובת</div><div className="contact-value">באר שבע, ישראל</div></div></div>
              <div className="contact-item"><div className="contact-icon">📞</div><div><div className="contact-label">טלפון</div><div className="contact-value"><a href="tel:+972547312262" style={{ color: 'var(--navy)' }}>054-7312262</a></div></div></div>
              <div className="contact-item"><div className="contact-icon">📧</div><div><div className="contact-label">אימייל</div><div className="contact-value"><a href="mailto:almog@abd-cpa.co.il" style={{ color: 'var(--navy)' }}>almog@abd-cpa.co.il</a></div></div></div>
              <div className="contact-item"><div className="contact-icon">🕐</div><div><div className="contact-label">שעות פעילות</div><div className="contact-value">א&apos;–ה&apos;: 9:00–18:00</div></div></div>
              <div className="contact-social">
                <a href="https://www.facebook.com/profile.php?id=61588477094876" target="_blank" rel="noopener noreferrer" className="social-icon" title="פייסבוק">f</a>
                <a href="https://wa.me/972547312262" target="_blank" rel="noopener noreferrer" className="social-icon" title="WhatsApp">W</a>
              </div>
            </div>
            <div className="contact-form reveal reveal-delay-1">
              <div className="trust-badges">
                <div className="trust-badge">✓ בדיקה ללא התחייבות</div>
                <div className="trust-badge">⏱ מענה תוך 24 שעות</div>
                <div className="trust-badge">🔒 פרטיות מלאה</div>
              </div>
              <h3>שלחי לי הודעה</h3>
              {!formSubmitted ? (
                <form id="contactForm" onSubmit={handleFormSubmit}>
                  <div className="form-row">
                    <div className="form-group"><label>שם מלא *</label><input type="text" placeholder="ישראל ישראלי" required /></div>
                    <div className="form-group"><label>טלפון *</label><input type="tel" placeholder="054-7312262" required /></div>
                  </div>
                  <div className="form-group"><label>אימייל</label><input type="email" placeholder="email@example.com" /></div>
                  <div className="form-group"><label>נושא הפנייה</label><select><option>החזר מס</option><option>פתיחת עסק</option><option>תכנון פרישה</option><option>הנהלת חשבונות</option><option>ייעוץ כללי</option><option>אחר</option></select></div>
                  <div className="form-group"><label>הודעה</label><textarea placeholder="ספרו לי מה המצב — אחזור בהקדם..." /></div>
                  <button type="submit" className="btn btn-primary form-submit-btn" disabled={formSending}>{formSending ? '⏳ שולח...' : '📨 שליחת הודעה'}</button>
                </form>
              ) : (
                <div className="form-success" style={{ display: 'block' }}>✅ תודה! קיבלתי את ההודעה ואחזור אליכם תוך שעות.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: 'var(--navy)', color: 'rgba(255,255,255,.8)', padding: '64px 0 0' }}>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="אלמוג בן דוד" />
              </div>
              <p className="footer-desc">רואת חשבון מוסמכת בבאר שבע. עובדת עם עצמאיים, חברות ושכירים מכל הארץ — הכל דיגיטלי.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <a href="https://www.facebook.com/profile.php?id=61588477094876" target="_blank" rel="noopener noreferrer" className="social-icon" style={{ borderColor: 'rgba(255,255,255,.2)', color: 'var(--gold-light)' }}>f</a>
                <a href="#contact" className="social-icon" style={{ borderColor: 'rgba(255,255,255,.2)', color: 'var(--gold-light)' }}>W</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>שירותים</h4>
              <ul><li><a href="/service-tax-refund">החזרי מס</a></li><li><a href="/service-business">פתיחת עסק</a></li><li><a href="/service-retirement">תכנון פרישה</a></li><li><a href="#services">הנהלת חשבונות</a></li><li><a href="#services">דוחות שנתיים</a></li></ul>
            </div>
            <div className="footer-col">
              <h4>מידע</h4>
              <ul><li><a href="#about">אודות</a></li><li><a href="/calculators">מחשבונים</a></li><li><a href="/articles">מאמרים</a></li><li><a href="#testimonials">המלצות</a></li><li><a href="#contact">צור קשר</a></li></ul>
            </div>
            <div className="footer-col">
              <h4>יצירת קשר</h4>
              <ul><li><span>באר שבע, ישראל</span></li><li><a href="mailto:almog@abd-cpa.co.il">almog@abd-cpa.co.il</a></li><li><span>א&apos;–ה&apos; 9:00–18:00</span></li></ul>
              <a href="#contact" className="btn btn-primary" style={{ marginTop: 20, padding: '10px 24px', fontSize: '.9rem' }}>ייעוץ חינמי</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 <span className="footer-gold">אלמוג בן דוד</span> – כל הזכויות שמורות</p>
            <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.3)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <a href="/accessibility" style={{ color: 'rgba(255,255,255,.4)' }}>הצהרת נגישות</a>
              <a href="/privacy" style={{ color: 'rgba(255,255,255,.4)' }}>מדיניות פרטיות</a>
              <a href="/terms" style={{ color: 'rgba(255,255,255,.4)' }}>תנאי שימוש</a>
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
