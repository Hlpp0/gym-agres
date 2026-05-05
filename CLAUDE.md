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
Chaque fiche a un YAML frontmatter avec : tags, engin, categorie, famille, code_est, code_stv, url_stv.

## Conventions importantes
- Langue : tout en français
- Terminologie : "Stans" ou "appui renversé sur les mains" (jamais ATR ou Handstand)
- Niveaux de compétition : C1 à C7 (jamais K1/K2 ou "catégorie 3")
- Le symbole `--` dans un nom d'élément = tenue 2 secondes obligatoire

## Priorités V1 en cours
- Scroll-aware header (disparaît au scroll down, réapparaît au scroll up)
- Composant VideoEmbed (champ frontmatter : video_youtube)
- Bouton Edit sur les fiches (lien GitHub)
- Page /agres/[agres] fonctionnelle
- Google AdSense (après ~10 fiches live + pages légales)

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
