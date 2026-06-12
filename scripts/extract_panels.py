"""
extract_panels.py
-----------------
Reads a DXF file and extracts electrical equipment positions.

Output: data/panels.json  — ready to merge into CINERNET node data

Usage:
    python scripts/extract_panels.py "Cinerglass Electrical Panel Locations.dxf"
"""

import sys
import json
from pathlib import Path
import ezdxf
from ezdxf.math import Vec3
from collections import defaultdict

ELECTRICAL_LAYERS = {"E-ELEC-EQPM", "E-PANO", "E-DATA", "E-ELEC-FIXT"}

def main(dxf_path: str):
    print(f"Opening {dxf_path} ...")
    try:
        doc = ezdxf.readfile(dxf_path)
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)

    msp = doc.modelspace()

    # ── 1. List all layers ──────────────────────────────────────────────
    layers = sorted({e.dxf.layer for e in msp})
    print(f"\nFound {len(layers)} layers:")
    for l in layers:
        print(f"  {l}")

    # ── 2. Count entity types per layer ────────────────────────────────
    layer_counts = defaultdict(lambda: defaultdict(int))
    for e in msp:
        layer_counts[e.dxf.layer][e.dxftype()] += 1

    print("\nEntity counts per layer:")
    for layer, counts in sorted(layer_counts.items()):
        if "INSERT" in counts or "TEXT" in counts or "MTEXT" in counts:
            marker = " <-- electrical" if layer in ELECTRICAL_LAYERS else ""
            print(f"  {layer}: {dict(counts)}{marker}")

    # ── 3. Extract INSERT from electrical layers ────────────────────────
    inserts = []
    for e in msp.query("INSERT"):
        if e.dxf.layer not in ELECTRICAL_LAYERS:
            continue
        pos: Vec3 = e.dxf.insert
        entry = {
            "block": e.dxf.name,
            "layer": e.dxf.layer,
            "x": round(pos.x, 2),
            "y": round(pos.y, 2),
            "z": round(pos.z, 2),
            "rotation": round(getattr(e.dxf, "rotation", 0), 2),
            "attributes": {}
        }
        try:
            for attrib in e.attribs:
                tag = attrib.dxf.tag.strip()
                val = attrib.dxf.text.strip()
                if tag:
                    entry["attributes"][tag] = val
        except Exception:
            pass
        inserts.append(entry)

    print(f"\nElectrical INSERT entities: {len(inserts)}")

    # ── 4. Extract TEXT / MTEXT from electrical layers ──────────────────
    texts = []
    for e in msp.query("TEXT MTEXT"):
        if e.dxf.layer not in ELECTRICAL_LAYERS:
            continue
        try:
            pos = e.dxf.insert if hasattr(e.dxf, "insert") else Vec3(0, 0, 0)
            raw = e.plain_text() if e.dxftype() == "MTEXT" else e.dxf.text
            texts.append({
                "type": e.dxftype(),
                "layer": e.dxf.layer,
                "text": raw,
                "x": round(pos.x, 2),
                "y": round(pos.y, 2),
            })
        except Exception:
            pass

    print(f"Electrical TEXT/MTEXT entities: {len(texts)}")

    # ── 5. Show unique block names ──────────────────────────────────────
    block_names = sorted({i["block"] for i in inserts})
    print(f"\nUnique block names ({len(block_names)}):")
    for b in block_names[:60]:
        print(f"  {b}")
    if len(block_names) > 60:
        print(f"  ... and {len(block_names) - 60} more")

    # ── 6. Show sample of inserts with attributes ───────────────────────
    with_attrs = [i for i in inserts if i["attributes"]]
    print(f"\nInserts with attributes: {len(with_attrs)}")
    print("First 10 samples:")
    for i in with_attrs[:10]:
        print(f"  block={i['block']}  layer={i['layer']}  x={i['x']}  y={i['y']}  attrs={i['attributes']}")

    # ── 7. Write output ─────────────────────────────────────────────────
    out = {
        "summary": {
            "total_inserts": len(inserts),
            "total_texts": len(texts),
            "block_names": block_names,
            "layers": list(ELECTRICAL_LAYERS),
        },
        "inserts": inserts,
        "texts": texts,
    }
    out_path = Path(__file__).resolve().parent.parent / "data" / "panels.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Written to {out_path}")
    print("  Share that file and I'll build the CINERNET position mapper.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/extract_panels.py <file.dxf>")
        sys.exit(1)
    main(sys.argv[1])
