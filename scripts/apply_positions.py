import os
import re
import csv
import json

positions = {}

# 1. Load from CSV
csv_path = r"C:\Users\lukasz.klimowski\Documents\cinernet\cinernet_positions (1).csv"
try:
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            obj_id = row['Object ID'].strip()
            x = row['X pos'].strip()
            y = row['Y pos'].strip()
            if obj_id and x and y:
                positions[obj_id] = (x, y)
except Exception as e:
    print(f"Error reading CSV: {e}")

# 2. Add manual overrides from user's chat message
chat_overrides = {
    'CVCD-13': ('5216', '-5'),   # taking the last one they dragged it to
    'THROAT': ('3369', '722'),
    '7': ('3066', '865'),
    'TR-02': ('652', '134'),
    'UT-FMCC': ('658', '585')
}
positions.update(chat_overrides)

print(f"Loaded {len(positions)} positions.")

DATA_DIR = r"C:\Users\lukasz.klimowski\Documents\cinernet\data\installations"

# Function to replace position for a given id
def replace_pos(match):
    full_str = match.group(0)
    id_val = match.group(2)
    pos_str = match.group(3)
    
    if id_val in positions:
        x, y = positions[id_val]
        # replace the position part
        new_pos_str = re.sub(r'position:\s*\{\s*x:\s*[-\d.]+,\s*y:\s*[-\d.]+\s*\}', f"position: {{ x: {x}, y: {y} }}", pos_str)
        return match.group(1) + id_val + new_pos_str
    return full_str

# 3. Update all .ts files
updated_count = 0
for fname in os.listdir(DATA_DIR):
    if not fname.endswith('.ts'): continue
    fpath = os.path.join(DATA_DIR, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We look for: id: 'SOME_ID', ... position: { x: 0, y: 0 }
    # Using a regex that captures the ID and then everything up to the position object
    pattern = r"(id:\s*['\"])([^'\"]+)(['\"],[\s\S]*?position:\s*\{\s*x:\s*[-\d.]+,\s*y:\s*[-\d.]+\s*\})"
    new_content = re.sub(pattern, replace_pos, content)
    
    if new_content != content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
            updated_count += 1
            print(f"Updated {fname}")

# 4. Update JSON files
JSON_DIR = r"C:\Users\lukasz.klimowski\Documents\cinernet\data\imported"
for fname in os.listdir(JSON_DIR):
    if not fname.endswith('.json'): continue
    fpath = os.path.join(JSON_DIR, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    changed = False
    for node in data.get('nodes', []):
        if node['id'] in positions:
            x, y = positions[node['id']]
            node['position'] = {'x': float(x), 'y': float(y)}
            changed = True
            
    if changed:
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            print(f"Updated {fname}")

print("Done updating positions.")
