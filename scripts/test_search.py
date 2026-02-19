"""Quick test: Search for just 3 lessons to validate the approach works."""

import subprocess
import json
import re
from difflib import SequenceMatcher

test_queries = [
    "khan academy Limits intro",
    "khan academy Power rule derivatives",
    "khan academy Scalars and vectors in 1D",
]

def search_youtube(query, max_results=3):
    search_url = f"ytsearch{max_results}:{query}"
    cmd = ["yt-dlp", "--flat-playlist", "--dump-json", "--no-warnings", search_url]
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
                    })
                except json.JSONDecodeError:
                    pass
        return videos
    except Exception as e:
        print(f"Error: {e}")
        return []

for query in test_queries:
    print(f"\n{'='*50}")
    print(f"Query: {query}")
    results = search_youtube(query)
    for i, v in enumerate(results):
        ka_flag = "🟢" if "Khan" in v.get("channel", "") else "⚪"
        print(f"  {ka_flag} {i+1}. [{v['videoId']}] {v['title']} | {v['channel']}")
