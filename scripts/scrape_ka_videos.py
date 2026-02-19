"""
Khan Academy Full Video Scraper
================================
Searches KA's YouTube channel for videos matching each lesson topic,
then updates courses_manifest.json with YouTube video IDs.

Strategy:
- For each lesson title in courses_manifest.json, search YouTube
  with "khan academy <lesson title>" and pick the best match from KA's channel
- Uses yt-dlp for fast metadata extraction
"""

import subprocess
import json
import os
import sys
import time
import re
import io
from difflib import SequenceMatcher

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

MANIFEST_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'courses_manifest.json')
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'courses_manifest.json')
CACHE_PATH = os.path.join(os.path.dirname(__file__), 'video_cache.json')

# Khan Academy's YouTube channel ID
KA_CHANNEL_ID = "UC4a-Gbdw7vOaccHmFo40b9g"

def load_cache():
    """Load cached search results"""
    if os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_cache(cache):
    """Save search cache"""
    with open(CACHE_PATH, 'w', encoding='utf-8') as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

def search_youtube(query, max_results=5):
    """Search YouTube for a specific query, return video metadata"""
    search_url = f"ytsearch{max_results}:{query}"
    cmd = [
        "yt-dlp",
        "--flat-playlist",
        "--dump-json",
        "--no-warnings",
        "--socket-timeout", "10",
        search_url
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        videos = []
        for line in result.stdout.strip().split('\n'):
            if line.strip():
                try:
                    data = json.loads(line)
                    videos.append({
                        "videoId": data.get("id", ""),
                        "title": data.get("title", ""),
                        "channel": data.get("channel", "") or data.get("uploader", ""),
                        "channelId": data.get("channel_id", "") or data.get("uploader_id", ""),
                        "duration": data.get("duration"),
                    })
                except json.JSONDecodeError:
                    pass
        return videos
    except subprocess.TimeoutExpired:
        return []
    except Exception as e:
        print(f"    Search error: {e}")
        return []

def similarity(a, b):
    """Simple string similarity ratio"""
    a_clean = re.sub(r'[^\w\s]', '', a.lower().strip())
    b_clean = re.sub(r'[^\w\s]', '', b.lower().strip())
    return SequenceMatcher(None, a_clean, b_clean).ratio()

def find_best_match(lesson_title, course_title, results):
    """Find the best matching Khan Academy video from search results"""
    # Prefer Khan Academy channel
    ka_results = [v for v in results if "Khan" in v.get("channel", "")]
    
    candidates = ka_results if ka_results else results
    
    if not candidates:
        return None
    
    # Score each result
    best_score = 0
    best_match = None
    
    for v in candidates:
        video_title = v.get("title", "")
        
        # Similarity between lesson title and video title
        score = similarity(lesson_title, video_title)
        
        # Bonus if the lesson title words appear in the video title
        lesson_words = set(lesson_title.lower().split())
        video_words = set(video_title.lower().split())
        word_overlap = len(lesson_words & video_words) / max(len(lesson_words), 1)
        score += word_overlap * 0.3
        
        # Bonus for Khan Academy channel
        if "Khan" in v.get("channel", ""):
            score += 0.2
        
        if score > best_score:
            best_score = score
            best_match = v
    
    return best_match if best_score > 0.3 else None

def scrape_all():
    """Main scraping function"""
    # Load manifest
    with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    
    cache = load_cache()
    
    total_lessons = sum(
        len(lesson) 
        for course in manifest['courses'] 
        for unit in course['units'] 
        for lesson in [unit.get('lessons', [])]
    )
    
    print(f"=" * 60)
    print(f"Khan Academy Video Scraper")
    print(f"Total lessons to search: {total_lessons}")
    print(f"Cached results: {len(cache)}")
    print(f"=" * 60)
    
    found = 0
    not_found = 0
    skipped = 0
    
    for course in manifest['courses']:
        course_title = course['title']
        print(f"\n[COURSE] {course_title}")
        
        for unit in course['units']:
            unit_title = unit['title']
            print(f"  [UNIT] {unit_title}")
            
            for lesson in unit.get('lessons', []):
                lesson_title = lesson['title']
                lesson_id = lesson['id']
                
                # Check cache
                if lesson_id in cache:
                    cached = cache[lesson_id]
                    if cached.get('videoId'):
                        lesson['youtubeVideoId'] = cached['videoId']
                        lesson['youtubeTitle'] = cached.get('youtubeTitle', '')
                        found += 1
                        skipped += 1
                        continue
                
                # Search YouTube
                query = f"khan academy {lesson_title}"
                print(f"    >> {lesson_title}...", end=" ", flush=True)
                
                results = search_youtube(query)
                match = find_best_match(lesson_title, course_title, results)
                
                if match:
                    lesson['youtubeVideoId'] = match['videoId']
                    lesson['youtubeTitle'] = match['title']
                    cache[lesson_id] = {
                        'videoId': match['videoId'],
                        'youtubeTitle': match['title'],
                        'channel': match.get('channel', ''),
                    }
                    found += 1
                    print(f"OK {match['videoId']} - {match['title'][:50]}")
                else:
                    cache[lesson_id] = {'videoId': None}
                    not_found += 1
                    print(f"MISS")
                
                # Save cache periodically
                save_cache(cache)
                
                # Small delay to avoid rate limiting
                time.sleep(0.5)
    
    # Save updated manifest
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'=' * 60}")
    print(f"RESULTS:")
    print(f"  Found: {found}")
    print(f"  Not found: {not_found}")
    print(f"  Skipped (cached): {skipped}")
    print(f"  Updated: {OUTPUT_PATH}")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    scrape_all()
