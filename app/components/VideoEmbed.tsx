function extractYouTubeId(value: string): string | null {
  const trimmed = value.trim()
  // Already a bare ID (11 chars, YouTube ID charset)
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed
  // youtu.be/ID
  const short = trimmed.match(/youtu\.be\/([\w-]{11})/)
  if (short) return short[1]
  // youtube.com/watch?v=ID or /embed/ID
  const long = trimmed.match(/(?:v=|\/embed\/)([\w-]{11})/)
  if (long) return long[1]
  return null
}

export default function VideoEmbed({
  value,
  title,
}: {
  value: string
  title: string
}) {
  const id = extractYouTubeId(value)
  if (!id) return null

  return (
    <div className="my-8 rounded-xl overflow-hidden border border-gray-100">
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="w-full h-full"
        />
      </div>
    </div>
  )
}
