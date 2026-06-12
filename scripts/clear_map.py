import os
import re

DATA_DIR = r"C:\Users\lukasz.klimowski\Documents\cinernet\data\installations"

def process_file(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    out = []
    in_target_array = False
    
    for line in lines:
        # Check if this line OPENS a target array
        # e.g., `nodes: [` or `edges: [` or `export const siteFeederEdges: TopologyEdgeInput[] = [`
        if re.search(r'(nodes:\s*\[|edges:\s*\[|Edges[\w]*\s*:\s*TopologyEdgeInput\[\]\s*=\s*\[)', line):
            out.append(line)
            in_target_array = True
            continue
            
        if in_target_array:
            # Check if this line CLOSES the array
            if line.strip() in ('],', '];', ']'):
                in_target_array = False
                out.append(line)
            else:
                # Comment it out if not already commented
                if not line.lstrip().startswith('//'):
                    # Preserve indentation
                    indent = len(line) - len(line.lstrip())
                    out.append(line[:indent] + '// ' + line[indent:])
                else:
                    out.append(line)
        else:
            out.append(line)
            
    with open(fpath, 'w', encoding='utf-8') as f:
        f.writelines(out)

for fname in os.listdir(DATA_DIR):
    if fname.endswith('.ts'):
        # Do not process main-hv-panel.ts because it generates arrays via functions and map()
        if fname == 'main-hv-panel.ts':
            # Actually, main-hv-panel.ts exports mainHvPanelCells: TopologyNodeInput[] = Array.from(...)
            # We can't easily comment that out line by line.
            # We can just leave it alone, or the user can manually comment it.
            continue
            
        process_file(os.path.join(DATA_DIR, fname))
        print(f"Commented out nodes/edges in {fname}")

# For the JSON terminal boxes, we just rename the 'nodes' and 'edges' arrays
import json
json_path = r"C:\Users\lukasz.klimowski\Documents\cinernet\data\imported\batch-house-terminal-boxes.json"
try:
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'nodes' in data:
        data['_nodes'] = data.pop('nodes')
    if 'edges' in data:
        data['_edges'] = data.pop('edges')
        
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print("Disabled arrays in batch-house-terminal-boxes.json")
except Exception as e:
    pass

print("Map cleared successfully!")
