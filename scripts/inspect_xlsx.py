#!/usr/bin/env python3
"""Print rows from an XLSX file using only the Python standard library."""

from __future__ import annotations

import argparse
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"


def column_index(reference: str) -> int:
    letters = re.match(r"[A-Z]+", reference).group(0)
    index = 0
    for letter in letters:
        index = index * 26 + ord(letter) - ord("A") + 1
    return index - 1


def cell_text(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    value = cell.find(f"{{{MAIN_NS}}}v")
    if cell_type == "inlineStr":
        return "".join(cell.itertext())
    if value is None or value.text is None:
        return ""
    if cell_type == "s":
        return shared_strings[int(value.text)]
    if cell_type == "b":
        return "TRUE" if value.text == "1" else "FALSE"
    return value.text


def read_workbook(path: Path) -> dict[str, list[tuple[int, list[str]]]]:
    result: dict[str, list[tuple[int, list[str]]]] = {}
    with zipfile.ZipFile(path) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared_strings = ["".join(item.itertext()) for item in root]

        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {
            rel.attrib["Id"]: rel.attrib["Target"]
            for rel in relationships.findall(f"{{{PKG_REL_NS}}}Relationship")
        }

        for sheet in workbook.find(f"{{{MAIN_NS}}}sheets"):
            name = sheet.attrib["name"]
            result[name] = []
            relationship_id = sheet.attrib[f"{{{REL_NS}}}id"]
            target = targets[relationship_id].lstrip("/")
            if not target.startswith("xl/"):
                target = f"xl/{target}"
            worksheet = ET.fromstring(archive.read(target))
            for row in worksheet.findall(f".//{{{MAIN_NS}}}row"):
                values: list[str] = []
                for cell in row.findall(f"{{{MAIN_NS}}}c"):
                    index = column_index(cell.attrib["r"])
                    while len(values) <= index:
                        values.append("")
                    values[index] = cell_text(cell, shared_strings).strip()
                if any(values):
                    result[name].append((int(row.attrib["r"]), values))
    return result


def inspect_workbook(path: Path, unit: str | None = None) -> None:
    for sheet_name, rows in read_workbook(path).items():
        print(f"\n### {sheet_name}")
        for row_number, values in rows:
            if unit and (not values or not values[0].startswith(f"{unit}.")):
                continue
            print(f"{row_number}: {values!r}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--unit", choices=[str(number) for number in range(9)])
    args = parser.parse_args()
    inspect_workbook(args.workbook, args.unit)


if __name__ == "__main__":
    main()
