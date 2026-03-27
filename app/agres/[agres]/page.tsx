export default function AgresPage({ params }: { params: { agres: string } }) {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Agrès : {params.agres}</h1>
      <p className="text-gray-500">Tous les éléments de cet agrès.</p>
    </main>
  )
}