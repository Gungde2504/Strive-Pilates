import os

files = [
    "frontend/src/pages/public/HomePage.jsx",
    "frontend/src/pages/public/ClassesPage.jsx",
    "frontend/src/pages/public/AboutPage.jsx",
    "frontend/src/pages/public/SchedulePage.jsx",
    "frontend/src/pages/public/PackagesPage.jsx",
    "frontend/src/components/public/Footer.jsx",
]

replacements = [
    (b"\xe2\x80\x93", "–"),
    (b"\xe2\x86\x92", "→"),
    (b"\xe2\x86\x93", "↓"),
    (b"\xe2\x98\x85", "★"),
    (b"\xe2\x94\x80", "-"),
    (b"\xc2\xb7", "·"),
    (b"\xe2\x80\x99", chr(8217)),
    (b"\xe2\x80\x9c", chr(8220)),
    (b"\xe2\x80\x9d", chr(8221)),
]

for filepath in files:
    if not os.path.exists(filepath):
        print(f"Skip: {filepath}")
        continue
    with open(filepath, "rb") as f:
        raw = f.read()
    for bad_bytes, good in replacements:
        raw = raw.replace(bad_bytes, good.encode("utf-8"))
    with open(filepath, "wb") as f:
        f.write(raw)
    print(f"Fixed: {filepath}")

print("Done!")
