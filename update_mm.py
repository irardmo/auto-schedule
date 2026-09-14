import json

mm_old_subjects = [
    {"id": "bsba_mm_o1", "title_and_code": "GE 101 Understanding The Self", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o2", "title_and_code": "GE 102 Sining ng Pakikipagtalastasan", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o3", "title_and_code": "GE EL 101 Entrepreneurial Mind", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o4", "title_and_code": "SIBTECH 101 Social Arts 1", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o5", "title_and_code": "COMP 101 Computer 1", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o6", "title_and_code": "PATHFIT 1 Movement Competency Training", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o7", "title_and_code": "NSTP 1 National Service Training Program 1", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o8", "title_and_code": "BUS CORE 1 Basic Microeconomics", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o9", "title_and_code": "GE 103 Mathematics in Modern World", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o10", "title_and_code": "GE 104 Purposive Communication", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o11", "title_and_code": "GE 105 Pagbasa at Pagsulat sa Ibat-Ibang Disiplina", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o12", "title_and_code": "SIBTECH 102 Social Arts 2", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o13", "title_and_code": "COMP 102 Advance Computer", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o14", "title_and_code": "PATHFIT 2 Exercise-Based Fitness Activities", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o15", "title_and_code": "NSTP 2 National Service Training Program 2", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o16", "title_and_code": "BUS CORE 112 Business Law (Obligation and Contracts)", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o17", "title_and_code": "GE 106 Science, Technology and Society", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o18", "title_and_code": "GE 107 The Contemporary World", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o19", "title_and_code": "GE EL 102 Philippine Literature", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o20", "title_and_code": "GE EL 103 Indigenous Creative Arts", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o21", "title_and_code": "PATHFIT 3 Group Exercise (Aerobics, Yoga, etc.)", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o22", "title_and_code": "BUS CORE 113 Good Governance and Social Responsibility", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o23", "title_and_code": "PROF COR MM Professional Salesmanship", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o24", "title_and_code": "PROF COR MM Marketing Management", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o25", "title_and_code": "BME 141 Operations Management (TQM)", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o26", "title_and_code": "GE 108 Business Ethics", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o27", "title_and_code": "GE 109 Readings on Philippine History", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o28", "title_and_code": "GE 110 Art Appreciation", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o29", "title_and_code": "PATHFIT 4 Sports", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o30", "title_and_code": "BUS CORE 114 Income Taxation", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o31", "title_and_code": "PROF COR MM Distribution Management", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o32", "title_and_code": "PROF COR MM Advertising", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o33", "title_and_code": "MM ELEC 131 Personal Finance", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o34", "title_and_code": "BME 142 Strategic Management", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o35", "title_and_code": "GE 111 Statistics", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o36", "title_and_code": "RZL Life and Works of Rizal", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o37", "title_and_code": "BUS CORE Human Resource Management", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o38", "title_and_code": "BUS CORE Business Research", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o39", "title_and_code": "PROF COR MM 125 Product Management", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o40", "title_and_code": "MM ELEC 132 Customer Service Management", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o41", "title_and_code": "MM ELEC 133 Franchising", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o42", "title_and_code": "MM ELEC 134 Cooperative Management", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o43", "title_and_code": "PROF COR MM Retail Management", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o44", "title_and_code": "PROF COR MM Pricing Strategy", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o45", "title_and_code": "PROF COR MM Marketing Research", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o46", "title_and_code": "MM ELEC 135 Consumer Behavior", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o47", "title_and_code": "MM ELEC 136 Sales Management", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o48", "title_and_code": "MM ELEC 137 Industrial/Agricultural Marketing", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o49", "title_and_code": "MM ELEC 138 Project Management", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o50", "title_and_code": "THESIS 1 Research 1", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o51", "title_and_code": "BUS CORE 117 International Business and Trade", "course": "BSBA-MM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o52", "title_and_code": "MM ELEC 139 Entrepreneurial Management", "course": "BSBA-MM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o53", "title_and_code": "MM ELEC 140 Special Topics in Marketing Management", "course": "BSBA-MM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o54", "title_and_code": "COMP 103 Introduction to Computing", "course": "BSBA-MM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o55", "title_and_code": "COMP 104 Web Development", "course": "BSBA-MM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "old"},
    {"id": "bsba_mm_o56", "title_and_code": "THESIS 2 Research 2", "course": "BSBA-MM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old"},
    {"id": "bsba_mm_o57", "title_and_code": "INT Internship", "course": "BSBA-MM", "year_level": 4, "semester": 2, "units": 6, "lec_hours": 0, "lab_hours": 6, "is_major": 1, "curriculum_type": "old"}
]

with open('script.js', 'r') as f:
    js = f.read()

idx = js.find('"bsba_hrdm_o56"')
end_obj_idx = js.find('}', idx) + 1

formatted_items = ',\n' + ',\n'.join(['    ' + json.dumps(item) for item in mm_old_subjects])

js_updated = js[:end_obj_idx] + formatted_items + js[end_obj_idx:]

with open('script.js', 'w') as f:
    f.write(js_updated)

print('script.js updated with BSBA-MM Old subjects!')
