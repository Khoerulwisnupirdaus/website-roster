import os
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

img_srcs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
print(f"Total <img> tags: {len(img_srcs)}")
missing_imgs = [src for src in img_srcs if not os.path.exists(src.split('?')[0])]
print(f"Missing images: {missing_imgs if missing_imgs else 'None (all exist locally)'}")

link_hrefs = re.findall(r'<link[^>]+href=["\']([^"\']+)["\']', html)
local_links = [h for h in link_hrefs if not h.startswith('http')]
print(f"Local <link> tags: {len(local_links)}")
missing_links = [h for h in local_links if not os.path.exists(h.split('?')[0])]
print(f"Missing local link targets: {missing_links if missing_links else 'None'}")

script_srcs = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', html)
local_scripts = [s for s in script_srcs if not s.startswith('http')]
print(f"Local <script> tags: {len(local_scripts)}")
missing_scripts = [s for s in local_scripts if not os.path.exists(s.split('?')[0])]
print(f"Missing local scripts: {missing_scripts if missing_scripts else 'None'}")
