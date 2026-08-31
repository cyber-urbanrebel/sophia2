from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"

SUBS = {
    "\u00e2\u20ac\u201d": "\u2014",
    "\u00e2\u20ac\u201c": "\u2014",
    "\u00e2\u20ac\u2014": "\u2014",
    "\u00e2\u20ac\u2013": "\u2013",
    "\u00e2\u20ac\u00a6": "\u2026",
    "\u00e2\u20ac\u00a2": "\u2022",
    "\u00e2\u20ac\u2122": "'",
    "\u00e2\u20ac\u02dc": "'",
    "\u00e2\u20ac\u0153": '"',
    "\u00e2\u20ac\u009d": '"',
    "\u00e2\u0153\u201c": "\u2713",
    "\u00e2\u0153\u2022": "\u00d7",
    "\u00e2\u0153\u00a8": "\u2726",
    "\u00e2\u0161\u00a1": "\u2301",
    "\u00e2\u0161\u2122": "\u2699",
    "\u00e2\u0161\u2013": "\u2696",
    "\u00e2\u0153\u008f": "\u270e",
    "\u00e2\u201e\u00b9": "i",
    "\u00e2\u0153\u0153": "\u00d7",
    "\u00e2\u00ad\u0090": "\u2605",
    "\u00c3\u2014": "\u00d7",
    "\ufeff": "",
}


def decode_run(chunk: str) -> str:
    for enc in ("cp1252", "latin-1"):
        try:
            return chunk.encode(enc).decode("utf-8")
        except Exception:
            continue
    return chunk


def fix_text(text: str) -> str:
    for old, new in SUBS.items():
        text = text.replace(old, new)
    out = []
    i = 0
    while i < len(text):
        ch = text[i]
        if ch in "\u00f0\u00e2\u00c3\u00ef" and i + 1 < len(text) and ord(text[i + 1]) > 127:
            j = i + 1
            while j < len(text) and ord(text[j]) > 127:
                j += 1
            out.append(decode_run(text[i:j]))
            i = j
        else:
            out.append(ch)
            i += 1
    return "".join(out)


def main() -> None:
    changed = []
    for path in list(ROOT.rglob("*.jsx")) + list(ROOT.rglob("*.js")) + list(ROOT.rglob("*.css")):
        original = path.read_text(encoding="utf-8")
        updated = fix_text(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed.append(str(path.relative_to(ROOT)))
    print("\n".join(changed) or "none")


if __name__ == "__main__":
    main()
