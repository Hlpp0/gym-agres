@AGENTS.md

# CLAUDE.md : Contexte du projet GETUMA

## C'est quoi GETUMA ?
GETUMA Coach : outil de gestion d'équipe pour coachs de gymnastique aux agrès (STV/FSG).
Évaluer qui sait faire quoi, former des groupes de travail par besoin, générer une séance, suivre la progression.
Domaine : getuma.app (projet Vercel `gym-agres`, auto-deploy sur push `main`).

Le catalogue public de fiches (ancienne version du site) a été retiré le 23.11.2026 au profit de l'app.
Les fiches Markdown restent dans `content/elements/` (non utilisées par l'app pour l'instant).
L'historique Git conserve l'ancien site (dernier commit : e9f782c).

## Architecture
- Next.js 16 (App Router) utilisé seulement pour l'API et l'hébergement.
- `public/index.html` : l'app entière (HTML + CSS + JS vanilla, sans build). Servie sur `/` via un rewrite dans `next.config.ts`.
- `public/sw.js` + `public/manifest.json` + icônes : PWA installable, coquille disponible hors-ligne.
- `app/api/db/route.ts` : API GET (tout lire) / POST (lot d'opérations set, patch, del).
- Stockage : Vercel Blob PRIVÉ, un JSON par document : `db/{groups|gymnasts|sessions|club}/{id}.json`.
  Les `patch` font lecture, fusion profonde, puis écriture conditionnelle (`ifMatch`) pour éviter d'écraser un autre coach.
- Accès : code club partagé, variable d'environnement `CLUB_CODE`, envoyé par l'app dans l'en-tête `x-club-code`.
- Variables requises : `BLOB_READ_WRITE_TOKEN` (créée en connectant le Blob store au projet), `CLUB_CODE`.

## Fonctionnement côté app
- Cache local (localStorage) + file d'attente des modifications (`getuma-outbox`) : on évalue hors-ligne, l'envoi part au retour du réseau.
- Synchronisation : pull toutes les 20 s quand l'app est visible, et au retour en ligne.
- Catalogue : éléments Sol issus du fichier GETUMA_elements.xlsx (codes EST/STV), affichage par défaut des bases C1-C2
  + 4 fondamentaux GETUMA (fente avant, appui renversé contre le mur, pont, gainage I).
- Statuts : 0 non abordé, 1 découverte, 2 avec aide, 3 acquis, 4 maîtrisé.
- Besoin prioritaire = élément de la catégorie pas encore acquis dont les prérequis (table PRE) sont validés.

## Conventions importantes
- Langue : tout en français. Jamais de tiret long (em dash) dans les textes.
- Terminologie : "appui renversé" (jamais ATR ou Handstand).
- Niveaux de compétition : C1 à C7 (jamais K1/K2 ou "catégorie 3").
- Le symbole `--` dans un nom d'élément = tenue 2 secondes obligatoire (champ `h` dans le catalogue).
- Données de mineurs : prénom + initiale du nom et catégorie seulement.

## Mémoire continue
À chaque session, si une décision technique est prise, une convention est établie,
un bug est résolu, ou une nouvelle fonctionnalité est implémentée :
→ Mettre à jour ce fichier CLAUDE.md en conséquence.
