import json
import re

DATA = """
TR-DP 1.1 400V/230V 50Hz	UTB-Y1-5.5-LVR
F1-MDP-1 400V/230V	F10-A1-0.0-FPR
F1-MDP-2 400V/230V	F10-A1-0.0-FPR
F1-MDP-3 400V/230V	F10-A1-0.0-FPL
F1-MDP-4 400V/230V 50Hz	F10-A1-0.0-FPL
F1-MDP-7 400V/230V 50Hz	F10-A1-0.0-VPR
FH10 400V/230V 2|3X1120A|	F10-A1-9.0-FH1
FUR 10 CHIMNEY FILTRATION SYSTEM 814kW	F10-0.0-CFS
4 BAR COMPRESSOR UT-COMP4-1 264 kW	UTB-Y2-0.0-CPH
4 BAR DRYER  UT-DRY4-1 58.5kW	UTB-Y2-0.0-CPH
CHILLER 1 ACH-01 237.8kW	F10-0.0-CFS
CHILLER 2 ACH-01 237.8kW	F10-0.0-CFS
TR-DP1 PFC WITH HARMONIC FILTER 1500kVAr	UTB-Y1-5.5-LVR
FOREHEART TRANSFORMER DISTRIBUTION PANEL 1.1 20kW	F10-A1-9.0-FH1
FOREHEART TRANSFORMER DISTRIBUTION PANEL 1.2 20kW	F10-A1-9.0-FH1
FOREHEART TRANSFORMER DISTRIBUTION PANEL 1.3 20kW	F10-A1-9.0-FH1
FOREHEART TRANSFORMER DISTRIBUTION PANEL 1.4 20kW	F10-A1-9.0-FH1
FOREHEART TRANSFORMER DISTRIBUTION PANEL 2.1 20kW	F10-A1-9.0-FH2
FOREHEART TRANSFORMER DISTRIBUTION PANEL 2.2 20kW	F10-A1-9.0-FH2
FOREHEART TRANSFORMER DISTRIBUTION PANEL 2.3 20kW	F10-A1-9.0-FH2
FOREHEART TRANSFORMER DISTRIBUTION PANEL 2.4 20kW	F10-A1-9.0-FH2
FOREHEART TRANSFORMER DISTRIBUTION PANEL 3.1 20kW	F10-A1-9.0-FH3
FOREHEART TRANSFORMER DISTRIBUTION PANEL 3.2 20kW	F10-A1-9.0-FH3
FOREHEART TRANSFORMER DISTRIBUTION PANEL 3.3 20kW	F10-A1-9.0-FH3
FOREHEART TRANSFORMER DISTRIBUTION PANEL 3.4 20kW	F10-A1-9.0-FH3
FOREHEART TRANSFORMER DISTRIBUTION PANEL 4.1 20kW	F10-A1-9.0-FH4
FOREHEART TRANSFORMER DISTRIBUTION PANEL 4.2 20kW	F10-A1-9.0-FH4
FOREHEART TRANSFORMER DISTRIBUTION PANEL 4.3 20kW	F10-A1-9.0-FH4
FOREHEART TRANSFORMER DISTRIBUTION PANEL 4.4 20kW	F10-A1-9.0-FH4
THROAT BOOST PANEL |TRANSFORMER| 20kW	F10-A1-9.0-FUR
STIRRER  PANEL DISTRIBUTION BOARD - 1 1.18kW	F10-A1-9.0-FH1
STIRRER  PANEL DISTRIBUTION BOARD - 2 1.18kW	F10-A1-9.0-FH1
STIRRER  PANEL DISTRIBUTION BOARD - 3 1.18kW	F10-A1-9.0-FH2
STIRRER  PANEL DISTRIBUTION BOARD - 4 1.18kW	F10-A1-9.0-FH2
STIRRER  PANEL DISTRIBUTION BOARD - 5 1.18kW	F10-A1-9.0-FH3
STIRRER  PANEL DISTRIBUTION BOARD - 6 1.18kW	F10-A1-9.0-FH3
STIRRER  PANEL DISTRIBUTION BOARD - 7 1.18kW	F10-A1-9.0-FH4
STIRRER  PANEL DISTRIBUTION BOARD - 8 1.18kW	F10-A1-9.0-FH4
VACUM COMPRESOR F10-VAC-01 91.9kW	F10-A1-0.0-VCC
VACUM COMPRESOR F10-VAC-02 91.9kW	F10-A1-0.0-VCC
VACUM COMPRESOR F10-VAC-03 91.9kW	F10-A1-0.0-VCC
VACUM COMPRESOR F10-VAC-04 91.9kW	F10-A1-0.0-VCC
EMOC COOLING FAN F10-ECF-14-1 110kW	F10-A1-0.0-FRL
EMOC COOLING FAN F10-ECF-14-2 110kW	F10-A1-0.0-FRL
CONVEYOR COOLING FAN F10-CCF-13 55kW	F10-A1-0.0-FRL
CONVEYOR COOLING FAN F10-CCF-13-14 55kW	F10-A1-0.0-FRL
CONVEYOR COOLING FAN F10-CCF-14-1 55kW	F10-A1-0.0-FRL
VERTFLOW COOLING FAN F10-VCF-13-2	F10-A1-0.0-FRL
VERTFLOW COOLING FAN F10-VCF-13-1	F10-A1-0.0-FRL
EMOC COOLING FAN F10-ECF-13-2	F10-A1-0.0-FRL
EMOC COOLING FAN F10-ECF-12-1 110kW	F10-A1-0.0-FRR
EMOC COOLING FAN F10-ECF-12-2 110kW	F10-A1-0.0-FRR
CONVEYOR COOLING FAN F10-CCF-11 55kW	F10-A1-0.0-FRR
CONVEYOR COOLING FAN F10-CCF-11-12 55kW	F10-A1-0.0-FRR
CONVEYOR COOLING FAN F10-CCF-12-1 55kW	F10-A1-0.0-FRR
VERTFLOW COOLING FAN F10-VCF-11-2	F10-A1-0.0-FRR
VERTFLOW COOLING FAN F10-VCF-11-1	F10-A1-0.0-FRR
EMOC COOLING FAN F10-ECF-11-2 110kW	F10-A1-0.0-FRR
"""

