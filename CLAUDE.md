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
- `public/sw.js` + `public/manifest.json` + icônes : PWA installable, coquille disponible hors-ligne. Monter la version `V` de sw.js à chaque changement d'index.html.
- `lib/blobdb.ts` : lecture, écriture, mise à jour conditionnelle (`ifMatch`) des documents JSON du Blob privé.
- `lib/auth.ts` : comptes (scrypt), session en cookie HttpOnly signé HMAC (`gsess`, 30 jours), version de session `sv` pour couper les sessions.
- Routes : `/api/auth/{signup,login,logout,me,password}`, `/api/admin` (admin seulement), `/api/db` (données filtrées par droits).
- Stockage Blob PRIVÉ : `db/{clubs|groups|gymnasts|sessions}/{id}.json`, `users/{uid}.json`, `users-email/{sha256(email)}.json`.
- Variables requises : `BLOB_READ_WRITE_TOKEN`, `SESSION_SECRET` (64 caractères hex), `ADMIN_EMAIL` (emails admin séparés par des virgules).
  `CLUB_CODE` n'est plus utilisé depuis le passage aux comptes.

## Comptes et droits
- Inscription libre (email + mot de passe 10 caractères min.) ; le compte reste « en attente » jusqu'à validation par un admin.
- Un email listé dans `ADMIN_EMAIL` devient admin et actif dès l'inscription.
- Admin : voit tout, crée sociétés et groupes, valide les comptes, rattache les coachs aux sociétés, génère un mot de passe provisoire.
- Coach : voit seulement les sociétés de son compte (`user.clubs`), modifie gymnastes et séances de leurs groupes, ne crée ni société ni groupe.
- Protection CSRF : toute requête qui modifie doit envoyer l'en-tête `x-getuma: 1`.
- Verrouillage 15 min après 5 mots de passe faux. Pas d'envoi d'email pour l'instant : mot de passe oublié = l'admin en génère un nouveau.
- Migration : à la première ouverture par un admin, les groupes sans société sont rattachés à une société « Ma société ».

## Fonctionnement côté app
- Cache local (localStorage) + file d'attente des modifications (`getuma-outbox`) : on évalue hors-ligne, l'envoi part au retour du réseau.
- Synchronisation : pull toutes les 20 s quand l'app est visible, et au retour en ligne. Les opérations refusées par le serveur (droits) sont retirées de la file.
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
