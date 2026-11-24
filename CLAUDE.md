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
- Routes : `/api/auth/{signup,login,logout,me,password,profile}`, `/api/admin` (admin seulement), `/api/db` (données filtrées par droits).
- Stockage Blob PRIVÉ : `db/{clubs|groups|gymnasts|sessions|attendance}/{id}.json`, `users/{uid}.json`, `users-email/{sha256(email)}.json`.
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
- Gymnastes multi-groupes : champ `groupIds` (l'ancien `groupId` reste lu en secours). Un gymnaste peut être dans des groupes
  de plusieurs sociétés ; ses évaluations sont communes. Un coach ne reçoit que les `groupIds` de ses sociétés, et le serveur
  conserve les autres lors des modifications. Un coach qui « supprime » un gymnaste présent ailleurs le retire seulement de ses groupes.

## Présences et BDNS
- Statut par gymnaste dans `attendance.st[gid]` = {s: p|e|a (présent, excusé, absent), m: motif, late: min, early: min}.
  `present[gid]` reste à 1 seulement pour « p » (sert à l'export BDNS). Ancien format (present seul) toujours lu.
- Liste triée par nom de famille. Enregistrer une séance crée/complète la feuille de présences du jour (heure, durée, moniteurs).
- Groupes de travail et génération de séance retirent les excusés et absents du jour ; retard et départ anticipé affichés à côté du nom.
- Motif d'excuse : rester générique (« Santé »), jamais de détail médical (donnée sensible nLPD).
- Onglet Présences : un document `attendance/{groupId}_{date}` (heure, durée, lieu, gymnastes présents, moniteurs présents).
- Pas d'API publique BDNS : export CSV au format d'importation du contrôle des présences J+S
  (N° PERSONNEL;FONCTION;DATE;TYPE D'ACTIVITE;HEURE;DUREE;LIEU, séparateur `;`, UTF-8 avec BOM), import manuel dans la BDNS.
- N° personnel BDNS : champ `bdns` sur les gymnastes et sur les comptes (Réglages › Mon compte). Les lignes sans numéro sont ignorées et signalées.
- À vérifier avec un vrai import : libellés FONCTION (« Participant », « Moniteur »), TYPE (« Entraînement »), durées admises.

## Fonctionnement côté app
- Cache local (localStorage) + file d'attente des modifications (`getuma-outbox`) : on évalue hors-ligne, l'envoi part au retour du réseau.
- Synchronisation : pull toutes les 20 s quand l'app est visible, et au retour en ligne. Les opérations refusées par le serveur (droits) sont retirées de la file.
- Catalogue : éléments Sol issus du fichier GETUMA_elements.xlsx (codes EST/STV), affichage par défaut des bases C1-C2
  + 4 fondamentaux GETUMA (fente avant, appui renversé contre le mur, pont, gainage I).
- Engins : sélecteur dans Évaluer, Groupes, Séance et Biblio (`S.engin`, gardé dans localStorage `getuma-engin`).
  Catalogue RAW : sol, anneaux, saut, reck, bp (barres parallèles), ba (barres asymétriques). Hors Sol, familles = « Éléments C1 », etc.
  PRE (prérequis) et ateliers détaillés n'existent que pour le Sol pour l'instant.
- Classement par élément : `gymnast.rk[eid]` = rang (0 = le meilleur) parmi les gymnastes à « acquis » ou « maîtrisé » ; flèches dans la page de l'élément.
- Tableau : la position de scroll des zones `.tscroll` et `.pillbar` est conservée à chaque rendu.
- Statuts : 0 non abordé, 1 découverte, 2 avec aide, 3 acquis, 4 maîtrisé.
- Besoin prioritaire = élément de la catégorie pas encore acquis dont les prérequis (table PRE) sont validés.

## Bibliothèque (onglet Biblio)
- Éléments : fiche par élément du catalogue (codes, famille, prérequis, éléments suivants, ateliers, renforcement conseillé).
  Lien vers la fiche technique complète quand elle existe (table FICHES).
- Exercices d'apprentissage : ateliers par famille (POSTES_FAM) et par élément (POSTES_EL).
- Renforcement et mobilité : `public/data/exercices.json` (172 exercices), généré depuis la bibliothèque Obsidian
  d'Hippolyte (iCloud « 21 Bibliothèque d'exercices », textes reformulés, source @get.gymnast.fit créditée et liée).
  Les captures d'écran des vidéos ne sont PAS reprises (droits de l'auteur). Champs : id, n, orig, type, zone, niv (1-3),
  mat, dos, exec, keys, bio, var, rel {easier, same, harder}, routines, src, auteur. « ATR » remplacé par « appui renversé ».
- Renforcement conseillé pour un élément : correspondance famille → zones (FAM_ZONES), niveaux 1-2.

## Conventions importantes
- Langue : tout en français. Jamais de tiret long (em dash) dans les textes.
- Terminologie : "appui renversé" (jamais ATR ou Handstand).
- Niveaux de compétition : C1 à C7 (jamais K1/K2 ou "catégorie 3").
- Le symbole `--` dans un nom d'élément = tenue 2 secondes obligatoire (champ `h` dans le catalogue).
- Données des gymnastes (mineurs) : prénom, nom, date de naissance, niveau, N° FSG, N° BDNS, adresse, téléphones des parents.
  Champs `prenom`, `nom`, `naissance` (AAAA-MM-JJ), `cat`, `fsg`, `bdns`, `adresse`, `tel1`, `tel2` ; `name` = prénom + nom (affichage).
  Visibles uniquement par les coachs des sociétés du gymnaste. Ne rien ajouter de plus sans besoin réel (nLPD).
- Tableau des infos (Gymnastes › Tableau des infos) : édition en ligne cellule par cellule + import par copier-coller depuis Excel.
- Tri des gymnastes (liste et tableau) : prénom, nom, âge, niveau, progression, besoins ; 2e clic = sens inverse ; filtre par niveau.
  Choix gardé dans localStorage `getuma-sort`. Valeurs vides toujours en fin de liste. Dans le tableau, l'ordre est figé pendant la saisie
  (recalculé seulement quand le tri change ou à l'ouverture du tableau).

## Mémoire continue
À chaque session, si une décision technique est prise, une convention est établie,
un bug est résolu, ou une nouvelle fonctionnalité est implémentée :
→ Mettre à jour ce fichier CLAUDE.md en conséquence.
