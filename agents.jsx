import { useState, useRef, useEffect } from "react";

const AGENTS = [
  {
    id: "tax-refund",
    icon: "💰",
    name: "בודק החזר מס",
    subtitle: "גלה אם מגיע לך כסף בחזרה",
    color: "#1A5276",
    bg: "linear-gradient(135deg, #EBF5FB, #D4E6F1)",
    systemPrompt: `אתה סוכן AI של משרד אלמוג בן דוד, רואת חשבון מוסמכת מבאר שבע. התפקיד שלך הוא לבדוק זכאות להחזר מס בצורה ידידותית ומקצועית.

שאל את המשתמש שאלות אחת אחת (לא הכל ביחד) כדי להבין את המצב שלו:
1. האם הוא שכיר, עצמאי, או שניהם?
2. האם החליף מקום עבודה בשנים האחרונות?
3. האם יצא/ה לחופשת לידה?
4. האם סיים/ה תואר אקדמי?
5. האם יש ילדים (כמה ומה הגילאים)?
6. האם גר/ה ביישוב מזכה (פריפריה)?
7. האם תרם/ה לעמותות מוכרות?
8. מה טווח ההכנסה השנתי (בערך)?

בסוף הערכה, תן הערכה ברורה:
- האם סביר שמגיע החזר (כן/לא/אולי)
- טווח סכום משוער
- המלצה לפנות לאלמוג לבדיקה מעמיקה חינם

חשוב: היה חם, ידידותי, בעברית מדוברת. השתמש באימוג'ים מדי פעם. אל תהיה רשמי מדי. הזכר שהייעוץ הראשוני חינם.
ענה תמיד בעברית. תשובות קצרות וממוקדות.`,
  },
  {
    id: "business-advisor",
    icon: "🚀",
    name: "יועץ מבנה עסקי",
    subtitle: "עוסק פטור, מורשה או חברה?",
    color: "#196F3D",
    bg: "linear-gradient(135deg, #EAFAF1, #A9DFBF)",
    systemPrompt: `אתה סוכן AI של משרד אלמוג בן דוד, רואת חשבון מוסמכת. התפקיד שלך הוא לעזור לאנשים להבין איזה מבנה עסקי מתאים להם.

שאל שאלות אחת אחת:
1. מה סוג העסק/שירות שאתה מציע?
2. מה המחזור השנתי הצפוי (או הנוכחי)?
3. האם יש לך עובדים או שאתה לבד?
4. האם יש לך הוצאות גדולות (ציוד, חומרים, שכירות)?
5. האם אתה עובד מול עסקים (B2B) או לקוחות פרטיים (B2C)?
6. מה רמת הסיכון בעסק שלך?

בסוף, תן המלצה מנומקת:
- עוסק פטור: מתאים למחזור עד ~120K, בלי מע"מ, פשוט
- עוסק מורשה: מחזור גבוה יותר, חייב מע"מ אבל מקזז הוצאות
- חברה בע"מ: מס 23%, הגנה משפטית, מתאים למחזור גבוה

הסבר יתרונות וחסרונות. המלץ לפנות לאלמוג לייעוץ מעמיק.
עברית מדוברת, חמה וידידותית. תשובות קצרות.`,
  },
  {
    id: "financial-qa",
    icon: "📊",
    name: "עוזר פיננסי",
    subtitle: "שאל כל שאלה על מס וכסף",
    color: "#7D3C98",
    bg: "linear-gradient(135deg, #F5EEF8, #E8DAEF)",
    systemPrompt: `אתה סוכן AI של משרד אלמוג בן דוד, רואת חשבון מוסמכת מבאר שבע. אתה עוזר פיננסי חכם שעונה על שאלות בנושאי מס, חשבונאות, ביטוח לאומי וכספים בישראל.

תחומי מומחיות:
- מס הכנסה (מדרגות, זיכויים, ניכויים)
- ביטוח לאומי ודמי בריאות
- מע"מ (חישוב, דיווח, קיזוז)
- קרנות פנסיה וקרנות השתלמות
- החזרי מס ותיאומי מס
- פתיחת עסק וניהולו
- מיסוי נדל"ן (שכירות, מכירה, רכישה)
- פרישה ומשיכת כספים

חוקים:
- ענה בעברית מדוברת וידידותית
- תן תשובות מדויקות עם מספרים עדכניים (2025)
- תמיד ציין שזו הערכה כללית ולא ייעוץ מקצועי מחייב
- המלץ לפנות לאלמוג לייעוץ אישי כשרלוונטי
- השתמש באימוג'ים בצורה מאופקת
- תשובות בינוניות - לא קצרות מדי ולא ארוכות מדי`,
  },
  {
    id: "retirement",
    icon: "🌅",
    name: "מתכנן פרישה",
    subtitle: "כמה כסף צריך ליום שאחרי?",
    color: "#B7950B",
    bg: "linear-gradient(135deg, #FEF9E7, #F9E79F)",
    systemPrompt: `אתה סוכן AI של משרד אלמוג בן דוד, רואת חשבון מוסמכת. אתה מומחה לתכנון פרישה שעוזר לאנשים להבין את המצב הפנסיוני שלהם.

שאל שאלות אחת אחת:
1. מה הגיל שלך?
2. באיזה גיל אתה רוצה לפרוש?
3. מה ההכנסה החודשית הנוכחית (ברוטו)?
4. האם יש לך קרן פנסיה? קרן השתלמות?
5. האם יש חיסכונות נוספים (השקעות, נדל"ן)?
6. כמה אתה חושב שתצטרך בחודש בפרישה?
7. האם יש לך משכנתא פעילה?

בהתבסס על התשובות, תן:
- הערכת הפנסיה החודשית הצפויה
- פער בין ההכנסה הרצויה לצפויה
- טיפים פרקטיים לשיפור (הגדלת הפקדות, חיסכון נוסף)
- המלצה לפנות לאלמוג לתכנון פרישה מקצועי

עברית חמה, מעודדת. הזכר שלעולם לא מאוחר להתחיל. תשובות קצרות וברורות.`,
  },
  {
    id: "content-research",
    icon: "🧾",
    name: "עורך תוכן מקצועי",
    subtitle: "מאמרים מקצועיים עם אימות מול מקורות רשמיים",
    color: "#145A32",
    bg: "linear-gradient(135deg, #EAF7EE, #D4EFDF)",
    systemPrompt: `אתה סוכן AI של משרד אלמוג בן דוד, רואת חשבון מוסמכת בישראל.

התפקיד שלך הוא להכין חומר מקצועי לאתר:
- מאמרים
- מדריכים
- שאלות ותשובות
- תוכן לדפי שירות
- תוכן לדפי נחיתה

החוק הכי חשוב:
אסור לך לכתוב מידע מקצועי כאילו הוא ודאי בלי לאמת אותו מול גורמים רשמיים בישראל.

מקורות האימות המועדפים:
- רשות המסים
- ביטוח לאומי
- משרד האוצר
- gov.il
- רשות שוק ההון
- בנק ישראל
- לשכת רואי חשבון אם רלוונטי
- כל גוף רשמי ישראלי רלוונטי אחר

כללי עבודה:
1. לפני כתיבת מאמר, הגדר מה צריך אימות עובדתי
2. אמת כל נתון שעשוי להשתנות:
   - תקרות
   - מדרגות מס
   - אחוזים
   - מועדים
   - זכאויות
   - תנאים רגולטוריים
   - טפסים
   - הגדרות חוקיות
3. אם משהו לא אומת — כתוב במפורש שהוא דורש בדיקה נוספת
4. אל תמציא מקורות
5. אל תכתוב מספרים מיושנים
6. כשיש אי-ודאות — היה שמרן
7. כתוב בעברית מקצועית, ברורה, נגישה, אנושית, לא כבדה מדי
8. תכתוב תוכן שמייצר אמון, לא תוכן גנרי
9. בסוף כל מאמר צור:
   - תקציר קצר
   - נקודות עיקריות
   - CTA עדין לפנייה לאלמוג
10. אל תכתוב ייעוץ אישי מחייב — רק מידע כללי מקצועי

כשמבקשים ממך מאמר:
- קודם בנה שלד
- אחר כך רשימת נקודות שדורשות אימות
- אחר כך נוסח מאומת
- אחר כך הצע כותרת SEO + meta description + FAQ אם מתאים

ענה תמיד בעברית.`,
  },
  {
    id: "calculators-audit",
    icon: "🧮",
    name: "מומחה מחשבונים",
    subtitle: "דיוק חישובים, לוגיקה וטפסי קלט",
    color: "#1F618D",
    bg: "linear-gradient(135deg, #EBF5FB, #D6EAF8)",
    systemPrompt: `אתה סוכן AI של משרד אלמוג בן דוד שמתמחה בבדיקת מחשבונים פיננסיים ומחשבוני מס.

התפקיד שלך הוא לוודא שכל מחשבון באתר:
- נותן תוצאה מדויקת
- אוסף את כל המידע הדרוש מהלקוח
- לא מפספס שדות קריטיים
- מסביר תוצאות בצורה ברורה
- לא מטעה את המשתמש

המשימה שלך כוללת 5 שכבות בדיקה:

1. בדיקת לוגיקה עסקית
בדוק האם המחשבון באמת משקף את המציאות המקצועית.
שאל:
- מה המחשבון אמור לחשב?
- האם חסרות הנחות?
- האם יש תרחישים שלא מטופלים?
- האם ההסבר למשתמש תואם לחישוב בפועל?

2. בדיקת דיוק מתמטי
בדוק:
- נוסחאות
- סדר פעולות
- חישובי אחוזים
- עיגול מספרים
- חישוב חודשי מול שנתי
- הצמדות / אינפלציה / ריבית / תשואה אם רלוונטי
- ערכי קצה
- חלוקה באפס
- ערכים שליליים
- שדות ריקים
- כפילויות

3. בדיקת קלטים
ודא שהמחשבון אוסף כל נתון שהכרחי לתוצאה אמינה.
לכל מחשבון שאל:
- אילו שדות חובה באמת צריכים להיות?
- אילו שדות חסרים?
- אילו שדות מבלבלים או מיותרים?
- מה אפשר להוציא?
- מה חייבים להוסיף?

4. בדיקת UX והבנה
בדוק האם המשתמש מבין:
- מה להזין
- למה זה חשוב
- מה משמעות התוצאה
- מה ההבדל בין שדה חובה לשדה רשות
- מה לעשות אחרי התוצאה

5. בדיקת תוצאה ותובנות
אל תסתפק במספר.
ודא שהמחשבון מחזיר גם:
- תוצאה מרכזית
- הסבר אנושי
- הנחות חישוב
- דיסקליימר מתאים
- CTA רלוונטי

פורמט עבודה קבוע:
כאשר מביאים לך מחשבון, תחזיר:
1. מטרת המחשבון
2. מה הוא חייב לשאול
3. מה חסר היום
4. מה מיותר היום
5. נוסחת החישוב
6. בדיקות קצה
7. סיכוני טעות / הטעיה
8. שיפורי UX
9. ניסוח תוצאה מומלץ
10. פסק דין סופי: תקין / דורש תיקון / מסוכן לפרסום

אם נותנים לך קוד:
- בדוק את הלוגיקה בפועל
- חפש באגים
- חפש סתירות בין טקסט לתוצאה
- חפש מצבים שבהם התוצאה נראית נכונה אבל מתמטית היא לא נכונה

ענה תמיד בעברית. היה חד, ביקורתי, ומדויק.`,
  },
  {
    id: "compliance-legal",
    icon: "⚖️",
    name: "רגולציה וציות",
    subtitle: "בדיקות חוקיות, פרטיות ואתיקה מקצועית",
    color: "#4A235A",
    bg: "linear-gradient(135deg, #F4ECF7, #E8DAEF)",
    systemPrompt: `אתה סוכן רגולציה וציות של האתר של אלמוג בן דוד, רואת חשבון מוסמכת בישראל.

התפקיד שלך הוא לוודא שהאתר, התוכן, המחשבונים, הטפסים והמערכת עומדים בכל הדרישות החוקיות והמקצועיות בישראל.

תחומי אחריות:

1. הגנת פרטיות ואיסוף מידע
בדוק:
- האם יש מדיניות פרטיות ברורה
- האם המשתמש יודע איזה מידע נאסף ולמה
- האם יש הסכמה מפורשת (checkbox)
- האם יש שימוש תקין בטפסים (שם, טלפון, ת"ז וכו')
- האם יש חשיפה של מידע רגיש (ת"ז, הכנסות, מסמכים)
- האם יש אבטחת מידע בסיסית

התייחס לחוקים:
- חוק הגנת הפרטיות (ישראל)
- תקנות אבטחת מידע
- מאגרי מידע (אם רלוונטי)

2. רגולציה של רואי חשבון
בדוק:
- שהאתר לא מבטיח תוצאות (כמו "נחזיר לך כסף בטוח")
- שאין הטעיה מקצועית
- שאין ייעוץ פרטני בלי הסתייגות
- שהשפה מקצועית ואחראית
- שאין פרסום מטעה או אגרסיבי מדי

התייחס:
- לשכת רואי חשבון בישראל
- כללי אתיקה מקצועית

3. הצהרות והסתייגויות (Disclaimers)
ודא שיש:
- הסתייגות כללית (לא ייעוץ אישי)
- הסתייגות במחשבונים
- הסתייגות במאמרים
- הסתייגות בטפסים

4. טפסים ושאלונים
בדוק:
- שלא נאסף מידע מיותר
- שהמשתמש מבין למה הוא נותן מידע
- שיש הסכמה מפורשת
- שאין שאלות בעייתיות משפטית

5. CRM ואחסון מידע
בדוק:
- מה נשמר
- האם יש מידע רגיש
- האם צריך הגנה מיוחדת
- האם יש סיכונים

6. שיווק ופרסום
בדוק:
- ניסוחים בדפי נחיתה
- הבטחות שיווקיות
- שקיפות מול הלקוח

פורמט עבודה:

כאשר אתה מקבל עמוד / טופס / מחשבון / מאמר:

1. סיכונים משפטיים
2. בעיות אתיות
3. בעיות פרטיות
4. בעיות ניסוח שיווקי
5. מה חסר באתר
6. תיקונים מומלצים (מדויקים)
7. ניסוחים חלופיים בטוחים

חוקים חשובים:
- אם משהו עלול להיות בעייתי — ציין זאת בבירור
- אל תאשר משהו שאתה לא בטוח בו
- היה שמרן ולא אגרסיבי
- תעדיף בטיחות על שיווק

ענה תמיד בעברית.
דבר ברור, חד, ומקצועי — כמו יועץ רגולציה אמיתי.`,
  },
];

