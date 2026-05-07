#!/usr/bin/env python3
"""Génère les squelettes de fiches Markdown C1 — ne jamais écraser l'existant."""

import os

TEMPLATE = """\
---
tags:
  - {engin_slug}
  - {famille}
  - C1
engin: {engin_label}
categorie: C1
structure de mouvement:
code_est: "{code_est}"
code_stv: ""
url_stv: ""
---

# {titre}

> **Engin :** {engin_label} · **Catégorie :** C1 · **Famille :** {famille}
> **Code EST :** {code_est}

---

> [!info] Présentation
> *À compléter*

---

## 1. Analyse Technique
### 🎯 Objectifs pédagogiques
### 🧠 Points clés techniques
### 📷 Décomposition du mouvement

## 2. Prérequis
### 💪 Prérequis physiques
### 🤸 Prérequis techniques

## 3. Erreurs fréquentes et corrections

## 4. Postes d'apprentissage

## 5. Préparation physique

## 6. Progressions

## 7. Checklist de validation
> Les critères en **gras** sont les critères officiels STV/EST.

## 8. Éléments suivants
*À compléter*

---
*Source : EST {engin_label} · Fiche squelette générée automatiquement — à compléter*
"""

# (filename, titre, code_est, famille)
ELEMENTS = {
    ("sol", "Sol", "content/elements/sol"): [
        ("Saut-en-extension-avec-1-2-tour.md",              "Saut en extension avec 1/2 tour",                                              "10502", "saut"),
        ("Saut-ecarté-transversal.md",                      "Saut écarté transversal (départ pieds joints)",                                "10508", "saut"),
        ("Pas-sautillé.md",                                 "Pas sautillé",                                                                 "10513", "saut"),
        ("Saut-ecarté-transversal-jambes-jointes.md",       "Saut écarté transversal à la station jambes jointes",                          "10516", "saut"),
        ("Saut-ecarté-transversal-jambes-jointes-1-4-tour.md","Saut écarté transversal à la station jambes jointes avec 1/4 tour",          "10517", "saut"),
        ("Saut-de-course.md",                               "Saut de course",                                                               "10526", "saut"),
        ("Roulé-en-avant-au-siège-ecarté.md",               "Roulé en avant au siège écarté",                                               "10602", "roulé"),
        ("Roulé-en-avant-sans-aide-des-mains.md",           "Roulé en avant sans aide des mains",                                           "10603", "roulé"),
        ("Roulé-en-arrière-assis-sur-les-talons.md",        "Roulé en arrière arrivée assis sur les talons",                                "10619", "roulé"),
        ("Roulé-en-arrière-appui-facial.md",                "Roulé en arrière à l'appui facial",                                            "10620", "roulé"),
        ("Cercle-d-une-jambe.md",                           "Cercle d'une jambe par l'extérieur",                                           "10801", "cercle"),
        ("Roue.md",                                         "Roue",                                                                         "10901", "renversement-lateral"),
    ],
    ("saut", "Saut", "content/elements/saut"): [
        ("Saut-en-extension.md",                            "Saut en extension",                                                            "30101", "saut-de-base"),
        ("Saut-ecarté-latéral.md",                          "Saut écarté latéral",                                                          "30105", "saut-de-base"),
        ("Saut-groupé.md",                                  "Saut groupé",                                                                  "30107", "saut-de-base"),
        ("Renversement-latéral-1-4-tour.md",                "Renversement latéral avec 1/4 tour contre l'obstacle",                         "30608", "renversement-saut"),
    ],
    ("anneaux", "Anneaux", "content/elements/anneaux"): [
        ("Balancé-arrière-saut-station.md",                 "Balancé en arrière et sauter à la station",                                    "20106", "balancement"),
        ("Balancé-avant-élever-suspension-mi-renversée.md", "Balancé en avant et s'élever corps carpé à la suspension mi-renversée",        "20201", "balancement"),
        ("Balancé-arrière-élever-groupé-suspension.md",     "Balancé en arrière s'élever corps groupé bras pliés suspension mi-renversée",  "20205", "balancement"),
        ("Balancé-suspension-fléchie-abaisser.md",          "Balancé en suspension fléchie et s'abaisser à la suspension",                  "20309", "balancement"),
        ("Balancé-appui-fléchi-abaisser.md",                "Balancé à l'appui fléchi et s'abaisser à la suspension",                       "20310", "balancement"),
        ("Balancé-appui-fléchi-demi-tour-abaisser.md",      "Balancé à l'appui fléchi avec 1/2 tour et s'abaisser",                         "20311", "balancement"),
        ("Balancé-arrière-établissement-suspension-fléchie.md","Balancé en arrière et établissement à la suspension fléchie",               "20501", "balancement"),
        ("Balancé-suspension-mi-renversée-bascule.md",      "Balancé en suspension mi-renversée et bascule à l'appui fléchi",               "20601", "balancement"),
        ("Dislocation-arrière.md",                          "Dislocation en arrière dans le balancé en arrière",                            "20701", "balancement"),
    ],
    ("reck", "Reck", "content/elements/reck"): [
        ("Saut-appui-facial-minitrampoline.md",             "Du minitrampoline sauter à l'appui facial",                                    "40101", "balancement"),
        ("Siège-ecarté-demi-tour-appui-facial.md",          "Du siège écarté transversal 1/2 tour à l'appui facial",                        "40105", "balancement"),
        ("Elan-avant-suspension.md",                        "Elan en suspension en avant",                                                  "40128", "balancement"),
        ("Elan-arrière-saut-station.md",                    "Elancé en suspension en arrière et saut à la station",                         "40129", "balancement"),
        ("Crocher-jarret-établir-avant.md",                 "Crocher le jarret et s'établir en avant",                                      "40201", "tour-d-appui"),
        ("Siège-ecarté-abaisser-jarret.md",                 "Du siège écarté transversal s'abaisser en arrière en crochant le jarret",       "40202", "tour-d-appui"),
        ("Siège-ecarté-jambe-tendue-abaisser.md",           "Du siège écarté jambe tendue entre les prises s'abaisser en arrière",           "40203", "tour-d-appui"),
        ("Tour-appui-avant-groupé.md",                      "Tour d'appui en avant groupé",                                                 "40207", "tour-d-appui"),
        ("Elan-circulaire-arrière-jarret.md",               "Elan circulaire en arrière par le jarret",                                     "40401", "tour-d-appui"),
        ("Elan-circulaire-talons.md",                       "Elan circulaire en avant ou en arrière par les talons",                        "40402", "tour-d-appui"),
        ("Elan-circulaire-groupé.md",                       "Elan circulaire groupé en avant ou en arrière pieds sur la barre",             "40403", "tour-d-appui"),
        ("Elan-circulaire-assis-libre-arrière.md",          "Elan circulaire assis libre en arrière",                                       "40319", "tour-d-appui"),
        ("Mühlabschwung-durchschub-stütz-dorsal.md",        "Du siège écarté transversal s'abaisser en arrière et bascule à l'appui dorsal","40321", "tour-d-appui"),
    ],
    ("barres-paralleles", "Barres parallèles", "content/elements/barres-paralleles"): [
        ("Siège-transversal-devant-main.md",                "Siège transversal devant une main",                                            "50101", "balance"),
        ("Siège-ecarté-derrière-prises.md",                 "Siège écarté derrière les prises",                                             "50102", "balance"),
        ("Siège-ecarté-devant-prises.md",                   "Siège écarté devant les prises",                                               "50103", "balance"),
        ("Siège-cheval-derrière-main.md",                   "Siège à cheval derrière une main",                                             "50104", "balance"),
        ("Station-accroupie.md",                            "Station accroupie derrière une main jambe levée horizontalement",              "50201", "renversement-statique"),
        ("Saut-appui-renversé-épaules.md",                  "Du minitrampoline saut à l'appui renversé sur les épaules --",                 "50208", "renversement-statique"),
        ("Sortie-faciale.md",                               "Sortie faciale à la station transversale",                                     "50401", "sortie"),
        ("Elancer-avant-écarter-jambe.md",                  "Elancer en avant écarter la jambe rebondir sur les barres",                    "50501", "balancement"),
        ("Bascule-courue.md",                               "Bascule courue",                                                               "50801", "balancement"),
        ("Elancer-arrière-appui-fléchi.md",                 "Elancer en arrière à l'appui fléchi puis élancer en avant en suspension brachiale", "50901", "balancement"),
    ],
    ("barres-asymetriques", "Barres asymétriques", "content/elements/barres-asymetriques"): [
        ("Appui-facial.md",                                 "Appui facial",                                                                 "60101", "balancement"),
        ("Appui-dorsal.md",                                 "Appui dorsal",                                                                 "60102", "balancement"),
        ("Siège-transversal.md",                            "Siège transversal",                                                            "60201", "balance"),
        ("Siège-jambes-tendues-levées.md",                  "Siège avec les jambes tendues levées",                                         "60202", "balance"),
        ("Siège-cheval.md",                                 "Siège à cheval",                                                               "60205", "balance"),
        ("Station-accroupie.md",                            "Station accroupie une jambe levée horizontalement",                            "60304", "renversement-statique"),
        ("Suspension-mi-renversée.md",                      "Suspension mi-renversée carpée ou groupée",                                    "60305", "balancement"),
        ("Balance-suspension-ecartée.md",                   "Balance à la suspension écartée",                                              "60315", "balance"),
        ("Balance-suspension-ecartée-grand-ecart.md",       "Balance à la suspension écartée jusqu'au grand écart --",                      "60316", "balance"),
        ("Balance-couchée-faciale.md",                      "Balance couchée faciale horizontale à l'appui --",                             "60317", "balance"),
        ("Saut-appui-facial-barre-basse.md",                "Sauter à l'appui facial à la barre basse",                                     "60501", "balancement"),
        ("Appui-lat-cheval.md",                             "De l'appui facial passer une jambe sous la prise à l'appui latéral à cheval",  "60505", "balancement"),
        ("Sortie-jambes-groupées-barre-haute.md",           "Sortir jambes groupées par-dessus la barre haute",                             "60522", "sortie"),
        ("Sortie-jambes-ecartées-barre-haute.md",           "Sortir jambes écartées par-dessus la barre haute",                             "60521", "sortie"),
        ("Roulé-arrière-station.md",                        "Elancé en avant élancé en arrière et roulé en arrière à la station",           "60529", "roulé"),
    ],
}

