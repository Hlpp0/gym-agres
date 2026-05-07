import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions légales — GETUMA',
  description: 'Mentions légales du site GETUMA, plateforme pédagogique de référence pour la gymnastique aux agrès suisse.',
}

export default function MentionsLegales() {
  return (
    <main className="min-h-screen py-14">
      <div className="max-w-3xl mx-auto px-6 md:px-10">

        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-10">
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Accueil
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Mentions légales</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-14">
          Mentions légales
        </h1>

        <div className="space-y-12 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Éditeur</h2>
            <p>
              GETUMA est un projet indépendant à but non lucratif, basé en Suisse.
              Il n'est ni affilié ni mandaté par la Fédération suisse de
              gymnastique (STV/FSG).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hébergement</h2>
            <p>
              Ce site est hébergé par Vercel Inc., 340 Pine Street, Suite 900,
              San Francisco, CA 94104, États-Unis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Propriété intellectuelle
            </h2>
            <p className="mb-3">
              Les fiches pédagogiques publiées sur GETUMA sont basées sur les
              documents officiels de l'Elementskala Turnen (EST), publiés par
              la Fédération suisse de gymnastique (STV/FSG). Ces documents sont
              la propriété de leurs auteurs respectifs.
            </p>
            <p>
              Les contenus pédagogiques originaux (décompositions, conseils,
              progressions) rédigés par GETUMA sont la propriété de GETUMA et
              sont mis à disposition à des fins éducatives.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sources officielles STV/FSG
            </h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-gray-300 select-none mt-0.5">—</span>
                <span>
                  Catalogue officiel des éléments :{' '}
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
                <span>
                  Site fédéral :{' '}
                  <a
                    href="https://www.stv-fsg.ch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 underline underline-offset-2 hover:text-gray-500 transition-colors"
                  >
                    stv-fsg.ch
                  </a>
                </span>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  )
}
