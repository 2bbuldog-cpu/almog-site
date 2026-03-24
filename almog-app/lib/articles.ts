export type ArticleCategory = 'tax' | 'business' | 'pension' | 'salary' | 'realestate'

export interface Article {
  slug: string
  title: string
  excerpt: string
  category: ArticleCategory
  categoryLabel: string
  date: string
  readTime: string
  image: string
  imageAlt: string
  href: string
  featured?: boolean
  badge?: string
}

export const CATEGORY_STYLES: Record<ArticleCategory, { bg: string; color: string }> = {
  tax:        { bg: 'rgba(14,30,64,0.07)',   color: '#0E1E40' },
  business:   { bg: 'rgba(14,30,64,0.07)',   color: '#0E1E40' },
  pension:    { bg: 'rgba(201,168,76,0.12)', color: '#8B6914' },
  salary:     { bg: 'rgba(14,30,64,0.07)',   color: '#0E1E40' },
  realestate: { bg: 'rgba(14,30,64,0.07)',   color: '#0E1E40' },
}

export const FEATURED_ARTICLE: Article = {
  slug: 'tax-refund-guide-2026',
  title: 'המדריך המלא להחזרי מס 2026: כל מה שצריך לדעת',
  excerpt:
    'ניתן לתבוע החזר עד 6 שנים אחורה. החלפת מקום עבודה, חל"ד, לימודים אקדמיים, תרומות — כל אלה עשויים לזכות אותך בהחזר של אלפי שקלים. הממוצע עומד על 8,000–25,000 ₪.',
  category: 'tax',
  categoryLabel: 'החזרי מס',
  date: 'מרץ 2026',
  readTime: '7 דקות קריאה',
  image: '/images/articles/article-tax-refund-guide.svg',
  imageAlt: 'מדריך החזרי מס 2026 — מסמך מס מודרני על רקע כחול בהיר',
  href: '/tax-refund',
  featured: true,
  badge: 'הכי נקרא',
}

