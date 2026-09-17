import re
import json

# Let's read raw prompt lines
from parse_prompt_curricula import raw_prompt

lines = raw_prompt.split('\n')

sections = [
    {"name": "BSCA Old", "course": "BSCA", "curr": "old", "table": "bsca_subject_old", "prefix": "bsca_o", "start": 0, "end": 61},
    {"name": "BSBA-HRDM Old", "course": "BSBA-HRDM", "curr": "old", "table": "bsba_hrdm_subject_old", "prefix": "bsba_hrdm_o", "start": 61, "end": 120},
    {"name": "BSED Old", "course": "BSED", "curr": "old", "table": "bsed_subject_old", "prefix": "bsed_o", "start": 120, "end": 175},
    {"name": "BSIT Old", "course": "BSIT", "curr": "old", "prefix": "bsit_o", "start": 175, "end": 229},
    {"name": "BEED Old", "course": "BEED", "curr": "old", "prefix": "beed_o", "start": 229, "end": 289},
    {"name": "BSHM Old", "course": "BSHM", "curr": "old", "prefix": "bshm_o", "start": 289, "end": 346},
    {"name": "BSBA-MM Old", "course": "BSBA-MM", "curr": "old", "prefix": "bsba_mm_o", "start": 346, "end": 397},
    {"name": "BSBA-FM Old", "course": "BSBA-FM", "curr": "old", "prefix": "bsba_fm_o", "start": 397, "end": 460},
    {"name": "BSCRIM Old", "course": "BSCRIM", "curr": "old", "prefix": "bscrim_o", "start": 460, "end": 519},
    {"name": "BSHM New", "course": "BSHM", "curr": "new", "prefix": "bshm_n", "start": 519, "end": 592},
    {"name": "BSCRIM New", "course": "BSCRIM", "curr": "new", "prefix": "bscrim_n", "start": 592, "end": 668},
    {"name": "BSED New", "course": "BSED", "curr": "new", "prefix": "bsed_n", "start": 668, "end": 735},
    {"name": "BSIT New", "course": "BSIT", "curr": "new", "prefix": "bsit_n", "start": 735, "end": 796},
    {"name": "BSBA-MM New", "course": "BSBA-MM", "curr": "new", "prefix": "bsba_mm_n", "start": 796, "end": 854},
    {"name": "BSBA-FM New", "course": "BSBA-FM", "curr": "new", "prefix": "bsba_fm_n", "start": 854, "end": 910},
    {"name": "BSBA-HRDM New", "course": "BSBA-HRDM", "curr": "new", "prefix": "bsba_hrdm_n", "start": 910, "end": 967},
    {"name": "BEED New", "course": "BEED", "curr": "new", "prefix": "beed_n", "start": 967, "end": 1040},
    {"name": "BSCA New", "course": "BSCA", "curr": "new", "prefix": "bsca_n", "start": 1040, "end": len(lines)}
]

def parse_with_strict_year_sem(sec):
    sec_lines = lines[sec["start"]:sec["end"]]
    subs = []

    current_year = 1
    current_sem = 1

    for line in sec_lines:
        line_s = line.strip()
        if not line_s:
            continue
        line_u = line_s.upper()

        # Detect Year level explicitly
        if 'FIRST YEAR' in line_u or '1ST YEAR' in line_u:
            current_year = 1
            current_sem = 1
            continue
        elif 'SECOND YEAR' in line_u or '2ND YEAR' in line_u:
            current_year = 2
            current_sem = 1
            continue
        elif 'THIRD YEAR' in line_u or '3RD YEAR' in line_u:
            current_year = 3
            current_sem = 1
            continue
        elif 'FOURTH YEAR' in line_u or '4TH YEAR' in line_u:
            current_year = 4
            current_sem = 1
            continue
        elif 'SUMMER' in line_u:
            current_year = 3
            current_sem = 3
            continue

        if line_u.startswith(('COURSE CODE', 'CLASS CODE', 'FIRST SEMESTER', 'SECOND SEMESTER', 'TOTAL', '\tTOTAL', 'BACHELOR', 'MAJOR IN', 'CURRICULUM')):
            continue

        tabs = line.split('\t')
        non_empty = [(i, t.strip()) for i, t in enumerate(tabs) if t.strip()]
        if not non_empty or non_empty[0][1].upper() in ['TOTAL', 'LEC', 'LAB', 'COURSE CODE', 'CLASS CODE'] or non_empty[0][1].isdigit():
            continue

        # Split left (Sem 1) and right (Sem 2)
        split_at = None
        for k in range(1, len(non_empty)):
            tab_idx, token = non_empty[k]
            prev_tab_idx = non_empty[k-1][0]
            if (tab_idx - prev_tab_idx >= 2 or tab_idx >= 5) and not token.isdigit() and token.upper() not in ['NONE', 'ALL', 'LEC', 'LAB', 'TOTAL']:
                if len(token) <= 15 or token.startswith('(') or not ' ' in token:
                    split_at = k
                    break

        if split_at is not None:
            left_toks = [item[1] for item in non_empty[:split_at]]
            right_toks = [item[1] for item in non_empty[split_at:]]
        else:
            left_toks = [item[1] for item in non_empty]
            right_toks = []

        def process_tokens(toks, s_num):
            if not toks or len(toks) < 2:
                return None
            code = toks[0]
            if code.upper() in ['DESCRIPTIVE TITLE', 'UNITS', 'PRE-REQUISITE', 'COLUMN1', 'TOTAL']:
                return None
            title = toks[1]
            nums = []
            for t in toks[2:]:
                if t.isdigit():
                    nums.append(int(t))
                elif re.match(r'^\(\d+\)$', t):
                    nums.append(int(t.strip('()')))
            if len(nums) >= 2:
                lec = nums[0]; lab = nums[1]
            elif len(nums) == 1:
                lec = nums[0]; lab = 0
            else:
                lec = 3; lab = 0
            units = lec + lab
            is_m = 1 if (lab > 0 or not code.startswith('GE')) else 0
            return {
                "id": f"{sec['prefix']}{len(subs)+1}",
                "title_and_code": f"{code} - {title}",
                "course": sec["course"],
                "year_level": current_year,
                "semester": s_num,
                "units": units,
                "lec_hours": lec,
                "lab_hours": lab,
                "is_major": is_m,
                "curriculum_type": sec["curr"]
            }

        s1 = process_tokens(left_toks, 3 if current_sem == 3 else 1)
        if s1:
            subs.append(s1)

        if right_toks:
            s2 = process_tokens(right_toks, 2)
            if s2:
                subs.append(s2)

    return subs

all_audited = {}
for sec in sections:
    subs = parse_with_strict_year_sem(sec)
    all_audited[sec["table"]] = subs

    # Print counts by year_level and semester
    y2_s1 = len([s for s in subs if s['year_level']==2 and s['semester']==1])
    y2_s2 = len([s for s in subs if s['year_level']==2 and s['semester']==2])
    y3_s1 = len([s for s in subs if s['year_level']==3 and s['semester']==1])
    y3_s2 = len([s for s in subs if s['year_level']==3 and s['semester']==2])
    print(f"{sec['table']:<25}: Total {len(subs)} | Y2S1:{y2_s1} Y2S2:{y2_s2} Y3S1:{y3_s1} Y3S2:{y3_s2}")

with open("strict_year_sem_master.json", "w") as f:
    json.dump(all_audited, f, indent=2)
