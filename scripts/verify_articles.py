import json

with open('src/data/courses_manifest.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

articles = [l for c in d['courses'] for u in c['units'] for l in u.get('lessons', []) if l.get('type') == 'article']
print(f"Articles: {len(articles)}")
for a in articles:
    has_url = bool(a.get('articleUrl'))
    has_video = bool(a.get('youtubeVideoId'))
    print(f"  {a['id']}: url={has_url} video={has_video}")
