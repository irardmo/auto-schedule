import re
import json

# Read raw prompt text
from parse_prompt_curricula import raw_prompt

lines = raw_prompt.split('\n')

sections = [
    {"name": "BSCA Old", "course": "BSCA", "curr": "old", "table": "bsca_subject_old", "prefix": "bsca_o", "start": 0, "end": 61},
    {"name": "BSBA-HRDM Old", "course": "BSBA-HRDM", "curr": "old", "table": "bsba_hrdm_subject_old", "prefix": "bsba_hrdm_o", "start": 61, "end": 120},
    {"name": "BSED Old", "course": "BSED", "curr": "old", "table": "bsed_subject_old", "prefix": "bsed_o", "start": 120, "end": 175},
    {"name": "BSIT Old", "course": "BSIT", "curr": "old", "table": "bsit_subject_old", "prefix": "bsit_o", "start": 175, "end": 229},
    {"name": "BEED Old", "course": "BEED", "curr": "old", "table": "beed_subject_old", "prefix": "beed_o", "start": 229, "end": 289},
    {"name": "BSHM Old", "course": "BSHM", "curr": "old", "table": "bshm_subject_old", "prefix": "bshm_o", "start": 289, "end": 346},
    {"name": "BSBA-MM Old", "course": "BSBA-MM", "curr": "old", "table": "bsba_mm_subject_old", "prefix": "bsba_mm_o", "start": 346, "end": 397},
    {"name": "BSBA-FM Old", "course": "BSBA-FM", "curr": "old", "table": "bsba_fm_subject_old", "prefix": "bsba_fm_o", "start": 397, "end": 460},
    {"name": "BSCRIM Old", "course": "BSCRIM", "curr": "old", "table": "bscrim_subject_old", "prefix": "bscrim_o", "start": 460, "end": 519},
    {"name": "BSHM New", "course": "BSHM", "curr": "new", "prefix": "bshm_n", "table": "bshm_subject_new", "start": 519, "end": 592},
    {"name": "BSCRIM New", "course": "BSCRIM", "curr": "new", "prefix": "bscrim_n", "table": "bscrim_subject_new", "start": 592, "end": 668},
    {"name": "BSED New", "course": "BSED", "curr": "new", "prefix": "bsed_n", "table": "bsed_subject_new", "start": 668, "end": 735},
    {"name": "BSIT New", "course": "BSIT", "curr": "new", "prefix": "bsit_n", "table": "bsit_subject_new", "start": 735, "end": 796},
    {"name": "BSBA-MM New", "course": "BSBA-MM", "curr": "new", "prefix": "bsba_mm_n", "table": "bsba_mm_subject_new", "start": 796, "end": 854},
    {"name": "BSBA-FM New", "course": "BSBA-FM", "curr": "new", "prefix": "bsba_fm_n", "table": "bsba_fm_subject_new", "start": 854, "end": 910},
    {"name": "BSBA-HRDM New", "course": "BSBA-HRDM", "curr": "new", "prefix": "bsba_hrdm_n", "table": "bsba_hrdm_subject_new", "start": 910, "end": 967},
    {"name": "BEED New", "course": "BEED", "curr": "new", "prefix": "beed_n", "table": "beed_subject_new", "start": 967, "end": 1040},
    {"name": "BSCA New", "course": "BSCA", "curr": "new", "prefix": "bsca_n", "table": "bsca_subject_new", "start": 1040, "end": len(lines)}
]

def parse_section_exact_years(sec):
    sec_lines = lines[sec["start"]:sec["end"]]
    subs = []

    current_year = 1
    current_sem = 1

    for l in sec_lines:
        l_s = l.strip()
        if not l_s:
            continue
        l_u = l_s.upper()

        # Check Year Level Headers
        if 'FIRST YEAR' in l_u or '1ST YEAR' in l_u:
            current_year = 1
            current_sem = 1
            continue
        elif 'SECOND YEAR' in l_u or '2ND YEAR' in l_u:
            current_year = 2
            current_sem = 1
            continue
        elif 'THIRD YEAR' in l_u or '3RD YEAR' in l_u:
            current_year = 3
            current_sem = 1
            continue
        elif 'FOURTH YEAR' in l_u or '4TH YEAR' in l_u:
            current_year = 4
            current_sem = 1
            continue
        elif 'SUMMER' in l_u:
            current_year = 3
            current_sem = 3
            continue

        if line_is_header(l_u):
            continue

        tabs = l.split('\t')
        non_empty = [(i, t.strip()) for i, t in enumerate(tabs) if t.strip()]
        if not non_empty or non_empty[0][1].upper() in ['TOTAL', 'LEC', 'LAB', 'COURSE CODE', 'CLASS CODE'] or non_empty[0][1].isdigit():
            continue

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

        def process_toks(toks, sem_val):
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
                "semester": sem_val,
                "units": units,
                "lec_hours": lec,
                "lab_hours": lab,
                "is_major": is_m,
                "curriculum_type": sec["curr"]
            }

        s1 = process_toks(left_toks, 3 if current_sem == 3 else 1)
        if s1:
            subs.append(s1)

        if right_toks:
            s2 = process_toks(right_toks, 2)
            if s2:
                subs.append(s2)

    return subs

def line_is_header(l_u):
    for h in ['COURSE CODE', 'CLASS CODE', 'FIRST SEMESTER', 'SECOND SEMESTER', 'TOTAL', '\tTOTAL', 'BACHELOR', 'MAJOR IN', 'CURRICULUM']:
        if l_u.startswith(h):
            return True
    return False

all_tables_exact = {}
for sec in sections:
    subs = parse_section_exact_years(sec)
    all_tables_exact[sec["table"]] = subs

    y1s1 = len([s for s in subs if s['year_level']==1 and s['semester']==1])
    y1s2 = len([s for s in subs if s['year_level']==1 and s['semester']==2])
    y2s1 = len([s for s in subs if s['year_level']==2 and s['semester']==1])
    y2s2 = len([s for s in subs if s['year_level']==2 and s['semester']==2])
    y3s1 = len([s for s in subs if s['year_level']==3 and s['semester']==1])
    y3s2 = len([s for s in subs if s['year_level']==3 and s['semester']==2])
    y4s1 = len([s for s in subs if s['year_level']==4 and s['semester']==1])
    y4s2 = len([s for s in subs if s['year_level']==4 and s['semester']==2])

    print(f"{sec['table']:<25} | Total: {len(subs):2d} | Y1S1:{y1s1} Y1S2:{y1s2} | Y2S1:{y2s1} Y2S2:{y2s2} | Y3S1:{y3s1} Y3S2:{y3s2} | Y4S1:{y4s1} Y4S2:{y4s2}")
