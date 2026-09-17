import re
import json

# Let's inspect demoData.subjects in script.js to verify year_level and semester distribution across all 18 curricula!
with open("script.js", "r") as f:
    js_text = f.read()

match = re.search(r'\"subjects\": (\[[\s\S]*?\n    \])', js_text)
if not match:
    print("Error: subjects array not found")
    exit(1)

# Using node to load demoData subjects
