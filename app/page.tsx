export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Section héro */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Gymnastique aux Agrès
        </h1>
        <p className="text-xl text-gray-500 mb-12">
          Catalogue pédagogique des éléments.
          Apprendre, comprendre, progresser.
        </p>

        {/* Cartes de navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <a
            href="/elements"
            className="block p-6 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200"
          >
            <h2 className="text-2xl font-semibold mb-2">📖 Éléments</h2>
            <p className="text-gray-500">
              Catalogue complet des éléments par agrès et niveau de difficulté.
            </p>
          </a>

          <a
            href="/glossaire"
            className="block p-6 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200"
          >
            <h2 className="text-2xl font-semibold mb-2">📚 Glossaire</h2>
            <p className="text-gray-500">
              Terminologie et définitions de la gymnastique aux agrès.
            </p>
          </a>

        </div>
      </div>
    </main>
  );
}