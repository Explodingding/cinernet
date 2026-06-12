import os
import re
import csv
import sys

try:
    import fitz  # PyMuPDF
except ImportError:
    print("PyMuPDF is not installed. Please install it with: pip install PyMuPDF")
    sys.exit(1)

PDF_DIR = r"C:\Users\lukasz.klimowski\Documents\cinernet"
OUTPUT_CSV = os.path.join(PDF_DIR, "extracted_objects.csv")

# Regex to find tags like TR-01, MAIN-HV-CELL-01, F1-HOT-DP
TAG_PATTERN = re.compile(r'\b[A-Z][A-Z0-9]*-[A-Z0-9]+(?:-[A-Z0-9]+)*\b')

# Ignore lists for common electrical/cable notations that match the pattern
IGNORE_LIST = {
    'VCB-3AH5', 'VCB-SION', 'EXECGB', 'EXECG', 'EAXECWB', 'SICAM-Q100', '1X240', '3X1X630',
    'FS5', 'SFS5', 'FS10', 'SFS10', 'P2P1', 'L1L2L3'
}

def extract_tags_from_pdf(pdf_path):
    tags = set()
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text = page.get_text()
            matches = TAG_PATTERN.findall(text)
            for match in matches:
                # Basic noise filtering
                if len(match) < 4: continue
                if any(ignored in match for ignored in IGNORE_LIST): continue
                if re.match(r'^\d+-\d+', match): continue # starts with numbers like 66-15
                
                tags.add(match)
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
    return tags

def main():
    all_tags = set()
    
    for filename in os.listdir(PDF_DIR):
        if filename.lower().endswith('.pdf'):
            pdf_path = os.path.join(PDF_DIR, filename)
            print(f"Scanning {filename}...")
            tags = extract_tags_from_pdf(pdf_path)
            all_tags.update(tags)
            print(f"  Found {len(tags)} potential tags.")

    print(f"\nTotal unique tags found: {len(all_tags)}")
    
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Object ID', 'Asset Type', 'Layer Level', 'X pos', 'Y pos'])
        for tag in sorted(all_tags):
            writer.writerow([tag, '', '', '', ''])
            
    print(f"Exported to {OUTPUT_CSV}")

if __name__ == '__main__':
    main()
