"""
Test different approaches to get KA article content.
"""

import json
import sys
import io
import requests

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Approach 1: Try KA's internal GraphQL API for article content
def try_graphql_article():
    url = "https://en.khanacademy.org/api/internal/graphql/articleRenderer"
    
    # Common headers
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Origin": "https://en.khanacademy.org",
        "Referer": "https://en.khanacademy.org/math/multivariable-calculus/integrating-multivariable-functions/surface-integrals-articles/a/surface-area-integrals",
    }

    # Try articleRenderer query with path
    payload = {
        "operationName": "articleRenderer",
        "variables": {
            "path": "/math/multivariable-calculus/integrating-multivariable-functions/surface-integrals-articles/a/surface-area-integrals"
        },
        "query": """
        query articleRenderer($path: String!) {
          articleByPath(path: $path) {
            title
            perseusContent
            kaUrl
          }
        }
        """
    }

    try:
        r = requests.post(url, json=payload, headers=headers, timeout=15)
        print(f"GraphQL articleRenderer: {r.status_code}")
        print(f"Response (first 500): {r.text[:500]}")
    except Exception as e:
        print(f"GraphQL error: {e}")

# Approach 2: Try content endpoint
def try_content_api():
    # KA has a content API endpoint
    url = "https://en.khanacademy.org/api/v1/articles/surface-area-integrals"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    }
    try:
        r = requests.get(url, headers=headers, timeout=15)
        print(f"\nContent API: {r.status_code}")
        print(f"Response (first 500): {r.text[:500]}")
    except Exception as e:
        print(f"Content API error: {e}")

# Approach 3: Try the topic tree API
def try_topic_tree():
    url = "https://en.khanacademy.org/api/v1/topictree?kind=Article"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    }
    try:
        r = requests.get(url, headers=headers, timeout=15, stream=True)
        print(f"\nTopic Tree API: {r.status_code}")
        # Just read first 1000 bytes
        data = r.raw.read(1000)
        print(f"Response (first 500): {data[:500]}")
        r.close()
    except Exception as e:
        print(f"Topic Tree error: {e}")

# Approach 4: Try getting article via scrape proxy (Google)
def try_google_cache():
    slug = "surface-area-integrals"
    url = f"https://webcache.googleusercontent.com/search?q=cache:khanacademy.org/math/multivariable-calculus/integrating-multivariable-functions/surface-integrals-articles/a/{slug}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    }
    try:
        r = requests.get(url, headers=headers, timeout=15)
        print(f"\nGoogle Cache: {r.status_code}")
        print(f"Response (first 500): {r.text[:500]}")
    except Exception as e:
        print(f"Google Cache error: {e}")

# Approach 5: Try Wayback Machine
def try_wayback():
    article_url = "https://www.khanacademy.org/math/multivariable-calculus/integrating-multivariable-functions/surface-integrals-articles/a/surface-area-integrals"
    api_url = f"https://archive.org/wayback/available?url={article_url}"
    try:
        r = requests.get(api_url, timeout=15)
        print(f"\nWayback API: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        if data.get('archived_snapshots', {}).get('closest', {}).get('url'):
            snapshot_url = data['archived_snapshots']['closest']['url']
            print(f"Snapshot URL: {snapshot_url}")
            # Try fetching the snapshot
            r2 = requests.get(snapshot_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
            print(f"Snapshot status: {r2.status_code}")
            # Look for perseus content
            if 'perseus' in r2.text.lower() or '"content"' in r2.text:
                # Find JSON data in the page
                start = r2.text.find('{"__typename"')
                if start > 0:
                    print(f"Found JSON data at position {start}")
                    print(f"Preview: {r2.text[start:start+300]}")
    except Exception as e:
        print(f"Wayback error: {e}")

print("Testing approaches to get KA article content...\n")
try_graphql_article()
try_content_api()
try_wayback()
print("\nDone!")