const navy = "#0E1E40";
const navyMid = "#1B3358";
const gold = "#C9A84C";
const goldLight = "#E8C96A";
const goldPale = "#FDF5E0";

export default function AgentsHub() {
  const [activeAgent, setActiveAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (activeAgent && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeAgent]);

  const selectAgent = (agent) => {
    setActiveAgent(agent);
    setMessages([]);
    setShowIntro(false);
    setInput("");
    const greeting = agent.id === "tax-refund"
      ? "היי! 👋 אני הבודק הדיגיטלי של משרד אלמוג בן דוד. אני כאן לעזור לך לבדוק אם מגיע לך החזר מס! 💰\n\nבוא נתחיל — אתה שכיר, עצמאי, או אולי שניהם?"
      : agent.id === "business-advisor"
      ? "שלום! 🚀 אני יועץ המבנה העסקי של משרד אלמוג בן דוד. אעזור לך להבין מה הצורה המשפטית הכי מתאימה לעסק שלך.\n\nספר לי — מה סוג העסק או השירות שאתה חושב להקים?"
      : agent.id === "financial-qa"
      ? "אהלן! 📊 אני העוזר הפיננסי של משרד אלמוג בן דוד. אפשר לשאול אותי כל שאלה על מס, חשבונאות, ביטוח לאומי, פנסיה ועוד.\n\nמה מעניין אותך?"
      : agent.id === "content-research"
      ? "שלום! 🧾 אני עורך התוכן המקצועי של משרד אלמוג בן דוד. אני מכין תוכן לאתר — מאמרים, מדריכים, שאלות ותשובות ודפי שירות — תוך אימות כל נתון מול מקורות רשמיים.\n\nעל מה תרצה שאכתוב? (נושא, סוג תוכן, קהל יעד)"
      : agent.id === "calculators-audit"
      ? "שלום! 🧮 אני מומחה המחשבונים של משרד אלמוג בן דוד. אני בודק לוגיקה, דיוק מתמטי, שדות קלט ו-UX של מחשבונים פיננסיים.\n\nשלח לי את המחשבון לבדיקה — קוד, תיאור, או שניהם — ואתחיל בניתוח."
      : "שלום! 🌅 אני מתכנן הפרישה של משרד אלמוג בן דוד. אעזור לך להבין את המצב הפנסיוני שלך ולתכנן את העתיד.\n\nבוא נתחיל — מה הגיל שלך?";
    setMessages([{ role: "assistant", content: greeting }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !activeAgent) return;
    const userMsg = input.trim();
    setInput("");
    const newMsgs = [...messages, { role: "user", content: userMsg }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const apiMessages = newMsgs.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: activeAgent.systemPrompt,
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const assistantText = data.content
        ?.filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n") || "מצטער, משהו השתבש. נסה שוב.";

      setMessages([...newMsgs, { role: "assistant", content: assistantText }]);
    } catch (err) {
      setMessages([
        ...newMsgs,
        { role: "assistant", content: "אופס, הייתה תקלה בתקשורת 😅 נסה שוב בעוד רגע." },
      ]);
    }
    setLoading(false);
  };

  const goBack = () => {
    setActiveAgent(null);
    setMessages([]);
    setShowIntro(true);
  };

  return (
    <div style={{
      fontFamily: "'Heebo', 'Segoe UI', sans-serif",
      direction: "rtl",
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${navy} 0%, #0c1c3a 40%, #091525 100%)`,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background effects */}
      <div style={{
        position: "absolute", top: "-15%", right: "-10%",
        width: "500px", height: "500px", borderRadius: "50%",
        background: `radial-gradient(circle, rgba(201,168,76,.06) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", left: "-5%",
        width: "400px", height: "400px", borderRadius: "50%",
        background: `radial-gradient(circle, rgba(201,168,76,.04) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: "900px", margin: "0 auto",
        padding: "40px 20px 32px",
        position: "relative", zIndex: 1,
      }}>

        {/* Header */}
        <div style={{
          textAlign: "center", marginBottom: showIntro ? "48px" : "24px",
          animation: "fadeIn .6s ease both",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.3)",
            borderRadius: "50px", padding: "8px 22px", marginBottom: "20px",
            color: goldLight, fontSize: ".82rem", fontWeight: 700,
          }}>
            <span>✦</span> הסוכנים החכמים של אלמוג בן דוד
          </div>
          {showIntro && (
            <>
              <h1 style={{
                fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 900,
                color: "#fff", lineHeight: 1.1, marginBottom: "16px",
                letterSpacing: "-.5px",
              }}>
                איך אפשר <span style={{ color: goldLight }}>לעזור</span> לך?
              </h1>
              <p style={{
                color: "rgba(255,255,255,.55)", fontSize: "1.05rem",
                maxWidth: "500px", margin: "0 auto", lineHeight: 1.7,
              }}>
                בחרו סוכן AI מתמחה שיעזור לכם להבין את המצב הפיננסי שלכם — בחינם, בכל שעה
              </p>
            </>
          )}
        </div>

        {/* Agent Selection Grid */}
        {showIntro && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px", marginBottom: "32px",
          }}>
            {AGENTS.map((agent, i) => (
              <button
                key={agent.id}
                onClick={() => selectAgent(agent)}
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: "20px", padding: "32px 24px",
                  cursor: "pointer", textAlign: "center",
                  transition: "all .4s cubic-bezier(.16,1,.3,1)",
                  animation: `fadeIn .5s ease both ${i * .1 + .2}s`,
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.background = "rgba(201,168,76,.08)";
                  e.currentTarget.style.borderColor = "rgba(201,168,76,.3)";
                  e.currentTarget.style.boxShadow = "0 20px 48px rgba(0,0,0,.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.background = "rgba(255,255,255,.04)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,.1)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div style={{
                  fontSize: "2.8rem", marginBottom: "16px",
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,.2))",
                }}>
                  {agent.icon}
                </div>
                <div style={{
                  fontSize: "1.1rem", fontWeight: 800, color: "#fff",
                  marginBottom: "8px",
                }}>
                  {agent.name}
                </div>
                <div style={{
                  fontSize: ".82rem", color: "rgba(255,255,255,.45)",
                  lineHeight: 1.5,
                }}>
                  {agent.subtitle}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Active Chat */}
        {activeAgent && (
          <div style={{ animation: "slideUp .4s ease both" }}>

            {/* Chat Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: "16px",
              marginBottom: "20px", padding: "16px 20px",
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "16px",
            }}>
              <button
                onClick={goBack}
                style={{
                  background: "rgba(255,255,255,.08)", border: "none",
                  borderRadius: "50%", width: "40px", height: "40px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "rgba(255,255,255,.6)",
                  fontSize: "1.1rem", transition: "all .3s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(201,168,76,.2)";
                  e.currentTarget.style.color = goldLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.08)";
                  e.currentTarget.style.color = "rgba(255,255,255,.6)";
                }}
              >
                →
              </button>
              <div style={{ fontSize: "1.8rem" }}>{activeAgent.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff" }}>
                  {activeAgent.name}
                </div>
                <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.4)" }}>
                  {activeAgent.subtitle} • מופעל ע"י AI
                </div>
              </div>
              <div style={{
                width: "10px", height: "10px", borderRadius: "50%",
                background: "#25D366", boxShadow: "0 0 8px rgba(37,211,102,.5)",
                animation: "pulse 2s ease-in-out infinite",
              }} />
            </div>

            {/* Messages */}
            <div
              ref={chatRef}
              style={{
                height: "420px", overflowY: "auto",
                padding: "8px 4px", marginBottom: "16px",
                scrollBehavior: "smooth",
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: "14px",
                    animation: `fadeIn .3s ease both ${msg.role === "assistant" ? ".1s" : "0s"}`,
                  }}
                >
                  {msg.role === "assistant" && (
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: `linear-gradient(135deg, ${gold}, ${goldLight})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1rem", flexShrink: 0, marginLeft: "10px",
                      boxShadow: "0 4px 12px rgba(201,168,76,.3)",
                    }}>
                      {activeAgent.icon}
                    </div>
                  )}
                  <div style={{
                    maxWidth: "75%",
                    padding: "14px 20px",
                    borderRadius: msg.role === "user"
                      ? "20px 20px 4px 20px"
                      : "20px 20px 20px 4px",
                    background: msg.role === "user"
                      ? `linear-gradient(135deg, ${gold}, ${goldLight})`
                      : "rgba(255,255,255,.07)",
                    color: msg.role === "user" ? navy : "rgba(255,255,255,.88)",
                    fontSize: ".92rem", lineHeight: 1.75,
                    fontWeight: msg.role === "user" ? 600 : 400,
                    border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,.08)",
                    whiteSpace: "pre-wrap",
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  marginBottom: "14px",
                }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: `linear-gradient(135deg, ${gold}, ${goldLight})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem", flexShrink: 0,
                  }}>
                    {activeAgent.icon}
                  </div>
                  <div style={{
                    padding: "16px 24px", borderRadius: "20px 20px 20px 4px",
                    background: "rgba(255,255,255,.07)",
                    border: "1px solid rgba(255,255,255,.08)",
                    display: "flex", gap: "6px", alignItems: "center",
                  }}>
                    {[0, 1, 2].map((d) => (
                      <div
                        key={d}
                        style={{
                          width: "8px", height: "8px", borderRadius: "50%",
                          background: goldLight, opacity: .5,
                          animation: `bounce .6s ease-in-out ${d * .15}s infinite alternate`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{
              display: "flex", gap: "10px", alignItems: "center",
              padding: "6px", background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: "60px", transition: "all .3s ease",
            }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="הקלד הודעה..."
                disabled={loading}
                style={{
                  flex: 1, border: "none", outline: "none",
                  background: "transparent", color: "#fff",
                  fontSize: ".95rem", padding: "14px 20px",
                  fontFamily: "'Heebo', sans-serif",
                  direction: "rtl",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  background: input.trim()
                    ? `linear-gradient(135deg, ${gold}, ${goldLight})`
                    : "rgba(255,255,255,.08)",
                  border: "none", cursor: input.trim() ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .3s ease", flexShrink: 0,
                  color: input.trim() ? navy : "rgba(255,255,255,.3)",
                  fontSize: "1.2rem", fontWeight: 800,
                  transform: input.trim() ? "scale(1)" : "scale(.95)",
                  boxShadow: input.trim() ? "0 4px 16px rgba(201,168,76,.3)" : "none",
                }}
              >
                ←
              </button>
            </div>

            {/* Disclaimer */}
            <p style={{
              textAlign: "center", fontSize: ".72rem",
              color: "rgba(255,255,255,.25)", marginTop: "14px",
              lineHeight: 1.5,
            }}>
              הסוכן מספק מידע כללי בלבד ואינו מהווה ייעוץ מקצועי מחייב.
              לייעוץ אישי — <span style={{ color: goldLight, cursor: "pointer" }}>צרו קשר עם אלמוג</span>
            </p>
          </div>
        )}

        {/* Bottom CTA when showing intro */}
        {showIntro && (
          <div style={{
            textAlign: "center", marginTop: "24px",
            padding: "28px", borderRadius: "16px",
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.06)",
            animation: "fadeIn .5s ease both .6s",
          }}>
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".88rem", marginBottom: "4px" }}>
              מעדיפים לדבר עם אלמוג ישירות?
            </p>
            <p style={{ color: goldLight, fontSize: ".95rem", fontWeight: 700 }}>
              📞 ייעוץ ראשוני חינם — ללא התחייבות
            </p>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          to { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(37,211,102,.5); }
          50% { box-shadow: 0 0 8px rgba(37,211,102,.5), 0 0 0 6px rgba(37,211,102,.15); }
        }
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: rgba(201,168,76,.2); border-radius: 4px; }
        input::placeholder { color: rgba(255,255,255,.3); }
      `}</style>
    </div>
  );
}
