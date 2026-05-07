import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — GETUMA',
  description: 'Politique de confidentialité de GETUMA. Données collectées, cookies Google AdSense, droits LPD et RGPD.',
}

export default function PolitiqueDeConfidentialite() {
  return (
    <main className="min-h-screen py-14">
      <div className="max-w-3xl mx-auto px-6 md:px-10">

        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-10">
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Accueil
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Politique de confidentialité</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-14">
          Politique de confidentialité
        </h1>

        <div className="space-y-12 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Données collectées
            </h2>
            <p>
              GETUMA ne collecte aucune donnée personnelle directement. Il n'y
              a pas de formulaire d'inscription, de compte utilisateur, ni de
              système de tracking propriétaire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Hébergement
            </h2>
            <p>
              Le site est hébergé sur Vercel, qui peut collecter des logs
              serveur standards (adresse IP, user agent, pages visitées) à des
              fins techniques et de sécurité. Pour plus d'informations,
              consulter la{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 underline underline-offset-2 hover:text-gray-500 transition-colors"
              >
                politique de confidentialité de Vercel
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Publicité et cookies
            </h2>
            <p className="mb-3">
              Ce site utilise Google AdSense pour afficher des publicités.
              Google AdSense peut déposer des cookies publicitaires sur votre
              appareil afin de personnaliser les annonces en fonction de vos
              centres d'intérêt.
            </p>
            <p>
              Pour en savoir plus ou gérer vos préférences publicitaires,
              consultez la{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 underline underline-offset-2 hover:text-gray-500 transition-colors"
              >
                politique de confidentialité de Google
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Vos droits
            </h2>
            <p>
              Conformément à la loi fédérale suisse sur la protection des
              données (LPD) et au Règlement général sur la protection des
              données (RGPD), vous disposez d'un droit d'accès, de
              rectification et de suppression des données vous concernant.
              Pour exercer ces droits, utilisez le bouton{' '}
              <span className="font-medium text-gray-900">Modifier</span> sur
              chaque fiche ou contactez-nous via GitHub.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
