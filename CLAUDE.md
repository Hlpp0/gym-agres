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
- Stockage Blob PRIVÉ : `db/{clubs|groups|gymnasts|sessions|attendance|content}/{id}.json`, `media/{uuid}.{ext}`, `users/{uid}.json`, `users-email/{sha256(email)}.json`.
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
- Synchronisation : pull toutes les 60 s quand l'app est visible, et au retour en ligne. Les opérations refusées par le serveur (droits) sont retirées de la file.
- Catalogue : programme (RAW, fichier GETUMA_elements.xlsx, catégories C1-C3 exigées) + 4 fondamentaux GETUMA
  + catalogue complet EST (`EST`, 709 éléments extraits le 24.11.2026 des tableaux d'évaluation : Sol 2025-09, Anneaux 2025-09,
  Saut 2025-01, Reck 2025-01, Barres parallèles 2025-01, Barres asymétriques scolaires 2018-04 ; script /tmp/est/parse.py, pdfplumber).
  Champs EST : id `x{code}`, a, n (nom FR), stv (code), v (valeur B, L = liaison, ou 4 à 7), s (famille FR), i (passe par l'appui renversé).
  Fusion : un élément du programme avec le même code reçoit v/i/s ; les autres deviennent `XTRA` (x:1).
  Affichage : valeur EST (« B », « C5 ») puis « Programme C1-C2 » si exigé. Niveaux d'affichage (Évaluer, Réglages) :
  base (bases C1-C2), all (programme), est (catalogue complet). Les éléments x:1 sont proposés aux gymnastes dont la catégorie
  atteint la valeur (B pour tous) mais n'entrent dans les besoins qu'une fois commencés, et jamais dans la progression.
  Familles Sol dans l'ordre des codes 101 à 112 (FAM_ORDER) ; autres engins : familles EST (ordre `EST_FAMNUM`).
- Engins : sélecteur dans Évaluer, Groupes, Séance et Biblio (`S.engin`, gardé dans localStorage `getuma-engin`).
  Catalogue RAW : sol, anneaux, saut, reck, bp (barres parallèles), ba (barres asymétriques). Hors Sol, familles = « Éléments C1 », etc.
  PRE (prérequis) et ateliers détaillés n'existent que pour le Sol pour l'instant.
- Classement par élément : `gymnast.rk[eid]` = rang (0 = le meilleur) parmi les gymnastes à « acquis » ou « maîtrisé » ; flèches dans la page de l'élément.
- Tableau : la position de scroll des zones `.tscroll` et `.pillbar` est conservée à chaque rendu.
- Pas d'acquis implicite (essayé puis abandonné le 24.11.2026 à la demande d'Hippolyte) : `implicitOk` renvoie toujours faux.
  Progression = éléments de sa catégorie ET des catégories inférieures + bases, tous à évaluer.
- Quota Vercel Blob (offre gratuite : 10 000 lectures simples/mois) : `/api/db` garde la base en mémoire par instance et ne la relit
  que si `db/_rev.json` a changé (`touchRev` à chaque écriture, y compris comptes). Le client envoie `?rev=` et reçoit `{same:true}`
  si rien n'a changé ; poll toutes les 60 s. Utilisateur de session gardé 60 s en mémoire (`UCACHE`), liste des comptes 5 min.
- Page d'un élément (Évaluer) : accordéons par statut (non abordé en haut, maîtrisé en bas), état gardé dans `S.acc`.
  Mode « Classer » : `gymnast.rk[eid]` ordonne les gymnastes à l'intérieur de chaque statut (qui est le plus proche de réussir).
- Fiche gymnaste façon profil (avatar, catégorie, année, groupes, 3 chiffres), « Modifier le profil » repliable.
  Programme perso : `gymnast.prog[exId]` = {dos, charge, note, d} ; attribué depuis la fiche d'un exercice (null = retiré).
