@AGENTS.md

# CLAUDE.md — Contexte du projet GETUMA

## C'est quoi GETUMA ?
Plateforme pédagogique de référence pour la gymnastique aux agrès suisse (STV/FSG).
Site public : gym-agres-git-main-hlpp0s-projects.vercel.app
Repo : gym-agres (Next.js App Router, déployé sur Vercel)

## Stack technique
- Next.js App Router (pas de dossier `src/`) — chemins : `app/...`
- Tailwind CSS + @tailwindcss/typography
- shadcn/ui (composants)
- Contenu : Markdown avec YAML frontmatter dans `content/elements/[agres]/`
- `lib/elements.ts` : lecture des fichiers, normalisation des slugs, conversion wikilinks Obsidian → Markdown standard, callouts Obsidian → texte bold avec emoji
- `gray-matter`, `next-mdx-remote`, `react-markdown`, `remark-gfm` installés
- Deploy : Vercel auto-deploy sur push main

## Structure des pages
- `/` — page d'accueil
- `/elements` — catalogue complet
- `/elements/[slug]` — fiche d'un élément
- `/agres/[agres]` — éléments filtrés par engin
- `/a-propos` — page à propos

## Contenu
Les fiches Markdown sont rédigées dans Obsidian et poussées via Git.
Chaque fiche a un YAML frontmatter avec : tags, engin, categorie, structure de mouvement, code_est, code_stv, url_stv.

## État du contenu
- 63 fiches squelettes C1 créées (toutes les 6 engins)
- 7 fiches complètes : Bougie, Saut en extension (sol),
  Pas chassé transversal en avant, Pas chassé latéral,
  Roulé en avant à la station, Roulé en arrière,
  Roulé de côté avec jambes écartées, Poirier
- Vault Obsidian pointé sur ~/Developer/gym-agres/content/elements
- Workflow : Obsidian → git push → Vercel auto-deploy

## Conventions importantes
- Langue : tout en français
- Terminologie : "Stans" ou "appui renversé sur les mains" (jamais ATR ou Handstand)
- Niveaux de compétition : C1 à C7 (jamais K1/K2 ou "catégorie 3")
- Le symbole `--` dans un nom d'élément = tenue 2 secondes obligatoire

## Priorités V1 en cours
- Composant VideoEmbed (champ frontmatter : video_youtube)
- Google AdSense (après ~10 fiches live + pages légales)

## Décisions techniques prises
- lib/agres.ts : source de vérité unique pour les 6 engins (slug, label, couleur)
- Slugs normalisés en minuscules sans accents dans lib/elements.ts
  — `normalizeSlug()` : NFD decomposition + strip `\p{M}` + lowercase + tirets
  — utilisée dans readElementsFromDir, getRecentElements, getElementBySlug, convertWikilinks
- Nav.tsx en Client Component (usePathname pour lien actif)
  — position fixed, scroll-aware (translateY -100% au scroll bas, réapparaît au scroll haut)
  — layout.tsx : pt-16 sur body pour compenser la hauteur du header fixe
- SSG (generateStaticParams) sur toutes les pages engin
- Layout max-w-screen-xl pour respirer sur grands écrans
- scripts/generate_skeletons.py conservé pour générer C2, C3...
- getElementBySlug retourne filePath (chemin relatif, nom de fichier original avec accents)
  — utilisé pour construire le lien GitHub edit sur chaque fiche
- app/not-found.tsx : page 404 personnalisée
- Fichier Mühlabschwung renommé en ASCII : Muehlabschwung-durchschub-stutz-dorsal.md

## Mémoire continue
À chaque session, si une décision technique est prise, une convention est établie,
un bug est résolu, ou une nouvelle fonctionnalité est implémentée :
→ Mettre à jour ce fichier CLAUDE.md en conséquence.

Exemples de choses à noter ici :
- Nouvelle dépendance installée
- Convention de code adoptée
- Bug connu et sa solution
- Décision d'architecture (ex: pourquoi on a choisi X plutôt que Y)
- Fonctionnalité implémentée et comment elle fonctionne
