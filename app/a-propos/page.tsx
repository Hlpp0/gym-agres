import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'À propos — GETUMA',
  description:
    'Plateforme pédagogique de référence pour la gymnastique aux agrès suisse (STV/FSG). Fiches EST, entraîneurs, gymnastes.',
}

export default function APropos() {
  return (
    <main className="min-h-screen py-14">
      <div className="max-w-3xl mx-auto px-6 md:px-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-10">
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Accueil
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">À propos</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-14">
          À propos de GETUMA
        </h1>

        <div className="space-y-12 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              C'est quoi GETUMA ?
            </h2>
            <p>
              GETUMA est une plateforme pédagogique de référence pour la
              gymnastique aux agrès suisse (STV/FSG). Elle rassemble les
              éléments officiels de l'Elementskala Turnen (EST) sous forme
              de fiches pédagogiques structurées, accessibles à tous les
              gymnastes et entraîneurs suisses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pour qui ?
            </h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-gray-300 select-none mt-0.5">—</span>
                <span>
                  Gymnastes qui veulent comprendre les éléments qu'ils
                  apprennent
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-300 select-none mt-0.5">—</span>
                <span>
                  Entraîneurs qui cherchent une référence pédagogique
                  structurée
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-300 select-none mt-0.5">—</span>
                <span>
                  Clubs qui veulent un outil de formation cohérent avec le
                  système STV/FSG
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sources officielles
            </h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-gray-300 select-none mt-0.5">—</span>
                <span>
                  EST (Elementskala Turnen) par engin — référence officielle
                  STV
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-300 select-none mt-0.5">—</span>
                <span>
                  Catalogue STV :{' '}
                  <a
                    href="https://elements.stv-fsg.ch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 underline underline-offset-2 hover:text-gray-500 transition-colors"
                  >
                    elements.stv-fsg.ch
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-gray-300 select-none mt-0.5">—</span>
                <span>Programme de compétition 2026</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact & Contributions
            </h2>
            <p>
              Le projet est en développement continu. Pour toute suggestion
              ou correction, utilise le bouton{' '}
              <span className="font-medium text-gray-900">Modifier</span> sur
              chaque fiche — il ouvre directement le fichier sur GitHub.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
