import urllib.request
import re

with open('D:/Furtner/src/data/products.js', 'r', encoding='utf-8') as f:
    prod_text = f.read()

with open('D:/Furtner/src/data/categories.js', 'r', encoding='utf-8') as f:
    cat_text = f.read()

with open('D:/Furtner/src/data/collections.js', 'r', encoding='utf-8') as f:
    col_text = f.read()

urls = set(re.findall(r'https?://[^\s\'\"\`]+', prod_text + cat_text + col_text))
print(f"Total unique remote URLs: {len(urls)}")

failed = []
for u in urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status != 200:
                failed.append((u, resp.status))
    except Exception as e:
        failed.append((u, str(e)))

print(f"Failed URLs: {len(failed)}")
for u, err in failed:
    print(' ', u, '->', err)

