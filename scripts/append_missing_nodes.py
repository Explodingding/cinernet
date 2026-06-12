import os
import re
import json

DATA_DIR = r"C:\Users\lukasz.klimowski\Documents\cinernet\data\installations"
MISSING_PATH = os.path.join(DATA_DIR, "missing_nodes.json")

def load_missing():
    if not os.path.exists(MISSING_PATH): return []
    with open(MISSING_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def dict_to_ts(node):
    # Convert a python dict to a TS object string
    lines = []
    lines.append("  {")
    lines.append(f"    id: '{node['id']}',")
    lines.append(f"    name: '{node['name']}',")
    lines.append(f"    assetType: '{node['assetType']}',")
    lines.append(f"    layer: '{node['layer']}',")
    lines.append(f"    status: '{node['status']}',")
    
    specs = node.get("specs", {})
    lines.append("    specs: {")
    for k, v in specs.items():
        lines.append(f"      {k}: '{v}',")
    lines.append("    },")
    
    phys = node.get("physicalLocation", {})
    lines.append("    physicalLocation: {")
    for k, v in phys.items():
        lines.append(f"      {k}: '{v}',")
    lines.append("    },")
    
    pos = node.get("position", {"x":0, "y":0})
    lines.append(f"    position: {{ x: {pos['x']}, y: {pos['y']} }},")
    
    lines.append("  },")
    return "\n".join(lines)

def main():
    missing = load_missing()
    if not missing:
        print("No missing nodes.")
        return
        
    by_bld = {}
    for n in missing:
        b = n["physicalLocation"]["building"]
        if b not in by_bld: by_bld[b] = []
        by_bld[b].append(n)
        
    for bld, nodes in by_bld.items():
        # find the ts file
        # bld is like furnace-10
        ts_path = os.path.join(DATA_DIR, f"{bld}.ts")
        if not os.path.exists(ts_path):
            print(f"File {ts_path} not found. Creating it...")
            continue
            
        with open(ts_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Find the end of the nodes array: ],\s*edges:
        match = re.search(r'(\n\s*)(\],\s*edges:)', content)
        if not match:
            print(f"Could not find end of nodes array in {ts_path}")
            continue
            
        ts_nodes = [dict_to_ts(n) for n in nodes]
        ts_nodes_str = "\n" + "\n".join(ts_nodes) + "\n"
        
        # Inject right before the closing bracket of the nodes array
        insert_idx = match.start(2)
        new_content = content[:insert_idx] + ts_nodes_str + content[insert_idx:]
        
        with open(ts_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        print(f"Appended {len(nodes)} nodes to {bld}.ts")

if __name__ == '__main__':
    main()
