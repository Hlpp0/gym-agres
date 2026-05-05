export default async function AgresPage({ params }: { params: Promise<{ agres: string }> }) {
  const { agres } = await params
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Agrès : {agres}</h1>
      <p className="text-gray-500">Tous les éléments de cet agrès.</p>
    </main>
  )
}