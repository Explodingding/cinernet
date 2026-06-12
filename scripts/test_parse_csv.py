import os
import csv
import re

CSV_PATH = r"C:\Users\lukasz.klimowski\Documents\cinernet\Panel connections 2(Locations).csv"

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
                if panel.startswith("Panel") or panel == "Legende": continue
                
                parts = loc.split('-')
                if len(parts) >= 2:
                    items.append((panel, loc))
    return items

def main():
    items = parse_csv()
    print(f"Found {len(items)} items in CSV.")
    for panel, loc in items[:15]:
        print(f"Panel: {panel} | Loc: {loc}")

if __name__ == '__main__':
    main()
