export default function ElementPage({ params }: { params: { slug: string } }) {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Élément : {params.slug}</h1>
      <p className="text-gray-500">Fiche détaillée de l'élément.</p>
    </main>
  )
}