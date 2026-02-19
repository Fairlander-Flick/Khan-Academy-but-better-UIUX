"""
Update all article-type lessons in courses_manifest.json:
- Set type to "article"
- Add articleUrl (KA topic page URL)
- Remove incorrect youtubeVideoId and youtubeTitle
"""
import json
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

MANIFEST_PATH = 'src/data/courses_manifest.json'

# Map of lesson IDs to their KA article section URLs
ARTICLE_URLS = {
    'mc_u1_06': 'https://www.khanacademy.org/math/multivariable-calculus/thinking-about-multivariable-functions/visualizing-multivariable-functions/a/multivariable-functions',
    'mc_u2_03': 'https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/partial-derivative-and-gradient-articles/a/introduction-to-partial-derivatives',
    'mc_u2_08': 'https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/differentiating-vector-valued-functions-articles/a/multivariable-chain-rule-simple-version',
    'mc_u2_11': 'https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/divergence-and-curl-articles/a/divergence',
    'mc_u3_04': 'https://www.khanacademy.org/math/multivariable-calculus/applications-of-multivariable-derivatives/optimizing-multivariable-functions-articles/a/maximums-minimums-and-saddle-points',
    'mc_u3_06': 'https://www.khanacademy.org/math/multivariable-calculus/applications-of-multivariable-derivatives/constrained-optimization-articles/a/lagrange-multipliers-single-constraint',
    'mc_u4_02': 'https://www.khanacademy.org/math/multivariable-calculus/integrating-multivariable-functions/line-integrals-for-scalar-functions-articles/a/line-integrals-in-a-scalar-field',
    'mc_u4_04': 'https://www.khanacademy.org/math/multivariable-calculus/integrating-multivariable-functions/line-integrals-in-vector-fields-articles/a/line-integrals-in-a-vector-field',
    'mc_u4_06': 'https://www.khanacademy.org/math/multivariable-calculus/integrating-multivariable-functions/double-integrals-articles/a/double-integrals',
    # mc_u4_12a-d already have URLs, skip them
    'mc_u4_14': 'https://www.khanacademy.org/math/multivariable-calculus/integrating-multivariable-functions/flux-in-3d-articles/a/flux-in-3d',
    'mc_u5_03': 'https://www.khanacademy.org/math/multivariable-calculus/greens-stokes-and-the-divergence-theorems/greens-theorem-articles/a/greens-theorem',
    'mc_u5_06': 'https://www.khanacademy.org/math/multivariable-calculus/greens-stokes-and-the-divergence-theorems/stokes-theorem-articles/a/stokes-theorem',
    'mc_u5_08': 'https://www.khanacademy.org/math/multivariable-calculus/greens-stokes-and-the-divergence-theorems/divergence-theorem-articles/a/3d-divergence-theorem',
}

with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

updated = 0
for course in manifest['courses']:
    for unit in course['units']:
        for lesson in unit.get('lessons', []):
            lid = lesson['id']
            title = lesson['title']
            
            # Check if this is an article lesson (by title or already marked)
            is_article = ('(articles)' in title.lower() or 
                         '(article)' in title.lower() or 
                         lesson.get('type') == 'article')
            
            if is_article:
                # Set type
                lesson['type'] = 'article'
                
                # Add URL if we have one and lesson doesn't already have one
                if lid in ARTICLE_URLS and not lesson.get('articleUrl'):
                    lesson['articleUrl'] = ARTICLE_URLS[lid]
                
                # Remove incorrect video fields
                if 'youtubeVideoId' in lesson:
                    del lesson['youtubeVideoId']
                if 'youtubeTitle' in lesson:
                    del lesson['youtubeTitle']
                
                updated += 1
                print(f"  Updated: [{lid}] {title}")
                if lesson.get('articleUrl'):
                    print(f"    URL: {lesson['articleUrl']}")

# Save
with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

print(f"\nTotal updated: {updated}")
print(f"Saved to {MANIFEST_PATH}")
