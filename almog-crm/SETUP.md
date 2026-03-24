# Almog CRM — Setup Guide
## הפעלת המערכת

---

## שלב 1 — דרישות מקדימות
- Node.js 18+ (הורד מ-nodejs.org)
- חשבון Supabase (חינמי — supabase.com)
- חשבון Vercel (חינמי — vercel.com)

---

## שלב 2 — התקנת תלויות

```bash
cd almog-crm
npm install
```

---

## שלב 3 — הקמת Supabase

1. צור פרויקט חדש ב-[supabase.com](https://supabase.com)
2. לך ל-**SQL Editor** → **New query**
3. העתק את כל התוכן של `supabase/schema.sql` והרץ אותו
4. לך ל-**Settings → API** והעתק:
   - `Project URL`
   - `anon public` key
   - `service_role` key (סודי — לשרת בלבד)

---

## שלב 4 — קובץ Environment

צור קובץ `.env.local` בתיקיית `almog-crm/`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...

ANTHROPIC_API_KEY=sk-ant-api03-...

CRM_PASSWORD=סיסמה_חזקה_כאן
```

> ⚠️ לא להעלות את `.env.local` ל-Git!

---

## שלב 5 — הפעלה מקומית

```bash
npm run dev
```

פתח ב-browser: `http://localhost:3000`

| נתיב | תיאור |
|---|---|
| `/hazarat-mas` | דף נחיתה - החזר מס |
| `/sheelon` | שאלון לידים |
| `/todot` | עמוד תודה |
| `/agents` | סוכני AI |
| `/crm` | לוח הCRM (דורש סיסמה) |
| `/crm/[id]` | פרטי ליד |

---

## שלב 6 — Deploy ל-Vercel

```bash
# אם יש Vercel CLI:
npx vercel

# או:
# 1. Push ל-GitHub
# 2. Import project ב-vercel.com
# 3. הוסף Environment Variables בהגדרות
```

**חשוב:** הוסף את כל ה-env vars בהגדרות Vercel תחת **Settings → Environment Variables**.

---

## מבנה הנתיבים

```
POST  /api/leads              — יצירת ליד חדש מהשאלון
GET   /api/leads?status=X&q=Y — רשימת לידים (CRM)
GET   /api/leads/[id]         — פרטי ליד
PATCH /api/leads/[id]         — עדכון ליד

POST  /api/leads/[id]/notes     — הוספת הערה
POST  /api/leads/[id]/tasks     — הוספת משימה
PATCH /api/leads/[id]/tasks     — סימון משימה כבוצע
PATCH /api/leads/[id]/documents — עדכון קבלת מסמך

POST  /api/chat               — פרוקסי ל-Anthropic API
```

---

## שדות CRM מרכזיים

| שדה | תיאור |
|---|---|
| `status` | סטטוס בפייפליין |
| `score` | ציון ליד 0–10 |
| `score_label` | חם / בינוני / קר |
| `estimated_refund_min/max` | טווח החזר משוער |
| `actual_refund_amount` | סכום החזר בפועל |
| `bank_update_status` | סטטוס עדכון חשבון בנק |
| `partner` | שת"פ / מפנה |
| `next_followup_date` | תאריך מעקב הבא |
| `id_number` | ת"ז |

---

## חיבור הסוכני AI (agents.jsx)

`agents.jsx` הקיים קורא ל-Anthropic ישירות מה-browser.
**לא מומלץ לפרודקשן** — ה-API key חשוף.

הדף `/agents` בנוי עם proxy דרך `/api/chat` — מפתח נשמר בשרת.
להחליף את `agents.jsx` הקיים בשימוש ב-`/agents` נתיב.

---

## תחזוקה שוטפת

- כל ליד חדש מהשאלון נוצר אוטומטית עם ציון, רשימת מסמכים, והערה ראשונה
- עדכן סטטוסים ב-CRM דרך ה-UI
- הוסף הערות, משימות, ומסמכים לכל ליד
- הגדר תאריך מעקב לליד שלא ענה
