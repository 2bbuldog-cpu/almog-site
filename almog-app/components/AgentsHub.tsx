export default function AgentsHub() {
  const cards = [
    {
      title: "Generate Leads",
      description: "Automatically capture and qualify new leads from multiple sources.",
      icon: "🎯",
    },
    {
      title: "Manage Clients",
      description: "Track client interactions, documents, and follow-ups in one place.",
      icon: "👥",
    },
    {
      title: "Financial Tools",
      description: "Run tax calculations, refund estimates, and financial summaries.",
      icon: "📊",
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-3">Agents Hub</h2>
        <p className="text-gray-500 mb-12 text-lg">
          Powerful tools to automate your workflow and grow your client base
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl shadow-md bg-white p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
            >
              <span className="text-4xl mb-4">{card.icon}</span>
              <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-500 text-sm mb-6">{card.description}</p>
              <button className="mt-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                Start Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