export const ARTICLES: Article[] = [
  {
    slug: 'business-expenses',
    title: '5 הוצאות מוכרות שעצמאים שוכחים לנכות',
    excerpt:
      'ביגוד מקצועי, ספרות, אינטרנט ביתי, טלפון נייד ואפילו קפה עם לקוח — הוצאות שרוב העצמאים לא יודעים שהם יכולים לנכות ולחסוך אלפי שקלים בשנה.',
    category: 'tax',
    categoryLabel: 'מס הכנסה',
    date: '2026',
    readTime: '4 דק׳',
    image: '/images/articles/article-business-expenses.svg',
    imageAlt: 'הוצאות מוכרות לעצמאים — מסמכים על שולחן נקי',
    href: '#contact',
  },
  {
    slug: 'open-business-2026',
    title: 'פתיחת עסק בשנת 2026 — כל הצעדים מ-א׳ ועד ת׳',
    excerpt:
      'עוסק פטור, מורשה או חברה בע"מ? ההבדלים, התקרות, שיקולי מס ועלויות. צ׳קליסט מלא לכל מי שרוצה להתחיל — בלי להתבלבל בבירוקרטיה.',
    category: 'business',
    categoryLabel: 'פתיחת עסק',
    date: '2026',
    readTime: '6 דק׳',
    image: '/images/articles/article-open-business.svg',
    imageAlt: 'פתיחת עסק 2026 — נתיב צמיחה מינימליסטי',
    href: '/service-business',
  },
  {
    slug: 'retirement-planning',
    title: 'תכנון פרישה: למה כל שנה שמחכים עולה עשרות אלפים',
    excerpt:
      'כוח הריבית דריבית עובד נגדכם כשאתם מחכים. מהגיל 40 אפשר כבר לתכנן — ולחסוך מאות אלפי שקלים עד הפנסיה.',
    category: 'pension',
    categoryLabel: 'פרישה',
    date: '2026',
    readTime: '5 דק׳',
    image: '/images/articles/article-retirement-planning.svg',
    imageAlt: 'תכנון פרישה — אופק עתידי שקט',
    href: '/service-retirement',
  },
  {
    slug: 'company-vs-freelancer',
    title: 'חברה בע"מ מול עצמאי — השוואה מלאה ב-2026',
    excerpt:
      'מס חברות 23%, ביטוח לאומי מופחת, הגנה משפטית — אבל גם עלויות ניהול גבוהות. טבלת השוואה מלאה שעוזרת להחליט מה מתאים לכם.',
    category: 'business',
    categoryLabel: 'עסקים',
    date: '2026',
    readTime: '5 דק׳',
    image: '/images/articles/article-company-vs-freelancer.svg',
    imageAlt: 'חברה בעמ מול עצמאי — מאזן השוואה מינימליסטי',
    href: '#contact',
  },
  {
    slug: 'rental-tax',
    title: 'מיסוי שכירות — 3 מסלולים, מסלול אחד מנצח',
    excerpt:
      '10% מס קבוע, מסלול פטור עד תקרה, או מס שולי עם הוצאות? בעלי דירות להשקעה — ככה בוחרים את המסלול שחוסך הכי הרבה כסף.',
    category: 'realestate',
    categoryLabel: 'נדל"ן',
    date: '2025',
    readTime: '6 דק׳',
    image: '/images/articles/article-rental-tax.svg',
    imageAlt: 'מיסוי שכירות — נדלן להשקעה',
    href: '#contact',
  },
  {
    slug: 'tax-credits-salaried',
    title: 'נקודות זיכוי במס — מדריך לשכירים ב-2026',
    excerpt:
      'תואר אקדמי, ילדים, שירות מילואים, יישוב מזכה, נכות — כל נקודת זיכוי שווה 242 ₪ פחות מס בחודש. בדקו אם אתם ממצים את כולן.',
    category: 'salary',
    categoryLabel: 'שכירים',
    date: '2026',
    readTime: '4 דק׳',
    image: '/images/articles/article-tax-credits-salaried.svg',
    imageAlt: 'נקודות זיכוי מס לשכירים — רשימה מסודרת',
    href: '#contact',
  },
  {
    slug: 'income-tax-brackets',
    title: 'מדרגות מס הכנסה 2025–2026: טבלה מעודכנת',
    excerpt:
      'מ-10% עד 47% — כמה מס באמת משלמים? הטבלה המעודכנת עם כל המדרגות, תקרות ביטוח לאומי, ונקודות זיכוי. כולל דוגמאות חישוב.',
    category: 'tax',
    categoryLabel: 'מס הכנסה',
    date: '2026',
    readTime: '3 דק׳',
    image: '/images/articles/article-income-tax-brackets.svg',
    imageAlt: 'מדרגות מס הכנסה — גרף מדורג',
    href: '#contact',
  },
  {
    slug: 'study-fund',
    title: 'קרן השתלמות — למה זה אפיק החיסכון הכי משתלם?',
    excerpt:
      'פטור ממס רווחי הון, נזיל אחרי 6 שנים, המעסיק מפקיד 7.5%. אין שום מכשיר חיסכון אחר בישראל עם תנאים כאלה. הנה איך ממקסמים.',
    category: 'salary',
    categoryLabel: 'שכירים',
    date: '2026',
    readTime: '4 דק׳',
    image: '/images/articles/article-study-fund.svg',
    imageAlt: 'קרן השתלמות — עקומת צמיחה',
    href: '#contact',
  },
  {
    slug: 'severance-pay',
    title: 'משיכת פיצויים — מס, פטור, והטעויות שעולות ביוקר',
    excerpt:
      'עזבתם מקום עבודה? מגיעים לכם פיצויים — אבל הדרך שבה תמשכו אותם משפיעה דרמטית על כמה תקבלו בפועל. הנה הטעויות הנפוצות.',
    category: 'pension',
    categoryLabel: 'פרישה',
    date: '2025',
    readTime: '5 דק׳',
    image: '/images/articles/article-severance-pay.svg',
    imageAlt: 'משיכת פיצויים — הגנה פיננסית',
    href: '#contact',
  },
]
