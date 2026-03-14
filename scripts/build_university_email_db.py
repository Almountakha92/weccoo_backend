#!/usr/bin/env python3
import argparse
import json
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree as ET


NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def col_letters_to_index(letters: str) -> int:
    value = 0
    for ch in letters:
        value = value * 26 + (ord(ch) - ord("A") + 1)
    return value - 1


CELL_REF_RE = re.compile(r"^([A-Z]+)([0-9]+)$")


def parse_shared_strings(zf: zipfile.ZipFile):
    try:
        xml = zf.read("xl/sharedStrings.xml")
    except KeyError:
        return None

    root = ET.fromstring(xml)
    strings = []
    for si in root.findall("s:si", NS):
        # shared string can be a set of rich text runs <r><t>...</t></r>
        text = ""
        for t in si.findall(".//s:t", NS):
            text += t.text or ""
        strings.append(text)
    return strings


def cell_value(cell: ET.Element, shared_strings):
    t = cell.get("t")
    if t == "inlineStr":
        node = cell.find("s:is/s:t", NS)
        return (node.text or "").strip() if node is not None else ""
    if t == "s" and shared_strings is not None:
        v = cell.find("s:v", NS)
        if v is None or v.text is None:
            return ""
        try:
            idx = int(v.text)
            return (shared_strings[idx] or "").strip()
        except Exception:
            return ""
    # default: value in <v>
    v = cell.find("s:v", NS)
    return (v.text or "").strip() if v is not None else ""


def parse_sheet_rows(zf: zipfile.ZipFile, sheet_path: str):
    sheet_xml = zf.read(sheet_path)
    root = ET.fromstring(sheet_xml)
    sheet_data = root.find("s:sheetData", NS)
    if sheet_data is None:
        return []

    shared_strings = parse_shared_strings(zf)
    rows = []
    for row in sheet_data.findall("s:row", NS):
        cells = {}
        for c in row.findall("s:c", NS):
            ref = c.get("r") or ""
            m = CELL_REF_RE.match(ref)
            if not m:
                continue
            col = col_letters_to_index(m.group(1))
            cells[col] = cell_value(c, shared_strings)
        if cells:
            max_col = max(cells.keys())
            out = [""] * (max_col + 1)
            for idx, val in cells.items():
                out[idx] = val
            rows.append(out)
    return rows


def normalize_university(value: str) -> str:
    return value.strip().lower()


def normalize_email(value: str) -> str:
    return value.strip().lower()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--xlsx", required=True, help="Path to .xlsx source file")
    parser.add_argument("--out", required=True, help="Path to output .json db")
    parser.add_argument("--sheet", default="xl/worksheets/sheet1.xml", help="Sheet XML path inside the xlsx zip")
    args = parser.parse_args()

    xlsx_path = Path(args.xlsx)
    out_path = Path(args.out)

    if not xlsx_path.exists():
        raise SystemExit(f"XLSX not found: {xlsx_path}")

    with zipfile.ZipFile(xlsx_path, "r") as zf:
        rows = parse_sheet_rows(zf, args.sheet)

    if not rows:
        raise SystemExit("No rows found in sheet.")

    headers = [h.strip().lower() for h in rows[0]]
    try:
        uni_idx = headers.index("universite")
        email_idx = headers.index("email_universitaire")
    except ValueError as e:
        raise SystemExit(f"Missing expected header: {e}")

    universities: dict[str, set[str]] = {}
    total = 0
    for r in rows[1:]:
        uni = r[uni_idx] if uni_idx < len(r) else ""
        email = r[email_idx] if email_idx < len(r) else ""
        uni_n = normalize_university(uni)
        email_n = normalize_email(email)
        if not uni_n or not email_n:
            continue
        universities.setdefault(uni_n, set()).add(email_n)
        total += 1

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": str(xlsx_path),
        "rowCount": total,
        "universities": {k: sorted(v) for k, v in sorted(universities.items())},
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()

