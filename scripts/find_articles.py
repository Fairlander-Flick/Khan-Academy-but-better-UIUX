import json
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('src/data/courses_manifest.json', 'r', encoding='utf-8') as f:
    m = json.load(f)

# KA URL slug mapping for each course
COURSE_SLUGS = {
    'differential_calculus': 'math/differential-calculus',
    'differential_equations': 'math/differential-equations',
    'integral_calculus': 'math/integral-calculus',
    'linear_algebra': 'math/linear-algebra',
    'multivariable_calculus': 'math/multivariable-calculus',
    'statistics_probability': 'math/statistics-probability',
    'ap_physics_1': 'science/ap-college-physics-1',
    'ap_physics_2': 'science/ap-physics-2',
}

# Unit slug mapping (KA uses kebab-case slugs)
def title_to_slug(title):
    """Convert a title to a KA-style slug"""
    import re
    # Remove "Unit N: " prefix
    t = re.sub(r'^Unit \d+:\s*', '', title)
    # Convert to lowercase, replace spaces with dashes
    t = t.lower().strip()
    t = re.sub(r'[^a-z0-9\s-]', '', t)
    t = re.sub(r'\s+', '-', t)
    return t

articles = []
for c in m['courses']:
    for u in c['units']:
        for l in u.get('lessons', []):
            title = l['title']
            if '(articles)' in title.lower() or '(article)' in title.lower() or l.get('type') == 'article':
                # Construct potential KA URL
                course_slug = COURSE_SLUGS.get(c['id'], '')
                unit_slug = title_to_slug(u['title'])
                lesson_slug = title_to_slug(title).replace('(articles)', '').replace('(article)', '').strip('-')
                
                articles.append({
                    'course': c['title'],
                    'course_id': c['id'],
                    'unit': u['title'],
                    'id': l['id'],
                    'title': title,
                    'type': l.get('type', 'video'),
                    'articleUrl': l.get('articleUrl', ''),
                    'constructed_url': f"https://en.khanacademy.org/{course_slug}/{unit_slug}" if course_slug else '',
                })

# Write to file for easy reading
with open('scripts/articles_list.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

print(f"Total article lessons: {len(articles)}")
for i, a in enumerate(articles):
    print(f"\n{i+1}. [{a['id']}] {a['title']}")
    print(f"   {a['course']} > {a['unit']}")
    if a['articleUrl']:
        print(f"   URL: {a['articleUrl']}")
    else:
        print(f"   Guess: {a['constructed_url']}")
