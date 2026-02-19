"""
Khan Academy Video Scraper — via yt-dlp
Extracts video metadata from Khan Academy's YouTube channel playlists.

Strategy:
1. Use yt-dlp to extract playlist/channel metadata (no download, just info)
2. Search Khan Academy's YouTube channel for our topics
3. Map videos to courses_manifest.json
"""

import subprocess
import json
import sys
import os

# Khan Academy YouTube Channel
KA_CHANNEL = "https://www.youtube.com/@khanacademy"

# Known KA playlist URLs (some are well-known)
# We'll search for these first
KNOWN_SEARCHES = [
    # Differential Calculus topics  
    "khanacademy limits",
    "khanacademy derivatives",
]

def check_ytdlp():
    """Check if yt-dlp is available"""
    try:
        result = subprocess.run(["yt-dlp", "--version"], capture_output=True, text=True)
        print(f"✅ yt-dlp version: {result.stdout.strip()}")
        return True
    except FileNotFoundError:
        print("❌ yt-dlp not found. Install with: pip install yt-dlp")
        return False

def search_ka_channel(query, max_results=5):
    """Search Khan Academy's YouTube channel"""
    search_url = f"ytsearch{max_results}:khan academy {query}"
    cmd = [
        "yt-dlp",
        "--flat-playlist",
        "--dump-json",
        "--no-warnings",
        search_url
    ]
    
    print(f"\nSearching: '{query}'...")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        videos = []
        for line in result.stdout.strip().split('\n'):
            if line:
                try:
                    data = json.loads(line)
                    videos.append({
                        "id": data.get("id"),
                        "title": data.get("title"),
                        "url": data.get("url") or data.get("webpage_url"),
                        "duration": data.get("duration"),
                        "channel": data.get("channel"),
                        "uploader": data.get("uploader"),
                    })
                except json.JSONDecodeError:
                    pass
        
        # Filter to Khan Academy only
        ka_videos = [v for v in videos if v.get("uploader") and "Khan" in v["uploader"]]
        return ka_videos if ka_videos else videos
        
    except subprocess.TimeoutExpired:
        print("  Timeout!")
        return []
    except Exception as e:
        print(f"  Error: {e}")
        return []

def get_channel_playlists():
    """Get all playlists from Khan Academy's YouTube channel"""
    # Try fetching channel playlists tab
    url = "https://www.youtube.com/@khanacademy/playlists"
    cmd = [
        "yt-dlp",
        "--flat-playlist",
        "--dump-json",
        "--no-warnings",
        "--playlist-end", "50",
        url
    ]
    
    print(f"\nFetching KA channel playlists...")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        playlists = []
        for line in result.stdout.strip().split('\n'):
            if line:
                try:
                    data = json.loads(line)
                    playlists.append({
                        "id": data.get("id"),
                        "title": data.get("title"),
                        "url": data.get("url") or data.get("webpage_url"),
                    })
                except json.JSONDecodeError:
                    pass
        return playlists
    except subprocess.TimeoutExpired:
        print("  Timeout!")
        return []
    except Exception as e:
        print(f"  Error: {e}")
        return []

def get_playlist_videos(playlist_url, max_videos=100):
    """Get all videos from a specific playlist"""
    cmd = [
        "yt-dlp",
        "--flat-playlist",
        "--dump-json",
        "--no-warnings",
        "--playlist-end", str(max_videos),
        playlist_url
    ]
    
    print(f"\nFetching playlist videos: {playlist_url[:60]}...")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        videos = []
        for line in result.stdout.strip().split('\n'):
            if line:
                try:
                    data = json.loads(line)
                    videos.append({
                        "videoId": data.get("id"),
                        "title": data.get("title"),
                        "duration": data.get("duration"),
                    })
                except json.JSONDecodeError:
                    pass
        return videos
    except subprocess.TimeoutExpired:
        print("  Timeout!")
        return []

if __name__ == "__main__":
    if not check_ytdlp():
        print("\nInstalling yt-dlp...")
        subprocess.run([sys.executable, "-m", "pip", "install", "yt-dlp"], 
                       capture_output=True)
        if not check_ytdlp():
            sys.exit(1)
    
    # Step 1: Get channel playlists
    playlists = get_channel_playlists()
    
    if playlists:
        print(f"\n{'='*60}")
        print(f"Found {len(playlists)} playlists:")
        print(f"{'='*60}")
        for i, p in enumerate(playlists[:30]):
            print(f"  {i+1}. {p['title']} ({p['id']})")
        
        # Save to file
        with open("ka_playlists.json", "w", encoding="utf-8") as f:
            json.dump(playlists, f, indent=2, ensure_ascii=False)
        print(f"\n✅ Saved {len(playlists)} playlists to ka_playlists.json")
    else:
        print("\n⚠️ No playlists found via channel. Trying search...")
        
        # Step 2: Search for specific topics
        for query in KNOWN_SEARCHES:
            videos = search_ka_channel(query)
            for v in videos:
                print(f"  📺 {v['title']} | {v['id']} | {v.get('uploader', 'N/A')}")
