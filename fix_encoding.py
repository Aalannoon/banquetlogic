# Fix mojibake in BanquetLogic index.html
# Run from project folder: python fix_encoding.py

import os
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'index.html')
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()

# Em dash: â€" (3 chars) -> —
s = s.replace('\u00e2\u20ac\u201c', '\u2014')
s = s.replace('\u00e2\u20ac\u201d', '\u2014')
s = s.replace('\u00e2\u20ac\u2014', '\u2014')

# Arrows: â¬… -> ←, âž¡ -> →
s = s.replace('\u00e2\u0080\u0098', '\u2190')
s = s.replace('\u00e2\u009e\u00a1', '\u2192')

# Emoji: mojibake form (UTF-8 bytes read as Windows-1252)
# ðŸ"' -> 🔒, ðŸ"" -> 🔓, etc.
s = s.replace('\u00f0\u0178\u201c\u2019', '\U0001f512')   # lock
s = s.replace('\u00f0\u0178\u201c\u201d', '\U0001f513')   # unlock
s = s.replace('\u00f0\u0178\u00a7', '\U0001f4e7')        # email (3 chars)
s = s.replace('\u00f0\u0178\u2018', '\U0001f4c1')        # upload
s = s.replace('\u00f0\u0178\u2039', '\U0001f4cb')        # clipboard
s = s.replace('\u00f0\u2019\u00be', '\U0001f4be')        # save
s = s.replace('\u00f0\u0178\u00a5', '\U0001f4e5')       # inbox
s = s.replace('\u00f0\u009f\u009a\u00a8', '\U0001f6a8')  # siren
s = s.replace('\u00f0\u2019\u00a1', '\U0001f4a1')       # light bulb
s = s.replace('\u00e2\u009a\u00a0\u00ef\u00b8\u008f', '\u26a0\ufe0f')  # âš ï¸ -> ⚠️
s = s.replace('\u00e2\u0080\u00b9\u00ef\u00b8\u008f', '\u2139\ufe0f')  # â„¹ï¸ -> ℹ️

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(s)
print('Encoding fixes applied to index.html')
