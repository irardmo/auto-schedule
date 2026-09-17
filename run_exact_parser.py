import re
import json

# Read prompt from raw_prompt or file
from parse_prompt_curricula import raw_prompt

from parse_prompt_with_exact_years import sections, parse_section_exact_years

all_tables_exact = {}
total_subs = 0

for sec in sections:
    subs = parse_section_exact_years(sec)

    clean_subs = []
    for s in subs:
        if 'TOTAL' in s['title_and_code'].upper() or 'CLASS CODE' in s['title_and_code'].upper() or 'DESCRIPTIVE TITLE' in s['title_and_code'].upper():
            continue
        s['id'] = f"{sec['prefix']}{len(clean_subs)+1}"
        clean_subs.append(s)

    all_tables_exact[sec["table"]] = clean_subs
    total_subs += len(clean_subs)

    y1s1 = len([s for s in clean_subs if s['year_level']==1 and s['semester']==1])
    y1s2 = len([s for s in clean_subs if s['year_level']==1 and s['semester']==2])
    y2s1 = len([s for s in clean_subs if s['year_level']==2 and s['semester']==1])
    y2s2 = len([s for s in clean_subs if s['year_level']==2 and s['semester']==2])
    y3s1 = len([s for s in clean_subs if s['year_level']==3 and s['semester']==1])
    y3s2 = len([s for s in clean_subs if s['year_level']==3 and s['semester']==2])
    y4s1 = len([s for s in clean_subs if s['year_level']==4 and s['semester']==1])
    y4s2 = len([s for s in clean_subs if s['year_level']==4 and s['semester']==2])

    print(f"{sec['table']:<25} | Total: {len(clean_subs):2d} | Y1S1:{y1s1} Y1S2:{y1s2} | Y2S1:{y2s1} Y2S2:{y2s2} | Y3S1:{y3s1} Y3S2:{y3s2} | Y4S1:{y4s1} Y4S2:{y4s2}")

print(f"\nTOTAL ALL SUBJECTS: {total_subs}")

# Write to master json
with open("strict_year_sem_master.json", "w") as f:
    json.dump(all_tables_exact, f, indent=2)
