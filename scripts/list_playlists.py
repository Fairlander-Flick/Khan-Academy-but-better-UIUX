import json
data = json.load(open('ka_playlists.json', 'r', encoding='utf-8'))
for i, p in enumerate(data):
    print(f"{i+1}. {p['title']}  |  {p['id']}")
