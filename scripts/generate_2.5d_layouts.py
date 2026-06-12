import os
import csv
import re
import json

CSV_PATH = r"C:\Users\lukasz.klimowski\Documents\cinernet\Panel connections 2(Locations).csv"

BLD_MAP = {
    "F10": "furnace-10",
    "UTB": "utility",
    "F20": "furnace-20",
    "BAH": "batch-house",
    "CT": "cullet-tower",
    "WH": "warehouse",
    "DSB": "distribution-building"
}

ROOMS = {
    "LVR": "Low voltage room",
    "BFC": "Batch & Furnace Control Room",
    "BMR": "Botero Machine Room",
    "CFS": "Chimney Filtration System",
    "CPH": "Compressorhal",
    "CPR": "Compressor Panel Room",
    "CRA": "Cullet Return Area",
    "FH1": "Foreheart 1", "FH2": "Foreheart 2", "FH3": "Foreheart 3", "FH4": "Foreheart 4",
    "FPF": "Fan Panel Room Furnace",
    "FPL": "Fan Panel Room Left",
    "FPR": "Fan Panel Room Right",
    "FRF": "Fan Room Furnace",
    "FRL": "Fan Room Left",
    "FRR": "Fan Room Right",
    "FUR": "Furnace",
    "GPR": "Ground Level Panel Room",
    "STR": "Safety Transformer Room",
    "UPS": "UPS Room",
    "VCC": "Vacuüm Corner",
    "VPR": "Vacuüm Panel Room",
}

def extract_id(desc):
    # F1-MDP-1 400V/230V -> F1-MDP-1
    # 4 BAR COMPRESSOR UT-COMP4-1 264 kW -> UT-COMP4-1
    # Find something with hyphens that looks like an ID
    match = re.search(r'\b[A-Z0-9]+-[A-Z0-9]+(?:-[A-Z0-9]+)*\b', desc)
    if match: return match.group(0)
    return desc.split()[0]

def parse_csv():
    items = []
    with open(CSV_PATH, 'r', encoding='latin-1') as f:
        reader = csv.reader(f)
        for row in reader:
            for i in range(0, len(row), 6):
                if i + 1 >= len(row): continue
                panel = row[i].strip()
                loc = row[i+1].strip()
                if not panel or not loc: continue
                if panel.startswith("Panel") or panel == "Legende" or panel == "Afkorting": continue
                
                parts = loc.split('-')
                if len(parts) >= 2:
                    items.append((panel, loc))
    return items

def generate_nodes():
    items = parse_csv()
    
    # Auto-assign Base X for rooms
    room_base_x = {}
    next_x = 200
    
    # Group by Building
    nodes_by_bld = {}
    
    # Group by room for Z-stacking
    room_groups = {} # loc_string -> count
    
    for panel, loc in items:
        parts = loc.split('-')
        bld_code = parts[0]
        bld_name = BLD_MAP.get(bld_code, "unknown")
        
        # Parse F10-A1-0.0-FPR
        grid = ""
        elev = "0.0"
        room = ""
        if len(parts) == 4:
            grid, elev, room = parts[1], parts[2], parts[3]
        elif len(parts) == 3:
            elev, room = parts[1], parts[2]
        else:
            elev = parts[1] if len(parts) > 1 else "0.0"
            room = "UNKNOWN"
            
        # Z-Stacking Logic
        loc_key = f"{bld_code}-{elev}-{room}"
        z_index = room_groups.get(loc_key, 0)
        room_groups[loc_key] = z_index + 1
        
        # Base Y based on elevation
        try:
            elev_f = float(elev)
        except:
            elev_f = 0.0
        
        base_y = 1200 - (elev_f * 50)  # 0.0 -> 1200, 5.5 -> 925, 9.0 -> 750
        
        # Base X based on room
        if room not in room_base_x:
            room_base_x[room] = next_x
            next_x += 250
            
        base_x = room_base_x[room]
        
        # 2.5D Isometric Shift
        final_x = base_x + (z_index * 45)
        final_y = base_y - (z_index * 30)
        
        floor = "Ground Floor" if elev_f == 0.0 else f"Elevated (+{elev}m)"
        zone_suffix = "ground" if elev_f == 0.0 else "elevated"
        zone = f"{bld_name}-{zone_suffix}"
        if zone == "utility-elevated": zone = "utility-ground" # fallback
        
        obj_id = extract_id(panel)
        
        node = {
            "id": obj_id,
            "name": panel,
            "assetType": "panel",
            "layer": "lv-panel",
            "status": "operational",
            "specs": {"location": loc},
            "physicalLocation": {
                "building": bld_name,
                "zone": zone,
                "floor": floor,
                "elevation": f"{elev} m",
                "area": ROOMS.get(room, room)
            },
            "position": {"x": final_x, "y": final_y}
        }
        if grid: node["physicalLocation"]["gridRef"] = grid
        
        if bld_name not in nodes_by_bld:
            nodes_by_bld[bld_name] = []
        nodes_by_bld[bld_name].append(node)
        
    return nodes_by_bld

def main():
    nodes_by_bld = generate_nodes()
    
    # Save as JSON so we can easily inject it or format it
    out_path = r"C:\Users\lukasz.klimowski\Documents\cinernet\data\installations\generated_nodes.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(nodes_by_bld, f, indent=2)
        
    print(f"Generated 2.5D nodes for {len(nodes_by_bld)} buildings.")
    print(f"Saved to {out_path}")

if __name__ == '__main__':
    main()