- Séance : plusieurs engins (`apps[]`, temps principal réparti à parts égales) + blocs libres (« Chorégraphie 15 ») avant le retour au calme.
- Présences : « Tous présents » / « Décocher les présents » (ne touchent pas aux excusés et absents).
- Affichage mobile : `.wrap` en `minmax(0,1fr)` (évite le débordement horizontal), champs à 16 px sur écran tactile (sinon zoom iPhone),
  barre du bas avec « Équipe » au lieu de « Gymnastes ». Rendu immédiat au clic, sauvegarde locale différée (saveCacheSoon).
- Statuts : 0 non abordé, 1 découverte, 2 avec aide, 3 acquis, 4 maîtrisé.
- Besoin prioritaire = élément de la catégorie pas encore acquis dont les prérequis (table PRE) sont validés.

## Bibliothèque (onglet Biblio)
- Éléments : fiche par élément. RIEN ne renvoie vers Claude : les fiches complètes sont intégrées dans `FICHE_DEF` (Roue e58 importée
  le 24.11.2026 depuis l'ancien doc) : desc, cue, obj[], pts[], phases[[phase,action,posture,regard,consigne]], rythme, preTech/prePhys[[nom,test]],
  err[[erreur,phase,cause,correction]], aide, parade, progNote, prog[], jeunes, prepaNote, prepa[[exercice,cible,dosage]], check[], checkNote, nextNote.
  Fiches intégrées (24.11.2026) : Roue e58 + 10 bases du Sol : f1 fente, f2 appui renversé contre le mur, e53 s'établir à l'appui renversé,
  e54 bougie et roulé avant, e69 roulé avant, e68 roulé avant à la station, e61 roulé arrière, e65 roulé arrière jambes tendues,
  e59 roue ¼ de tour, e60 rondade et saut en extension. Leurs postes sont dans POSTES_EL (+ détail dans POSTE_INFO).
  Programme complet (24.11.2026) : `public/data/fiches.json` {el, postes, postesEl} chargé au démarrage par `loadFiches()`
  (mis en cache hors-ligne par sw.js) : 101 fiches (tout le programme Sol, Anneaux, Reck, Barres parallèles, Barres asymétriques, Saut,
  + f3 pont, f4 gainage). Générées par /tmp/fiches/*.py (helper lib.py : fiche(), P()). Les fiches inline (FICHE_DEF) restent prioritaires.
  Fiches hors Sol plus compactes ; plusieurs descriptions d'éléments de barres ou d'anneaux sont à valider par Hippolyte (relecture du jour).
  Détail des postes d'origine : `POSTE_INFO` (par nom). « Version d'origine » = FICHE_DEF + catalogue ; le doc `content` surcharge.
- Noms et doublons (25.11.2026) : codes ajoutés aux éléments du programme qui avaient un équivalent EST (anneaux e86-e109,
  saut e41) ; e53 = 10108 (et non 10109, qui est la version tenue --) ; e65 sans code ; e70 = « Roulé en av. au siège écarté » (10602) ;
  x11006 = « Souplesse en av. sur un bras » (nom FR incomplet dans le PDF, corrigé d'après l'allemand « Bögli vw. einarmig »).
  Plusieurs éléments du programme partagent légitimement un code EST (variantes : 10606, 10106, 10901, 20206, 20207, 20304, 20306, 20301).
  Admin : nom modifiable (`content.el_X.n`, nom d'origine dans `e.n0`) et « Masquer » (`hide`) dans l'éditeur ; `syncEls()` applique
  à chaque rendu. Les éléments masqués disparaissent d'Évaluer, des besoins, des groupes et de l'arbre (l'admin les voit dans Biblio).
- Tableau des éléments (Biblio › Tableau, admin, route `biblio--table`) : nom, code, valeur, catégories, masqué, lien fiche ;
  filtres Tous / Programme / Doublons / Sans code / Modifiés / Masqués ; saisie `saveElCell`. Identité éditable aussi dans l'éditeur
  (`elIdent` : n, stv, v, c ; valeurs d'origine n0/stv0/v0/c0 dans `syncEls`). Un nom modifié REMPLACE le nom (pas de double nom
  affiché) ; à chaque export « Mes corrections », intégrer les nouveaux noms dans RAW pour qu'ils deviennent l'origine.
- Éditeur d'élément : sections dans l'ordre de la fiche affichée (identité, médias, présentation, objectifs, phases, progression,
  erreurs, exercices d'apprentissage, préparation physique, checklist, remarques de relecture).
- Arbre : panneau admin « Vérifications automatiques » (`treeChecks`) : même nom, prérequis demandé dans une catégorie plus haute,
  élément du programme C2+ sans prérequis.
- Relecture du jour : ordre Sol, Anneaux, Saut, Reck, Barres parallèles, Barres asymétriques (choix d'Hippolyte), 1 fiche par jour.
- Arbre de progression (Biblio › Arbre), refait le 25.11.2026 : canevas façon timeline Notion, flux de gauche à droite (colonne = étape).
  `treeLayout` : chaque groupe d'éléments reliés forme son propre petit arbre (empilés), ordre par barycentres (8 passes) pour limiter
  les croisements ; éléments sans lien en grille sous « Sans lien pour l'instant ». Liens = courbes de Bézier (droite → gauche).
  Admin, mode « Modifier » : glisser une case (positions dans `content.tree_{hash(engin|famille)}` = {pos:{id:[x,y]}}),
  tirer le rond bleu à droite d'une case vers un autre élément = lien (`treeLink`, boucles refusées), toucher un lien = « Supprimer le lien »,
  « Réorganiser automatiquement » efface les positions. Zoom `S.tz`. Bascule « Catalogue EST complet ».
  toucher un élément puis un autre ajoute/retire un lien (prérequis ou suivant), boucles refusées.
- Postes « Pour : » et « Utilisé pour » : seulement les éléments dont aucun prérequis (direct ou indirect) n'est déjà listé (`minimalEls`).
- Exercices de renforcement sans média : la 1re vidéo Instagram source (@get.gymnast.fit) est intégrée via l'embed officiel.
- Exercices d'apprentissage : ateliers par famille (POSTES_FAM) et par élément (POSTES_EL).
- Renforcement et mobilité : `public/data/exercices.json` (172 exercices), généré depuis la bibliothèque Obsidian
  d'Hippolyte (iCloud « 21 Bibliothèque d'exercices », textes reformulés, source @get.gymnast.fit créditée et liée).
  Les captures d'écran des vidéos ne sont PAS reprises (droits de l'auteur). Champs : id, n, orig, type, zone, niv (1-3),
  mat, dos, exec, keys, bio, var, rel {easier, same, harder}, routines, src, auteur. « ATR » remplacé par « appui renversé ».
- Renforcement conseillé pour un élément : correspondance famille → zones (FAM_ZONES), niveaux 1-2.

## Édition de la bibliothèque (admin)
- Collection `content` : lisible par tous les comptes actifs, modifiable par l'admin seulement. Clés :
  `el_{id}` (desc, pts[], err[], parade, fiche, pre[], postes[], media[]), `po_{pid}` (n, desc, fam, mat, steps[], crit[], secu, media[]),
  `ex_{id}` (n, dos, mat, exec[], keys[], bio, media[]). Ces documents surchargent les valeurs par défaut du code.
- Prérequis effectifs : `preOf(id)` (content.pre sinon table PRE). Éléments suivants = inverse (`nextOf`). Ajouter un suivant X
  à E écrit E dans les prérequis de X. Ces liens servent aussi au calcul des besoins.
- Postes : id `p` + hash du texte pour les postes d'origine (POSTES_EL / POSTES_FAM), `n…` pour les postes créés.
- Médias : `{url, cap, type?}`. Liens intégrés : YouTube (youtube-nocookie), Vimeo, Instagram, TikTok, Google Drive ; image/GIF/vidéo directe.
  Fichiers ≤ 4 Mo via `/api/media` ; plus lourds (≤ 100 Mo) : envoi direct navigateur → Blob privé avec `public/vendor/blob-client.js`
  (bundle esbuild de `@vercel/blob/client`) et jeton délivré par `/api/media/upload` (admin). Lecture : plages transmises au Blob.
  Ancienne règle : `/api/media` (POST admin, 4 Mo max, jpg/png/webp/gif/mp4/webm/mov ; photos réduites à 1600 px côté app),
  servis seulement aux comptes actifs, avec lecture par plages (vidéo iPhone). Seuls les liens https:// ou /api/media sont acceptés.

## Boucle de relecture (fiches)
- Relecture du jour (Biblio, admin) : `reviewQueue()` = fiches de FICHE_DEF (ordre des codes) suivies de leurs postes détaillés.
  « Relue ✓ » écrit `ok: AAAA-MM-JJ` dans le doc content de la fiche ; « Une autre » saute la fiche pour la journée (localStorage
  `getuma-revskip`). Pastille orange sur l'onglet Biblio tant qu'aucune fiche n'a été relue aujourd'hui. Bandeau « Pas encore relue »
  sur les fiches de la file. Les nouvelles fiches ajoutées à FICHE_DEF entrent automatiquement dans la file.
- Chaque fiche (élément, poste, exercice) a un champ admin `rev` « Remarques de relecture » dans l'éditeur.
- Biblio (admin) › « Mes corrections » : télécharge ou copie un JSON {fiches: {clé: {nom, modifie, origine}}}.
  Hippolyte l'envoie à Claude, qui : 1) intègre les fiches corrigées dans FICHE_DEF/POSTE_INFO (elles deviennent la version
  d'origine), 2) tire de ses corrections les règles générales (vocabulaire, longueur, ordre, contenu manquant) et les applique
  aux autres fiches, 3) note ces règles ici (section « Règles de rédaction des fiches »).

## Règles de rédaction des fiches
- (à compléter à partir des corrections d'Hippolyte)

## Conventions importantes
- Langue : tout en français. Jamais de tiret long (em dash) dans les textes.
- Terminologie : "appui renversé" (jamais ATR ou Handstand).
- Niveaux de compétition : C1 à C7 (jamais K1/K2 ou "catégorie 3").
- Le symbole `--` dans un nom d'élément = tenue 2 secondes obligatoire (champ `h` dans le catalogue).
- Données des gymnastes (mineurs) : décision du 24.11.2026, données MINIMALES (Hippolyte n'utilise que le prénom + l'année de naissance).
  Champs de base : `prenom`, `nom` (facultatif), `annee` (AAAA, sert à voir quand un gymnaste change de groupe), `cat`, `fsg`.
  Champs étendus masqués par défaut (Réglages › Champs étendus, localStorage `getuma-extra`) : `naissance` (AAAA-MM-JJ), `bdns`,
  `adresse`, `tel1`, `tel2`, et l'export BDNS. `yearOf(g)` lit `annee` sinon l'année de `naissance`. `name` = prénom + nom (affichage).
  Visibles uniquement par les coachs des sociétés du gymnaste. Ne rien ajouter de plus sans besoin réel (nLPD).
- BDNS mis de côté pour l'instant (24.11.2026) ; excuses, retards et départs anticipés dans Présences restent utilisés.
- Tableau des infos (Gymnastes › Tableau des infos) : édition en ligne cellule par cellule + import par copier-coller depuis Excel.
- Tri des gymnastes (liste et tableau) : prénom, nom, âge (date ou année), niveau, progression, besoins ; 2e clic = sens inverse ;
  filtres par niveau et par année de naissance. Import collé : Prénom, Nom, Année (ou date), Niveau, N° FSG (+ champs étendus si activés).
  Choix gardé dans localStorage `getuma-sort`. Valeurs vides toujours en fin de liste. Dans le tableau, l'ordre est figé pendant la saisie
  (recalculé seulement quand le tri change ou à l'ouverture du tableau).

## Mémoire continue
À chaque session, si une décision technique est prise, une convention est établie,
un bug est résolu, ou une nouvelle fonctionnalité est implémentée :
→ Mettre à jour ce fichier CLAUDE.md en conséquence.
