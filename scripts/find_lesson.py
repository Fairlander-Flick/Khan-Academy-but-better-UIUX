import json

with open('src/data/courses_manifest.json', 'r', encoding='utf-8') as f:
    m = json.load(f)

for c in m['courses']:
    if c['id'] == 'multivariable_calculus':
        for u in c['units']:
            if 'u4' in u['id']:
                print(f"Unit: {u['title']}")
                for i, l in enumerate(u['lessons']):
                    vid = l.get('youtubeVideoId', 'NONE')
                    print(f"  {i}. [{l['id']}] {l['title']}  | vid={vid}")
