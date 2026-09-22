#!/usr/bin/env python3
"""Build Unit 0-4 browser data from the official workbook without altering forms.

IDs retain the worksheet row for browser progress compatibility. Empty singular
cells are intentional for plural-only nouns; interpret notation in questions.js,
not in this raw import. See docs/curriculum.md for source paths and exceptions.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from inspect_xlsx import read_workbook


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("workbook", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--units", nargs="+", default=["0", "1", "2", "3", "4"])
    args = parser.parse_args()

    rows = read_workbook(args.workbook).get("Vocabulary", [])
    entries = []
    for row_number, values in rows:
        values += [""] * (6 - len(values))
        unit_label, word_class, singular, plural, english, example = values[:6]
        unit = unit_label.split(".", 1)[0]
        if unit not in args.units:
            continue
        entries.append(
            {
                "id": f"u{unit}-r{row_number}",
                "unit": int(unit),
                "unitTitle": unit_label.split(". ", 1)[1],
                "wordClass": word_class.lower(),
                "german": singular,
                "pluralOrConjugation": plural,
                "english": english,
                "example": example,
                "sourceRow": row_number,
            }
        )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    module = (
        "// Generated from the official LAG1201 Das Leben A1 glossary.\n"
        "// Rebuild with scripts/build_glossary.py when the workbook changes.\n"
        f"export const glossary = {json.dumps(entries, ensure_ascii=False, indent=2)};\n"
    )
    args.output.write_text(module, encoding="utf-8")
    print(f"Wrote {len(entries)} entries to {args.output}")


if __name__ == "__main__":
    main()
