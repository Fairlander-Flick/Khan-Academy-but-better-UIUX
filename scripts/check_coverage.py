import json

with open('src/data/courses_manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

total = 0
found = 0
missing = []

for course in manifest['courses']:
    course_found = 0
    course_total = 0
    for unit in course['units']:
        for lesson in unit.get('lessons', []):
            course_total += 1
            total += 1
            if lesson.get('youtubeVideoId'):
                course_found += 1
                found += 1
            else:
                missing.append(f"  {course['title']} > {unit['title']} > {lesson['title']}")
    
    pct = round(course_found / max(course_total, 1) * 100)
    print(f"{course['title']:40s} {course_found:3d}/{course_total:3d}  ({pct}%)")

print(f"\n{'='*60}")
print(f"TOTAL: {found}/{total} videos found ({round(found/total*100)}%)")
print(f"Missing: {total - found}")

if missing:
    print(f"\nMissing lessons:")
    for m in missing[:20]:
        print(m)
    if len(missing) > 20:
        print(f"  ... and {len(missing) - 20} more")
