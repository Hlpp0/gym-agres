#!/usr/bin/env python3
"""Export all element Markdown files to export_elements.csv."""

import csv
import re
import sys
from collections import defaultdict
from pathlib import Path

import yaml  # PyYAML

ROOT = Path(__file__).parent.parent
CONTENT_DIR = ROOT / "content" / "elements"
OUTPUT = ROOT / "export_elements.csv"

COLUMNS = [
    "fichier",
    "engin",
    "categorie",
    "nom",
    "code_est",
    "code_stv",
    "url_stv",
    "structure_de_mouvement",
    "video_youtube",
    "statut",
]

REQUIRED_FIELDS = ["engin", "categorie", "nom", "code_est"]

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)
H1_RE = re.compile(r"^#\s+(.+)$", re.MULTILINE)


def parse_file(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    fm = {}
    m = FRONTMATTER_RE.match(text)
    if m:
        fm = yaml.safe_load(m.group(1)) or {}

    # Frontmatter title takes priority; fall back to first H1 in content
    nom = str(fm.get("title", "")).strip()
    if not nom:
        h1 = H1_RE.search(text)
        if h1:
            nom = h1.group(1).strip()

    relative = path.relative_to(ROOT).as_posix()

    row = {
        "fichier": relative,
        "engin": fm.get("engin", ""),
        "categorie": fm.get("categorie", ""),
        "nom": nom,
        "code_est": fm.get("code_est", ""),
        "code_stv": fm.get("code_stv", ""),
        "url_stv": fm.get("url_stv", ""),
        "structure_de_mouvement": fm.get("structure de mouvement", ""),
        "video_youtube": fm.get("video_youtube", ""),
        "statut": "",
    }

    complet = all(str(row.get(f, "")).strip() for f in REQUIRED_FIELDS)
    row["statut"] = "complet" if complet else ""
    return row


def main():
    if not CONTENT_DIR.exists():
        print(f"Dossier introuvable : {CONTENT_DIR}", file=sys.stderr)
        sys.exit(1)

    files = sorted(CONTENT_DIR.rglob("*.md"))
    if not files:
        print("Aucun fichier Markdown trouvé.", file=sys.stderr)
        sys.exit(1)

    rows = [parse_file(f) for f in files]

    # Write UTF-8 with BOM for Excel
    with OUTPUT.open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"✓ {len(rows)} fiches exportées → {OUTPUT.relative_to(ROOT)}\n")

    by_engin: dict[str, int] = defaultdict(int)
    for r in rows:
        by_engin[r["engin"] or "(sans engin)"] += 1
    for engin, count in sorted(by_engin.items()):
        print(f"  {engin:<30} {count:>3} fiche(s)")

    complets = sum(1 for r in rows if r["statut"] == "complet")
    print(f"\n  Fiches complètes : {complets}/{len(rows)}")


if __name__ == "__main__":
    main()
