import re
import json

# Read script.js
with open("script.js", "r") as f:
    js_text = f.read()

# We can parse the prompt text with strict year tracking
# Let's inspect how the prompt text transitions between years