ROOMS = {
    "LVR": "Low voltage room",
    "BFC": "Batch & Furnace Control Room",
    "BMR": "Botero Machine Room",
    "BTH": "Botero Timing Room Hallway",
    "BTR": "Botero Timing Room",
    "CFS": "Chimney Filtration System",
    "CNC": "Canteen Corridor",
    "COE": "Cold End",
    "CPC": "Control Panel Corner",
    "CPH": "Compressorhal",
    "CPR": "Compressor Panel Room",
    "CRA": "Cullet Return Area",
    "CRR": "Corner Reserve Room",
    "FCR": "Fusion Pool Control Room",
    "FGS": "Furnace Gas Skid",
    "FH1": "Foreheart 1",
    "FH2": "Foreheart 2",
    "FH3": "Foreheart 3",
    "FH4": "Foreheart 4",
    "FLR": "Female Locker Room",
    "FPF": "Fan Panel Room Furnace",
    "FPL": "Fan Panel Room Left",
    "FPR": "Fan Panel Room Right",
    "FRF": "Fan Room Furnace",
    "FRL": "Fan Room Left",
    "FRR": "Fan Room Right",
    "FSS": "Fire Supression System Room",
    "FUR": "Furnace",
    "GPR": "Ground Level Panel Room",
    "GSR": "Generator Synchronisation Room",
    "HSE": "HSE Office Corridor",
    "LCR": "Lathi Control Room",
    "LTR": "Technical Room Left Side",
    "MLR": "Male Locker Room",
    "MTR": "Monosection Training Room",
    "MVC": "Midle Voltage Corridor",
    "PEL": "Pallet Elevator",
    "RFL": "Left Rotary Filter Room",
    "RFR": "Right Rotary Filter Room",
    "RPL": "Re-Paletizer",
    "RTR": "Technical Room Richt Side",
    "STR": "Safety Transformer Room",
    "SWP": "Shrinking Wrap Pallet",
    "UPS": "UPS Room",
    "UTR": "Utilities technical Room (Besides UT Workshop)",
    "UTW": "Utilities workshop",
    "VCC": "Vacuüm Corner",
    "VPR": "Vacuüm Panel Room",
}

BLD_MAP = {
    "F10": "furnace-10",
    "UTB": "utility",
    "F20": "furnace-20",
    "BH": "batch-house"
}

results = []

for line in DATA.strip().split('\n'):
    if '\t' not in line: continue
    desc, loc = line.split('\t')
    desc = desc.strip()
    loc = loc.strip()
    
    parts = loc.split('-')
    bld_code = parts[0]
    
    bld_name = BLD_MAP.get(bld_code, "unknown")
    
    # Format might be F10-A1-0.0-FPR or F10-0.0-CFS
    if len(parts) == 4:
        grid = parts[1]
        elev = parts[2]
        room = parts[3]
    elif len(parts) == 3:
        grid = ""
        elev = parts[1]
        room = parts[2]
    else:
        grid, elev, room = "", "", ""
        
    floor = "Ground Floor" if elev == "0.0" else f"Elevated (+{elev}m)"
    zone_suffix = "ground" if elev == "0.0" else "elevated"
    zone = f"{bld_name}-{zone_suffix}"
    
    room_name = ROOMS.get(room, room)
    
    # Extract ID from desc
    # This is a bit tricky, let's use the first word if it matches ID patterns, or clean up
    # E.g. "F1-MDP-1 400V/230V" -> F1-MDP-1
    # "EMOC COOLING FAN F10-ECF-14-1 110kW" -> F10-ECF-14-1
    id_match = re.search(r'\b[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+(?:-[A-Z0-9]+)*\b', desc)
    obj_id = id_match.group(0) if id_match else desc.split()[0]
    
    phys_loc = {
        "building": bld_name,
        "zone": zone,
        "floor": floor,
        "elevation": f"{elev} m",
        "area": room_name,
    }
    if grid:
        phys_loc["gridRef"] = grid
        
    # Generate the TS snippet
    snippet = f"""  {{
    id: '{obj_id}',
    name: '{desc}',
    assetType: 'panel', // TODO: adjust type
    layer: 'lv-panel', // TODO: adjust layer
    status: 'operational',
    specs: {{
      location: '{loc}'
    }},
    physicalLocation: {json.dumps(phys_loc, indent=6).replace('"', "'")[:-1]}    }}
  }}"""
    results.append(snippet)

md_content = "# Mapped Equipment Data\\n\\n"
md_content += "Here is how your equipment list translates directly into `TopologyNodeInput` objects for our TypeScript codebase based on the location parsing rules you provided:\\n\\n"
md_content += "```typescript\\n" + ",\\n".join(results) + "\\n```"

with open("C:/Users/lukasz.klimowski/.gemini/antigravity/brain/9633c68b-14af-4179-99f3-0795889d31fb/equipment_mapping.md", "w") as f:
    f.write(md_content)

print("Mapping generated in equipment_mapping.md")
