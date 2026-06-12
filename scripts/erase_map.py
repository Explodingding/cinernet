import os
import re

DATA_DIR = r"C:\Users\lukasz.klimowski\Documents\cinernet\data\installations"

def erase_arrays(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace nodes: [ ... ] with nodes: [],
    # Since our formatting is well-behaved, we can match 'nodes: [' up to '  ],'
    
    # We use a non-greedy match to find everything between nodes: [ and the first ], 
    # that is on its own line with 2 spaces of indentation, or similar.
    # Actually, replacing all nodes and edges arrays completely:
    
    # regex for nodes: [ ... ]
    # We want to match `nodes: [` followed by anything until `  ],`
    pattern_nodes = re.compile(r'nodes:\s*\[[\s\S]*?^\s*\],', re.MULTILINE)
    new_content = pattern_nodes.sub('nodes: [],', content)
    
    pattern_edges = re.compile(r'edges:\s*\[[\s\S]*?^\s*\],', re.MULTILINE)
    new_content = pattern_edges.sub('edges: [],', new_content)
    
    # For site-feeders.ts
    pattern_site = re.compile(r'export const siteFeederEdges: TopologyEdgeInput\[\] = \[[\s\S]*?^\];', re.MULTILINE)
    new_content = pattern_site.sub('export const siteFeederEdges: TopologyEdgeInput[] = [];', new_content)
    
    if new_content != content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Erased arrays in {os.path.basename(fpath)}")


for fname in os.listdir(DATA_DIR):
    if fname.endswith('.ts'):
        # For main-hv-panel.ts we don't erase the math arrays, but the user wants to start from 0!
        # If we erase mainHvPanelCells, it will break exports. Let's change them to empty arrays.
        if fname == 'main-hv-panel.ts':
            with open(os.path.join(DATA_DIR, fname), 'r', encoding='utf-8') as f:
                content = f.read()
            content = re.sub(r'export const mainHvPanelCells: TopologyNodeInput\[\] = Array\.from\([\s\S]*?^\}\);', 'export const mainHvPanelCells: TopologyNodeInput[] = [];', content, flags=re.MULTILINE)
            content = re.sub(r'export const mainFeedTransformers: TopologyNodeInput\[\] = \[[\s\S]*?^\];', 'export const mainFeedTransformers: TopologyNodeInput[] = [];', content, flags=re.MULTILINE)
            content = re.sub(r'export function buildMainPanelEdges\(\): TopologyEdgeInput\[\] \{[\s\S]*?^\}', 'export function buildMainPanelEdges(): TopologyEdgeInput[] {\n  return [];\n}', content, flags=re.MULTILINE)
            with open(os.path.join(DATA_DIR, fname), 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Erased arrays in main-hv-panel.ts")
            continue
            
        erase_arrays(os.path.join(DATA_DIR, fname))

# For JSON terminal boxes, we just empty the arrays
import json
json_path = r"C:\Users\lukasz.klimowski\Documents\cinernet\data\imported\batch-house-terminal-boxes.json"
try:
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if '_nodes' in data:
        del data['_nodes']
    if '_edges' in data:
        del data['_edges']
        
    data['nodes'] = []
    data['edges'] = []
        
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print("Erased arrays in batch-house-terminal-boxes.json")
except Exception as e:
    pass

print("Map fully erased!")
