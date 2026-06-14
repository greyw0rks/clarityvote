#!/usr/bin/env python3
"""
Patch clarityvote.clar: replace illegal non-ASCII characters with ASCII equivalents.
Run from inside the Clarityvote project directory:
  python3 patch_clarityvote.py
"""
import re

path = "contracts/clarityvote.clar"

replacements = {
    "\u2014": "--",   # em dash
    "\u2013": "-",    # en dash
    "\u2192": "->",   # right arrow
    "\u00d7": "x",    # multiplication sign
    "\u2018": "'",    # left single quote
    "\u2019": "'",    # right single quote
    "\u201c": '"',    # left double quote
    "\u201d": '"',    # right double quote
}

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

original = content
for char, replacement in replacements.items():
    content = content.replace(char, replacement)

# Catch any remaining non-ASCII chars in comments (replace with ?)
def replace_non_ascii_in_comments(text):
    lines = text.split("\n")
    result = []
    for line in lines:
        if ";;" in line:
            # Replace any remaining non-ASCII after the comment marker
            comment_idx = line.index(";;")
            before = line[:comment_idx]
            comment = line[comment_idx:]
            comment = comment.encode("ascii", errors="replace").decode("ascii")
            line = before + comment
        result.append(line)
    return "\n".join(result)

content = replace_non_ascii_in_comments(content)

if content == original:
    print("No changes needed.")
else:
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Patched {path} — illegal characters replaced.")

# Verify no non-ASCII remains
remaining = [(i+1, repr(c)) for i, c in enumerate(content) if ord(c) > 127]
if remaining:
    print(f"WARNING: {len(remaining)} non-ASCII chars still remain:")
    for pos, char in remaining[:10]:
        print(f"  pos {pos}: {char}")
else:
    print("Verified: file is clean ASCII.")
