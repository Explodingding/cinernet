import os
import re
import json

BASE_Y = {
    'hv-feed': 2800,
    'hv-switchgear': 2500,
    'transformer': 2000,
    'lv-panel': 1500,
    'cabinet': 1000,
    'junction': 1000,
    'load': 500,
    'motor': 500
}

# We track counts to add vertical jitter for nodes on the same layer AND same X coordinate
# so they form a neat vertical list instead of overlapping.
col_counts = {}

def get_new_y(layer, x_val):
    base = BASE_Y.get(layer, 1500) # fallback to middle
    key = (layer, float(x_val))
    count = col_counts.get(key, 0)
    col_counts[key] = count + 1
    
    # 40px vertical spacing for items in the exact same column and layer
    return base + (count * 40)

def process_ts_file(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    out_lines = []
    current_layer = None
    
    for i, line in enumerate(lines):
        # Detect layer
        layer_match = re.search(r"layer:\s*['\"]([^'\"]+)['\"]", line)
        if layer_match:
            current_layer = layer_match.group(1)
            
        # Detect position: { x: VAL, y: VAL }
        pos_match = re.search(r"(position:\s*\{\s*x:\s*)([-\d.]+)(,\s*y:\s*)[-\d.]+(\s*\})", line)
        if pos_match and current_layer:
            x_val = pos_match.group(2)
            new_y = get_new_y(current_layer, x_val)
            
            # Replace the y value
            new_line = pos_match.group(1) + x_val + pos_match.group(3) + str(new_y) + pos_match.group(4)
            line = line[:pos_match.start()] + new_line + line[pos_match.end():]
            
            # Reset layer after consuming position so we don't accidentally reuse it
            current_layer = None
            
        # Or it might be multi-line:
        # position: {
        #   x: 100,
        #   y: 200
        # }
        # This requires more complex parsing. We happen to know from our previous script 
        # that most positions are single-line `position: { x: ..., y: ... },`
        # But wait, in template.ts or main-hv-panel.ts it might be multi-line.
        # Let's check for multi-line x and y if we are inside a position block.
        out_lines.append(line)
        
    # Since main-hv-panel.ts has dynamic positions in the code (e.g. x: 100 + (cellNumber * 80), y: 300),
    # we should use a safer full-file regex approach that ignores dynamic math and only targets literal numbers.
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.writelines(out_lines)


# A safer full-file regex for single-line position strings
def process_ts_file_safe(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all node blocks. A block usually starts with `{ id:` or `id:` and ends with `}`
    # We can split by `id: ` to approximate nodes.
    # Actually, let's use a regex that finds `layer: '...'` and the nearest subsequent `position: { x: <num>, y: <num> }`
    
    def replacer(match):
        layer = match.group(1)
        x_val = match.group(3)
        y_val = get_new_y(layer, x_val)
        return match.group(0).replace(f"y: {match.group(4)}", f"y: {y_val}")

    # match layer, any whitespace/characters until position: { x: NUM, y: NUM }
    # using non-greedy [\\s\\S]*?
    pattern = r"layer:\s*['\"]([^'\"]+)['\"][\s\S]*?(position:\s*\{\s*x:\s*)([-\d.]+)(,\s*y:\s*)([-\d.]+)(\s*\})"
    
    new_content = content
    # Since re.sub processes iteratively from left to right, we can use a callback!
    def callback(match):
        layer = match.group(1)
        prefix1 = match.group(2)
        x_val = match.group(3)
        prefix2 = match.group(4)
        y_val = get_new_y(layer, x_val)
        suffix = match.group(6)
        
        # We must return the entire matched string (from 'layer:' to '}') but with the new y value
        # But wait! If we return the whole match, we replace everything in between.
        # So we just construct the new match string
        original_match = match.group(0)
        # We know the position string is at the end of the match
        old_pos = f"{prefix1}{x_val}{prefix2}{match.group(5)}{suffix}"
        new_pos = f"{prefix1}{x_val}{prefix2}{y_val}{suffix}"
        return original_match.replace(old_pos, new_pos)

    new_content = re.sub(pattern, callback, content)
    
    # Also handle multi-line position blocks (x: \n y: \n)
    pattern_multi = r"layer:\s*['\"]([^'\"]+)['\"][\s\S]*?(position:\s*\{\s*x:\s*)([-\d.]+)(,\s*y:\s*)([-\d.]+)(\s*\})"
    # The regex above actually handles newlines because \s matches \n!
    # Let's refine it to be completely generic:
    pattern2 = r"(layer:\s*['\"]([^'\"]+)['\"][\s\S]*?position:\s*\{\s*x:\s*)([-\d.]+)(,\s*y:\s*)([-\d.]+)(\s*\})"
    def callback2(match):
        prefix = match.group(1)
        layer = match.group(2)
        x_val = match.group(3)
        mid = match.group(4)
        suffix = match.group(6)
        
        y_val = get_new_y(layer, x_val)
        return f"{prefix}{x_val}{mid}{y_val}{suffix}"
        
    new_content2 = re.sub(pattern2, callback2, content)

    if content != new_content2:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content2)
            print(f"Updated Y coords in {os.path.basename(fpath)}")


def process_json_file(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    changed = False
    for node in data.get('nodes', []):
        if 'layer' in node and 'position' in node:
            layer = node['layer']
            x = node['position']['x']
            new_y = get_new_y(layer, x)
            node['position']['y'] = new_y
            changed = True
            
    if changed:
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            print(f"Updated Y coords in {os.path.basename(fpath)}")


DATA_DIR = r"C:\Users\lukasz.klimowski\Documents\cinernet\data\installations"
JSON_DIR = r"C:\Users\lukasz.klimowski\Documents\cinernet\data\imported"

for fname in os.listdir(DATA_DIR):
    if fname.endswith('.ts'):
        process_ts_file_safe(os.path.join(DATA_DIR, fname))

for fname in os.listdir(JSON_DIR):
    if fname.endswith('.json'):
        process_json_file(os.path.join(JSON_DIR, fname))

print("Completed Y cascading script!")