created = {}
skipped = {}
errors = {}

for (engin_slug, engin_label, directory), elements in ELEMENTS.items():
    os.makedirs(directory, exist_ok=True)
    created[engin_slug] = []
    skipped[engin_slug] = []

    for filename, titre, code_est, famille in elements:
        filepath = os.path.join(directory, filename)

        if os.path.exists(filepath):
            skipped[engin_slug].append(filename)
            continue

        content = TEMPLATE.format(
            engin_slug=engin_slug,
            famille=famille,
            engin_label=engin_label,
            code_est=code_est,
            titre=titre,
        )

        try:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            created[engin_slug].append(filename)
        except Exception as e:
            errors[filename] = str(e)

# Report
total_created = sum(len(v) for v in created.values())
total_skipped = sum(len(v) for v in skipped.values())

print(f"\n{'='*60}")
print(f"RÉSULTAT : {total_created} fichiers créés, {total_skipped} ignorés")
print(f"{'='*60}")

for engin_slug in created:
    n_c = len(created[engin_slug])
    n_s = len(skipped[engin_slug])
    print(f"\n{engin_slug.upper()} — {n_c} créés, {n_s} ignorés")
    for f in created[engin_slug]:
        print(f"  + {f}")
    for f in skipped[engin_slug]:
        print(f"  ~ {f} (existant)")

if errors:
    print(f"\nERREURS :")
    for f, e in errors.items():
        print(f"  ! {f} : {e}")
