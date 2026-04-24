#!/usr/bin/env python3
"""
patch-html-for-light-mode.py

Run from the project root (cf-ai/):
    python3 patch-html-for-light-mode.py

This script adds two things to every .html file in src/:
  1. An inline <script> in <head> (before stylesheets) to apply the saved
     theme preference before first paint — prevents flash of wrong theme.
  2. A <script type="module"> before </body> to load the toggle button.

Safe to run multiple times — it skips files already patched.
"""

import os
import glob

HEAD_SNIPPET = (
    '  <!-- Theme: apply saved preference before paint -->\n'
    '  <script>(function(){var t=localStorage.getItem("theme")'
    '||(matchMedia("(prefers-color-scheme:light)").matches?"light":"dark");'
    'document.documentElement.setAttribute("data-theme",t)})()</script>'
)

BODY_SNIPPET = '  <script type="module" src="/components/theme-toggle.js"></script>'

SENTINEL = 'theme-toggle.js'  # skip if already patched

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if SENTINEL in content:
        print(f"  SKIP (already patched): {filepath}")
        return

    # 1. Insert head snippet before the first <link rel="stylesheet"
    marker = '<link rel="stylesheet"'
    idx = content.find(marker)
    if idx == -1:
        print(f"  WARN: no stylesheet link found in {filepath}")
        return

    line_start = content.rfind('\n', 0, idx) + 1
    content = content[:line_start] + HEAD_SNIPPET + '\n\n' + content[line_start:]

    # 2. Insert body snippet before </body>
    content = content.replace('</body>', BODY_SNIPPET + '\n</body>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  DONE: {filepath}")

def main():
    src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
    if not os.path.isdir(src_dir):
        print("ERROR: src/ directory not found. Run this script from the project root.")
        return

    html_files = sorted(
        glob.glob(os.path.join(src_dir, '*.html'))
        + glob.glob(os.path.join(src_dir, 'use-cases', '*.html'))
    )

    print(f"Patching {len(html_files)} HTML files...\n")
    for f in html_files:
        patch_file(f)
    print(f"\nDone! Toggle button will appear in the header of every page.")

if __name__ == '__main__':
    main()