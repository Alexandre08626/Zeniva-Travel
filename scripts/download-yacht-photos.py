#!/usr/bin/env python3
"""
Script de téléchargement des photos de bateaux YCN Miami
Exécuter sur le VPS: python3 /root/Zeniva-Travel/scripts/download-yacht-photos.py
"""

import requests, json, os, re, time, subprocess
from urllib.parse import quote

SUPABASE_URL = "https://rvlcgtlcjylozbihtpkr.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGNndGxjanlsb3piaWh0cGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NTA4NTMsImV4cCI6MjA4NTAyNjg1M30.ZWQi4bvY1Z3LVb04jxDGt9QLSTEzulGXKTKLrgrSt-Y"

PUBLIC_JSON = "/root/Zeniva-Travel/web/src/data/ycn_packages.json"
OUTPUT_DIR = "/root/Zeniva-Travel/web/public/yachts"

# Mapping: nom du bateau → dossier Google Drive ID
DRIVE_FOLDERS = {
    "43ft Leopard Power Cat (2017)": {"id": "1Wu7LaGQQ_6sVt8ci0HWkKqf7lUOlj9De", "folder": "43ft-leopard-white"},
    "44ft Aquila Power Catamaran (2024)": {"id": "1Ms3-s-5cTfzJhZTTdo9h5T2UNCHKQdxb", "folder": "44ft-aquila-mako"},
    "53ft Leopard PC (2023)": {"id": "1IGG2qkzcw4eCpnaZ5doowpmzAhlCcI7F", "folder": "53ft-leopard-brusea"},
    "68ft Azimut 66 Fly (2016)": {"id": "1_WduPxef0uowQMRjcUdm7GV3PpOw4wGW", "folder": "68ft-azimut-lgb"},
    "70ft Lagoon 630 Fly (2020)": {"id": "1cMwUuLXacAw9JHkiuY7SS7Po1n5g_bCw", "folder": "70ft-lagoon-atlantia"},
}

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

def get_drive_file_ids(folder_id):
    """Récupère les IDs de fichiers d'un dossier Google Drive public via l'API interne"""
    # Try using the drive folder API
    url = f"https://drive.google.com/drive/folders/{folder_id}?usp=share_link"
    r = requests.get(url, headers=headers, timeout=15)
    
    # Extract file IDs from the page source using multiple patterns
    file_ids = []
    
    # Pattern 1: Look for data arrays with file IDs and image extensions
    patterns = [
        r'"([A-Za-z0-9_-]{28,44})","[^"]+\.(?:jpg|jpeg|png|webp|JPG|PNG|JPEG|WEBP)"',
        r'id=([A-Za-z0-9_-]{28,44})&',
        r'"([A-Za-z0-9_-]{28,44})"[^,]{0,20},"(?:image|photo|IMG)',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, r.text, re.IGNORECASE)
        file_ids.extend(matches)
    
    # Remove duplicates and folder ID itself
    file_ids = list(set(f for f in file_ids if f != folder_id and len(f) > 25))
    return file_ids


def download_drive_file(file_id, output_path):
    """Télécharge un fichier depuis Google Drive"""
    url = f"https://drive.google.com/uc?id={file_id}&export=download"
    try:
        r = requests.get(url, headers=headers, timeout=30, allow_redirects=True)
        if r.status_code == 200 and len(r.content) > 5000:
            # Check if it's actually an image
            content_type = r.headers.get('content-type', '')
            if 'image' in content_type or 'jpeg' in content_type or 'png' in content_type:
                with open(output_path, 'wb') as f:
                    f.write(r.content)
                return True
    except Exception as e:
        pass
    return False


def upload_to_supabase(local_path, bucket_path):
    """Upload une image vers Supabase Storage"""
    with open(local_path, 'rb') as f:
        content = f.read()
    
    ext = os.path.splitext(local_path)[1].lower()
    mime = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp'}.get(ext[1:], 'image/jpeg')
    
    url = f"{SUPABASE_URL}/storage/v1/object/yacht-photos/{bucket_path}"
    r = requests.post(url,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": mime,
        },
        data=content,
        timeout=30
    )
    if r.status_code in [200, 201]:
        return f"{SUPABASE_URL}/storage/v1/object/public/yacht-photos/{bucket_path}"
    return None


def process_boat(boat_name, drive_id, folder_slug):
    print(f"\n{'='*50}")
    print(f"Processing: {boat_name}")
    print(f"Drive folder: {drive_id}")
    
    local_dir = os.path.join(OUTPUT_DIR, folder_slug)
    os.makedirs(local_dir, exist_ok=True)
    
    # Get file IDs from Drive
    file_ids = get_drive_file_ids(drive_id)
    print(f"Found {len(file_ids)} potential file IDs")
    
    downloaded_urls = []
    
    if not file_ids:
        print("  No file IDs found — trying direct folder download approach")
        # Alternative: try using the web content link
        # This is a fallback - use Unsplash for this boat type
        return []
    
    for i, fid in enumerate(file_ids[:20]):  # max 20 photos per boat
        ext = '.jpg'  # default
        local_path = os.path.join(local_dir, f"photo_{i+1:02d}{ext}")
        
        if download_drive_file(fid, local_path):
            # Upload to Supabase
            bucket_path = f"yachts/{folder_slug}/photo_{i+1:02d}{ext}"
            public_url = upload_to_supabase(local_path, bucket_path)
            if public_url:
                downloaded_urls.append(public_url)
                print(f"  ✅ Photo {i+1} uploaded: {public_url[:60]}...")
            else:
                # Use local path as fallback
                downloaded_urls.append(f"/yachts/{folder_slug}/photo_{i+1:02d}{ext}")
                print(f"  📁 Photo {i+1} saved locally")
        else:
            print(f"  ❌ Failed to download file {fid[:20]}...")
        
        time.sleep(0.5)
    
    return downloaded_urls


def update_packages_json(boat_name, new_images):
    """Met à jour le ycn_packages.json avec les nouvelles images"""
    with open(PUBLIC_JSON, 'r') as f:
        packages = json.load(f)
    
    updated = False
    for pkg in packages:
        if pkg.get('title') == boat_name:
            if new_images:
                pkg['images'] = new_images
                pkg['thumbnail'] = new_images[0]
                updated = True
                print(f"  Updated {boat_name} with {len(new_images)} images")
    
    if updated:
        with open(PUBLIC_JSON, 'w') as f:
            json.dump(packages, f, indent=2, ensure_ascii=False)
    
    return updated


if __name__ == "__main__":
    print("🚢 YCN Miami Photo Downloader")
    print("================================")
    
    all_results = {}
    
    for boat_name, info in DRIVE_FOLDERS.items():
        urls = process_boat(boat_name, info['id'], info['folder'])
        all_results[boat_name] = urls
        
        if urls:
            update_packages_json(boat_name, urls)
        
        time.sleep(1)
    
    print("\n\n=== RÉSUMÉ FINAL ===")
    for boat, urls in all_results.items():
        print(f"{boat}: {len(urls)} photos ajoutées")
    
    print("\n✅ Fait! Push les changements avec:")
    print("cd /root/Zeniva-Travel && git add -A && git commit -m 'feat: yacht photos from YCN Drive' && git push origin main")
