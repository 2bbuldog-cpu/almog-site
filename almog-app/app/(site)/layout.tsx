import Navigation from '@/components/Navigation'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">האתר בשיפוצים</h1>
            <p className="text-lg text-gray-600">האתר שלנו נמצא כרגע בשיפוצים. אנא חזרו מאוחר יותר.</p>
          </div>
        </div>
      </main>
    </>
  )
}
