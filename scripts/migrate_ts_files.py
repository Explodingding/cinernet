import os
import re
import json

DATA_DIR = r"C:\Users\lukasz.klimowski\Documents\cinernet\data\installations"
JSON_PATH = os.path.join(DATA_DIR, "generated_nodes.json")

def load_generated():
    if not os.path.exists(JSON_PATH): return {}
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Flatten by ID
    flat = {}
    for bld, nodes in data.items():
        for n in nodes:
            flat[n["id"]] = n
    return flat

def migrate_file(filepath, generated):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the nodes array
    match = re.search(r'(nodes:\s*\[)([\s\S]*?)(\],\s*edges:)', content)
    if not match:
        return
        
    prefix = content[:match.start(2)]
    nodes_content = match.group(2)
    suffix = content[match.end(2):]

    # Process nodes content (we'll use a simple parser/regex since it's TS objects)
    # We will search for id: '...' inside the string.
    # This regex is a bit risky but we can do a pass to replace layout/positionOverride
    
    # Remove layout: { ... },
    nodes_content = re.sub(r'\s*layout:\s*\{[^}]+\},?', '', nodes_content)
    # Remove positionOverride: { ... },
    nodes_content = re.sub(r'\s*positionOverride:\s*\{[^}]+\},?', '', nodes_content)
    
    # Now we need to inject position: {x,y} into each node.
    # A node starts with { and ends with } (but has nested braces).
    # Since we can't easily parse TS nested objects in regex, let's just find id: '...' and insert position after it.
    
    def repl_id(m):
        full_match = m.group(0)
        id_str = m.group(2)
        
        pos_x = 0
        pos_y = 0
        if id_str in generated:
            pos_x = generated[id_str]["position"]["x"]
            pos_y = generated[id_str]["position"]["y"]
            # We pop it so we know what's left over
            generated.pop(id_str, None)
            
        return f"{full_match}\n    position: {{ x: {pos_x}, y: {pos_y} }},"
        
    nodes_content = re.sub(r'(id:\s*[\'"])(.*?)([\'"],)', repl_id, nodes_content)
    
    new_content = prefix + nodes_content + suffix
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

def main():
    generated = load_generated()
    
    for fname in os.listdir(DATA_DIR):
        if fname.endswith(".ts"):
            migrate_file(os.path.join(DATA_DIR, fname), generated)
            
    print(f"Migration complete. Remaining generated nodes to inject: {len(generated)}")
    # We can write the remaining to a file to manually append
    if generated:
        with open(os.path.join(DATA_DIR, "missing_nodes.json"), 'w') as f:
            json.dump(list(generated.values()), f, indent=2)

if __name__ == '__main__':
    main()
