
function getFilteredStandardDays(selectedSetting) {
  const allDays = ["M", "T", "W", "TH", "F", "S", "MT", "TTH", "MWF", "WF", "MW", "MF", "TF"];
  if (!selectedSetting || selectedSetting === 'all') return allDays;
  const count = parseInt(selectedSetting, 10);
  if (count === 1) return ["M", "T", "W", "TH", "F", "S"];
  if (count === 2) return ["MT", "TTH", "WF", "MW", "MF", "TF"];
  if (count === 3) return ["MWF"];
  return allDays;
}

// Southwestern Institute of Business and Technology (SIBT) Scheduling Logic Engine

// Initialize Database structure
let db = {
  instructors: [],
  rooms: [],
  sections: [],
  subjects: [],
  schedules: []
};

let selectedScheduleIds = new Set();
let selectedTeacherIds_manage = new Set();
let selectedSubjectIds = new Set();
let selectedRoomIds = new Set();
let selectedSectionIds = new Set();

let schedulesCurrentPage = 1;
let instructorsCurrentPage = 1;
let subjectsCurrentPage = 1;
let roomsCurrentPage = 1;
let sectionsCurrentPage = 1;
const GENERAL_PAGE_SIZE = 20;

function renderPaginationControls(totalItems, currentPage, pageSize, navElId, infoElId, changePageFuncName) {
  const navEl = document.getElementById(navElId);
  const infoEl = document.getElementById(infoElId);
  if (!navEl) return currentPage;

  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  let adjustedPage = currentPage;
  if (adjustedPage > totalPages) adjustedPage = totalPages;
  if (adjustedPage < 1) adjustedPage = 1;

  // Render info text
  if (infoEl) {
    const start = totalItems === 0 ? 0 : (adjustedPage - 1) * pageSize + 1;
    const end = Math.min(adjustedPage * pageSize, totalItems);
    infoEl.innerText = `Showing ${start} to ${end} of ${totalItems} entries`;
  }

  navEl.innerHTML = '';
  if (totalPages <= 1) {
    return adjustedPage; 
  }

  // Prev Button
  const prevDisabled = adjustedPage === 1 ? 'disabled' : '';
  navEl.innerHTML += `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" onclick="event.preventDefault(); ${changePageFuncName}(${adjustedPage - 1})">Previous</a>
    </li>
  `;

  // Determine pages to display: First page, 3 middle pages (around current), Last page
  let pagesToDisplay = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pagesToDisplay.push(i);
  } else {
    pagesToDisplay.push(1); // First page

    let midStart = adjustedPage - 1;
    let midEnd = adjustedPage + 1;

    if (adjustedPage <= 3) {
      midStart = 2;
      midEnd = 4;
    } else if (adjustedPage >= totalPages - 2) {
      midStart = totalPages - 3;
      midEnd = totalPages - 1;
    }

    for (let i = midStart; i <= midEnd; i++) {
      if (i > 1 && i < totalPages) {
        pagesToDisplay.push(i);
      }
    }

    pagesToDisplay.push(totalPages); // Last page
  }

  pagesToDisplay = Array.from(new Set(pagesToDisplay)).sort((a, b) => a - b);

  let prevNum = 0;
  for (let i = 0; i < pagesToDisplay.length; i++) {
    const pageNum = pagesToDisplay[i];
    if (prevNum > 0 && pageNum - prevNum > 1) {
      navEl.innerHTML += `
        <li class="page-item disabled">
          <span class="page-link">...</span>
        </li>
      `;
    }
    const activeClass = pageNum === adjustedPage ? 'active' : '';
    navEl.innerHTML += `
      <li class="page-item ${activeClass}">
        <a class="page-link" href="#" onclick="event.preventDefault(); ${changePageFuncName}(${pageNum})">${pageNum}</a>
      </li>
    `;
    prevNum = pageNum;
  }

  // Next Button
  const nextDisabled = adjustedPage === totalPages ? 'disabled' : '';
  navEl.innerHTML += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="#" onclick="event.preventDefault(); ${changePageFuncName}(${adjustedPage + 1})">Next</a>
    </li>
  `;

  return adjustedPage;
}

function changeSchedulesPage(page) {
  schedulesCurrentPage = page;
  renderSchedulesTable();
}

function changeInstructorsPage(page) {
  instructorsCurrentPage = page;
  renderInstructorsTable();
}

function changeSubjectsPage(page) {
  subjectsCurrentPage = page;
  renderSubjectsTable();
}

function changeRoomsPage(page) {
  roomsCurrentPage = page;
  renderRoomsTable();
}

function changeSectionsPage(page) {
  sectionsCurrentPage = page;
  renderSectionsTable();
}

function updateBulkDeleteUI(type) {
  let selectedSet;
  let btnId, countId, checkAllId;

  if (type === 'schedules') {
    selectedSet = selectedScheduleIds;
    btnId = 'btn-bulk-delete-schedules';
    countId = 'selected-schedules-count';
    checkAllId = 'check-all-schedules';
  } else if (type === 'teachers') {
    selectedSet = selectedTeacherIds_manage;
    btnId = 'btn-bulk-delete-teachers';
    countId = 'selected-teachers-count';
    checkAllId = 'check-all-teachers';
  } else if (type === 'subjects') {
    selectedSet = selectedSubjectIds;
    btnId = 'btn-bulk-delete-subjects';
    countId = 'selected-subjects-count';
    checkAllId = 'check-all-subjects';
  } else if (type === 'rooms') {
    selectedSet = selectedRoomIds;
    btnId = 'btn-bulk-delete-rooms';
    countId = 'selected-rooms-count';
    checkAllId = 'check-all-rooms';
  } else if (type === 'sections') {
    selectedSet = selectedSectionIds;
    btnId = 'btn-bulk-delete-sections';
    countId = 'selected-sections-count';
    checkAllId = 'check-all-sections';
  }

  const btn = document.getElementById(btnId);
  const countSpan = document.getElementById(countId);

  if (btn && countSpan) {
    if (selectedSet.size > 0) {
      btn.style.display = 'inline-flex';
      countSpan.innerText = selectedSet.size;
    } else {
      btn.style.display = 'none';
      countSpan.innerText = '0';
    }
  }
}

function toggleSelectAll(type, isChecked) {
  let allCheckboxes = document.querySelectorAll(`.chk-bulk-${type}`);
  let selectedSet;

  if (type === 'schedules') selectedSet = selectedScheduleIds;
  else if (type === 'teachers') selectedSet = selectedTeacherIds_manage;
  else if (type === 'subjects') selectedSet = selectedSubjectIds;
  else if (type === 'rooms') selectedSet = selectedRoomIds;

  selectedSet.clear();

  allCheckboxes.forEach(chk => {
    chk.checked = isChecked;
    if (isChecked) {
      selectedSet.add(chk.value);
    }
  });

  updateBulkDeleteUI(type);
}

function toggleItemSelection(type, id, isChecked) {
  let selectedSet;
  let checkAllId;

  if (type === 'schedules') {
    selectedSet = selectedScheduleIds;
    checkAllId = 'check-all-schedules';
  } else if (type === 'teachers') {
    selectedSet = selectedTeacherIds_manage;
    checkAllId = 'check-all-teachers';
  } else if (type === 'subjects') {
    selectedSet = selectedSubjectIds;
    checkAllId = 'check-all-subjects';
  } else if (type === 'rooms') {
    selectedSet = selectedRoomIds;
    checkAllId = 'check-all-rooms';
  }

  if (isChecked) {
    selectedSet.add(id);
  } else {
    selectedSet.delete(id);
  }

  const checkAll = document.getElementById(checkAllId);
  if (checkAll) {
    const allCheckboxes = document.querySelectorAll(`.chk-bulk-${type}`);
    checkAll.checked = allCheckboxes.length > 0 && Array.from(allCheckboxes).every(chk => chk.checked);
  }

  updateBulkDeleteUI(type);
}

// SIBT Demo Dataset matching instrcuctor.png & Program head.png
const demoData = {
    "instructors": [
        {
            "id": "t1",
            "name": "KENT LIWANAGAN",
            "designation": "Regular Teacher",
            "degree": "College Faculty",
            "area": "ACADEMICS",
            "employee_no": "0105",
            "effectivity_date": "July 13, 2026",
            "admin_load": "",
            "max_units": 24
        },
        {
            "id": "t2",
            "name": "GERARDO MICIANO",
            "designation": "Program Head",
            "degree": "BSIT",
            "area": "ADMINISTRATION",
            "employee_no": "0321",
            "effectivity_date": "June 23, 2026",
            "admin_load": "CIT Program Head",
            "max_units": 18
        },
        {
            "id": "t3",
            "name": "CAREN ROSE L TOJEDO, LPT., MAED.",
            "designation": "Director",
            "degree": "Dean of Academics",
            "area": "ACADEMICS",
            "employee_no": "0001",
            "effectivity_date": "June 01, 2026",
            "admin_load": "Dean of Academics",
            "max_units": 15
        },
        {
            "id": "t4",
            "name": "MAILA M MORALES, LPT., CHRA",
            "designation": "Admin",
            "degree": "HRD Director",
            "area": "ADMINISTRATION",
            "employee_no": "0002",
            "effectivity_date": "July 01, 2026",
            "admin_load": "HRD Director",
            "max_units": 9
        }
    ],
    "rooms": [
        {
            "id": "r1",
            "name": "COMLAB",
            "room_type": "Laboratory"
        },
        {
            "id": "r2",
            "name": "CRIMLAB",
            "room_type": "Laboratory"
        },
        {
            "id": "r3",
            "name": "203",
            "room_type": "Lecture"
        },
        {
            "id": "r4",
            "name": "204",
            "room_type": "Lecture"
        },
        {
            "id": "r5",
            "name": "205",
            "room_type": "Lecture"
        },
        {
            "id": "r6",
            "name": "206",
            "room_type": "Lecture"
        },
        {
            "id": "r7",
            "name": "207",
            "room_type": "Lecture"
        },
        {
            "id": "r8",
            "name": "208",
            "room_type": "Lecture"
        },
        {
            "id": "r9",
            "name": "HS-101",
            "room_type": "Lecture"
        },
        {
            "id": "r10",
            "name": "HS-102",
            "room_type": "Lecture"
        },
        {
            "id": "r11",
            "name": "HS-103",
            "room_type": "Lecture"
        },
        {
            "id": "r12",
            "name": "HS-104",
            "room_type": "Lecture"
        },
        {
            "id": "r13",
            "name": "HS-105",
            "room_type": "Lecture"
        },
        {
            "id": "r14",
            "name": "HS-106",
            "room_type": "Lecture"
        },
        {
            "id": "r15",
            "name": "HS-107",
            "room_type": "Lecture"
        },
        {
            "id": "r16",
            "name": "HS-108",
            "room_type": "Lecture"
        },
        {
            "id": "r17",
            "name": "HS-109",
            "room_type": "Lecture"
        },
        {
            "id": "r18",
            "name": "HS110",
            "room_type": "Lecture"
        },
        {
            "id": "r19",
            "name": "Library 1",
            "room_type": "Special Room"
        },
        {
            "id": "r20",
            "name": "Library 2",
            "room_type": "Special Room"
        },
        {
            "id": "r21",
            "name": "TBL Room",
            "room_type": "Special Room"
        }
    ],
    "subjects": [
        {
                "id": "bsca_o1",
                "title_and_code": "GE 101 - UNDERSTANDING THE SELF",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o2",
                "title_and_code": "GE 103 - MATHEMATICS IN THE MODERN WORLD",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o3",
                "title_and_code": "GE 102 - SINING NG PAKIKIPAGTALASTASAN",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o4",
                "title_and_code": "GE 104 - PURPOSIVE COMMUNICATION",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o5",
                "title_and_code": "GE EL 101 - ENTREPRENEURIAL MIND",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o6",
                "title_and_code": "GE 105 - PAGBASA AT PAGSULAT SA IBAT-IBANG DISIPLINA",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o7",
                "title_and_code": "SIBTECH 101 - SOCIAL ARTS 1",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o8",
                "title_and_code": "SIBTECH 102 - SOCIAL ARTS 2",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o9",
                "title_and_code": "COMP 101 - COMPUTER 1",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o10",
                "title_and_code": "COMP 102 - ADVANCE COMPUTER",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o11",
                "title_and_code": "TM 1 - FUNDAMENTALS OF CUSTOMS AND TARIFF MANAGEMENT",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o12",
                "title_and_code": "SCM 1 - INTRO TO SUPPLY CHAIN MGT",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o13",
                "title_and_code": "ELC 1 - ENTREPRENEURIAL MANAGEMENT",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o14",
                "title_and_code": "CM 1 - BORDER CONTROL & SECURITY",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o15",
                "title_and_code": "PATHFIT 1 - MOVEMENT COMPETENCY TRAINING",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o16",
                "title_and_code": "PATHFIT 2 - EXERCISE-BASED FITNESS ACTIVITIES",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o17",
                "title_and_code": "NSTP 1 - NATIONAL SERVICE TRAINING PROGRAM 1",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o18",
                "title_and_code": "NSTP 2 - NATIONAL SERVICE TRAINING PROGRAM 2",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o19",
                "title_and_code": "GE 106 - SCIENCE, TECHNOLOGY AND SOCIETY",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o20",
                "title_and_code": "GE 108 - BUSINESS ETHICS",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o21",
                "title_and_code": "GE 107 - THE CONTEMPORARY WORLD",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o22",
                "title_and_code": "GE 109 - READINGS ON PHILIPPINE HISTORY",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o23",
                "title_and_code": "GE EL 102 - PHILIPPINE LITERATURE",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o24",
                "title_and_code": "SBEC 1 - OBLIGATION AND CONTRACT",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o25",
                "title_and_code": "GE EL 103 - INDIGENOUS CREATIVE ARTS",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o26",
                "title_and_code": "SBEC 2 - TAXATION (INCOME AND BUSINESS TAXATION)",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o27",
                "title_and_code": "SCM 2 - WAREHOUSE OPERATIONNS MGT",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o28",
                "title_and_code": "SCM 3 - PROCUREMENT AND INVENTORY MANAGEMENT",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o29",
                "title_and_code": "CM 2 - CUSTOMS OPERATIONS & CARGO HANDLING",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o30",
                "title_and_code": "TM 3 - CUSTOMS VALUATION SYSTEM",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o31",
                "title_and_code": "TM 2 - COMMODIY CLASSIFICATION SYSTEM",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o32",
                "title_and_code": "CM 3 - CUSTOMS WAREHOUSING",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 5,
                "lec_hours": 5,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o33",
                "title_and_code": "PATHFIT 3 - GROUP EXERCISE (AEROBICS, YOGA, ETC.)",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o34",
                "title_and_code": "PATHFIT 4 - SPORTS",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o35",
                "title_and_code": "GE 111 - STATISTICS",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o36",
                "title_and_code": "GE 112 - GENDER AND SOCIETY",
                "course": "BSCA",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o37",
                "title_and_code": "RZL - LIFE AND WORKS OF RIZAL",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o38",
                "title_and_code": "CM 5 - CUSTOMS PROCEEDING",
                "course": "BSCA",
                "year_level": 3,
                "semester": 2,
                "units": 5,
                "lec_hours": 5,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o39",
                "title_and_code": "SCM 4 - TRANSPORTATION MANAGEMENT",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o40",
                "title_and_code": "TM 5 - EXCISE TAXES, LIQUIDATION OF DUTY AND SURCHARGES",
                "course": "BSCA",
                "year_level": 3,
                "semester": 2,
                "units": 5,
                "lec_hours": 5,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o41",
                "title_and_code": "CM 4 - CUSTOMS CLEARANCE",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 5,
                "lec_hours": 5,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o42",
                "title_and_code": "EL 3 - INTERNATIONAL MARKETING",
                "course": "BSCA",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o43",
                "title_and_code": "CMBE 1 - OPERATIONS MANAGEMENT",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o44",
                "title_and_code": "RES 2 - THESIS WRITING 2",
                "course": "BSCA",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o45",
                "title_and_code": "TM 4 - CUSTOMS APPRAISAL AND ASSESSMENT",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o46",
                "title_and_code": "CMBE 2 - STRATEGIC MANAGEMENT",
                "course": "BSCA",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o47",
                "title_and_code": "RES 1 - THESIS WRITING 1",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o48",
                "title_and_code": "CM 6 - CUSTOMS POST CLEARANCE AUDIT AND FRAUD DETECTION",
                "course": "BSCA",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o49",
                "title_and_code": "EL 2 - FINANCIAL MANAGEMENT",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o50",
                "title_and_code": "INTERN - INTERNSHIP/PRACTICUM FOR CUSTOMS ADMINISTRATION (400HRS)",
                "course": "BSCA",
                "year_level": 3,
                "semester": 3,
                "units": 4,
                "lec_hours": 4,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o51",
                "title_and_code": "CM 7 - ETHICS AND STANDARDS OF THE CUSTOMS BROKER",
                "course": "BSCA",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o52",
                "title_and_code": "CM 8 - COMPETENCIES ASSESSMENT IN CUSTOMS MANAGEMENT",
                "course": "BSCA",
                "year_level": 4,
                "semester": 2,
                "units": 5,
                "lec_hours": 5,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o53",
                "title_and_code": "TM6 - SPECIAL DUTIES AND TRADE REMEDIES",
                "course": "BSCA",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o54",
                "title_and_code": "TM 8 - COMPETENCIES ASSESSMENT IN TARIFF MANAGEMENT",
                "course": "BSCA",
                "year_level": 4,
                "semester": 2,
                "units": 5,
                "lec_hours": 5,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsca_o55",
                "title_and_code": "TM7 - INTERNATIONAL TRADE ORGNIZATIONS, AGREEMENT AND RULES OF ORIGIN",
                "course": "BSCA",
                "year_level": 4,
                "semester": 1,
                "units": 5,
                "lec_hours": 5,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o1",
                "title_and_code": "GE 101 - UNDERSTANDING THE SELF",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o2",
                "title_and_code": "GE 103 - MATHEMATICS IN MODERN WORLD",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o3",
                "title_and_code": "GE 102 - SINING NG PAKIKIPAGTALASTASAN",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o4",
                "title_and_code": "GE 104 - PURPOSIVE COMMUNICATION",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o5",
                "title_and_code": "MGT 1 - PRINCIPLES OF MANAGEMENT",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o6",
                "title_and_code": "FIN 1 - BASIC FINANCE",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o7",
                "title_and_code": "GE EL 101 - ENTREPREURIAL MIND",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o8",
                "title_and_code": "ACCTG 1 - FUNDAMENTALS OF ACCOUNTING",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o9",
                "title_and_code": "SIBTECH 101 - SOCIAL ARTS 1",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o10",
                "title_and_code": "SIBTECH 102 - SOCIAL ARTS 2",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o11",
                "title_and_code": "BUS CORE 111 - BASIC MICROECONOMICS",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o12",
                "title_and_code": "MGT 2 - HUMAN BEHAVIOR IN ORGANIZATION",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o13",
                "title_and_code": "COMP 101 - COMPUTER 1",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o14",
                "title_and_code": "COMP 102 - ADVANCE COMPUTER",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o15",
                "title_and_code": "PATHFIT 1 - MOVEMENT COMPETENCY TRAINING",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o16",
                "title_and_code": "PATHFIT 2 - EXERCISE-BASED FITNESS ACTIVITIES",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o17",
                "title_and_code": "NSTP 1 - NATIONAL SERVICE TRAINING PROGRAM 1",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o18",
                "title_and_code": "NSTP 2 - NATIONAL SERVICE TRAINING PROGRAM 2",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o19",
                "title_and_code": "GE 106 - SCIENCE, TECHNOLOGY AND SOCIETY",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o20",
                "title_and_code": "GE 108 - BUSINESS ETHICS",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o21",
                "title_and_code": "GE 107 - THE CONTEMPORARY WORLD",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o22",
                "title_and_code": "GE 109 - READINGS ON PHILIPPINE HISTORY",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o23",
                "title_and_code": "GE EL 102 - PHILIPPINE LITERATURE",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o24",
                "title_and_code": "GE 110 - ART APPRECIATION",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o25",
                "title_and_code": "GE EL 103 - INDIGENOUS CREATIVE ARTS",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o26",
                "title_and_code": "HRDM 3 - RECRUITMENT AND SELECTION",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o27",
                "title_and_code": "MGT 3 - HUMAN RESOURCE MANAGEMENT",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o28",
                "title_and_code": "TAX 1 - INCOME TAXATION",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o29",
                "title_and_code": "HRDM 1 - ADMINISTRATIVE AND OFFICE  MANAGEMENT",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o30",
                "title_and_code": "ACCTG 2 - FINANCIAL ACCOUNTING",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o31",
                "title_and_code": "HRDM 2 - LABOR LAW AND LEGISLATION",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o32",
                "title_and_code": "MKTG 1 - PRINCIPLES OF MARKETING",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o33",
                "title_and_code": "PATHFIT 3 - GROUP EXERCISE (AEROBICS, YOGA, ETC.)",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o34",
                "title_and_code": "PATHFIT 4 - SPORTS",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o35",
                "title_and_code": "GE 111 - BUSINESS STATISTICS",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o36",
                "title_and_code": "HRDM ELEC 2 - PROJECT MANAGEMENT",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o37",
                "title_and_code": "RZL - LIFE AND WORKS OF RIZAL",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o38",
                "title_and_code": "GE EL 105 - GENDER AND SOCIETY",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o39",
                "title_and_code": "PSYCHO - GENERAL PSYCHOLOGY",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o40",
                "title_and_code": "BUS CORE 112 - BUSINESS LAW (OBLIGATION AND CONTRACT)",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o41",
                "title_and_code": "ENG 1 - BASIC COMMUNICATION SKILLS",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o42",
                "title_and_code": "ENG 2 - BUSINESS ENGLISH AND CORRESPONDENCE",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o43",
                "title_and_code": "HRDM ELEC 3 - SPECIAL TOPICS IN HRDM",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o44",
                "title_and_code": "HRDM ELEC 1 - MARKETING MANAGEMENT",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o45",
                "title_and_code": "HRDM 5 - COMPENSATION AND ADMINISTRATION",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o46",
                "title_and_code": "HRDM 4 - TRAINING AND DEVELOPMENT",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o47",
                "title_and_code": "THESIS 1 - THESIS WRITING 1",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o48",
                "title_and_code": "BUS CORE 113 - GOOD GOVERNANCE AND SOCIAL RESPONSIBILITY",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o49",
                "title_and_code": "HRDM 6 - STRATEGIC HUMAN RESOURCE MANAGEMENT",
                "course": "BSBA-HRDM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o50",
                "title_and_code": "INT - INTERNSHIP",
                "course": "BSBA-HRDM",
                "year_level": 4,
                "semester": 2,
                "units": 6,
                "lec_hours": 6,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o51",
                "title_and_code": "HRDM 7 - ORGANIZATION AND DEVELOPMENT",
                "course": "BSBA-HRDM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o52",
                "title_and_code": "GE EL 104 - ENVIRONMENTAL SCIENCE",
                "course": "BSBA-HRDM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o53",
                "title_and_code": "HRDM ELEC 4 - ENTREPENEURIAL MANAGEMENT",
                "course": "BSBA-HRDM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o54",
                "title_and_code": "HRDM ELEC 5 - OPERATIONS MANAGEMENT",
                "course": "BSBA-HRDM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_hrdm_o55",
                "title_and_code": "THESIS 2 - THESIS WRITING 2",
                "course": "BSBA-HRDM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o1",
                "title_and_code": "GE 101 - Understanding the Self",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o2",
                "title_and_code": "GE 103 - Mathematics in the Modern World",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o3",
                "title_and_code": "GE 102 - Basic English Grammar",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o4",
                "title_and_code": "GE 104 - Purposive Communication",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o5",
                "title_and_code": "GE EL 101 - Entrepreneurial Mind",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o6",
                "title_and_code": "EL 103 - Principles and Theories of Language Acquisition and Learning",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o7",
                "title_and_code": "EL 100 - Introduction to Linguistics",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o8",
                "title_and_code": "EL 104 - Language Programs and Policies in Multilingual Societies",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o9",
                "title_and_code": "EL 101 - Language, Culture and Society",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o10",
                "title_and_code": "EL 105 - Preparation of Language Learning Materials",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o11",
                "title_and_code": "EL 102 - Structures of English",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o12",
                "title_and_code": "EL 106 - The Child and Adolescent Learner and Learning Principles",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o13",
                "title_and_code": "PATHFIT 1 - Movement Competency Training",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o14",
                "title_and_code": "PATHFIT 2 - Exercise-Based Fitness Activities",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o15",
                "title_and_code": "SIBTECH 101 - Social Arts 1",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o16",
                "title_and_code": "SIBTECH 102 - Social Arts 2",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o17",
                "title_and_code": "NSTP 1 - National Service Training Program 1",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o18",
                "title_and_code": "NSTP 2 - National Service Training Program 2",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o19",
                "title_and_code": "Comp 101 - Computer 1",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o20",
                "title_and_code": "GE 106 - Science, Technology and Society",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o21",
                "title_and_code": "GE 108 - Ethics",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o22",
                "title_and_code": "GE 107 - The Contemporary World",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o23",
                "title_and_code": "GE 109 - Readings on Philippine History",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o24",
                "title_and_code": "GE EL 102 - Philippine Literature",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o25",
                "title_and_code": "GE 110 - Art Appreciation",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o26",
                "title_and_code": "EL 107 - Speech and Theater Arts",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o27",
                "title_and_code": "GE 105 - Public Speaking and Debate",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o28",
                "title_and_code": "EL 108 - The Teaching Profession",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o29",
                "title_and_code": "EL 110 - The Teacher and the Community, School Culture and Organizational Leadership",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o30",
                "title_and_code": "ELT 1 - Teaching and Assessment of Literature",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o31",
                "title_and_code": "LIT 1 - Children and Adolescent Literature",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o32",
                "title_and_code": "ELT 2 - Teaching and Assessment of the Microskills",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o33",
                "title_and_code": "LIT 2 - Mythology and Folklore",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o34",
                "title_and_code": "ELT 3 - Teaching and Assessment of Grammar",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o35",
                "title_and_code": "LIT 3 - Survey of Philippine Literature in English",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o36",
                "title_and_code": "PATHFIT 3 - Group Exercises (Aerobics, Yoga, etc.)",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o37",
                "title_and_code": "PATHFIT 4 - Sports",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o38",
                "title_and_code": "RZL - Life and Works of Rizal",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o39",
                "title_and_code": "EL 113 - Campus Journalism",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o40",
                "title_and_code": "GE 111 - Statistics",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o41",
                "title_and_code": "EL 114 - Stylistics and Discourse Analysis",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o42",
                "title_and_code": "EL 111 - Foundation of Special and Inclusive Education",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o43",
                "title_and_code": "EL 115 - Remedial Instruction",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o44",
                "title_and_code": "EL 112 - Assessment of Learning 1",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o45",
                "title_and_code": "EL 116 - Assessment of Learning 2",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o46",
                "title_and_code": "ELT 4 - Technical Writing",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o47",
                "title_and_code": "EL 117 - The Teacher and the School Curriculum",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o48",
                "title_and_code": "LIT 4 - Survey of Afro-Asian Literature",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o49",
                "title_and_code": "EL 118 - Building and Enhancing New Literacies Across the Curriculum",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o50",
                "title_and_code": "LIT 5 - Survey of English and American Literature",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o51",
                "title_and_code": "ELT 5 - Facilitating Learner-Centered Teaching",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o52",
                "title_and_code": "LIT 6 - Contemporary and Popular Literature",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o53",
                "title_and_code": "TTL1 - Technology for Teaching and Learning 1",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o54",
                "title_and_code": "LIT 7 - Literary Criticism",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o55",
                "title_and_code": "TTL 2 - Technology for Teaching and Learning 2  (Teaching in Language Education)",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o56",
                "title_and_code": "EL-FS 1 - FIELD STUDY 1 (Observations of Teaching)",
                "course": "BSED",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o57",
                "title_and_code": "EL-TIB - TEACHING INTERNSHIP",
                "course": "BSED",
                "year_level": 4,
                "semester": 1,
                "units": 6,
                "lec_hours": 6,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o58",
                "title_and_code": "EL-FS 2 - FIELD STUDY 2 (Participation and Teaching Assistanship)",
                "course": "BSED",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o59",
                "title_and_code": "RES 2 - Language Research 2",
                "course": "BSED",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsed_o60",
                "title_and_code": "RES 1 - Language Research 1",
                "course": "BSED",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o1",
                "title_and_code": "GE 101 - UNDERSTANDING THE SELF",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o2",
                "title_and_code": "GE 103 - MATHEMATICS IN MODERN WORLD",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o3",
                "title_and_code": "GE 102 - SINING NG PAKIKIPAGTALASTASAN",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o4",
                "title_and_code": "GE 104 - PURPOSIVE COMMUNICATION",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o5",
                "title_and_code": "GE EL 101 - ENTREPREURIAL MIND",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o6",
                "title_and_code": "GE 105 - PAGBASA AT PAGSULAT SA IBAT-IBANG DISIPLINA",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o7",
                "title_and_code": "SIBTECH 103 - SOCIAL ARTS 1",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o8",
                "title_and_code": "SIBTECH 102 - SOCIAL ARTS 2",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o9",
                "title_and_code": "PATHFIT 1 - MOVEMENT COMPETENCY TRAINING",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o10",
                "title_and_code": "PATHFIT 2 - EXERCISE-BASED FITNESS ACTIVITIES",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o11",
                "title_and_code": "NSTP 1 - NATIONAL SERVICE TRAINING PROGRAM 1",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o12",
                "title_and_code": "NSTP 2 - NATIONAL SERVICE TRAINING PROGRAM 2",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o13",
                "title_and_code": "CC 101 - INTRODUCTION TO COMPUTING",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o14",
                "title_and_code": "CC 102 - COMPUTER PROGRAMMING 1",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o15",
                "title_and_code": "MS 101 - DISCRETE MATHEMATICS",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o16",
                "title_and_code": "MS 102 - QUANTITATIVE METHODS (INCLUDING MODELLING AND SIMULATION)",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o17",
                "title_and_code": "GE 106 - SCIENCE, TECHNOLOGY AND SOCIETY",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o18",
                "title_and_code": "GE 108 - Business ETHICS",
                "course": "BSIT",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o19",
                "title_and_code": "GE 107 - THE COMTEMPORARY WORLD",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o20",
                "title_and_code": "GE 109 - READINGS ON PHILIPPINE HISTORY",
                "course": "BSIT",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o21",
                "title_and_code": "GE EL 102 - PHILIPPINE LITERATURE",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o22",
                "title_and_code": "GE 110 - ART APPRECIATION",
                "course": "BSIT",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o23",
                "title_and_code": "GE EL 103 - INDIGENOUS CREATIVE ARTS",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o24",
                "title_and_code": "PATHFIT 4 - SPORTS",
                "course": "BSIT",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o25",
                "title_and_code": "PATHFIT 3 - GROUP EXERCISE (AEROBICS, YOGA, ETC.)",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o26",
                "title_and_code": "CC 104 - DATA STRUCTURES AND ALGORITHM",
                "course": "BSIT",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o27",
                "title_and_code": "CC 103 - COMPUTER PROGRAMMING 2",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o28",
                "title_and_code": "CC 105 - INFORMATION MANAGEMENT",
                "course": "BSIT",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o29",
                "title_and_code": "IM 101 - FUNDAMENTALS OF DATABASE SYSTEM",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o30",
                "title_and_code": "HCI 101 - INTRODUCTION TO HUMAN AND COMPUTER INTERACTION",
                "course": "BSIT",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o31",
                "title_and_code": "PF 101 - OBJECT ORIENTED PROGRAMMING",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o32",
                "title_and_code": "GE 111 - STATISTICS",
                "course": "BSIT",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o33",
                "title_and_code": "WS 101 - WEB SYSTEMS AND TECHNOLOGY",
                "course": "BSIT",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o34",
                "title_and_code": "RZL - LIFE AND WORKS OF RIZAL",
                "course": "BSIT",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o35",
                "title_and_code": "IPT 101 - INTEGRATIVE PROGRAMMING AND TECHNOLOGY",
                "course": "BSIT",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o36",
                "title_and_code": "CC 106 - APPLICATION DEVELOPMENT AND EMERGING TECHNOLOGY",
                "course": "BSIT",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o37",
                "title_and_code": "NET 102 - NETWORKING 2",
                "course": "BSIT",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o38",
                "title_and_code": "NET 101 - NETWORKING 1",
                "course": "BSIT",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o39",
                "title_and_code": "IAS 102 - INFORMATION ASSURANCE AND SECURITY 2",
                "course": "BSIT",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o40",
                "title_and_code": "IAS 101 - INFORMATION ASSURANCE AND SECURITY 1",
                "course": "BSIT",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o41",
                "title_and_code": "SIA 101 - SYSTEM INTERGRATION AND ARCHITECTURE 1",
                "course": "BSIT",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o42",
                "title_and_code": "SA 101 - SYSTEM ADMINISTRATION AND MAINTENANCE",
                "course": "BSIT",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o43",
                "title_and_code": "CAP 101 - CAPSTONE PROJECT AND RESEARCH 1",
                "course": "BSIT",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o44",
                "title_and_code": "SP 101 - SOCIAL AND PROFESSIONAL ISSUES",
                "course": "BSIT",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o45",
                "title_and_code": "SIA 102 - SYSTEM INTERGRATION AND ARCHITECTURE 2",
                "course": "BSIT",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o46",
                "title_and_code": "PRAC 101 - PRACTICUM",
                "course": "BSIT",
                "year_level": 4,
                "semester": 2,
                "units": 6,
                "lec_hours": 6,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o47",
                "title_and_code": "PT 101 - PLATFORM TECHNOLOGY",
                "course": "BSIT",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o48",
                "title_and_code": "IT 101 - MULTIMEDIA AND ANIMATION",
                "course": "BSIT",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o49",
                "title_and_code": "HCI 102 - HUMAN COMPUTER INTERACTION 2",
                "course": "BSIT",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsit_o50",
                "title_and_code": "CAP 102 - CAPSTONE PROJECT AND RESERCH 2",
                "course": "BSIT",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o1",
                "title_and_code": "GE 101 - UNDERSTANDING THE SELF",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o2",
                "title_and_code": "GE 103 - MATHEMATICS IN MODERN WORLD",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o3",
                "title_and_code": "GE 102 - SINING NG PAKIKIPAGTALASTASAN",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o4",
                "title_and_code": "GE 104 - PURPOSIVE COMMUNICATION",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o5",
                "title_and_code": "GE EL 101 - ENTREPREURIAL MIND",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o6",
                "title_and_code": "GE 105 - PAGBASA AT PAGSULAT SA IBAT-IBANG DISIPLINA",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o7",
                "title_and_code": "SIBTECH - SOCIAL ARTS 1",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o8",
                "title_and_code": "SIBTECH 102 - SOCIAL ARTS 2",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o9",
                "title_and_code": "COMP 101 - COMPUTER 1",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o10",
                "title_and_code": "COMP 102 - ADVANCE COMPUTER",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o11",
                "title_and_code": "PATHFIT 1 - MOVEMENT COMPETENCY TRAINING",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o12",
                "title_and_code": "PATHFIT 2 - EXERCISE-BASED FITNESS ACTIVITIES",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o13",
                "title_and_code": "NSTP 1 - NATIONAL SERVICE TRAINING PROGRAM 1",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o14",
                "title_and_code": "NSTP 2 - NATIONAL SERVICE TRAINING PROGRAM 2",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o15",
                "title_and_code": "PROF ED 1 - THE CHILD AND ADOLESCENT LEARNERS AND LEARNING PRINCIPLES",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o16",
                "title_and_code": "PROF ED 2 - THE TEACHING PROFESSION",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o17",
                "title_and_code": "ENG 1 - TEACHING ENGLISH IN THE ELEMENTARY GRADES (LANGUAGE ARTS)",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o18",
                "title_and_code": "EHC 1 - EDUCATION ENHANCEMENT COURSE 1",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o19",
                "title_and_code": "GE 106 - SCIENCE, TECHNOLOGY AND SOCIETY",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o20",
                "title_and_code": "GE 108 - ETHICS",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o21",
                "title_and_code": "GE 107 - THE COMTEMPORARY WORLD",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o22",
                "title_and_code": "GE 109 - READINGS ON PHILIPPINE HISTORY",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o23",
                "title_and_code": "GE EL 102 - PHILIPPINE LITERATURE",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o24",
                "title_and_code": "GE 110 - ART APPRECIATION",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o25",
                "title_and_code": "GE EL 103 - INDIGENOUS CREATIVE ARTS",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o26",
                "title_and_code": "PATHFIT 4 - SPORTS",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o27",
                "title_and_code": "PATHFIT 3 - GROUP EXERCISE (AEROBICS, YOGA, ETC.)",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o28",
                "title_and_code": "PROF ED 4 - FOUNDATION OF SPECIAL AND INCLUSIVE EDUCATION",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o29",
                "title_and_code": "PROF ED 3 - THE TEACHER AND THE COMMUNITY, SCHOOL CULTURE AND ORGANIZATIONAL LEADERSHIP",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o30",
                "title_and_code": "PROF ED 5 - FACILITATING LEARNER-CENTERED TEACHING",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o31",
                "title_and_code": "MATH 1 - TEACHING MATH IN THE PRIMARY GRADES",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o32",
                "title_and_code": "SCI 1 - TEACHING SCIENCE IN THE ELEMENTARY GRADES (BIOLOGY AND CHEMISTRY)",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o33",
                "title_and_code": "ENG 2 - TEACHING ENGLISH IN THE ELEMENTARY GRADES THROUGH LITERATURE",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o34",
                "title_and_code": "MATH 2 - TEACHING MATH IN THE INTERMEDIATE GRADES",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o35",
                "title_and_code": "EHC 2 - EDUCATION ENHANCEMENT COURSE 2",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o36",
                "title_and_code": "GE 111 - STATISTICS",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o37",
                "title_and_code": "PROF ED 8 - ASSESSMENT IN LEARNING 2",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o38",
                "title_and_code": "RZL - LIFE AND WORKS OF RIZAL",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o39",
                "title_and_code": "PROF ED 9 - THE TEACHER AND THE SCHOOL CURRICULUM",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o40",
                "title_and_code": "MTB-MLE - CONTENT AND PEDAGOGY IN THE MOTHER TONGUE",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o41",
                "title_and_code": "SSC 2 - TEACHING SOCIAL STUDIES IN THE ELEMENTARY GRADES (CULTURE AND GEOGRAPHY)",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o42",
                "title_and_code": "PROF ED 6 - ASSESSMENT IN LEARNING 1",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o43",
                "title_and_code": "FIL - PAGTUTURO AND FILIPINO SA ELEMENTARYA - PANITIKAN NG PILIPINAS",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o44",
                "title_and_code": "PROF ED 7 - TE CHNOLOGY FOR TEACHING AND  LEARNING",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o45",
                "title_and_code": "TLE - EDUKASYONG PANTAHANAN AT PANGKABUHAYAN WITH ENTREPRENEURSHIP",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o46",
                "title_and_code": "SSC 1 - TEACHING SOCIAL STUDIES IN THE ELEMENTARY GRADES (PHILIPPINE HISTORY AND GOVERNMENT)",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o47",
                "title_and_code": "MUSIC - TEACHING MUSIC IN THE ELEMENTARY GRADES",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o48",
                "title_and_code": "FIL - PAGTUTURO NG FILIPINO SA ELEMENTARYA - ESTRAKTURA AT GAMIT NG WIKANG FILIPINO",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o49",
                "title_and_code": "FS 1 - FIELD STUDY 1",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o50",
                "title_and_code": "TLE - EDUKASYONG PANTAHANAN AT PANGKABUHAYAN",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o51",
                "title_and_code": "PEH - TEACHING PE AND HEALTH IN THE ELEMENTARY GRADES",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o52",
                "title_and_code": "SCI 2 - TEACHING SCIENCE IN THE ELEMENTARY GRADES (PHYSICS, SPACE AND EARTH SCIENCE)",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o53",
                "title_and_code": "EHC3 - Educational Enhancement Course 3",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o54",
                "title_and_code": "PROF ED 10 - BUILDING AND ENHANCING NEW  LITERACIES ACROSS THE CURRI.",
                "course": "BEED",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o55",
                "title_and_code": "EDUC RES 2 - EDUCATIONAL RESEARCH 2",
                "course": "BEED",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o56",
                "title_and_code": "VED - GOOD MANNERS AND RIGHT CONDUCT",
                "course": "BEED",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o57",
                "title_and_code": "PT - TEACHING INTERNSHIP",
                "course": "BEED",
                "year_level": 4,
                "semester": 1,
                "units": 6,
                "lec_hours": 6,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o58",
                "title_and_code": "TTL - TECHNOLOGY FOR TEACHING AND ELEMENTARY GRADES",
                "course": "BEED",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o59",
                "title_and_code": "EHC 4 - Mock Board Course",
                "course": "BEED",
                "year_level": 4,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o60",
                "title_and_code": "ARTS - TEACHING ARTS IN THE ELEMENTARY GRADES",
                "course": "BEED",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o61",
                "title_and_code": "FS - FIELD STUDY 2",
                "course": "BEED",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o62",
                "title_and_code": "ED ELEC - TEACHING MULTIGRADE CLASSES",
                "course": "BEED",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o63",
                "title_and_code": "EDUC RES 1 - EDUCATIONAL RESEARCH 1",
                "course": "BEED",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o64",
                "title_and_code": "GE 101 - UNDERSTANDING THE SELF",
                "course": "BEED",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "beed_o65",
                "title_and_code": "GE 103 - MATHEMATICS IN MODERN WORLD",
                "course": "BEED",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o1",
                "title_and_code": "GE 102 - SINING NG PAKIKIPAGTALASTASAN",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o2",
                "title_and_code": "GE 104 - PURPOSIVE COMMUNICATION",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o3",
                "title_and_code": "GE EL 101 - ENTREPREURIAL MIND",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o4",
                "title_and_code": "GE 105 - PAGBASA AT PAGSULAT SA IBAT-IBANG DISIPLINA",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o5",
                "title_and_code": "SIBTECH 101 - SOCIAL ARTS 1",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o6",
                "title_and_code": "SIBTECH 102 - SOCIAL ARTS 2",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o7",
                "title_and_code": "COMP 101 - COMPUTER 1",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o8",
                "title_and_code": "COMP 102 - ADVANCE COMPUTER",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o9",
                "title_and_code": "PATHFIT 1 - MOVEMENT COMPETENCY TRAINING",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o10",
                "title_and_code": "PATHFIT 2 - EXERCISE-BASED FITNESS ACTIVITIES",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o11",
                "title_and_code": "NSTP 1 - NATIONAL SERVICE TRAINING PROGRAM 1",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o12",
                "title_and_code": "NSTP 2 - NATIONAL SERVICE TRAINING PROGRAM 2",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o13",
                "title_and_code": "THC 111 - PHILIPPINE CULTURE AND TOURISM GEOGRAPHY",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o14",
                "title_and_code": "THC 112 - RISK MANAGEMENT AS APPLIED TO SAFETY, SECURITY AND SANITATION",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o15",
                "title_and_code": "(NABMB 151) - ORGANIZATION AND MANAGEMENT",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o16",
                "title_and_code": "(NABMB 152) - BUSINESS MARKETING",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o17",
                "title_and_code": "GE 106 - SCIENCE, TECHNOLOGY AND SOCIETY",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o18",
                "title_and_code": "GE 108 - Business ETHICS",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o19",
                "title_and_code": "GE 107 - THE COMTEMPORARY WORLD",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o20",
                "title_and_code": "GE 109 - READINGS ON PHILIPPINE HISTORY",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o21",
                "title_and_code": "GE EL 102 - PHILIPPINE LITERATURE",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o22",
                "title_and_code": "GE 110 - ART APPRECIATION",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o23",
                "title_and_code": "GE EL 103 - INDIGENOUS CREATIVE ARTS",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o24",
                "title_and_code": "PATHFIT 4 - SPORTS",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o25",
                "title_and_code": "PATHFIT 3 - GROUP EXERCISE (AEROBICS, YOGA, ETC.)",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o26",
                "title_and_code": "THC 114 - LEGAL ASPECTS IN TOURISM AND HOSPITALITY",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o27",
                "title_and_code": "THC 113 - QUALITY SERVICE MANAGEMENT IN TOURISM AND HOSPITALITY",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o28",
                "title_and_code": "HPC 122 - FUNDAMENTALS IN FOOD SERVICE OPERATION",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 1,
                "lab_hours": 2,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o29",
                "title_and_code": "HPC 121 - KITCHEN ESSENTIALS AND BASIC FOOD PREPARATIONS",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o30",
                "title_and_code": "HMPE 131 - CULINARY FUNDAMENTALS",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o31",
                "title_and_code": "BME 141 - OPERATIONS MANAGEMENT (TQM)",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o32",
                "title_and_code": "BME 142 - STRATEGIC MANAGEMENT",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o33",
                "title_and_code": "(NABMB 153) - BUSINESS FINANCE (FOR NON-ABM)",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o34",
                "title_and_code": "(NABMB 154) - APPLIED ECONOMICS (FOR NON-ABM)",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o35",
                "title_and_code": "GE 111 - STATISTICS",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o36",
                "title_and_code": "THC 117 - MULTICULTURAL DIVERSITY IN WORKPLACE FOR THE TOURISM PROFESSIONAL",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o37",
                "title_and_code": "RZL - LIFE AND WORKS OF RIZAL",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o38",
                "title_and_code": "THC 118 - MICRO PERSPECTIVE OF TOURISM AND HOSPITALITY",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o39",
                "title_and_code": "THC 115 - MACRO PERSPECTIVE OF TOURISM AND HOSPITALITY",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o40",
                "title_and_code": "HPC 124 - APPLIED BUSINESS TOOLS AND TECHNOLOGIES",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o41",
                "title_and_code": "THC 116 - PROFESSIONAL DEVELOPMENT AND APPLIED ETHICS",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o42",
                "title_and_code": "HMPE 134 - FRONT OFFICE OPERATION",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o43",
                "title_and_code": "HPC 123 - FUNDAMENTALS IN LODGING OPERATIONS",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o44",
                "title_and_code": "HMPE 135 - ROOM DIVISION MANAGEMENT",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o45",
                "title_and_code": "HMPE 132 - FOOD AND BEVERAGE OPERATION",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o46",
                "title_and_code": "HPC 125 - SUPPLY CHAIN MANAGEMENT IN HOSPITALITY INDUSTRY",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o47",
                "title_and_code": "HMPE 3 - HOUSEKEEPING OPERATIONS",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o48",
                "title_and_code": "HPC 128 - FOREIGN LANGUAGE 1 (SPANISH)",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o49",
                "title_and_code": "NABMB 155 - FUNDAMENTALS OF ACCOUNTING (FOR NON- ABM)",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o50",
                "title_and_code": "RESEARCH 1 - HOSPITALITY RESEARCH 1",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o51",
                "title_and_code": "HPC 126 - Introduction to Meetings, Incentives, Conferences and Events Management (MICE) (Events Mgt. - NC III)",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o52",
                "title_and_code": "INT - INTERNSHIP/PRACTICUM",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 6,
                "lec_hours": 6,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o53",
                "title_and_code": "HPC 127 - ERGONOMETRIC AND FACILITIES PLANNING FOR THE HOSPITALITY INDUSTRY",
                "course": "BSHM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o54",
                "title_and_code": "HPC 129 - FOREIGN LANGUAGE 2 (SPANISH)",
                "course": "BSHM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o55",
                "title_and_code": "THC 119 - TOURISM AND HOSPITALITY MARKETING",
                "course": "BSHM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o56",
                "title_and_code": "THC 120 - ENTREPRENEURSHIP IN TOURISM AND HOSPITALITY",
                "course": "BSHM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_o57",
                "title_and_code": "RESEARCH 2 - HOSPITALITY RESEARCH 2",
                "course": "BSHM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o1",
                "title_and_code": "GE 101 - UNDERSTANDING THE SELF",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o2",
                "title_and_code": "GE 103 - MATHEMATICS IN MODERN WORLD",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o3",
                "title_and_code": "GE 102 - SINING NG PAKIKIPAGTALASTASAN",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o4",
                "title_and_code": "GE 104 - PURPOSIVE COMMUNICATION",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o5",
                "title_and_code": "GE EL 101 - ENTREPREURIAL MIND",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o6",
                "title_and_code": "GE 105 - PAGBASA AT PAGSULAT SA IBAT-IBANG DISIPLINA",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o7",
                "title_and_code": "SIBTECH 101 - SOCIAL ARTS 1",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o8",
                "title_and_code": "SIBTECH 102 - SOCIAL ARTS 2",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o9",
                "title_and_code": "COMP 101 - COMPUTER 1",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o10",
                "title_and_code": "COMP 102 - ADVANCE COMPUTER",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o11",
                "title_and_code": "PATHFIT 1 - MOVEMENT COMPETENCY TRAINING",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o12",
                "title_and_code": "PATHFIT 2 - EXERCISE-BASED FITNESS ACTIVITIES",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o13",
                "title_and_code": "NSTP 1 - NATIONAL SERVICE TRAINING PROGRAM 1",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o14",
                "title_and_code": "NSTP 2 - NATIONAL SERVICE TRAINING PROGRAM 2",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o15",
                "title_and_code": "BUS CORE 1 - BASIC MICROECONOMICS",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o16",
                "title_and_code": "BUS CORE 112 - BUSINESS LAW (OBLIGATION AND CONTRACTS)",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o17",
                "title_and_code": "GE 106 - SCIENCE, TECHNOLOGY AND SOCIETY",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o18",
                "title_and_code": "GE 108 - BUSINESS ETHICS",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o19",
                "title_and_code": "GE 107 - THE CONTEMPORARY WORLD",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o20",
                "title_and_code": "GE 109 - READINGS ON PHILIPPINE HISTORY",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o21",
                "title_and_code": "GE EL 102 - PHILIPPINE LITERATURE",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o22",
                "title_and_code": "GE 110 - ART APPRECIATION",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o23",
                "title_and_code": "GE EL 103 - INDIGENOUS CREATIVE ARTS",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o24",
                "title_and_code": "PATHFIT 4 - SPORTS",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o25",
                "title_and_code": "PATHFIT 3 - GROUP EXERCISE (AEROBICS, YOGA, ETC.)",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o26",
                "title_and_code": "PATHFIT 1&2 - BUS CORE 114",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o27",
                "title_and_code": "BUS CORE 113 - GOOD GOVERNANCE AND SOCIAL RESPONSIBILITY",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o28",
                "title_and_code": "BUS CORE 112 - PROF COR MM 123",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o29",
                "title_and_code": "PROF COR MM 121 - PROFESSIONAL SALESMANSHIP",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o30",
                "title_and_code": "PROF COR MM 124 - ADVERTISING",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o31",
                "title_and_code": "PROF COR MM 122 - MARKETING MANAGEMENT",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o32",
                "title_and_code": "MM ELEC 131 - PERSONAL FINANCE",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o33",
                "title_and_code": "BME 141 - OPERATIONS MANAGEMENT (TQM)",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o34",
                "title_and_code": "BME 142 - STRATEGIC MANAGEMENT",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o35",
                "title_and_code": "GE 111 - STATISTICS",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o36",
                "title_and_code": "PROF COR MM 126 - RETAIL MANAGEMENT",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o37",
                "title_and_code": "RZL - LIFE AND WORKS OF RIZAL",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o38",
                "title_and_code": "PROF COR MM 127 - PRICING STRATEGY",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o39",
                "title_and_code": "BUS CORE 115 - HUMAN RESOURCE MANAGEMENT",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o40",
                "title_and_code": "PROF COR MM 128 - MARKETING RESEARCH",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o41",
                "title_and_code": "BUS CORE 116 - BUSINESS RESEARCH",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o42",
                "title_and_code": "MM ELEC 135 - CONSUMER BEHAVIOR",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o43",
                "title_and_code": "PROF COR MM 125 - PRODUCT MANAGEMENT",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o44",
                "title_and_code": "PROF COR MM 122 - MM ELEC 136",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o45",
                "title_and_code": "MM ELEC 132 - CUSTOMER SERVICE MANAGEMENT",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o46",
                "title_and_code": "BME 142 - MM ELEC 137",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o47",
                "title_and_code": "MM ELEC 133 - FRANCHISING",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o48",
                "title_and_code": "MM ELEC 131 - MM ELEC 138",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o49",
                "title_and_code": "MM ELEC 134 - COOPERATIVE MANAGEMENT",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o50",
                "title_and_code": "MMC ELEC 131 - THESIS 1",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o51",
                "title_and_code": "BUS CORE 117 - INTERNATIONAL BUSINESS AND TRADE",
                "course": "BSBA-MM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o52",
                "title_and_code": "MM ELEC 138 - INT",
                "course": "BSBA-MM",
                "year_level": 4,
                "semester": 2,
                "units": 6,
                "lec_hours": 6,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o53",
                "title_and_code": "MM ELEC 139 - ENTREPRENEURIAL MANAGEMENT",
                "course": "BSBA-MM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o54",
                "title_and_code": "MM ELEC 140 - SPECIAL TOPICS IN MARKETING MANAGEMENT",
                "course": "BSBA-MM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o55",
                "title_and_code": "COMP 103 - INTRODUCTION TO COMPUTING",
                "course": "BSBA-MM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o56",
                "title_and_code": "COMP 104 - WEB DEVELOPMENT",
                "course": "BSBA-MM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_mm_o57",
                "title_and_code": "THESIS 2 - RESEARCH 2",
                "course": "BSBA-MM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o1",
                "title_and_code": "GE 101 - UNDERSTANDING THE SELF",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o2",
                "title_and_code": "GE 103 - MATHEMATICS IN MODERN WORLD",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o3",
                "title_and_code": "GE 102 - SINING NG PAKIKIPAGTALASTASAN",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o4",
                "title_and_code": "GE 104 - PURPOSIVE COMMUNICATION",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o5",
                "title_and_code": "GE EL 101 - ENTREPREURIAL MIND",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o6",
                "title_and_code": "GE 105 - PAGBASA AT PAGSULAT SA IBAT-IBANG DISIPLINA",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o7",
                "title_and_code": "SIBTECH 101 - SOCIAL ARTS 1",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o8",
                "title_and_code": "SIBTECH 102 - SOCIAL ARTS 2",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o9",
                "title_and_code": "COMP 101 - COMPUTER 1",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o10",
                "title_and_code": "COMP 102 - ADVANCE COMPUTER",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o11",
                "title_and_code": "PATHFIT 1 - MOVEMENT COMPETENCY TRAINING",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o12",
                "title_and_code": "PATHFIT 2 - EXERCISE-BASED FITNESS ACTIVITIES",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o13",
                "title_and_code": "NSTP 1 - NATIONAL SERVICE TRAINING PROGRAM 1",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o14",
                "title_and_code": "NSTP 2 - NATIONAL SERVICE TRAINING PROGRAM 2",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o15",
                "title_and_code": "BUS CORE 1 - BASIC MICROECONOMICS",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o16",
                "title_and_code": "BUS CORE 112 - BUSINESS LAW (OBLIGATION AND CONTRACTS)",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o17",
                "title_and_code": "GE 106 - SCIENCE, TECHNOLOGY AND SOCIETY",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o18",
                "title_and_code": "GE 108 - Business ETHICS",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o19",
                "title_and_code": "GE 107 - THE COMTEMPORARY WORLD",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o20",
                "title_and_code": "GE 109 - READINGS ON PHILIPPINE HISTORY",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o21",
                "title_and_code": "GE EL 102 - PHILIPPINE LITERATURE",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o22",
                "title_and_code": "GE 110 - ART APPRECIATION",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o23",
                "title_and_code": "GE EL 103 - INDIGENOUS CREATIVE ARTS",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o24",
                "title_and_code": "PATHFIT 4 - SPORTS",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o25",
                "title_and_code": "PATHFIT 3 - GROUP EXERCISE (AEROBICS, YOGA, ETC.)",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o26",
                "title_and_code": "BUS CORE 4 - INCOME TAXATION",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o27",
                "title_and_code": "BUS CORE 113 - GOOD GOVERNANCE AND SOCIAL RESPONSIBILITY",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o28",
                "title_and_code": "PROF COR FM 123 - INVESTMENT AND PORTFOLIO MANAGEMENT",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o29",
                "title_and_code": "PROF COR FM 121 - FINANCIAL MANAGEMENT",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o30",
                "title_and_code": "PROF COR FM 124 - CAPITAL MARKET",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o31",
                "title_and_code": "PROF COR FM 122 - BANKING AND FINANCIAL INSTITUTION",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o32",
                "title_and_code": "FM ELEC 131 - PERSONAL FINANCE",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o33",
                "title_and_code": "BME 141 - OPERATIONS MANAGEMENT (TQM)",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o34",
                "title_and_code": "BME 142 - STRATEGIC MANAGEMENT",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o35",
                "title_and_code": "GE 111 - STATISTICS",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o36",
                "title_and_code": "PROF COR FM 126 - CREDIT AND COLLECTION",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o37",
                "title_and_code": "RZL - LIFE AND WORKS OF RIZAL",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o38",
                "title_and_code": "PROF COR FM 127 - MONETARY POLICY AND CENTRAL BANKING",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o39",
                "title_and_code": "BUS CORE 115 - HUMAN RESOURCE MANAGEMENT",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o40",
                "title_and_code": "PROF COR FM 128 - SPECIAL TOPICS IN FINANCIAL MANGEMENT",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o41",
                "title_and_code": "BUS CORE 116 - BUSINESS RESEARCH",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o42",
                "title_and_code": "FM ELEC 135 - BEHAVIORAL FINANCE",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o43",
                "title_and_code": "PROF COR FM 125 - FINANCIAL ANALYSIS AND REPORTING",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o44",
                "title_and_code": "FM ELEC 136 - TREASURY MANAGEMENT",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o45",
                "title_and_code": "FM ELEC 132 - CUSTOMER SERVICE MANAGEMENT",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o46",
                "title_and_code": "FM ELEC 137 - MUTUAL FUND",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o47",
                "title_and_code": "FM ELEC 133 - FRANCHISING",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o48",
                "title_and_code": "FM ELEC 138 - PROJECT MANAGEMENT",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o49",
                "title_and_code": "FM ELEC 134 - COOPERATIVE MANAGEMENT",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o50",
                "title_and_code": "THESIS 1 - RESEARCH 1",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o51",
                "title_and_code": "BUS CORE 117 - INTERNATIONAL BUSINESS AND TRADE",
                "course": "BSBA-FM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o52",
                "title_and_code": "INT - INTERNSHIP",
                "course": "BSBA-FM",
                "year_level": 4,
                "semester": 2,
                "units": 6,
                "lec_hours": 6,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o53",
                "title_and_code": "FM ELEC 139 - ENTREPRENEURIAL MANAGEMENT",
                "course": "BSBA-FM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o54",
                "title_and_code": "FM ELEC 140 - RISK MANAGEMENT",
                "course": "BSBA-FM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o55",
                "title_and_code": "COMP 103 - INTRODUCTION TO COMPUTING",
                "course": "BSBA-FM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o56",
                "title_and_code": "COMP 104 - COMPUTER PROGRAMMING 1",
                "course": "BSBA-FM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bsba_fm_o57",
                "title_and_code": "THESIS 2 - RESEARCH 2",
                "course": "BSBA-FM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o1",
                "title_and_code": "GE 101 - Understanding The Self (General Psychology)",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o2",
                "title_and_code": "GE 103 - Mathematics in Modern World (Plane Trigonometry)",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o3",
                "title_and_code": "GE 102 - Sining ng Pakikipagtalastasan",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o4",
                "title_and_code": "GE 104 - Purposive Communication",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o5",
                "title_and_code": "GE EL 101 - Entrepreneurial Mind",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o6",
                "title_and_code": "GE 105 - PAGBASA AT PAGSULAT SA IBAT-IBANG DISIPLINA",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o7",
                "title_and_code": "GE EL 103 - Environmental Science",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o8",
                "title_and_code": "CDI 131 - Fundamentals of Investigation and Intelligence",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 4,
                "lec_hours": 4,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o9",
                "title_and_code": "GE EL 104 - Gender and Society",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o10",
                "title_and_code": "LEA 151 - Law Enforcement Organization and Administration",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 4,
                "lec_hours": 4,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o11",
                "title_and_code": "CRIM 111 - Introduction to Criminology",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o12",
                "title_and_code": "LEA 152 - Comparative Models in  Policing",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o13",
                "title_and_code": "CLJ 121 - Introduction to Philippine Criminal Justice",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o14",
                "title_and_code": "NSTP 2 - Reserve Officers' Training Corps 2",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o15",
                "title_and_code": "NSTP 1 - Reserve Officers' Training Corps 1",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o16",
                "title_and_code": "PE 182 - Arnis and Disarming Technique",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o17",
                "title_and_code": "PE 181 - Fundamentals of Martial Arts",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o18",
                "title_and_code": "EHC 171 - ENHANCEMENT COURSE 1",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o19",
                "title_and_code": "GE 106 - SCIENCE, TECHNOLOGY AND SOCIETY",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o20",
                "title_and_code": "GE 108 - ETHICS",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o21",
                "title_and_code": "GE 107 - THE CONTEMPORARY WORLD",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o22",
                "title_and_code": "GE 109 - READINGS ON PHILIPPINE HISTORY",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o23",
                "title_and_code": "GE EL 102 - PHILIPPINE LITERATURE",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o24",
                "title_and_code": "GE 110 - ART APPRECIATION",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o25",
                "title_and_code": "FORENSIC 141 - Forensic Photography",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o26",
                "title_and_code": "ADGE - General Chemistry (Organic)",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o27",
                "title_and_code": "CA 161 - Institutional Corrections",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o28",
                "title_and_code": "FORENSIC 142 - Personal Identification Techniques",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o29",
                "title_and_code": "CFLM-1 - Character Formation, Nationalism and Patriotism",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o30",
                "title_and_code": "CRIM 113 - Human Behavior and Victimology",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o31",
                "title_and_code": "CRIM 112 - Theories of Crime Causation",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o32",
                "title_and_code": "LEA 153 - Introduction to Industrial Security Concepts",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o33",
                "title_and_code": "CDI 132 - Specialized Crime Investigation 1 with Legal Medicine",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o34",
                "title_and_code": "PE 184 - Fundamentals of Marksmanship",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o35",
                "title_and_code": "PE 183 - First Aid and Water Safety",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o36",
                "title_and_code": "EHC 172 - ENHANCEMENT COURSE 2",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o37",
                "title_and_code": "RZL - LIFE AND WORKS OF RIZAL",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o38",
                "title_and_code": "CA 162 - Non-Institutional Corrections",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o39",
                "title_and_code": "CFLM-2 - Character Formation with Leadership, Decision Making, Management and Administration",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o40",
                "title_and_code": "CLJ 124 - Criminal Law (Book 2)",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 4,
                "lec_hours": 4,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o41",
                "title_and_code": "CLJ 122 - Human Rights Education",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o42",
                "title_and_code": "CRIM 114 - Professional Conduct and Ethical Standards",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o43",
                "title_and_code": "CLJ 123 - Criminal Law (Book 1)",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o44",
                "title_and_code": "CRIM 115 - Juvenile Delinquency and Juvenile Justice System",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 4,
                "lec_hours": 4,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o45",
                "title_and_code": "FORENSIC 143 - Forensic Chemistry and Toxicology",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 5,
                "lec_hours": 3,
                "lab_hours": 2,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o46",
                "title_and_code": "FORENSIC 114 - Questioned Documents Examination",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o47",
                "title_and_code": "CDI 133 - Specialized Crime Investigation 2 with Simulation on Interrogation and Interview",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o48",
                "title_and_code": "FORENSIC 115 - Lie Detection Techniques",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o49",
                "title_and_code": "CDI 134 - Traffic Management and Accident Investigation with Driving",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o50",
                "title_and_code": "CDI 135 - Technical English 1 (Technical Report Writing and Presentation)",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o51",
                "title_and_code": "LEA 154 - Law Enforcement Operations and Planning with Crime Mapping",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o52",
                "title_and_code": "EHC 3 - ENHANCEMENT COURSE 3",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o53",
                "title_and_code": "CA 163 - Therapeutic Modalities",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o54",
                "title_and_code": "CLJ 126 - Criminal Procedure and Court Testimony",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o55",
                "title_and_code": "CLJ 125 - Evidence",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o56",
                "title_and_code": "FORENSIC 146 - Forensic Ballistics",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o57",
                "title_and_code": "CRIM 116 - Dispute Resolution and Crises/Incidents Management",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o58",
                "title_and_code": "CRIM 118 - Criminological Research 2(Thesis Writing and Presentation",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o59",
                "title_and_code": "CRIM 117 - Criminological Research1 (Research Methods with Applied Statistics)",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o60",
                "title_and_code": "CDI 138 - Technical English 2 (Legal Forms)",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o61",
                "title_and_code": "CDI 136 - Fire Protection and Arson Investigation",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o62",
                "title_and_code": "CDI 139 - Introduction to Cybercrime and Environmental Laws and Protection",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o63",
                "title_and_code": "CDI 137 - Vice and Drug Education and Control",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o64",
                "title_and_code": "CP 192 - Internship (On-the Job Training)",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bscrim_o65",
                "title_and_code": "CP 191 - Internship (On-the Job Training)",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "old"
        },
        {
                "id": "bshm_n1",
                "title_and_code": "GE 101 - Understanding The Self",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n2",
                "title_and_code": "GE 103 - Mathematics In The Modern World",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n3",
                "title_and_code": "GE 102 - Sining Ng Pakikipagtalastasan",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n4",
                "title_and_code": "GE 104 - Purposive Communication",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n5",
                "title_and_code": "GE EL 101 - Entrepreurial Mind",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n6",
                "title_and_code": "GE 105 - Pagbasa At Pagsulat Sa Ibat-Ibang Disiplina",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n7",
                "title_and_code": "(NABMB 153) - Business Finance (For Non-Abm)",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n8",
                "title_and_code": "HPC 121 - Kitchen Essentials And Basic Food Preparations",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n9",
                "title_and_code": "COMP 101 - Computer 1",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n10",
                "title_and_code": "COMP 102 - Advance Computer",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n11",
                "title_and_code": "PTHFIT 1 - Physical Fitness",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n12",
                "title_and_code": "PATHFIT 2 - Rhytmic Activities",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n13",
                "title_and_code": "NSTP 1 - National Service Training Program 1",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n14",
                "title_and_code": "NSTP 2 - National Service Training Program 2",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n15",
                "title_and_code": "THC 111 - Philippine Culture and Tourism Geography",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n16",
                "title_and_code": "THC 112 - Risk Management As Applied To Safety, Security And Sanitation",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n17",
                "title_and_code": "BME 141 - Operations Management",
                "course": "BSHM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n18",
                "title_and_code": "(NABMB 152) - Business Marketing",
                "course": "BSHM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n19",
                "title_and_code": "GE 106 - Science, Technology and Society",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n20",
                "title_and_code": "GE 108 - Ethics",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n21",
                "title_and_code": "GE 107 - The Contemporary World",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n22",
                "title_and_code": "GE 109 - Readings On Philippine History",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n23",
                "title_and_code": "GE EL 102 - Philippine Literature",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n24",
                "title_and_code": "GE 110 - Art Appreciation",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n25",
                "title_and_code": "GE EL 103 - Indigenous Creative Arts",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n26",
                "title_and_code": "PATHFIT 4 - Team Sports And Games",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n27",
                "title_and_code": "PATHFIT 3 - Dual Sports and Games",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n28",
                "title_and_code": "THC 114 - Legal Aspects in Tourism and Hospitality",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n29",
                "title_and_code": "THC 113 - Quality Service Management in Tourism and Hospitality",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n30",
                "title_and_code": "HPC 122 - Fundamentals In Food Service Operation",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 1,
                "lab_hours": 2,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n31",
                "title_and_code": "(NABMB 154) - Applied Economics (For Non-Abm)",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n32",
                "title_and_code": "HMPE 131 - Culinary Fundamentals",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n33",
                "title_and_code": "RZL - Life And Works Of Rizal",
                "course": "BSHM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n34",
                "title_and_code": "BME 142 - Strategic Management",
                "course": "BSHM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n35",
                "title_and_code": "GE 111 - Statistics",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n36",
                "title_and_code": "THC 117 - Multicultural Diversity in Workplace for The Tourism Professional",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n37",
                "title_and_code": "THC 115 - Macro Perspective of Tourism and Hospitality",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n38",
                "title_and_code": "THC 118 - Micro Perspective of Tourism and Hospitality",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n39",
                "title_and_code": "THC 116 - Professional Development and Applied Ethics",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n40",
                "title_and_code": "HPC 124 - Applied Business Tools and Technologies",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n41",
                "title_and_code": "HPC 123 - Fundamentals In Lodging Operations",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n42",
                "title_and_code": "HMPE 134 - Front Office Operation",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n43",
                "title_and_code": "HMPE 132 - Food And Beverage Operation",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n44",
                "title_and_code": "HMPE 135 - Room Division Management",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n45",
                "title_and_code": "HMPE 133 - Housekeeping Operations",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n46",
                "title_and_code": "HPC 125 - Supply Chain Management in Hospitality Industry",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n47",
                "title_and_code": "NABMB 155 - Fundamentals Of Accounting (For Non- Abm)",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n48",
                "title_and_code": "HPC 128 - Foreign Language 1 (Spanish)",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n49",
                "title_and_code": "RESEARCH 1 - Hospitality Research 1",
                "course": "BSHM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n50",
                "title_and_code": "RESEARCH 2 - Hospitality Research 2",
                "course": "BSHM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n51",
                "title_and_code": "HPC 126 - Introduction To Meetings, Incentives, Conferences and Events Management (MICE) (Events Mgt. - NC III)",
                "course": "BSHM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n52",
                "title_and_code": "INT - INTERNSHIP/PRACTICUM",
                "course": "BSHM",
                "year_level": 4,
                "semester": 2,
                "units": 6,
                "lec_hours": 6,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n53",
                "title_and_code": "600 HRS - HMPE 134  HMPE 135",
                "course": "BSHM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n54",
                "title_and_code": "HPC 127 - Ergonometric And Facilities Planning for The Hospitality Industry",
                "course": "BSHM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n55",
                "title_and_code": "HPC 129 - Foreign Language 2 (Spanish)",
                "course": "BSHM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n56",
                "title_and_code": "THC 119 - Tourism And Hospitality Marketing",
                "course": "BSHM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bshm_n57",
                "title_and_code": "THC 120 - Entrepreneurship In Tourism and Hospitality",
                "course": "BSHM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n1",
                "title_and_code": "GE 101 - Understanding the Self (General Psychology)",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n2",
                "title_and_code": "GE 103 - Mathematics In Modern World (Plane Trigonometry)",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n3",
                "title_and_code": "GE 106 - Science, Technology, and Society",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n4",
                "title_and_code": "GE 104 - Purposive Communication",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n5",
                "title_and_code": "LEA 1 - Law Enforcement Organization and Administration",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 4,
                "lec_hours": 4,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n6",
                "title_and_code": "GE EL 1 - Advanced Computer",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n7",
                "title_and_code": "CFLM-1 - Character Formation, Nationalism and Patriotism",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n8",
                "title_and_code": "GE 108 - Ethics",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n9",
                "title_and_code": "GE EL 105 - Gender and Society",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n10",
                "title_and_code": "CRIM 3 - Human Behavior and Victimology",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n11",
                "title_and_code": "CRIM 1 - Introduction To Criminology",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n12",
                "title_and_code": "LEA 2 - Comparative Models in Policing",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n13",
                "title_and_code": "CLJ 1 - Introduction To Philippine Criminal Justice System",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n14",
                "title_and_code": "CDI 1 - Fundamentals Of Investigation and Intelligence",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 4,
                "lec_hours": 4,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n15",
                "title_and_code": "NSTP 1 - Reserve Officers’ Training Corps 1",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n16",
                "title_and_code": "NSTP 2 - Reserve Officers’ Training Corps 2",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n17",
                "title_and_code": "PATHFIT 1 - Fundamentals Of Martial Arts",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n18",
                "title_and_code": "PATHFIT 2 - Arnis And Disarming Technique",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n19",
                "title_and_code": "CRIM 2 - Theories of Crime Causation",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n20",
                "title_and_code": "CFLM 2 - Character Formation w/ Leadership, Decision Making Management & Administration",
                "course": "BSCRIM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n21",
                "title_and_code": "LEA 3 - Introduction to Industrial Security Concepts",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n22",
                "title_and_code": "GE 109 - Readings On Philippine History",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n23",
                "title_and_code": "GE 107 - The Contemporary World",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n24",
                "title_and_code": "GE 110 - Art Appreciation",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n25",
                "title_and_code": "CRIM 4 - Professional Conduct and Ethical Standards",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n26",
                "title_and_code": "GE EL 2 - Information Assistance & Security",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n27",
                "title_and_code": "CA 1 - Institutional Corrections",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n28",
                "title_and_code": "ADGE - General Chemistry (Organic)",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n29",
                "title_and_code": "FORENSIC 1 - Forensic Photography",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n30",
                "title_and_code": "FORENSIC 2 - Personal Identification Techniques",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n31",
                "title_and_code": "CDI 2 - Specialized Crime Investigation 1 with Legal Medicine",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n32",
                "title_and_code": "CDI 3 - Specialized Crime Investigation 2 With Simulation on Interrogation and Interview",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n33",
                "title_and_code": "CRIM 5 - Juvenile Delinquency and Juvenile Justice System",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n34",
                "title_and_code": "CA2 - Non-Institutional Corrections",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n35",
                "title_and_code": "LEA 4 - Law Enforcement Operations and Planning with Crime Mapping",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n36",
                "title_and_code": "CDI 4 - Traffic Management and Accident Investigation with Driving",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n37",
                "title_and_code": "PATHFIT 3 - First Aid and Water Safety",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n38",
                "title_and_code": "PATHFIT 4 - Fundamentals of Marksmanship",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n39",
                "title_and_code": "RZL - Life and Works of Rizal",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n40",
                "title_and_code": "CDI 5 - Technical English 1 (Technical Report Writing and Presentation)",
                "course": "BSCRIM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n41",
                "title_and_code": "CLJ 2 - Human Rights Education",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n42",
                "title_and_code": "CRIM 8 - Criminological Research 2(Thesis Writing and Presentation",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n43",
                "title_and_code": "CLJ 3 - Criminal Law (Book 1)",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n44",
                "title_and_code": "CLJ 4 - Criminal Law (Book 2)",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 4,
                "lec_hours": 4,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n45",
                "title_and_code": "FORENSIC 5 - Lie Detection Techniques",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n46",
                "title_and_code": "CRIM 6 - Dispute Resolution and Crises/Incidents Management",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n47",
                "title_and_code": "STAT 111 - Statistics",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n48",
                "title_and_code": "FORENSIC 6 - Forensic Ballistics",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n49",
                "title_and_code": "FORENSIC 3 - Forensic Chemistry and Toxicology",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 5,
                "lec_hours": 3,
                "lab_hours": 2,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n50",
                "title_and_code": "CDI 6 - Fire Protection and Arson Investigation",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n51",
                "title_and_code": "CRIM 7 - Criminological Research1 (Research Methods with Applied Statistics)",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n52",
                "title_and_code": "CDI 9 - Introduction To Cybercrime and Environmental Laws and Protection",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n53",
                "title_and_code": "CA 3 - Therapeutic Modalities",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n54",
                "title_and_code": "EHC 2 - Criminology Enhancement Course 2",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n55",
                "title_and_code": "FORENSIC 4 - Questioned Documents Examination",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n56",
                "title_and_code": "CDI 7 - Vice And Drug Education and Control",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n57",
                "title_and_code": "EHC 1 - Criminology Enhancement Course 1",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n58",
                "title_and_code": "CDI 8 - Technical English 2 (Legal Forms)",
                "course": "BSCRIM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n59",
                "title_and_code": "CLJ 5 - Evidence",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n60",
                "title_and_code": "CLJ 6 - Criminal Procedure And Court Testimony",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n61",
                "title_and_code": "CP 1 - Internship (On-The Job Training) 270 hrs",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bscrim_n62",
                "title_and_code": "CP 2 - Internship (On-The Job Training) 270 hrs",
                "course": "BSCRIM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n1",
                "title_and_code": "GE 101 - Understanding the Self",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n2",
                "title_and_code": "GE 103 - Mathematics in the Modern World",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n3",
                "title_and_code": "GE 102 - Basic English Grammar",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n4",
                "title_and_code": "GE 104 - Purposive Communication",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n5",
                "title_and_code": "GE EL 102 - Philippine Literature",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n6",
                "title_and_code": "PROF ED 1 - The Child and Adolescent Learner and Learning Principles",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n7",
                "title_and_code": "EL 100 - Introduction to Linguistics",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n8",
                "title_and_code": "EL 104 - Language Programs and Policies in Multilingual Societies",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n9",
                "title_and_code": "EL 101 - Language, Culture and Society",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n10",
                "title_and_code": "EL 105 - Language Learning Materials Development",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n11",
                "title_and_code": "Comp 101 - Computer 1",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n12",
                "title_and_code": "PROFED2 - The Teaching Profession",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n13",
                "title_and_code": "PATHFIT 1 - Physical Fitness",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n14",
                "title_and_code": "PATHFIT 2 - Rhythmic Activities",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n15",
                "title_and_code": "EL 102 - Structures of English",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n16",
                "title_and_code": "EL106 - Teaching and Assessment of Literature Studies",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n17",
                "title_and_code": "NSTP 1 - National Service Training Program 1",
                "course": "BSED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n18",
                "title_and_code": "NSTP 2 - National Service Training Program 2",
                "course": "BSED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n19",
                "title_and_code": "EL 103 - Principles and Theories of Language Acquisition and Learning",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n20",
                "title_and_code": "GE 106 - Science, Technology and Society",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n21",
                "title_and_code": "GE 108 - Ethics",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n22",
                "title_and_code": "GE 107 - The Contemporary World",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n23",
                "title_and_code": "GE 109 - Readings on Philippine History",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n24",
                "title_and_code": "EL107 - Teaching and Assessment of the Macro skills",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n25",
                "title_and_code": "GE 110 - Art Appreciation",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n26",
                "title_and_code": "EL108 - Teaching and Assessment of Grammar",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n27",
                "title_and_code": "PROFED3 - The Teacher and the Community, School Culture and Organizational Leadership",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n28",
                "title_and_code": "EL 109 - Speech and Theater Arts",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n29",
                "title_and_code": "EL113 - Survey of Philippine Literature in English",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n30",
                "title_and_code": "EL111 - Children and Adolescent Literature",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n31",
                "title_and_code": "EL114 - Survey of Afro-Asian Literature",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n32",
                "title_and_code": "EL112 - Mythology and Folklore",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n33",
                "title_and_code": "PATHFIT 4 - Team Sport and Games",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n34",
                "title_and_code": "GE 105 - Public Speaking and Debate",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n35",
                "title_and_code": "EL115 - Survey of English and American Literature",
                "course": "BSED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n36",
                "title_and_code": "PATHFIT 3 - Dual Sports and Games",
                "course": "BSED",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n37",
                "title_and_code": "EL116 - Contemporary and Popular Literature",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n38",
                "title_and_code": "RZL - Life and Works of Rizal",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n39",
                "title_and_code": "ELEC1 - Stylistics and Discourse Analysis",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n40",
                "title_and_code": "GE 111 - Statistics",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n41",
                "title_and_code": "FS2 - FIELD STUDY 2 (Participation and Teaching Assistanship)",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n42",
                "title_and_code": "PROFED4 - Foundation of Special and Inclusive Education",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n43",
                "title_and_code": "ELEC2 - Remedial Instruction",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n44",
                "title_and_code": "PROF ED 5 - Facilitating Learner-Centered Teaching",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n45",
                "title_and_code": "PROF ED7 - Assessment of Learning 2",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n46",
                "title_and_code": "EL117 - Literary Criticism",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n47",
                "title_and_code": "PROF ED 9 - The Teacher and the School Curriculum",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n48",
                "title_and_code": "EL118 - Technical Writing",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n49",
                "title_and_code": "EL 119 - Campus Journalism",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n50",
                "title_and_code": "PROFED 6 - Assessment of Learning 1",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n51",
                "title_and_code": "PROF ED 10 - Building and Enhancing New Literacies Across the Curriculum",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n52",
                "title_and_code": "FS1 - FIELD STUDY 1 (Observations of Teaching)",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n53",
                "title_and_code": "PROF ED 8 - Technology for Teaching and Learning 1",
                "course": "BSED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n54",
                "title_and_code": "RES 1 - Language Research 1",
                "course": "BSED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n55",
                "title_and_code": "RES 2 - Language Research 2",
                "course": "BSED",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n56",
                "title_and_code": "EHC2 - Educational Enhancement Course 2",
                "course": "BSED",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n57",
                "title_and_code": "EL-TIB - TEACHING INTERNSHIP",
                "course": "BSED",
                "year_level": 4,
                "semester": 1,
                "units": 6,
                "lec_hours": 6,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n58",
                "title_and_code": "600HRS - FS 1 & 2",
                "course": "BSED",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsed_n59",
                "title_and_code": "EL120 - Technology for Teaching and Learning 2  (Teaching in Language Education)",
                "course": "BSED",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n1",
                "title_and_code": "GE 101 - Understanding the Self",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n2",
                "title_and_code": "GE 103 - Mathematics in the Modern World",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n3",
                "title_and_code": "GE 102 - Sining ng Pakikipagtalastasan",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n4",
                "title_and_code": "GE 104 - Purposive Communication",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n5",
                "title_and_code": "GE EL 101 - Entrepreneurial Mind",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n6",
                "title_and_code": "GE 105 - Pagbasa at Pagsulat sa Iba’t Ibang Disiplina",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n7",
                "title_and_code": "CC 102 - Computer Programming 1",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n8",
                "title_and_code": "CC 104 - Information Technology Fundamentals",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n9",
                "title_and_code": "PATHFIT 1 - Movement Competency Training",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n10",
                "title_and_code": "PATHFIT 2 - Exercise-Based Fitness Activities",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n11",
                "title_and_code": "NSTP 1 - National Service Training Program 1",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n12",
                "title_and_code": "NSTP 2 - National Service Training Program 2",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n13",
                "title_and_code": "CC 101 - Introduction to Computing",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n14",
                "title_and_code": "CC 103 - Computer Programming 2",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n15",
                "title_and_code": "MS 101 - Discrete Mathematics",
                "course": "BSIT",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n16",
                "title_and_code": "MS 102 - Quantitative Methods",
                "course": "BSIT",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n17",
                "title_and_code": "GE 106 - Science, Technology, and Society",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n18",
                "title_and_code": "GE 108 - Business Ethics",
                "course": "BSIT",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n19",
                "title_and_code": "GE 107 - The Contemporary World",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n20",
                "title_and_code": "GE 109 - Readings in Philippine History",
                "course": "BSIT",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n21",
                "title_and_code": "GE EL 102 - Philippine Literature",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n22",
                "title_and_code": "GE 110 - Art Appreciation",
                "course": "BSIT",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n23",
                "title_and_code": "GE EL 103 - Indigenous Creative Arts",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n24",
                "title_and_code": "PATHFIT 4 - Sports",
                "course": "BSIT",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n25",
                "title_and_code": "PATHFIT 3 - Group Exercise",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n26",
                "title_and_code": "PATHFIT 2 - CC 106",
                "course": "BSIT",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n27",
                "title_and_code": "PF 102 - Event Driven Programming",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n28",
                "title_and_code": "CC 103 - CC 105",
                "course": "BSIT",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n29",
                "title_and_code": "IM 101 - Fundamentals of Database Systems",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n30",
                "title_and_code": "CC 102 - IAS 101",
                "course": "BSIT",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n31",
                "title_and_code": "PF 101 - Object-Oriented Programming",
                "course": "BSIT",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n32",
                "title_and_code": "GE 111 - Statistics",
                "course": "BSIT",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n33",
                "title_and_code": "WS 101 - Web Systems and Technology",
                "course": "BSIT",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n34",
                "title_and_code": "RZL - Life and Works of Rizal",
                "course": "BSIT",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n35",
                "title_and_code": "IPT 101 - Integrative Programming & Technologies",
                "course": "BSIT",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n36",
                "title_and_code": "CC 107 - App Dev. & Emerging Technologies",
                "course": "BSIT",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n37",
                "title_and_code": "IM 101 - NET 102",
                "course": "BSIT",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n38",
                "title_and_code": "NET 101 - Networking 1",
                "course": "BSIT",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n39",
                "title_and_code": "CC 105 - IAS 102",
                "course": "BSIT",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n40",
                "title_and_code": "HCI 101 - Intro to Human-Computer Interaction",
                "course": "BSIT",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n41",
                "title_and_code": "CC 103 - SIA 101",
                "course": "BSIT",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n42",
                "title_and_code": "SP 101 - Social and Professional Issues",
                "course": "BSIT",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n43",
                "title_and_code": "SIA 102 - System Integration and Architecture 2",
                "course": "BSIT",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n44",
                "title_and_code": "SIA 101 - PRAC 101",
                "course": "BSIT",
                "year_level": 3,
                "semester": 2,
                "units": 6,
                "lec_hours": 6,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n45",
                "title_and_code": "PT 101 - Platform Technologies",
                "course": "BSIT",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n46",
                "title_and_code": "IT 101 - Multimedia and Animation",
                "course": "BSIT",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n47",
                "title_and_code": "HCI 102 - Human-Computer Interaction 2",
                "course": "BSIT",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsit_n48",
                "title_and_code": "CAP 102 - Capstone Project and Research 2",
                "course": "BSIT",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n1",
                "title_and_code": "GE 101 - Understanding The Self",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n2",
                "title_and_code": "GE 103 - Mathematics in the Modern World",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n3",
                "title_and_code": "GE EL 101 - Entrepreneurial Mind",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n4",
                "title_and_code": "GE 104 - Purposive Communication",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n5",
                "title_and_code": "GE EL 102 - Philippine Literature",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n6",
                "title_and_code": "GE 108 - Ethics",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n7",
                "title_and_code": "BUS CORE 111 - Basic Microeconomics",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n8",
                "title_and_code": "BUS CORE 112 - Business Law (Obligation And Contracts)",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n9",
                "title_and_code": "PROF COR MM 121 - Professional Salesmanship",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n10",
                "title_and_code": "MM ELEC 131 - Personal Finance",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n11",
                "title_and_code": "PATHFIT 1 - Physical Fitness",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n12",
                "title_and_code": "PATHFIT 2 - Rhytmic Activities",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n13",
                "title_and_code": "NSTP 1 - National Service Training Program 1",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n14",
                "title_and_code": "NSTP 2 - National Service Training Program 2",
                "course": "BSBA-MM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n15",
                "title_and_code": "GE 106 - Science, Technology And Society",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n16",
                "title_and_code": "GE 109 - Readings On Philippine History",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n17",
                "title_and_code": "GE 107 - The Contemporary World",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n18",
                "title_and_code": "GE 110 - Art Appreciation",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n19",
                "title_and_code": "GE EL 103 - Indigenous Creative Arts",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n20",
                "title_and_code": "BUS CORE 114 - Income Taxation",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n21",
                "title_and_code": "BME 141 - Operations Management (Tqm)",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n22",
                "title_and_code": "BME 142 - Strategic Management",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n23",
                "title_and_code": "BUS CORE 113 - Good Governance And Social Responsibility",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n24",
                "title_and_code": "PROF COR MM 123 - Distribution Management",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n25",
                "title_and_code": "PROF COR MM 122 - Marketing Management",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n26",
                "title_and_code": "PROF COR MM 124 - Advertising",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n27",
                "title_and_code": "PATHFIT 3 - Dual Sports And Games",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n28",
                "title_and_code": "PATHFIT 4 - Team Sports And Games",
                "course": "BSBA-MM",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n29",
                "title_and_code": "GE 111 - Statistics",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n30",
                "title_and_code": "PROF COR MM 126 - Retail Management",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n31",
                "title_and_code": "RZL - Life And Works Of Rizal",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n32",
                "title_and_code": "PROF COR MM 127 - Pricing Strategy",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n33",
                "title_and_code": "BUS CORE 115 - Human Resource Management",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n34",
                "title_and_code": "PROF COR MM 128 - Marketing Research",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n35",
                "title_and_code": "BUS CORE 116 - Business Research",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n36",
                "title_and_code": "MM ELEC 133 - Consumer Behavior",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n37",
                "title_and_code": "PROF COR MM 125 - Product Management",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n38",
                "title_and_code": "MM ELEC 134 - Sales Management",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n39",
                "title_and_code": "MM ELEC 132 - Franchising",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n40",
                "title_and_code": "MM ELEC 135 - Industrial/Agricultural Marketing",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n41",
                "title_and_code": "COMP 104 - Web Development",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n42",
                "title_and_code": "THESIS 1 - Research 1",
                "course": "BSBA-MM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n43",
                "title_and_code": "BUS CORE 117 - International Business And Trade",
                "course": "BSBA-MM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n44",
                "title_and_code": "INT - INTERNSHIP",
                "course": "BSBA-MM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n45",
                "title_and_code": "MM ELEC 136 - Special Topics In Marketing Management",
                "course": "BSBA-MM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_mm_n46",
                "title_and_code": "THESIS 2 - Research 2",
                "course": "BSBA-MM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n1",
                "title_and_code": "GE 101 - Understanding The Self",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n2",
                "title_and_code": "GE 103 - Mathematics in the Modern World",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n3",
                "title_and_code": "GE EL 101 - Entrepreneurial Mind",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n4",
                "title_and_code": "GE 104 - Purposive Communication",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n5",
                "title_and_code": "GE EL 102 - Philippine Literature",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n6",
                "title_and_code": "GE 108 - Ethics",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n7",
                "title_and_code": "PROF COR FM 121 - Financial Management",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n8",
                "title_and_code": "FM ELEC 131 - Personal Finance",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n9",
                "title_and_code": "BUS CORE 111 - Basic Microeconomics",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n10",
                "title_and_code": "BUS CORE 112 - Business Law (Obligation And Contracts)",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n11",
                "title_and_code": "PATHFIT 1 - Physical Fitness",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n12",
                "title_and_code": "PATHFIT 2 - Rhythmic Activities",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n13",
                "title_and_code": "NSTP 1 - National Service Training Program 1",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n14",
                "title_and_code": "NSTP 2 - National Service Training Program 2",
                "course": "BSBA-FM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n15",
                "title_and_code": "GE 106 - Science, Technology, and Society",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n16",
                "title_and_code": "GE 109 - Readings On Philippine History",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n17",
                "title_and_code": "GE 107 - The Contemporary World",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n18",
                "title_and_code": "GE 110 - Art Appreciation",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n19",
                "title_and_code": "GE EL 103 - Indigenous Creative Arts",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n20",
                "title_and_code": "BUSCORE 114 - Income Taxation",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n21",
                "title_and_code": "PROF COR FM 122 - Banking And Financial Institution",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n22",
                "title_and_code": "PROF COR FM 123 - Investment And Portfolio Management",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n23",
                "title_and_code": "BME 141 - Operations Management (Tqm)",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n24",
                "title_and_code": "PROF COR FM 124 - Capital Market",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n25",
                "title_and_code": "BUS CORE 113 - Good Governance And Social Responsibility",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n26",
                "title_and_code": "BME 142 - Strategic Management",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n27",
                "title_and_code": "PATHFIT 3 - Dual Sports And Games",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n28",
                "title_and_code": "PATHFIT 4 - Team Sports And Games",
                "course": "BSBA-FM",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n29",
                "title_and_code": "GE 111 - STATISTICS",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n30",
                "title_and_code": "PROF COR FM 127 - MONETARY POLICY AND CENTRAL BANKING",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n31",
                "title_and_code": "RZL - LIFE AND WORKS OF RIZAL",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n32",
                "title_and_code": "PROF COR FM 128 - SPECIAL TOPICS IN FINANCIAL MANGEMENT",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n33",
                "title_and_code": "BUS CORE 115 - HUMAN RESOURCE MANAGEMENT",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n34",
                "title_and_code": "FM ELEC 132 - BEHAVIORAL FINANCE",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n35",
                "title_and_code": "BUS CORE 116 - BUSINESS RESEARCH",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n36",
                "title_and_code": "FM ELEC 133 - TREASURY MANAGEMENT",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n37",
                "title_and_code": "PROF COR FM 125 - FINANCIAL ANALYSIS AND REPORTING",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n38",
                "title_and_code": "FM ELEC 134 - MUTUAL FUND",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n39",
                "title_and_code": "PROF COR FM 126 - CREDIT AND COLLECTION",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n40",
                "title_and_code": "THESIS 1 - RESEARCH 1",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n41",
                "title_and_code": "COMP 104 - INTRODUCTION  TO COMPUTING",
                "course": "BSBA-FM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n42",
                "title_and_code": "BUS CORE 117 - INTERNATIONAL BUSINESS AND TRADE",
                "course": "BSBA-FM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n43",
                "title_and_code": "INT - INTERNSHIP",
                "course": "BSBA-FM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n44",
                "title_and_code": "FM ELEC 135 - ENTREPRENEURIAL MANAGEMENT",
                "course": "BSBA-FM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n45",
                "title_and_code": "FM ELEC 136 - RISK MANAGEMENT",
                "course": "BSBA-FM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_fm_n46",
                "title_and_code": "THESIS 2 - RESEARCH 2",
                "course": "BSBA-FM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n1",
                "title_and_code": "GE 101 - Understanding The Self",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n2",
                "title_and_code": "GE 103 - Mathematics In Modern World",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n3",
                "title_and_code": "GE EL 101 - Entrepreneurial Mind",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n4",
                "title_and_code": "GE 104 - Purposive Communication",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n5",
                "title_and_code": "MGT 1 - Human Resource Management",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n6",
                "title_and_code": "GE 108 - Ethics",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n7",
                "title_and_code": "GE EL 102 - Philippine Literature",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n8",
                "title_and_code": "BUSCORE 112 - Business Law (Obligation And Contract)",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n9",
                "title_and_code": "BUS CORE 111 - Basic Microeconomics",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n10",
                "title_and_code": "HRM ELEC 1 - Personal Finance",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n11",
                "title_and_code": "PATHFIT 1 - Physical Fitness",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n12",
                "title_and_code": "PATHFIT 2 - Rhytmic Activities",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n13",
                "title_and_code": "NSTP 1 - National Service Training Program 1",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n14",
                "title_and_code": "NSTP 2 - National Service Training Program 2",
                "course": "BSBA-HRDM",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n15",
                "title_and_code": "GE 106 - Science, Technology, and Society",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n16",
                "title_and_code": "GE 109 - Readings On Philippine History",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n17",
                "title_and_code": "GE 107 - The Contemporary World",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n18",
                "title_and_code": "GE 110 - Art Appreciation",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n19",
                "title_and_code": "HRM 1 - Administrative And Office  Management",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n20",
                "title_and_code": "BUS CORE 114 - Income Taxation",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n21",
                "title_and_code": "HRM 2 - Labor Law And Legislation",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n22",
                "title_and_code": "COMP 102 - Advance Computer",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n23",
                "title_and_code": "BUS CORE 113 - Good Governance And Social Responsibility",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n24",
                "title_and_code": "HRM 3 - Recruitment And Selection",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n25",
                "title_and_code": "BME 141 - Operations Management",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n26",
                "title_and_code": "BME 142 - Strategic  Management",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n27",
                "title_and_code": "PATHFIT 3 - Dual Sports And Games",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n28",
                "title_and_code": "PATHFIT 4 - Team Sports And Games",
                "course": "BSBA-HRDM",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n29",
                "title_and_code": "GE 111 - Statistics",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n30",
                "title_and_code": "ENG 2 - Business English And Correspondence",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n31",
                "title_and_code": "RZL - Life And Works Of Rizal",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n32",
                "title_and_code": "HRM ELEC 3 - Project Management",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n33",
                "title_and_code": "GE EL 104 - Environmental Science",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n34",
                "title_and_code": "HRM 5 - Compensation And Administration",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n35",
                "title_and_code": "HRM ELEC 2 - Marketing Management",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n36",
                "title_and_code": "HRM 6 - Labor Relations And Negotiations",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n37",
                "title_and_code": "HRM 4 - Training And Development",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n38",
                "title_and_code": "HRM  7 - Special Topics In HRDM",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n39",
                "title_and_code": "BUS CORE 116 - Business Research",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n40",
                "title_and_code": "THESIS 1 - Thesis Writing 1",
                "course": "BSBA-HRDM",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n41",
                "title_and_code": "HRM 8 - Organizational Development",
                "course": "BSBA-HRDM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n42",
                "title_and_code": "INT - INTERNSHIP",
                "course": "BSBA-HRDM",
                "year_level": 4,
                "semester": 2,
                "units": 6,
                "lec_hours": 6,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n43",
                "title_and_code": "600hrs - NONE",
                "course": "BSBA-HRDM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n44",
                "title_and_code": "BUS CORE 117 - International Business and Trade",
                "course": "BSBA-HRDM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n45",
                "title_and_code": "HRM ELEC 4 - Entrepreneurial Management",
                "course": "BSBA-HRDM",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsba_hrdm_n46",
                "title_and_code": "THESIS 2 - Thesis Writing 2",
                "course": "BSBA-HRDM",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n1",
                "title_and_code": "GE 101 - Understanding The Self",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n2",
                "title_and_code": "GE 103 - Mathematics in the Modern World",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n3",
                "title_and_code": "VED - Good Manners And Right Conduct",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n4",
                "title_and_code": "GE 104 - Purposive Communication",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n5",
                "title_and_code": "GE EL 102 - Philippine Literature",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n6",
                "title_and_code": "GE 105 - Pagbasa At Pagsulat Sa Ibat-Ibang Disiplina",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n7",
                "title_and_code": "MATH 1 - Teaching Math In The Primary Grades",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n8",
                "title_and_code": "SCI 1 - Teaching Science In The Elementary Grades (Biology And Chemistry)",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n9",
                "title_and_code": "COMP 101 - Computer 1",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n10",
                "title_and_code": "MATH 2 - Teaching Math In The Intermediate Grades",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n11",
                "title_and_code": "PATHFIT 1 - Physical Fitness",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n12",
                "title_and_code": "PATHFIT 2 - Rhythmic Activities",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n13",
                "title_and_code": "NSTP 1 - National Service Training Program 1",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n14",
                "title_and_code": "NSTP 2 - National Service Training Program 2",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n15",
                "title_and_code": "PROF ED 1 - The Child And Adolescent Learners And Learning Principles",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n16",
                "title_and_code": "PROF ED 2 - The Teaching Profession",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n17",
                "title_and_code": "ENG 1 - Teaching English In The Elementary Grades (Language Arts)",
                "course": "BEED",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n18",
                "title_and_code": "MUSIC - Teaching Music In The Elementary Grades",
                "course": "BEED",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n19",
                "title_and_code": "GE 106 - Science, Technology And Society",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n20",
                "title_and_code": "GE 108 - Ethics",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n21",
                "title_and_code": "GE 107 - The Contemporary World",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n22",
                "title_and_code": "GE 109 - Readings On Philippine History",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n23",
                "title_and_code": "PROF ED 4 - Foundation Of Special And Inclusive Education",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n24",
                "title_and_code": "GE 110 - Art Appreciation",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n25",
                "title_and_code": "RZL - Life And Works Of Rizal",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n26",
                "title_and_code": "PATHFIT 4 - Team Sports And Games",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n27",
                "title_and_code": "PATHFIT 3 - Dual Sports And Games",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n28",
                "title_and_code": "PROF ED 5 - Facilitating Learner-Centered Teaching",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n29",
                "title_and_code": "PROF ED 3 - The Teacher And The Community, School Culture And Organizational Leadership",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n30",
                "title_and_code": "PROF ED 6 - Assessment In Learning 1",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n31",
                "title_and_code": "ENG 2 - Teaching English In The Elementary Grades Through Literature",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n32",
                "title_and_code": "TTL - Technology For Teaching And Elementary Grades",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n33",
                "title_and_code": "FIL - Pagtuturo Ng Filipino Sa Elementarya - Estraktura At Gamit Ng Wikang Filipino",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n34",
                "title_and_code": "MTB-MLE - Content And Pedagogy In The Mother Tongue",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n35",
                "title_and_code": "SCI 2 - Teaching Science In The Elementary Grades (Physics, Space And Earth Science)",
                "course": "BEED",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n36",
                "title_and_code": "FIL - Pagtuturo And Filipino Sa Elementarya - Panitikan Ng Pilipinas",
                "course": "BEED",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n37",
                "title_and_code": "GE  111 - Statistics",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n38",
                "title_and_code": "EHC 1 - Educational Enhancement Course",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n39",
                "title_and_code": "EDUC RES 1 - Educational Research 1",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n40",
                "title_and_code": "PROF ED 9 - The Teacher And The School Curriculum",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n41",
                "title_and_code": "SSC 1 - Teaching Social Studies In The Elementary Grades (Philippine History And Government)",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n42",
                "title_and_code": "SSC 2 - Teaching Social Studies In The Elementary Grades (Culture And Geography)",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n43",
                "title_and_code": "PROF ED 7 - Assessment In Learning 2",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n44",
                "title_and_code": "PEH - Teaching Pe And Health In The Elementary Grades",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n45",
                "title_and_code": "PROF ED 8 - Technology For Teaching And  Learning",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n46",
                "title_and_code": "TLE - Edukasyong Pantahanan At Pangkabuhayan With Entrepreneurship",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n47",
                "title_and_code": "TLE - Edukasyong Pantahanan At Pangkabuhayan",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n48",
                "title_and_code": "FS - Field Study 2",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n49",
                "title_and_code": "ARTS - Teaching Arts In The Elementary Grades",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n50",
                "title_and_code": "PROF ED 10 - Building And Enhancing New  Literacies Across The Curriculum.",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n51",
                "title_and_code": "FS 1 - Field Study 1",
                "course": "BEED",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n52",
                "title_and_code": "EDUC RES 2 - Educational Research 2",
                "course": "BEED",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n53",
                "title_and_code": "EHC 2 - Educational Enhancement Course 2",
                "course": "BEED",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n54",
                "title_and_code": "PT - Teaching Internship",
                "course": "BEED",
                "year_level": 4,
                "semester": 2,
                "units": 6,
                "lec_hours": 6,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n55",
                "title_and_code": "600hrs - FS 1 and 2",
                "course": "BEED",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "beed_n56",
                "title_and_code": "ED ELEC - Teaching Multigrade Classes",
                "course": "BEED",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n1",
                "title_and_code": "GE 101 - Understanding The Self",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n2",
                "title_and_code": "GE 103 - Mathematics In the Modern World",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n3",
                "title_and_code": "GE EL 101 - Entrepreneurial Mind",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n4",
                "title_and_code": "GE 104 - Purposive Communication",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n5",
                "title_and_code": "TM 1 - Fundamentals Of Customs And Tariff Management",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n6",
                "title_and_code": "COMP 102 - Advance Computer",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 2,
                "lab_hours": 1,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n7",
                "title_and_code": "ELC 1 - Entrepreneurial Management",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n8",
                "title_and_code": "SCM 2 - Warehouse Operations Mgt",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n9",
                "title_and_code": "PATHFIT 1 - Physical Fitness",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n10",
                "title_and_code": "CM 2 - Customs Operations & Cargo Handling",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n11",
                "title_and_code": "SCM 1 - Intro To Supply Chain Mgt",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n12",
                "title_and_code": "PATHFIT 2 - Exercise-Based Fitness Activities",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n13",
                "title_and_code": "CM 1 - Border Control & Security",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n14",
                "title_and_code": "TM 2 - Commodiy Classification System",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n15",
                "title_and_code": "GE EL 102 - Philippine Literature",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n16",
                "title_and_code": "SBEC 1 - Obligation And Contract",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n17",
                "title_and_code": "NSTP 1 - National Service Training Program 1",
                "course": "BSCA",
                "year_level": 1,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n18",
                "title_and_code": "NSTP 2 - National Service Training Program 2",
                "course": "BSCA",
                "year_level": 1,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n19",
                "title_and_code": "GE 106 - Science, Technology, and Society",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n20",
                "title_and_code": "GE 108 - Ethics",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n21",
                "title_and_code": "GE 107 - The Contemporary World",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n22",
                "title_and_code": "GE 109 - Readings On Philippine History",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n23",
                "title_and_code": "SBEC 2 - Taxation (Income and Business Taxation)",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n24",
                "title_and_code": "SCM 4 - Transportation Management",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n25",
                "title_and_code": "GE EL 103 - Indigenous Creative Arts",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n26",
                "title_and_code": "CM 4 - Customs Clearance",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 5,
                "lec_hours": 5,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n27",
                "title_and_code": "SCM 3 - Procurement And Inventory Management",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n28",
                "title_and_code": "CMBE 1 - Operations Management",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n29",
                "title_and_code": "TM 3 - Customs Valuation System",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n30",
                "title_and_code": "TM 4 - Customs Appraisal And Assessment",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n31",
                "title_and_code": "CM 3 - Customs Warehousing",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 5,
                "lec_hours": 5,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n32",
                "title_and_code": "EL 2 - Financial Management",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n33",
                "title_and_code": "PATHFIT 3 - Group Exercise (Aerobics, Yoga, Etc.)",
                "course": "BSCA",
                "year_level": 2,
                "semester": 1,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n34",
                "title_and_code": "PATHFIT 4 - Sports",
                "course": "BSCA",
                "year_level": 2,
                "semester": 2,
                "units": 2,
                "lec_hours": 2,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n35",
                "title_and_code": "GE 111 - Statistics",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n36",
                "title_and_code": "GE 112 - Gender And Society",
                "course": "BSCA",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 0,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n37",
                "title_and_code": "RZL - Life And Works of Rizal",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n38",
                "title_and_code": "CM 6 - Customs Post Clearance Audit and Fraud Detection",
                "course": "BSCA",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n39",
                "title_and_code": "CM 5 - Customs Proceeding",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 5,
                "lec_hours": 5,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n40",
                "title_and_code": "TM6 - Special Duties and Trade Remedies",
                "course": "BSCA",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n41",
                "title_and_code": "TM 5 - Excise Taxes, Liquidation of Duty and Surcharges",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 5,
                "lec_hours": 5,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n42",
                "title_and_code": "TM7 - International Trade Organizations, Agreements, and Rules of Origin",
                "course": "BSCA",
                "year_level": 3,
                "semester": 2,
                "units": 5,
                "lec_hours": 5,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n43",
                "title_and_code": "EL 3 - International Marketing",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n44",
                "title_and_code": "RES 2 - Thesis Writing 2",
                "course": "BSCA",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n45",
                "title_and_code": "CMBE 2 - Strategic Management",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n46",
                "title_and_code": "CM 7 - Ethics And Standards of The Customs Broker",
                "course": "BSCA",
                "year_level": 3,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n47",
                "title_and_code": "RES 1 - Thesis Writing 1",
                "course": "BSCA",
                "year_level": 3,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n48",
                "title_and_code": "INTERN - Internship/Practicum for Customs Administration (600HRS)",
                "course": "BSCA",
                "year_level": 4,
                "semester": 2,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n49",
                "title_and_code": "6(600) - NONE",
                "course": "BSCA",
                "year_level": 4,
                "semester": 1,
                "units": 3,
                "lec_hours": 3,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        },
        {
                "id": "bsca_n50",
                "title_and_code": "TM 8 - Competencies Assessment in Tariff Management",
                "course": "BSCA",
                "year_level": 4,
                "semester": 2,
                "units": 5,
                "lec_hours": 5,
                "lab_hours": 0,
                "is_major": 1,
                "curriculum_type": "new"
        }
],
    "sections": [
        { "id": "sec_bsit_1a", "course": "BSIT", "year_level": 1, "section_name": "1A" },
        { "id": "sec_bsit_1b", "course": "BSIT", "year_level": 1, "section_name": "1B" },
        { "id": "sec_bsit_2a", "course": "BSIT", "year_level": 2, "section_name": "2A" },
        { "id": "sec_bsit_2b", "course": "BSIT", "year_level": 2, "section_name": "2B" },
        { "id": "sec_bsit_3a", "course": "BSIT", "year_level": 3, "section_name": "3A" },
        { "id": "sec_bsit_3b", "course": "BSIT", "year_level": 3, "section_name": "3B" },
        { "id": "sec_bsit_4a", "course": "BSIT", "year_level": 4, "section_name": "4A" },
        { "id": "sec_bsit_4b", "course": "BSIT", "year_level": 4, "section_name": "4B" },
        { "id": "sec_beed_1a", "course": "BEED", "year_level": 1, "section_name": "1A" },
        { "id": "sec_beed_2a", "course": "BEED", "year_level": 2, "section_name": "2A" },
        { "id": "sec_beed_3a", "course": "BEED", "year_level": 3, "section_name": "3A" },
        { "id": "sec_beed_4a", "course": "BEED", "year_level": 4, "section_name": "4A" },
        { "id": "sec_bsed_1a", "course": "BSED", "year_level": 1, "section_name": "1A" },
        { "id": "sec_bsed_2a", "course": "BSED", "year_level": 2, "section_name": "2A" },
        { "id": "sec_bsed_3a", "course": "BSED", "year_level": 3, "section_name": "3A" },
        { "id": "sec_bsed_4a", "course": "BSED", "year_level": 4, "section_name": "4A" },
        { "id": "sec_bsca_1a", "course": "BSCA", "year_level": 1, "section_name": "1A" },
        { "id": "sec_bsca_2a", "course": "BSCA", "year_level": 2, "section_name": "2A" },
        { "id": "sec_bsca_3a", "course": "BSCA", "year_level": 3, "section_name": "3A" },
        { "id": "sec_bsca_4a", "course": "BSCA", "year_level": 4, "section_name": "4A" },
        { "id": "sec_bscrim_1a", "course": "BSCRIM", "year_level": 1, "section_name": "1A" },
        { "id": "sec_bscrim_2a", "course": "BSCRIM", "year_level": 2, "section_name": "2A" },
        { "id": "sec_bscrim_3a", "course": "BSCRIM", "year_level": 3, "section_name": "3A" },
        { "id": "sec_bscrim_4a", "course": "BSCRIM", "year_level": 4, "section_name": "4A" },
        { "id": "sec_bshm_1a", "course": "BSHM", "year_level": 1, "section_name": "1A" },
        { "id": "sec_bshm_2a", "course": "BSHM", "year_level": 2, "section_name": "2A" },
        { "id": "sec_bshm_3a", "course": "BSHM", "year_level": 3, "section_name": "3A" },
        { "id": "sec_bshm_4a", "course": "BSHM", "year_level": 4, "section_name": "4A" },
        { "id": "sec_bsba_fm_1a", "course": "BSBA-FM", "year_level": 1, "section_name": "1A" },
        { "id": "sec_bsba_fm_2a", "course": "BSBA-FM", "year_level": 2, "section_name": "2A" },
        { "id": "sec_bsba_fm_3a", "course": "BSBA-FM", "year_level": 3, "section_name": "3A" },
        { "id": "sec_bsba_fm_4a", "course": "BSBA-FM", "year_level": 4, "section_name": "4A" },
        { "id": "sec_bsba_hrdm_1a", "course": "BSBA-HRDM", "year_level": 1, "section_name": "1A" },
        { "id": "sec_bsba_hrdm_2a", "course": "BSBA-HRDM", "year_level": 2, "section_name": "2A" },
        { "id": "sec_bsba_hrdm_3a", "course": "BSBA-HRDM", "year_level": 3, "section_name": "3A" },
        { "id": "sec_bsba_hrdm_4a", "course": "BSBA-HRDM", "year_level": 4, "section_name": "4A" },
        { "id": "sec_bsba_mm_1a", "course": "BSBA-MM", "year_level": 1, "section_name": "1A" },
        { "id": "sec_bsba_mm_2a", "course": "BSBA-MM", "year_level": 2, "section_name": "2A" },
        { "id": "sec_bsba_mm_3a", "course": "BSBA-MM", "year_level": 3, "section_name": "3A" },
        { "id": "sec_bsba_mm_4a", "course": "BSBA-MM", "year_level": 4, "section_name": "4A" }
    ],
    "schedules": [
        {
            "id": "sch1",
            "instructor_id": "t1",
            "room_id": "r2",
            "day": "W",
            "time_start": "08:00",
            "time_end": "11:00",
            "subject_id": "bsit_n1",
            "course": "BSIT",
            "year_level": 1,
            "block_section": "1A"
        },
        {
            "id": "sch2",
            "instructor_id": "t2",
            "room_id": "r1",
            "day": "M",
            "time_start": "13:00",
            "time_end": "16:00",
            "subject_id": "bsit_n2",
            "course": "BSIT",
            "year_level": 1,
            "block_section": "1A"
        },
        {
            "id": "sch3",
            "instructor_id": "t1",
            "room_id": "r5",
            "day": "F",
            "time_start": "15:00",
            "time_end": "17:00",
            "subject_id": "s3"
        },
        {
            "id": "sch4",
            "instructor_id": "t2",
            "room_id": "r6",
            "day": "TTH",
            "time_start": "08:00",
            "time_end": "09:00",
            "subject_id": "s4"
        },
        {
            "id": "sch5",
            "instructor_id": "t2",
            "room_id": "r7",
            "day": "TTH",
            "time_start": "09:00",
            "time_end": "10:00",
            "subject_id": "s5"
        },
        {
            "id": "sch6",
            "instructor_id": "t2",
            "room_id": "r6",
            "day": "TTH",
            "time_start": "10:00",
            "time_end": "11:00",
            "subject_id": "s6"
        },
        {
            "id": "sch7",
            "instructor_id": "t2",
            "room_id": "r7",
            "day": "TTH",
            "time_start": "11:00",
            "time_end": "12:00",
            "subject_id": "s7"
        },
        {
            "id": "sch8",
            "instructor_id": "t2",
            "room_id": "r1",
            "day": "M",
            "time_start": "09:00",
            "time_end": "10:00",
            "subject_id": "s8"
        }
    ]
};

// MySQL API Endpoint configuration
const API_URL = "api.php";

// Helper to determine max units by designation as specified in prompt
function getMaxUnitsForDesignation(designation) {
  switch (designation) {
    case 'Licensed Teacher': return 27;
    case 'Regular Teacher': return 24;
    case 'Part-time':
    case 'Part-time Teacher': return 12;
    case 'Admin': return 9;
    case 'Director': return 15;
    case 'Program Head': return 18;
    default: return 24;
  }
}

// Helper to calculate total teaching load units for a teacher
function calculateTeacherTotalUnits(teacherId) {
  let totalUnits = 0;
  const teacherSchedules = db.schedules.filter(s => s.instructor_id === teacherId);
  const matchedSubjectIds = new Set();
  
  teacherSchedules.forEach(sch => {
    const sub = db.subjects.find(s => s.id === sch.subject_id);
    if (sub && !matchedSubjectIds.has(sub.id)) {
      totalUnits += sub.units;
      matchedSubjectIds.add(sub.id);
    }
  });
  return totalUnits;
}

// Load DB from MySQL with LocalStorage fallback
async function loadDatabase() {
  let loadedSuccessfully = false;
  try {
    const response = await fetch(`${API_URL}?action=get_all`);
    const result = await response.json();
    if (result && result.status === 'success' && result.subjects && result.subjects.length > 0) {
      db.instructors = (result.instructors || []).map(i => ({
        ...i,
        max_units: parseInt(i.max_units, 10)
      }));
      db.rooms = result.rooms || [];
      db.sections = (result.sections || []).map(sec => ({
        ...sec,
        year_level: parseInt(sec.year_level, 10)
      }));
      db.subjects = (result.subjects || []).map(s => ({
        ...s,
        year_level: parseInt(s.year_level, 10),
        units: parseInt(s.units, 10),
        lec_hours: parseInt(s.lec_hours, 10),
        lab_hours: parseInt(s.lab_hours, 10),
        is_major: parseInt(s.is_major || 0, 10)
      }));
      db.schedules = result.schedules || [];
      
      localStorage.setItem('sibt_scheduling_db', JSON.stringify(db));
      console.log("Database successfully synced with XAMPP MySQL backend.");
      loadedSuccessfully = true;
    }
  } catch (e) {
    console.warn("Could not sync with MySQL database. Trying local storage fallback.", e);
  }

  if (!loadedSuccessfully) {
    // Offline local storage fallback
    const saved = localStorage.getItem('sibt_scheduling_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.subjects && parsed.subjects.length > 0) {
          db = parsed;
          db.instructors = (db.instructors || []).map(i => ({ ...i, max_units: parseInt(i.max_units, 10) }));
          db.sections = (db.sections || demoData.sections || []).map(sec => ({
            ...sec,
            year_level: parseInt(sec.year_level, 10)
          }));
          db.subjects = (db.subjects || []).map(s => ({
            ...s,
            year_level: parseInt(s.year_level, 10),
            units: parseInt(s.units, 10),
            lec_hours: parseInt(s.lec_hours, 10),
            lab_hours: parseInt(s.lab_hours, 10),
            is_major: parseInt(s.is_major || 0, 10)
          }));
          loadedSuccessfully = true;
        }
      } catch (parseErr) {
        console.warn("Error parsing local storage DB:", parseErr);
      }
    }
  }

  // Ensure db.sections is initialized
  if (!db.sections || db.sections.length === 0) {
    db.sections = JSON.parse(JSON.stringify(demoData.sections || []));
  }

  // Final fallback: Seed demoData if still empty
  if (!db.subjects || db.subjects.length === 0) {
    db = JSON.parse(JSON.stringify(demoData));
    localStorage.setItem('sibt_scheduling_db', JSON.stringify(db));
  }

  updateStats();
  renderAllViews();
}

// Save Full Database state to MySQL with LocalStorage fallback
async function saveDatabase() {
  // Sync to Local Storage first
  localStorage.setItem('sibt_scheduling_db', JSON.stringify(db));
  
  try {
    const response = await fetch(`${API_URL}?action=save_database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(db)
    });
    const result = await response.json();
    if (result && result.status === 'success') {
      console.log("XAMPP MySQL database update persisted.");
    } else {
      throw new Error(result.message || "MySQL persist failed");
    }
  } catch (e) {
    console.warn("Could not sync data update to MySQL database server:", e);
  }

  updateStats();
  renderAllViews();
}

function resetToDemoData() {
  db = JSON.parse(JSON.stringify(demoData)); // Deep clone demo data
  saveDatabase();
  showToast("Database reset to SIBT demo data successfully!", "success");
}

// Real-time conflict checks and helper function for time overlap
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hrs, mins] = timeStr.split(':').map(Number);
  return hrs * 60 + mins;
}

// Get constituent single days from a composite day code
function getConstituentDays(dayStr) {
  if (!dayStr) return [];
  if (dayStr === 'MT') return ['M', 'T'];
  if (dayStr === 'MW') return ['M', 'W'];
  if (dayStr === 'MF') return ['M', 'F'];
  if (dayStr === 'TF') return ['T', 'F'];
  if (dayStr === 'WF') return ['W', 'F'];
  if (dayStr === 'TTH') return ['T', 'TH'];
  if (dayStr === 'MWF') return ['M', 'W', 'F'];
  if (dayStr === 'Monday-Friday') return ['M', 'T', 'W', 'TH', 'F'];
  return [dayStr]; // e.g. M, T, W, TH, F, S
}

// Day Overlap check via set intersection of constituent days
function daysOverlap(day1, day2) {
  if (!day1 || !day2) return false;
  if (day1 === day2) return true;
  const days1 = getConstituentDays(day1);
  const days2 = getConstituentDays(day2);
  return days1.some(d => days2.includes(d));
}

// Check if a room name is designated for high school (205-208, or HS101-HS110)
function isHighSchoolRoom(roomName) {
  if (!roomName) return false;
  const normalized = roomName.toUpperCase().replace(/\s+|-/g, ''); // normalize "HS-101" to "HS101", etc.
  
  // check for numeric 205 to 208
  if (/^\d+$/.test(normalized)) {
    const val = parseInt(normalized, 10);
    if (val >= 205 && val <= 208) return true;
  }
  
  // check for HS101 to HS110
  const hsMatch = normalized.match(/^HS(\d+)$/);
  if (hsMatch) {
    const val = parseInt(hsMatch[1], 10);
    if (val >= 101 && val <= 110) return true;
  }
  
  return false;
}

// Check if room name is one of the special rooms (Library 1, Library 2, TBL room)
function isSpecialRoom(roomName) {
  if (!roomName) return false;
  const normalized = roomName.toUpperCase().replace(/\s+|-/g, '');
  return (normalized === 'LIBRARY1' || normalized === 'LIBRARY2' || normalized === 'TBLROOM');
}

// Check if subject is computer/IT related (STRICTLY for COMLAB assignment)
function isComputerSubject(subject) {
  if (!subject) return false;
  const code = (subject.code || subject.title_and_code || '').toUpperCase();
  const title = (subject.descriptive_title || subject.title_and_code || '').toUpperCase();
  const course = (subject.course || '').toUpperCase();

  const normalizeStr = str => str.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const targetTitles = [
    'COMPUTER PROGRAMMING 1',
    'COMPUTER PROGRAMMING 1',
    'INFORMATION TECHNOLOGY FUNDAMENTALS',
    'IT FUNDAMENTALS',
    'COMPUTER PROGRAMMING 2',
    'OBJECT ORIENTED PROGRAMMING',
    'OBJECT-ORIENTED PROGRAMMING',
    'FUNDAMENTALS OF DATABASE SYSTEM',
    'FUNDAMENTALS OF DATABASE SYSTEMS',
    'EVENT DRIVEN PROGRAMMING',
    'DATA STRUCTURES AND ALGORITHM',
    'DATA STRUCTURES AND ALGORITHMS',
    'INFORMATION MANAGEMENT',
    'INFO ASSURANCE AND SECURITY 1',
    'INFORMATION ASSURANCE AND SECURITY 1',
    'APP DEV & EMERGING TECHNOLOGIES',
    'APP DEV. & EMERGING TECHNOLOGIES',
    'APPLICATION DEVELOPMENT AND EMERGING TECHNOLOGY',
    'NETWORKING 1',
    'INTRO TO HUMAN-COMPUTER INTERACTION',
    'INTRODUCTION TO HUMAN AND COMPUTER INTERACTION',
    'SYSTEM ADMIN & MAINTENANCE',
    'SYSTEM ADMINISTRATION AND MAINTENANCE',
    'WEB SYSTEMS AND TECHNOLOGY',
    'INTEGRATIVE PROGRAMMING & TECHNOLOGIES',
    'INTEGRATIVE PROGRAMMING AND TECHNOLOGY',
    'NETWORKING 2',
    'INFO ASSURANCE AND SECURITY 2',
    'INFORMATION ASSURANCE AND SECURITY 2',
    'SYSTEM INTEGRATION AND ARCHITECTURE 1',
    'SYSTEM INTEGRATION AND ARCHITECTURE 2',
    'PLATFORM TECHNOLOGIES',
    'PLATFORM TECHNOLOGY',
    'MULTIMEDIA AND ANIMATION',
    'HUMAN-COMPUTER INTERACTION 2',
    'HUMAN COMPUTER INTERACTION 2',
    'ADVANCE COMPUTER',
    'COMPUTER 1'
  ];

  const normTitle = normalizeStr(title);
  const normCode = normalizeStr(code);

  if (targetTitles.some(t => normTitle.includes(normalizeStr(t)) || normCode.includes(normalizeStr(t)))) return true;

  if (course === 'BSIT' && (subject.lab_hours > 0 || normCode.startsWith('CC') || normCode.startsWith('PF') || normCode.startsWith('IM') || normCode.startsWith('NET') || normCode.startsWith('IAS') || normCode.startsWith('SIA') || normCode.startsWith('WS') || normCode.startsWith('IPT') || normCode.startsWith('HCI') || normCode.startsWith('SA') || normCode.startsWith('PT') || normCode.startsWith('IT'))) {
    return true;
  }

  return false;
}

// Check if subject is criminology lab or special lab related (STRICTLY for CRIMLAB assignment)
function isCriminologySubject(subject) {
  if (!subject) return false;
  const code = (subject.code || subject.title_and_code || '').toUpperCase();
  const title = (subject.descriptive_title || subject.title_and_code || '').toUpperCase();
  const course = (subject.course || '').toUpperCase();

  const normalizeStr = str => str.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const exactCrimLabCodes = [
    'HPC 121', 'HMPE 131', 'HMPE 132', 'HMPE 3', 'HPC 124',
    'HMPE 134', 'HMPE 135', 'HPC 126', 'HPC 127'
  ];

  const normCode = normalizeStr(code);
  const normTitle = normalizeStr(title);

  if (exactCrimLabCodes.some(c => normCode.includes(normalizeStr(c)) || normTitle.includes(normalizeStr(c)))) return true;

  if (course === 'BSCRIM' && (subject.lab_hours > 0 || normCode.startsWith('FORENSIC'))) return true;

  return false;
}

// Get prioritized and filtered room list for scheduling
function getPrioritizedRooms(subject, roomsList) {
  const rooms = [...roomsList];
  const isComp = isComputerSubject(subject);
  const isCrim = isCriminologySubject(subject);

  return rooms.filter(r => {
    const rName = (r.name || '').toUpperCase();
    const isComLab = rName.includes('COMLAB');
    const isCrimLab = rName.includes('CRIMLAB');

    // COMLAB is strictly reserved for Computer subjects
    if (isComLab && !isComp) return false;

    // CRIMLAB is strictly reserved for Criminology subjects
    if (isCrimLab && !isCrim) return false;

    return true;
  }).sort((a, b) => {
    const aName = (a.name || '').toUpperCase();
    const bName = (b.name || '').toUpperCase();

    const aIsComLab = aName.includes('COMLAB');
    const bIsComLab = bName.includes('COMLAB');
    const aIsCrimLab = aName.includes('CRIMLAB');
    const bIsCrimLab = bName.includes('CRIMLAB');
    const aIsSpecial = isSpecialRoom(a.name);
    const bIsSpecial = isSpecialRoom(b.name);

    if (isComp) {
      if (aIsComLab && !bIsComLab) return -1;
      if (!aIsComLab && bIsComLab) return 1;
    }

    if (isCrim) {
      if (aIsCrimLab && !bIsCrimLab) return -1;
      if (!aIsCrimLab && bIsCrimLab) return 1;
    }

    // Special rooms (Library 1, Library 2, TBL Room) are LAST RESORT only
    if (aIsSpecial && !bIsSpecial) return 1;
    if (!aIsSpecial && bIsSpecial) return -1;

    return 0;
  });
}

// Check if the scheduled times are allowed for High School rooms based on the day
function isHighSchoolRoomTimeAllowed(day, startStr, endStr) {
  const constituents = getConstituentDays(day);
  const startMins = parseTimeToMinutes(startStr);
  const endMins = parseTimeToMinutes(endStr);
  
  for (let d of constituents) {
    let allowedStart = null;
    let allowedEnd = null;
    
    if (d === 'M' || d === 'T' || d === 'W') {
      allowedStart = parseTimeToMinutes("16:00"); // 4:00 PM
      allowedEnd = parseTimeToMinutes("19:00");   // 7:00 PM
    } else if (d === 'TH') {
      allowedStart = parseTimeToMinutes("17:00"); // 5:00 PM
      allowedEnd = parseTimeToMinutes("19:00");   // 7:00 PM
    } else if (d === 'F' || d === 'S') {
      allowedStart = parseTimeToMinutes("07:00"); // 7:00 AM
      allowedEnd = parseTimeToMinutes("19:00");   // 7:00 PM
    } else {
      // Sunday is not permitted
      return false;
    }
    
    if (startMins < allowedStart || endMins > allowedEnd) {
      return false;
    }
  }
  return true;
}

// Fully customizable time overlap checker
function timesOverlap(start1, end1, start2, end2) {
  const s1 = parseTimeToMinutes(start1);
  const e1 = parseTimeToMinutes(end1);
  const s2 = parseTimeToMinutes(start2);
  const e2 = parseTimeToMinutes(end2);
  return (s1 < e2 && s2 < e1);
}

// Function to validate a proposed schedule against all rules
function validateSchedule(candidate) {
  const errors = [];
  const warnings = [];

  const teacher = db.instructors.find(t => t.id === candidate.instructor_id);
  const subject = db.subjects.find(s => s.id === candidate.subject_id);
  const room = db.rooms.find(r => r.id === candidate.room_id);

  // 1. Load limit rule
  if (teacher && subject) {
    const currentUnits = calculateTeacherTotalUnits(candidate.instructor_id);
    const isNewSubject = !db.schedules.some(s => s.instructor_id === candidate.instructor_id && s.subject_id === candidate.subject_id && s.id !== candidate.id);
    
    const candidateUnits = isNewSubject ? currentUnits + subject.units : currentUnits;
    const baseLimit = teacher.max_units;
    const hardLimit = baseLimit + 2;

    if (candidateUnits > hardLimit) {
      errors.push(`Teacher Load Limit Exceeded: ${teacher.name} would have ${candidateUnits} units. The absolute maximum limit including +2 grace is ${hardLimit} units (Base: ${baseLimit} units for Designation: ${teacher.designation}).`);
    } else if (candidateUnits > baseLimit) {
      warnings.push(`Load Limit Grace Note: ${teacher.name} exceeds base limit of ${baseLimit} units, but is within the +2 grace allowance (${candidateUnits}/${hardLimit} units).`);
    }
  }

  // 2. High School Room availability constraints
  if (room && isHighSchoolRoom(room.name)) {
    if (!isHighSchoolRoomTimeAllowed(candidate.day, candidate.time_start, candidate.time_end)) {
      errors.push(`Room Constraint: High School Room ${room.name} is only available Mon-Wed 4PM-7PM (16:00-19:00), Thu 5PM-7PM (17:00-19:00), and Fri-Sat 7AM-7PM (07:00-19:00).`);
    }
  }

  // 3. Program Head scheduling constraints
  if (teacher && teacher.designation === 'Program Head') {
    const constituents = getConstituentDays(candidate.day);
    if (constituents.includes('S')) {
      errors.push(`Program Head Constraint: ${teacher.name} is a Program Head and cannot be scheduled on Saturday.`);
    }
    if (timesOverlap(candidate.time_start, candidate.time_end, "12:00", "13:00")) {
      errors.push(`Program Head Constraint: ${teacher.name} (Program Head) cannot have schedules during the 12:00 PM - 1:00 PM lunch period.`);
    }
    if (timesOverlap(candidate.time_start, candidate.time_end, "16:00", "19:00")) {
      errors.push(`Program Head Constraint: ${teacher.name} (Program Head) cannot have schedules during late hours (4:00 PM - 7:00 PM).`);
    }
  }

  // Check all other existing schedules
  db.schedules.forEach(existing => {
    // Skip checking self when editing
    if (existing.id === candidate.id) return;

    // Check if on overlapping days
    if (daysOverlap(existing.day, candidate.day)) {
      // Check if time blocks overlap
      if (timesOverlap(existing.time_start, existing.time_end, candidate.time_start, candidate.time_end)) {
        
        // Conflict 1: Instructor Double Booking
        if (existing.instructor_id === candidate.instructor_id) {
          const t = db.instructors.find(i => i.id === candidate.instructor_id);
          const teacherName = t ? t.name : 'Teacher';
          errors.push(`Teacher Conflict: ${teacherName} is already scheduled on ${existing.day} at ${existing.time_start} - ${existing.time_end}.`);
        }

        // Conflict 2: Room Double Booking
        if (existing.room_id === candidate.room_id) {
          const r = db.rooms.find(rm => rm.id === candidate.room_id);
          const roomName = r ? r.name : 'Room';
          errors.push(`Room Conflict: ${roomName} is already occupied on ${existing.day} at ${existing.time_start} - ${existing.time_end}.`);
        }

        // Conflict 3: Section/Block Student Overlap
        if (subject) {
          const existingSubject = db.subjects.find(s => s.id === existing.subject_id);
          if (existingSubject && 
              existingSubject.course === subject.course && 
              existingSubject.year_level === subject.year_level && 
              (existingSubject.block_section || '') === (subject.block_section || '')) {
            errors.push(`Section/Block Conflict: Section ${subject.course} ${subject.year_level}${subject.block_section} already has a class on ${existing.day} at ${existing.time_start} - ${existing.time_end}.`);
          }
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Auto calculation of time end based on start time & duration choice
function calculateTimeEnd() {
  const startVal = document.getElementById('input-time-start').value;
  const durationVal = parseFloat(document.getElementById('input-duration').value) || 2;
  
  if (!startVal) return;

  const [hrs, mins] = startVal.split(':').map(Number);
  let totalMins = hrs * 60 + mins + (durationVal * 60);
  
  const endHrs = Math.floor(totalMins / 60) % 24;
  const endMins = Math.round(totalMins % 60);
  
  const pad = (n) => String(n).padStart(2, '0');
  document.getElementById('input-time-end').value = `${pad(endHrs)}:${pad(endMins)}`;
  checkRealtimeConflict();
}

// Fill forms correctly on subject select (decoupled unique subject title selection)
function autofillSubjectDetails() {
  const subTitle = document.getElementById('input-subject').value;
  const blockSel = document.getElementById('input-block');
  if (!blockSel) return;

  if (!subTitle) {
    blockSel.innerHTML = '<option value="">Select Block...</option>';
    blockSel.disabled = true;
    document.getElementById('input-course').value = '';
    document.getElementById('input-year').value = '';
    document.getElementById('input-lec-hours').value = '2';
    document.getElementById('input-lab-hours').value = '0';
    document.getElementById('input-units').value = '3';
    return;
  }

  // Find all matching subjects for this unique title
  const matchingSubjects = db.subjects.filter(s => s.title_and_code === subTitle);
  blockSel.innerHTML = '<option value="">Select Block...</option>';
  matchingSubjects.forEach(sub => {
    blockSel.innerHTML += `<option value="${sub.id}">${sub.course} Year ${sub.year_level} - ${sub.title_and_code}</option>`;
  });
  blockSel.disabled = false;

  // Clear detail inputs until a block is selected
  document.getElementById('input-course').value = '';
  document.getElementById('input-year').value = '';
  document.getElementById('input-lec-hours').value = '';
  document.getElementById('input-lab-hours').value = '';
  document.getElementById('input-units').value = '';
}

// Dynamically handle block selection change
function onBlockSelectChange() {
  const subId = document.getElementById('input-block').value;
  if (!subId) return;

  const sub = db.subjects.find(s => s.id === subId);
  if (sub) {
    document.getElementById('input-course').value = sub.course;
    document.getElementById('input-year').value = sub.year_level;
    document.getElementById('input-lec-hours').value = sub.lec_hours;
    document.getElementById('input-lab-hours').value = sub.lab_hours;
    document.getElementById('input-units').value = sub.units;

    // Smart autofill room and duration based on class details
    if (sub.lab_hours > 0) {
      // Prefer laboratory room
      const labRoom = db.rooms.find(r => r.room_type === 'Laboratory');
      if (labRoom) {
        document.getElementById('input-room').value = labRoom.id;
      }
      document.getElementById('input-duration').value = "3"; // Labs are usually 3 hours
    } else {
      const lecRoom = db.rooms.find(r => r.room_type === 'Lecture' || r.room_type === 'Both');
      if (lecRoom) {
        document.getElementById('input-room').value = lecRoom.id;
      }
      document.getElementById('input-duration').value = "2"; // standard lecture duration
    }
    calculateTimeEnd();
  }
}

// Monitor the scheduling form inputs in real time for instant error warnings
function checkRealtimeConflict() {
  const formElement = document.getElementById('scheduleForm');
  if (!formElement) return;

  const teacherId = document.getElementById('input-teacher').value;
  const roomId = document.getElementById('input-room').value;
  const day = document.getElementById('input-day').value;
  const timeStart = document.getElementById('input-time-start').value;
  const timeEnd = document.getElementById('input-time-end').value;
  const subjectId = document.getElementById('input-block').value; // Using input-block value as subjectId
  const editId = document.getElementById('edit-id').value;

  const monitor = document.getElementById('realtimeConflictCheck');
  if (!monitor) return;

  if (!teacherId || !roomId || !day || !timeStart || !timeEnd || !subjectId) {
    monitor.innerHTML = `
      <div class="text-center py-4">
        <i class="bi bi-info-circle-fill text-muted display-4 d-block mb-3"></i>
        <h6 class="fw-bold text-muted">Awaiting Form Details</h6>
        <p class="text-muted small">Select a teacher, room, day, and time to perform real-time scheduling validation rules.</p>
      </div>
    `;
    return;
  }

  const candidate = {
    id: editId || 'candidate_temp_id',
    instructor_id: teacherId,
    room_id: roomId,
    day,
    time_start: timeStart,
    time_end: timeEnd,
    subject_id: subjectId
  };

  const validation = validateSchedule(candidate);
  
  if (validation.valid) {
    monitor.innerHTML = `
      <div class="card border-0 bg-success bg-opacity-10 text-success p-3 rounded-3 text-center">
        <i class="bi bi-shield-check-fill display-4 d-block mb-2 text-success"></i>
        <h6 class="fw-bold text-success mb-1">Schedule Validated & Safe!</h6>
        <p class="small mb-0 text-muted">No collisions detected for Teacher, Room, Section or total unit loading rules.</p>
      </div>
    `;
    document.getElementById('saveScheduleBtn').disabled = false;
  } else {
    let errItems = validation.errors.map(err => `<li class="mb-1 text-danger small">${err}</li>`).join('');
    monitor.innerHTML = `
      <div class="card border-0 conflict-card p-3 rounded-3">
        <i class="bi bi-exclamation-triangle-fill display-4 d-block mb-2 text-danger text-center"></i>
        <h6 class="fw-bold text-danger mb-2 text-center">Conflict Warning Detected!</h6>
        <ul class="ps-3 text-start mb-0">
          ${errItems}
        </ul>
        <div class="alert alert-danger mt-3 mb-0 py-1 px-2 text-center" style="font-size: 0.75rem;">
          <i class="bi bi-lock-fill"></i> Save is locked until conflicts are resolved.
        </div>
      </div>
    `;
    document.getElementById('saveScheduleBtn').disabled = true;
  }
}

// Tab Switching Routing Function
function switchTab(tabName) {
  const pageMap = {
    'board': 'board.html',
    'manual': 'input.html',
    'input': 'input.html',
    'auto': 'auto.html',
    'manage': 'manage.html',
    'print': 'print.html'
  };

  const panel = document.getElementById(`panel-${tabName}`);
  if (!panel && pageMap[tabName]) {
    window.location.href = pageMap[tabName];
    return;
  }

  // Hide all panels
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.classList.add('d-none');
  });
  // Un-active all nav items
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // Show active panel
  if (panel) panel.classList.remove('d-none');

  // Highlight active link
  const link = document.getElementById(`tab-${tabName}`);
  if (link) link.classList.add('active');

  // Render sub-views depending on tab
  if (tabName === 'print') {
    populatePrintTeachers();
    renderOfficialPrintout();
  } else if (tabName === 'manual' || tabName === 'input') {
    populateFormSelects();
    checkRealtimeConflict();
  }
}

// Switch between settings manage tables
function switchManageSubTab(subTab, el) {
  document.querySelectorAll('.manage-panel').forEach(panel => {
    panel.classList.add('d-none');
  });
  const subPanel = document.getElementById(`manage-${subTab}`);
  if (subPanel) subPanel.classList.remove('d-none');

  document.querySelectorAll('#manageSubTabs .list-group-item').forEach(btn => {
    btn.classList.remove('active');
  });
  if (el) {
    el.classList.add('active');
  } else if (window.event && window.event.target) {
    const target = window.event.target.closest('.list-group-item');
    if (target) target.classList.add('active');
  }

  if (subTab === 'teachers') {
    renderInstructorsTable();
  } else if (subTab === 'subjects') {
    renderSubjectsTable();
  } else if (subTab === 'rooms') {
    renderRoomsTable();
  } else if (subTab === 'sections') {
    renderSectionsTable();
  }
}

// Generate unique ID
function uniqueId() {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}

// GLOBAL ALERTS & TOAST NOTIFICATIONS
function showGlobalAlert(title, message, type = "success") {
  const container = document.getElementById('globalAlerts');
  if (!container) return;

  const alertId = 'alert_' + Date.now();
  const alertBg = type === 'success' ? 'alert-success' : (type === 'warning' ? 'alert-warning' : 'alert-danger');
  const alertIcon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';

  container.innerHTML = `
    <div id="${alertId}" class="alert ${alertBg} alert-dismissible fade show shadow-sm d-flex align-items-center" role="alert">
      <i class="bi ${alertIcon} fs-4 me-3"></i>
      <div>
        <strong class="d-block mb-1">${title}</strong>
        <span>${message}</span>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  // Auto dismiss after 10 seconds
  setTimeout(() => {
    const el = document.getElementById(alertId);
    if (el) {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(el);
      if (bsAlert) bsAlert.close();
    }
  }, 10000);
}

function showToast(message, type = "success") {
  const toastEl = document.getElementById('actionToast');
  const msgEl = document.getElementById('toastMsg');
  if (!toastEl || !msgEl) return;

  msgEl.innerText = message;
  toastEl.className = `toast align-items-center text-white border-0 ${type === 'success' ? 'bg-success' : (type === 'warning' ? 'bg-warning text-dark' : 'bg-danger')}`;
  
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

// Core DB Stats Display
function updateStats() {
  const instEl = document.getElementById('stat-instructors');
  if (instEl) instEl.innerText = db.instructors.length;
  const subjEl = document.getElementById('stat-subjects');
  if (subjEl) subjEl.innerText = db.subjects.length;
  const roomEl = document.getElementById('stat-rooms');
  if (roomEl) roomEl.innerText = db.rooms.length;
  const secEl = document.getElementById('stat-sections');
  if (secEl) secEl.innerText = (db.sections || []).length;
  const schEl = document.getElementById('stat-schedules');
  if (schEl) schEl.innerText = db.schedules.length;
}

// Populate Dropdowns dynamically
function populateFormSelects() {
  // Teacher selector
  const teacherSel = document.getElementById('input-teacher');
  if (teacherSel) {
    teacherSel.innerHTML = '<option value="">Select Teacher...</option>';
    db.instructors.forEach(t => {
      teacherSel.innerHTML += `<option value="${t.id}">${t.name} (${t.designation})</option>`;
    });
  }

  const singleTeacherSel = document.getElementById('single-mode-teacher');
  if (singleTeacherSel) {
    singleTeacherSel.innerHTML = '<option value="">Choose teacher...</option>';
    db.instructors.forEach(t => {
      singleTeacherSel.innerHTML += `<option value="${t.id}">${t.name} (${t.designation})</option>`;
    });
  }

  // Room selector
  const roomSel = document.getElementById('input-room');
  if (roomSel) {
    roomSel.innerHTML = '<option value="">Select Room...</option>';
    db.rooms.forEach(r => {
      roomSel.innerHTML += `<option value="${r.id}">${r.name} (${r.room_type})</option>`;
    });
  }

  // Subject selector (decoupled unique subject title list)
  const subSel = document.getElementById('input-subject');
  if (subSel) {
    const currentVal = subSel.value;
    subSel.innerHTML = '<option value="">Select Subject...</option>';
    const uniqueSubjectTitles = [...new Set(db.subjects.map(s => s.title_and_code))];
    uniqueSubjectTitles.forEach(title => {
      subSel.innerHTML += `<option value="${title}">${title}</option>`;
    });
    if (currentVal && uniqueSubjectTitles.includes(currentVal)) {
      subSel.value = currentVal;
    }
  }

  // Filters selectors on the schedule board page
  const filterTeacher = document.getElementById('filter-teacher');
  if (filterTeacher) {
    filterTeacher.innerHTML = '<option value="">All Teachers</option>';
    db.instructors.forEach(t => {
      filterTeacher.innerHTML += `<option value="${t.id}">${t.name}</option>`;
    });
  }

  // Course Selector filter
  const filterCourse = document.getElementById('filter-course');
  if (filterCourse) {
    filterCourse.innerHTML = '<option value="">All Courses</option>';
    const courses = [...new Set(db.subjects.map(s => s.course))];
    courses.forEach(c => {
      filterCourse.innerHTML += `<option value="${c}">${c}</option>`;
    });
  }

  // Blocks filter
  const filterBlock = document.getElementById('filter-block');
  if (filterBlock) {
    filterBlock.innerHTML = '<option value="">All Blocks</option>';
    const blocks = [...new Set(db.subjects.map(s => s.block_section).filter(Boolean))];
    blocks.forEach(b => {
      filterBlock.innerHTML += `<option value="${b}">${b}</option>`;
    });
  }

  // Subject filter
  const filterSubject = document.getElementById('filter-subject');
  if (filterSubject) {
    filterSubject.innerHTML = '<option value="">All Subjects</option>';
    const uniqueSubjectTitles = [...new Set(db.subjects.map(s => s.title_and_code))];
    uniqueSubjectTitles.forEach(title => {
      filterSubject.innerHTML += `<option value="${title}">${title}</option>`;
    });
  }

  // Waterfall / Batch Generate Selects Population
  const existingList = document.getElementById('existing-subjects-list');
  if (existingList) {
    existingList.innerHTML = '';
    // Suggest subjects from both New and Old curriculums
    db.subjects.forEach(s => {
      const cLabel = s.curriculum_type ? s.curriculum_type.toUpperCase() + ' Curriculum' : 'NEW Curriculum';
      existingList.innerHTML += `<option value="${s.title_and_code}">[${cLabel} - ${s.course}] ${s.title_and_code}</option>`;
    });
  }

  const waterfallRm = document.getElementById('waterfall-room');
  if (waterfallRm) {
    waterfallRm.innerHTML = '<option value="">Any available room</option>';
    db.rooms.forEach(r => {
      waterfallRm.innerHTML += `<option value="${r.id}">${r.name} (${r.room_type})</option>`;
    });
  }

  renderWaterfallTeachers();
  loadSectionSubjects();
}

// Waterfall / Batch Generate Teacher Search, Pagination and State
let waterfallSelectedTeachers = new Set();
let waterfallTeacherSearchQuery = '';
let waterfallTeacherCurrentPage = 1;
const waterfallTeacherPageSize = 20;

function onWaterfallSearchChange() {
  const searchInput = document.getElementById('waterfall-teacher-search');
  if (searchInput) {
    waterfallTeacherSearchQuery = searchInput.value.trim().toLowerCase();
    waterfallTeacherCurrentPage = 1;
    renderWaterfallTeachers();
  }
}

function toggleWaterfallTeacherSelection(id, checked) {
  if (checked) {
    waterfallSelectedTeachers.add(id);
  } else {
    waterfallSelectedTeachers.delete(id);
  }
}

function changeWaterfallPage(page) {
  waterfallTeacherCurrentPage = page;
  renderWaterfallTeachers();
}

function renderWaterfallPagination(totalPages) {
  const paginationUl = document.getElementById('waterfall-teachers-pagination');
  if (!paginationUl) return;

  paginationUl.innerHTML = '';
  if (totalPages <= 1) {
    return;
  }

  // Previous button
  const prevClass = waterfallTeacherCurrentPage === 1 ? 'disabled' : '';
  paginationUl.innerHTML += `
    <li class="page-item ${prevClass}">
      <a class="page-link" href="#" onclick="event.preventDefault(); changeWaterfallPage(${waterfallTeacherCurrentPage - 1})">Prev</a>
    </li>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === waterfallTeacherCurrentPage ? 'active' : '';
    paginationUl.innerHTML += `
      <li class="page-item ${activeClass}">
        <a class="page-link" href="#" onclick="event.preventDefault(); changeWaterfallPage(${i})">${i}</a>
      </li>
    `;
  }

  // Next button
  const nextClass = waterfallTeacherCurrentPage === totalPages ? 'disabled' : '';
  paginationUl.innerHTML += `
    <li class="page-item ${nextClass}">
      <a class="page-link" href="#" onclick="event.preventDefault(); changeWaterfallPage(${waterfallTeacherCurrentPage + 1})">Next</a>
    </li>
  `;
}

function renderWaterfallTeachers() {
  const waterfallTeachersDiv = document.getElementById('waterfall-instructors-list');
  if (!waterfallTeachersDiv) return;

  const filteredTeachers = db.instructors.filter(t => {
    return t.name.toLowerCase().includes(waterfallTeacherSearchQuery) || 
           t.designation.toLowerCase().includes(waterfallTeacherSearchQuery);
  });

  const totalItems = filteredTeachers.length;
  const totalPages = Math.ceil(totalItems / waterfallTeacherPageSize) || 1;
  if (waterfallTeacherCurrentPage > totalPages) {
    waterfallTeacherCurrentPage = totalPages;
  }
  if (waterfallTeacherCurrentPage < 1) {
    waterfallTeacherCurrentPage = 1;
  }

  const startIndex = (waterfallTeacherCurrentPage - 1) * waterfallTeacherPageSize;
  const endIndex = Math.min(startIndex + waterfallTeacherPageSize, totalItems);
  const pagedTeachers = filteredTeachers.slice(startIndex, endIndex);

  waterfallTeachersDiv.innerHTML = '';
  if (pagedTeachers.length === 0) {
    waterfallTeachersDiv.innerHTML = '<div class="col-12 text-muted text-center py-2">No instructors found matching search.</div>';
  } else {
    pagedTeachers.forEach(t => {
      const isChecked = waterfallSelectedTeachers.has(t.id) ? 'checked' : '';
      waterfallTeachersDiv.innerHTML += `
        <div class="col-md-6 col-12">
          <div class="form-check">
            <input class="form-check-input waterfall-teacher-checkbox" type="checkbox" value="${t.id}" id="chk-wf-${t.id}" ${isChecked} onchange="toggleWaterfallTeacherSelection('${t.id}', this.checked)">
            <label class="form-check-label small fw-medium text-truncate" for="chk-wf-${t.id}" style="max-width: 100%;">
              ${t.name} <span class="text-primary">(${getMaxUnitsForDesignation(t.designation)} max)</span>
            </label>
          </div>
        </div>
      `;
    });
  }

  renderWaterfallPagination(totalPages);
}

function populatePrintTeachers() {
  const printSel = document.getElementById('print-teacher-select');
  if (!printSel) return;
  printSel.innerHTML = '';
  db.instructors.forEach(t => {
    printSel.innerHTML += `<option value="${t.id}">${t.name} [${t.designation}]</option>`;
  });
}

// Update UI view renderings
function renderAllViews() {
  populateFormSelects();
  populatePrintTeachers();
  renderSchedulesTable();
  renderInstructorsTable();
  renderSubjectsTable();
  renderRoomsTable();
  renderSectionsTable();
  if (document.getElementById('print-teacher-select')) {
    renderOfficialPrintout();
  }
}

// RENDER SCHEDULE RECORDS TABLE (With Custom Filter Logic)
let activeFilters = {
  teacher: "",
  course: "",
  subject: "",
  year: "",
  block: ""
};

function applyFilters() {
  activeFilters.teacher = document.getElementById('filter-teacher').value;
  activeFilters.course = document.getElementById('filter-course').value;
  activeFilters.subject = document.getElementById('filter-subject').value;
  activeFilters.year = document.getElementById('filter-year').value;
  activeFilters.block = document.getElementById('filter-block').value;
  renderSchedulesTable();
}

function resetFilters() {
  document.getElementById('filter-teacher').value = "";
  document.getElementById('filter-course').value = "";
  document.getElementById('filter-subject').value = "";
  document.getElementById('filter-year').value = "";
  document.getElementById('filter-block').value = "";
  activeFilters = { teacher: "", course: "", subject: "", year: "", block: "" };
  renderSchedulesTable();
}

function autoSaveSchedule(id, field, value) {
  const sch = db.schedules.find(s => s.id === id);
  if (!sch) return;

  sch[field] = value;

  // Run validation check
  const validation = validateSchedule(sch);
  if (!validation.valid) {
    showToast(`Warning: Schedule conflict detected: ${validation.errors.join(', ')}`, "warning");
  } else {
    showToast("Schedule updated successfully!", "info");
  }

  saveDatabase();
  renderSchedulesTable();
}

function renderSchedulesTable() {
  const listEl = document.getElementById('scheduleList');
  if (!listEl) return;
  listEl.innerHTML = '';

  // Reset selections
  selectedScheduleIds.clear();
  const checkAllSchedules = document.getElementById('check-all-schedules');
  if (checkAllSchedules) checkAllSchedules.checked = false;
  updateBulkDeleteUI('schedules');

  let filtered = db.schedules.filter(sch => {
    const t = db.instructors.find(i => i.id === sch.instructor_id);
    const sub = db.subjects.find(s => s.id === sch.subject_id);

    const schCourse = sch.course || (sub ? sub.course : '');
    const schYear = sch.year_level || (sub ? sub.year_level : 0);
    const schBlock = sch.block_section || (sub ? sub.block_section : '');
    
    if (activeFilters.teacher && sch.instructor_id !== activeFilters.teacher) return false;
    if (activeFilters.subject && (!sub || sub.title_and_code !== activeFilters.subject)) return false;
    if (activeFilters.course && schCourse !== activeFilters.course) return false;
    if (activeFilters.year && schYear !== parseInt(activeFilters.year, 10)) return false;
    if (activeFilters.block && schBlock !== activeFilters.block && !schBlock.endsWith(activeFilters.block)) return false;

    return true;
  });

  const countBadgeEl = document.getElementById('filtered-count');
  if (countBadgeEl) countBadgeEl.innerText = `Showing ${filtered.length} records`;

  const noSchedEl = document.getElementById('noSchedulesMsg');
  const tableEl = document.getElementById('scheduleTable');

  if (filtered.length === 0) {
    if (noSchedEl) noSchedEl.style.display = 'block';
    if (tableEl) tableEl.style.display = 'none';
    return;
  }

  if (noSchedEl) noSchedEl.style.display = 'none';
  if (tableEl) tableEl.style.display = 'table';

  // Sort by day, time start
  const dayOrder = { "M": 1, "T": 2, "W": 3, "TH": 4, "F": 5, "S": 6, "MT": 1.5, "MW": 1.6, "MF": 1.7, "TF": 2.2, "WF": 3.5, "TTH": 2.5, "MWF": 1.2, "Monday-Friday": 0.5 };
  filtered.sort((a, b) => {
    const dayDiff = (dayOrder[a.day] || 9) - (dayOrder[b.day] || 9);
    if (dayDiff !== 0) return dayDiff;
    return parseTimeToMinutes(a.time_start) - parseTimeToMinutes(b.time_start);
  });

  // Page slice
  schedulesCurrentPage = renderPaginationControls(
    filtered.length, 
    schedulesCurrentPage, 
    GENERAL_PAGE_SIZE, 
    'schedules-pagination', 
    'schedules-page-info', 
    'changeSchedulesPage'
  );
  const startIdx = (schedulesCurrentPage - 1) * GENERAL_PAGE_SIZE;
  const pagedItems = filtered.slice(startIdx, startIdx + GENERAL_PAGE_SIZE);

  const standardDaysList = ['M', 'T', 'W', 'TH', 'F', 'S', 'MT', 'MW', 'MF', 'TF', 'WF', 'TTH', 'MWF', 'Monday-Friday'];

  pagedItems.forEach(sch => {
    const teacher = db.instructors.find(t => t.id === sch.instructor_id);
    const room = db.rooms.find(r => r.id === sch.room_id);
    const subject = db.subjects.find(s => s.id === sch.subject_id);

    const subTitle = subject ? subject.title_and_code : 'Unknown';
    const course = sch.course || (subject ? subject.course : '-');
    const year = sch.year_level || (subject ? subject.year_level : '-');
    const rawBlock = sch.block_section || (subject && subject.block_section ? subject.block_section : '');
    const currentBlockName = rawBlock ? (rawBlock.includes(course) ? rawBlock.replace(course, '').trim() : rawBlock) : '';

    const sectionOptions = (db.sections || [])
      .filter(sec => !course || course === '-' || sec.course === course)
      .map(sec => `<option value="${sec.section_name}" ${currentBlockName === sec.section_name ? 'selected' : ''}>${sec.course} ${sec.section_name}</option>`)
      .join('');

    const sectionSelect = `
      <select class="form-select form-select-sm border-0 bg-transparent editable-field fw-bold" style="min-width: 90px;" onchange="autoSaveSchedule('${sch.id}', 'block_section', this.value)">
        <option value="" ${!currentBlockName ? 'selected' : ''}>- None -</option>
        ${sectionOptions}
      </select>
    `;

    const lec = subject ? subject.lec_hours : 0;
    const lab = subject ? subject.lab_hours : 0;

    const teacherSelect = `
      <select class="form-select form-select-sm border-0 bg-transparent editable-field fw-bold ${!sch.instructor_id ? 'text-danger' : 'text-dark'}" onchange="autoSaveSchedule('${sch.id}', 'instructor_id', this.value)" style="min-width: 160px;">
        <option value="" ${!sch.instructor_id ? 'selected' : ''}>-- Unassigned (Blank) --</option>
        ${db.instructors.map(i => `<option value="${i.id}" ${sch.instructor_id === i.id ? 'selected' : ''}>${i.name}</option>`).join('')}
      </select>
    `;

    const roomSelect = `
      <select class="form-select form-select-sm border-0 bg-transparent editable-field fw-semibold" onchange="autoSaveSchedule('${sch.id}', 'room_id', this.value)">
        ${db.rooms.map(r => `<option value="${r.id}" ${sch.room_id === r.id ? 'selected' : ''}>${r.name}</option>`).join('')}
      </select>
    `;

    const daySelect = `
      <select class="form-select form-select-sm border-0 bg-transparent editable-field fw-bold text-primary" onchange="autoSaveSchedule('${sch.id}', 'day', this.value)">
        ${standardDaysList.map(d => `<option value="${d}" ${sch.day === d ? 'selected' : ''}>${d}</option>`).join('')}
      </select>
    `;

    const subjectSelect = `
      <select class="form-select form-select-sm border-0 bg-transparent editable-field text-wrap small text-muted" style="max-width: 220px;" onchange="autoSaveSchedule('${sch.id}', 'subject_id', this.value)">
        ${db.subjects.map(s => `<option value="${s.id}" ${sch.subject_id === s.id ? 'selected' : ''}>${s.title_and_code} (${s.course})</option>`).join('')}
      </select>
    `;

    listEl.innerHTML += `
      <tr>
        <td><input type="checkbox" class="form-check-input chk-bulk-schedules" value="${sch.id}" onchange="toggleItemSelection('schedules', '${sch.id}', this.checked)"></td>
        <td>${teacherSelect}</td>
        <td>${roomSelect}</td>
        <td>${daySelect}</td>
        <td><input type="time" class="form-control form-control-sm border-0 bg-transparent editable-field px-1" value="${sch.time_start}" onchange="autoSaveSchedule('${sch.id}', 'time_start', this.value)"></td>
        <td><input type="time" class="form-control form-control-sm border-0 bg-transparent editable-field px-1" value="${sch.time_end}" onchange="autoSaveSchedule('${sch.id}', 'time_end', this.value)"></td>
        <td class="text-center">${year}</td>
        <td>${sectionSelect}</td>
        <td>${subjectSelect}</td>
        <td>${course}</td>
        <td class="text-center fw-medium">${lec}</td>
        <td class="text-center fw-medium">${lab}</td>
        <td class="text-end">
          <button class="btn btn-outline-danger btn-xs py-0 px-1" onclick="deleteSchedule('${sch.id}')" title="Delete Schedule">
            <i class="bi bi-trash-fill"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

// RENDER SECTIONS TABLE
function renderSectionsTable() {
  const table = document.getElementById('sectionsListTable');
  if (!table) return;
  table.innerHTML = '';

  selectedSectionIds.clear();
  const checkAll = document.getElementById('check-all-sections');
  if (checkAll) checkAll.checked = false;
  updateBulkDeleteUI('sections');

  sectionsCurrentPage = renderPaginationControls(
    (db.sections || []).length,
    sectionsCurrentPage,
    GENERAL_PAGE_SIZE,
    'sections-pagination',
    'sections-page-info',
    'changeSectionsPage'
  );
  const startIdx = (sectionsCurrentPage - 1) * GENERAL_PAGE_SIZE;
  const pagedItems = (db.sections || []).slice(startIdx, startIdx + GENERAL_PAGE_SIZE);

  const courses = ['BSIT', 'BEED', 'BSED', 'BSCA', 'BSCRIM', 'BSHM', 'BSBA-FM', 'BSBA-HRDM', 'BSBA-MM'];

  pagedItems.forEach(sec => {
    const courseSelect = `
      <select class="form-select form-select-sm border-0 bg-transparent editable-field fw-bold" onchange="autoSaveSection('${sec.id}', 'course', this.value)">
        ${courses.map(c => `<option value="${c}" ${sec.course === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    `;

    const yearSelect = `
      <select class="form-select form-select-sm border-0 bg-transparent editable-field text-center fw-bold" onchange="autoSaveSection('${sec.id}', 'year_level', this.value)">
        <option value="1" ${sec.year_level === 1 ? 'selected' : ''}>1st Year</option>
        <option value="2" ${sec.year_level === 2 ? 'selected' : ''}>2nd Year</option>
        <option value="3" ${sec.year_level === 3 ? 'selected' : ''}>3rd Year</option>
        <option value="4" ${sec.year_level === 4 ? 'selected' : ''}>4th Year</option>
      </select>
    `;

    table.innerHTML += `
      <tr>
        <td><input type="checkbox" class="form-check-input chk-bulk-sections" value="${sec.id}" onchange="toggleItemSelection('sections', '${sec.id}', this.checked)"></td>
        <td>${courseSelect}</td>
        <td>${yearSelect}</td>
        <td><input type="text" class="form-control form-control-sm border-0 bg-transparent fw-bold editable-field" value="${sec.section_name || ''}" onchange="autoSaveSection('${sec.id}', 'section_name', this.value)"></td>
        <td class="text-end">
          <button class="btn btn-outline-danger btn-sm py-1 px-2" onclick="deleteSection('${sec.id}')" title="Delete Section">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

function autoSaveSection(id, field, value) {
  const sec = (db.sections || []).find(s => s.id === id);
  if (!sec) return;

  if (field === 'year_level') {
    sec.year_level = parseInt(value, 10) || 1;
  } else {
    sec[field] = value;
  }

  saveDatabase();
  showToast("Section updated successfully!");
}

function saveSection(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('section-id') ? document.getElementById('section-id').value : '';
  const course = document.getElementById('section-course-val') ? document.getElementById('section-course-val').value : 'BSIT';
  const year_level = document.getElementById('section-year-val') ? parseInt(document.getElementById('section-year-val').value, 10) : 1;
  const section_name = document.getElementById('section-name-val') ? document.getElementById('section-name-val').value.trim() : '';

  if (!section_name) {
    showToast("Please enter a section name.", "danger");
    return;
  }

  if (id) {
    const sec = (db.sections || []).find(s => s.id === id);
    if (sec) {
      sec.course = course;
      sec.year_level = year_level;
      sec.section_name = section_name;
    }
  } else {
    const newSec = {
      id: 'sec_' + uniqueId(),
      course,
      year_level,
      section_name
    };
    if (!db.sections) db.sections = [];
    db.sections.push(newSec);
  }

  saveDatabase();
  clearSectionForm();
  showToast("Section saved successfully!");
}

function deleteSection(id) {
  if (confirm("Are you sure you want to delete this section?")) {
    db.sections = (db.sections || []).filter(s => s.id !== id);
    saveDatabase();
    showToast("Section deleted successfully!", "danger");
  }
}

function clearSectionForm() {
  const form = document.getElementById('sectionForm');
  if (form) form.reset();
  if (document.getElementById('section-id')) document.getElementById('section-id').value = "";
}

function bulkDeleteSections() {
  if (selectedSectionIds.size === 0) return;
  if (confirm(`Are you sure you want to delete ${selectedSectionIds.size} selected section(s)?`)) {
    db.sections = (db.sections || []).filter(s => !selectedSectionIds.has(s.id));
    selectedSectionIds.clear();
    saveDatabase();
    showToast("Selected sections deleted successfully!", "danger");
  }
}

// AUTO-SAVE HELPERS FOR MANAGE DATA INLINE EDITING
function autoSaveInstructor(id, field, value) {
  const teacher = db.instructors.find(i => i.id === id);
  if (!teacher) return;

  if (field === 'max_units') {
    teacher.max_units = parseFloat(value) || 0;
  } else if (field === 'designation') {
    teacher.designation = value;
    teacher.max_units = getWorkloadLimitByDesignation(value);
    renderInstructorsTable();
  } else {
    teacher[field] = value;
  }

  saveDatabase();
  showToast(`Auto-saved instructor "${teacher.name}"`, "info");
}

function autoSaveSubject(id, field, value) {
  const sub = db.subjects.find(s => s.id === id);
  if (!sub) return;

  if (field === 'units' || field === 'lec_hours' || field === 'lab_hours' || field === 'year_level' || field === 'semester') {
    sub[field] = parseFloat(value) || 0;
  } else if (field === 'is_major') {
    sub.is_major = parseInt(value, 10);
    renderSubjectsTable();
  } else if (field === 'course') {
    sub.course = value;
    renderSubjectsTable();
  } else {
    sub[field] = value;
  }

  saveDatabase();
  showToast(`Auto-saved subject "${sub.title_and_code}"`, "info");
}

function autoSaveRoom(id, field, value) {
  const room = db.rooms.find(r => r.id === id);
  if (!room) return;

  room[field] = value;
  saveDatabase();
  showToast(`Auto-saved room "${room.name}"`, "info");
}

// RENDER INSTRUCTORS TABLE
function renderInstructorsTable() {
  const table = document.getElementById('teachersListTable');
  if (!table) return;
  table.innerHTML = '';

  selectedTeacherIds_manage.clear();
  const checkAll = document.getElementById('check-all-teachers');
  if (checkAll) checkAll.checked = false;
  updateBulkDeleteUI('teachers');

  instructorsCurrentPage = renderPaginationControls(
    db.instructors.length,
    instructorsCurrentPage,
    GENERAL_PAGE_SIZE,
    'teachers-pagination',
    'teachers-page-info',
    'changeInstructorsPage'
  );
  const startIdx = (instructorsCurrentPage - 1) * GENERAL_PAGE_SIZE;
  const pagedItems = db.instructors.slice(startIdx, startIdx + GENERAL_PAGE_SIZE);

  const desigOptions = [
    'Licensed Teacher',
    'Regular Teacher',
    'Program Head',
    'Director',
    'Part-time Teacher',
    'Admin'
  ];

  pagedItems.forEach(t => {
    const desigSelect = `
      <select class="form-select form-select-sm border-0 bg-transparent editable-field fw-semibold" onchange="autoSaveInstructor('${t.id}', 'designation', this.value)">
        ${desigOptions.map(d => `<option value="${d}" ${t.designation === d ? 'selected' : ''}>${d}</option>`).join('')}
      </select>
    `;

    table.innerHTML += `
      <tr>
        <td><input type="checkbox" class="form-check-input chk-bulk-teachers" value="${t.id}" onchange="toggleItemSelection('teachers', '${t.id}', this.checked)"></td>
        <td><input type="text" class="form-control form-control-sm border-0 bg-transparent fw-bold editable-field" value="${t.name || ''}" onchange="autoSaveInstructor('${t.id}', 'name', this.value)"></td>
        <td>${desigSelect}</td>
        <td><input type="text" class="form-control form-control-sm border-0 bg-transparent editable-field" value="${t.degree || ''}" onchange="autoSaveInstructor('${t.id}', 'degree', this.value)" placeholder="Degree"></td>
        <td><input type="text" class="form-control form-control-sm border-0 bg-transparent editable-field" value="${t.area || ''}" onchange="autoSaveInstructor('${t.id}', 'area', this.value)" placeholder="Department/Area"></td>
        <td><input type="text" class="form-control form-control-sm border-0 bg-transparent editable-field" value="${t.employee_no || ''}" onchange="autoSaveInstructor('${t.id}', 'employee_no', this.value)" placeholder="Emp #"></td>
        <td class="text-center">
          <input type="number" class="form-control form-control-sm border-0 bg-transparent text-center fw-bold text-primary editable-field mx-auto" style="width: 60px;" value="${t.max_units}" onchange="autoSaveInstructor('${t.id}', 'max_units', this.value)">
        </td>
        <td class="text-end">
          <button class="btn btn-outline-danger btn-sm py-1 px-2" onclick="deleteTeacher('${t.id}')" title="Delete Instructor">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

// RENDER SUBJECTS TABLE
function renderSubjectsTable() {
  const table = document.getElementById('subjectsListTable');
  if (!table) return;
  table.innerHTML = '';

  selectedSubjectIds.clear();
  const checkAll = document.getElementById('check-all-subjects');
  if (checkAll) checkAll.checked = false;
  updateBulkDeleteUI('subjects');

  subjectsCurrentPage = renderPaginationControls(
    db.subjects.length,
    subjectsCurrentPage,
    GENERAL_PAGE_SIZE,
    'subjects-pagination',
    'subjects-page-info',
    'changeSubjectsPage'
  );
  const startIdx = (subjectsCurrentPage - 1) * GENERAL_PAGE_SIZE;
  const pagedItems = db.subjects.slice(startIdx, startIdx + GENERAL_PAGE_SIZE);

  const courseOptions = ['BSIT', 'BEED', 'BSED', 'BSCA', 'BSCRIM', 'BSHM', 'BSBA-FM', 'BSBA-HRDM', 'BSBA-MM'];

  pagedItems.forEach(s => {
    const courseSelect = `
      <select class="form-select form-select-sm border-0 bg-transparent editable-field fw-semibold" onchange="autoSaveSubject('${s.id}', 'course', this.value)">
        ${courseOptions.map(c => `<option value="${c}" ${s.course === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    `;

    const majorSelect = `
      <select class="form-select form-select-sm border-0 bg-transparent editable-field fw-semibold ${s.is_major ? 'text-danger' : 'text-secondary'}" onchange="autoSaveSubject('${s.id}', 'is_major', this.value)">
        <option value="1" ${s.is_major ? 'selected' : ''}>Major</option>
        <option value="0" ${!s.is_major ? 'selected' : ''}>General</option>
      </select>
    `;

    const yearSelect = `
      <select class="form-select form-select-sm border-0 bg-transparent editable-field" onchange="autoSaveSubject('${s.id}', 'year_level', this.value)">
        <option value="1" ${s.year_level == 1 ? 'selected' : ''}>Year 1</option>
        <option value="2" ${s.year_level == 2 ? 'selected' : ''}>Year 2</option>
        <option value="3" ${s.year_level == 3 ? 'selected' : ''}>Year 3</option>
        <option value="4" ${s.year_level == 4 ? 'selected' : ''}>Year 4</option>
      </select>
    `;

    table.innerHTML += `
      <tr>
        <td><input type="checkbox" class="form-check-input chk-bulk-subjects" value="${s.id}" onchange="toggleItemSelection('subjects', '${s.id}', this.checked)"></td>
        <td><input type="text" class="form-control form-control-sm border-0 bg-transparent fw-bold text-dark editable-field" value="${s.title_and_code || ''}" onchange="autoSaveSubject('${s.id}', 'title_and_code', this.value)"></td>
        <td>${courseSelect}</td>
        <td>${majorSelect}</td>
        <td>${yearSelect}</td>
        <td class="text-center">
          <input type="number" class="form-control form-control-sm border-0 bg-transparent text-center fw-bold text-primary editable-field mx-auto" style="width: 55px;" value="${s.units}" onchange="autoSaveSubject('${s.id}', 'units', this.value)">
        </td>
        <td class="text-center">
          <div class="d-flex align-items-center justify-content-center gap-1">
            <input type="number" class="form-control form-control-sm border-0 bg-transparent text-center editable-field" style="width: 45px;" value="${s.lec_hours}" onchange="autoSaveSubject('${s.id}', 'lec_hours', this.value)" title="Lecture Hours">
            <span>/</span>
            <input type="number" class="form-control form-control-sm border-0 bg-transparent text-center editable-field" style="width: 45px;" value="${s.lab_hours}" onchange="autoSaveSubject('${s.id}', 'lab_hours', this.value)" title="Lab Hours">
          </div>
        </td>
        <td class="text-end">
          <button class="btn btn-outline-danger btn-sm py-1 px-2" onclick="deleteSubject('${s.id}')" title="Delete Subject">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

// RENDER ROOMS TABLE
function renderRoomsTable() {
  const table = document.getElementById('roomsListTable');
  if (!table) return;
  table.innerHTML = '';

  selectedRoomIds.clear();
  const checkAll = document.getElementById('check-all-rooms');
  if (checkAll) checkAll.checked = false;
  updateBulkDeleteUI('rooms');

  roomsCurrentPage = renderPaginationControls(
    db.rooms.length,
    roomsCurrentPage,
    GENERAL_PAGE_SIZE,
    'rooms-pagination',
    'rooms-page-info',
    'changeRoomsPage'
  );
  const startIdx = (roomsCurrentPage - 1) * GENERAL_PAGE_SIZE;
  const pagedItems = db.rooms.slice(startIdx, startIdx + GENERAL_PAGE_SIZE);

  const roomTypes = ['Lecture', 'Laboratory', 'Special Room'];

  pagedItems.forEach(r => {
    const typeSelect = `
      <select class="form-select form-select-sm border-0 bg-transparent editable-field fw-semibold" onchange="autoSaveRoom('${r.id}', 'room_type', this.value)">
        ${roomTypes.map(rt => `<option value="${rt}" ${r.room_type === rt ? 'selected' : ''}>${rt}</option>`).join('')}
      </select>
    `;

    table.innerHTML += `
      <tr>
        <td><input type="checkbox" class="form-check-input chk-bulk-rooms" value="${r.id}" onchange="toggleItemSelection('rooms', '${r.id}', this.checked)"></td>
        <td><input type="text" class="form-control form-control-sm border-0 bg-transparent fw-bold editable-field" value="${r.name || ''}" onchange="autoSaveRoom('${r.id}', 'name', this.value)"></td>
        <td>${typeSelect}</td>
        <td class="text-end">
          <button class="btn btn-outline-danger btn-sm py-1 px-2" onclick="deleteRoom('${r.id}')" title="Delete Room">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

// --- FORM ADD / EDIT / DELETE ACTIONS ---

// SCHEDULE
const schedFormEl = document.getElementById('scheduleForm');
if (schedFormEl) {
  schedFormEl.addEventListener('submit', function(e) {
    e.preventDefault();
  
  const id = document.getElementById('edit-id').value;
  const instructor_id = document.getElementById('input-teacher').value;
  const room_id = document.getElementById('input-room').value;
  const day = document.getElementById('input-day').value;
  const time_start = document.getElementById('input-time-start').value;
  const time_end = document.getElementById('input-time-end').value;
  const subject_id = document.getElementById('input-block').value; // Get unique subject ID from block selection

  const candidate = {
    id: id || uniqueId(),
    instructor_id,
    room_id,
    day,
    time_start,
    time_end,
    subject_id
  };

  const validation = validateSchedule(candidate);
  if (!validation.valid) {
    showToast(validation.errors[0], "danger");
    return;
  }

  if (validation.warnings && validation.warnings.length > 0) {
    showToast(validation.warnings[0], "warning");
  }

  if (id) {
    // Edit existing schedule
    const index = db.schedules.findIndex(s => s.id === id);
    if (index !== -1) {
      db.schedules[index] = candidate;
      if (!validation.warnings || validation.warnings.length === 0) {
        showToast("Schedule updated successfully!");
      }
    }
  } else {
    // Add new schedule
    db.schedules.push(candidate);
    if (!validation.warnings || validation.warnings.length === 0) {
      showToast("New schedule created successfully!");
    }
  }

  saveDatabase();
  clearForm();
  switchTab('board');
  });
}

function editSchedule(id) {
  const sch = db.schedules.find(s => s.id === id);
  if (sch) {
    switchTab('manual');
    document.getElementById('edit-id').value = sch.id;
    document.getElementById('input-teacher').value = sch.instructor_id;
    document.getElementById('input-room').value = sch.room_id;
    document.getElementById('input-day').value = sch.day;
    document.getElementById('input-time-start').value = sch.time_start;
    document.getElementById('input-time-end').value = sch.time_end;

    // Calculate duration choice manually based on hours
    const sMinutes = parseTimeToMinutes(sch.time_start);
    const eMinutes = parseTimeToMinutes(sch.time_end);
    const durHours = (eMinutes - sMinutes) / 60;
    document.getElementById('input-duration').value = String(durHours);

    // Populate decoupled subject select and dynamic block select
    const sub = db.subjects.find(s => s.id === sch.subject_id);
    if (sub) {
      document.getElementById('input-subject').value = sub.title_and_code;
      
      // Populate block list dynamically first
      autofillSubjectDetails();
      
      // Set the block selection to the exact subject ID
      document.getElementById('input-block').value = sub.id;
      
      // Populate fields
      document.getElementById('input-course').value = sub.course;
      document.getElementById('input-year').value = sub.year_level;
      document.getElementById('input-lec-hours').value = sub.lec_hours;
      document.getElementById('input-lab-hours').value = sub.lab_hours;
      document.getElementById('input-units').value = sub.units;
    }

    document.getElementById('saveScheduleBtn').innerHTML = '<i class="bi bi-save"></i> Update Schedule';
    checkRealtimeConflict();
  }
}

function deleteSchedule(id) {
  if (confirm("Are you sure you want to delete this schedule?")) {
    db.schedules = db.schedules.filter(s => s.id !== id);
    saveDatabase();
    showToast("Schedule deleted successfully!");
  }
}

function clearForm() {
  document.getElementById('scheduleForm').reset();
  document.getElementById('edit-id').value = "";
  
  const blockSel = document.getElementById('input-block');
  if (blockSel) {
    blockSel.innerHTML = '<option value="">Select Block...</option>';
    blockSel.disabled = true;
  }

  document.getElementById('saveScheduleBtn').innerHTML = '<i class="bi bi-calendar-plus"></i> Add Schedule';
  checkRealtimeConflict();
}

// CSV PARSER HELPER
function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let currentVal = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(currentVal.trim());
      if (row.some(field => field.length > 0)) {
        lines.push(row);
      }
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    if (row.some(field => field.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

// INSTRUCTOR CSV UPLOAD IMPLEMENTATION
function importInstructorsCSV(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const content = evt.target.result;
      const rows = parseCSV(content);
      if (rows.length < 2) {
        showToast("CSV file is empty or missing data rows!", "danger");
        return;
      }

      const headers = rows[0].map(h => h.toUpperCase().replace(/[^A-Z0-9#\s]/g, '').trim());
      
      const findColIndex = (keywords) => {
        return headers.findIndex(h => keywords.some(k => h.includes(k)));
      };

      const idxName = findColIndex(['NAME']);
      const idxEmpNo = findColIndex(['EMPLOYEE #', 'EMPLOYEE NO', 'EMPLOYEE NUMBER', 'EMP NO', 'EMPLOYEE']);
      const idxDesignation = findColIndex(['DESIGNATION', 'ROLE', 'POSITION']);
      const idxEduAttainment = findColIndex(['EDUCATIONAL ATTAINMENT', 'EDUCATION', 'ATTAINMENT']);
      const idxPrcLicense = findColIndex(['PRC LICENSE', 'LICENSE', 'PRC']);
      const idxMasteral = findColIndex(['MASTERAL DEGREE', 'MASTER DEGREE', 'MASTERS', 'MASTERAL']);
      const idxArea = findColIndex(['AREA', 'DEPARTMENT']);
      const idxEffectivity = findColIndex(['EFFECTIVITY DATE', 'EFFECTIVITY']);
      const idxAdminLoad = findColIndex(['ADMIN LOAD', 'ADMINISTRATIVE LOAD', 'ADMIN']);

      if (idxName === -1) {
        showToast("CSV file must contain a 'NAME' column!", "danger");
        return;
      }

      let addedCount = 0;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const name = idxName !== -1 && row[idxName] ? row[idxName].trim() : '';
        if (!name) continue;

        const rawEmpNo = idxEmpNo !== -1 && row[idxEmpNo] ? row[idxEmpNo].trim() : '';
        const rawDes = idxDesignation !== -1 && row[idxDesignation] ? row[idxDesignation].trim() : '';
        const edu = idxEduAttainment !== -1 && row[idxEduAttainment] ? row[idxEduAttainment].trim() : '';
        const prc = idxPrcLicense !== -1 && row[idxPrcLicense] ? row[idxPrcLicense].trim() : '';
        const masteral = idxMasteral !== -1 && row[idxMasteral] ? row[idxMasteral].trim() : '';
        const area = idxArea !== -1 && row[idxArea] ? row[idxArea].trim() : 'ACADEMICS';
        const effectivity = idxEffectivity !== -1 && row[idxEffectivity] ? row[idxEffectivity].trim() : 'July 13, 2026';
        const adminLoad = idxAdminLoad !== -1 && row[idxAdminLoad] ? row[idxAdminLoad].trim() : '';

        // Combine degree/credentials
        const degreeParts = [edu, prc ? (prc.toUpperCase().includes('LICENSE') || prc.toUpperCase().includes('LPT') ? prc : `PRC: ${prc}`) : '', masteral].filter(Boolean);
        const degreeStr = degreeParts.join(', ');

        // Determine designation
        let designation = "Regular Teacher";
        const desUpper = rawDes.toUpperCase();
        if (desUpper.includes('LICENSED')) designation = "Licensed Teacher";
        else if (desUpper.includes('REGULAR')) designation = "Regular Teacher";
        else if (desUpper.includes('PART')) designation = "Part-time";
        else if (desUpper.includes('ADMIN')) designation = "Admin";
        else if (desUpper.includes('DIRECTOR')) designation = "Director";
        else if (desUpper.includes('PROGRAM') || desUpper.includes('HEAD')) designation = "Program Head";
        else if (prc && !prc.toUpperCase().includes('NO') && !prc.toUpperCase().includes('NONE')) {
          designation = "Licensed Teacher";
        }

        const max_units = getMaxUnitsForDesignation(designation);

        // Check if teacher already exists by employee number or name
        let existing = db.instructors.find(t => (rawEmpNo && t.employee_no === rawEmpNo) || t.name.toUpperCase() === name.toUpperCase());
        if (existing) {
          existing.name = name;
          existing.designation = designation;
          existing.degree = degreeStr || existing.degree;
          existing.area = area || existing.area;
          existing.employee_no = rawEmpNo || existing.employee_no;
          existing.effectivity_date = effectivity || existing.effectivity_date;
          existing.admin_load = adminLoad || existing.admin_load;
          existing.max_units = max_units;
        } else {
          db.instructors.push({
            id: uniqueId(),
            name,
            designation,
            degree: degreeStr,
            area,
            employee_no: rawEmpNo,
            effectivity_date: effectivity,
            admin_load: adminLoad,
            max_units
          });
        }
        addedCount++;
      }

      saveDatabase();
      e.target.value = ''; // Reset input
      showToast(`Successfully imported/updated ${addedCount} instructor records from CSV!`, "success");
    } catch (err) {
      console.error("Error parsing CSV:", err);
      showToast("Failed to parse CSV file. Please check file format.", "danger");
    }
  };
  reader.readAsText(file);
}

// INSTRUCTORS
function saveTeacher(e) {
  e.preventDefault();
  const id = document.getElementById('teacher-id').value;
  const name = document.getElementById('teacher-name').value;
  const designation = document.getElementById('teacher-designation').value;
  const degree = document.getElementById('teacher-degree').value;
  const area = document.getElementById('teacher-area').value;
  const employee_no = document.getElementById('teacher-emp-no').value;
  const effectivity_date = document.getElementById('teacher-effectivity').value;
  const admin_load = document.getElementById('teacher-admin-load').value;
  const max_units = getMaxUnitsForDesignation(designation);

  const teacher = {
    id: id || uniqueId(),
    name,
    designation,
    degree,
    area,
    employee_no,
    effectivity_date,
    admin_load,
    max_units
  };

  if (id) {
    const idx = db.instructors.findIndex(t => t.id === id);
    if (idx !== -1) db.instructors[idx] = teacher;
  } else {
    db.instructors.push(teacher);
  }

  saveDatabase();
  clearTeacherForm();
  showToast("Instructor record saved successfully!");
}

function editTeacher(id) {
  const t = db.instructors.find(ins => ins.id === id);
  if (t) {
    document.getElementById('teacher-id').value = t.id;
    document.getElementById('teacher-name').value = t.name;
    document.getElementById('teacher-designation').value = t.designation;
    document.getElementById('teacher-degree').value = t.degree;
    document.getElementById('teacher-area').value = t.area;
    document.getElementById('teacher-emp-no').value = t.employee_no;
    document.getElementById('teacher-effectivity').value = t.effectivity_date;
    document.getElementById('teacher-admin-load').value = t.admin_load;
    updateDesignationHint();
  }
}

function deleteTeacher(id) {
  if (confirm("Are you sure you want to delete this instructor? Their associated schedules will remain with a blank instructor assignment.")) {
    db.instructors = db.instructors.filter(ins => ins.id !== id);
    db.schedules.forEach(sch => {
      if (sch.instructor_id === id) {
        sch.instructor_id = "";
      }
    });
    saveDatabase();
    showToast("Instructor deleted. Associated schedules preserved with blank instructor.", "warning");
  }
}

function clearTeacherForm() {
  document.getElementById('teacherForm').reset();
  document.getElementById('teacher-id').value = "";
  document.getElementById('teacher-area').value = "ACADEMICS";
  document.getElementById('teacher-effectivity').value = "July 13, 2026";
  updateDesignationHint();
}

function updateDesignationHint() {
  const des = document.getElementById('teacher-designation').value;
  const lim = getMaxUnitsForDesignation(des);
  document.getElementById('designation-hint').innerText = `${des} can teach up to a maximum limit of ${lim} units.`;
}

// SUBJECTS
function saveSubject(e) {
  e.preventDefault();
  const id = document.getElementById('subject-id').value;
  const title_and_code = document.getElementById('subject-title').value;
  const course = document.getElementById('subject-course-val').value;
  const year_level = parseInt(document.getElementById('subject-year').value);
  const units = parseInt(document.getElementById('subject-units').value);
  const lec_hours = parseInt(document.getElementById('subject-lec').value);
  const lab_hours = parseInt(document.getElementById('subject-lab').value);
  const is_major = document.getElementById('subject-is-major').checked ? 1 : 0;

  const subject = {
    id: id || uniqueId(),
    title_and_code,
    course,
    year_level,
    units,
    lec_hours,
    lab_hours,
    is_major
  };

  if (id) {
    const idx = db.subjects.findIndex(sub => sub.id === id);
    if (idx !== -1) db.subjects[idx] = subject;
  } else {
    db.subjects.push(subject);
  }

  saveDatabase();
  clearSubjectForm();
  showToast("Subject saved successfully!");
}

function editSubject(id) {
  const s = db.subjects.find(sub => sub.id === id);
  if (s) {
    document.getElementById('subject-id').value = s.id;
    document.getElementById('subject-title').value = s.title_and_code;
    document.getElementById('subject-course-val').value = s.course;
    document.getElementById('subject-year').value = s.year_level;
    document.getElementById('subject-units').value = s.units;
    document.getElementById('subject-lec').value = s.lec_hours;
    document.getElementById('subject-lab').value = s.lab_hours;
    document.getElementById('subject-is-major').checked = s.is_major === 1;
  }
}

function deleteSubject(id) {
  if (confirm("Are you sure you want to delete this subject? All related schedules will also be removed.")) {
    db.subjects = db.subjects.filter(s => s.id !== id);
    db.schedules = db.schedules.filter(sch => sch.subject_id !== id);
    saveDatabase();
    showToast("Subject and related schedules deleted successfully!", "danger");
  }
}

function clearSubjectForm() {
  document.getElementById('subjectForm').reset();
  document.getElementById('subject-id').value = "";
  document.getElementById('subject-is-major').checked = false;
}

// ROOMS
function saveRoom(e) {
  e.preventDefault();
  const id = document.getElementById('room-id').value;
  const name = document.getElementById('room-name').value;
  const room_type = document.getElementById('room-type').value;

  const room = {
    id: id || uniqueId(),
    name,
    room_type
  };

  if (id) {
    const idx = db.rooms.findIndex(rm => rm.id === id);
    if (idx !== -1) db.rooms[idx] = room;
  } else {
    db.rooms.push(room);
  }

  saveDatabase();
  clearRoomForm();
  showToast("Room saved successfully!");
}

function editRoom(id) {
  const r = db.rooms.find(rm => rm.id === id);
  if (r) {
    document.getElementById('room-id').value = r.id;
    document.getElementById('room-name').value = r.name;
    document.getElementById('room-type').value = r.room_type;
  }
}

function deleteRoom(id) {
  if (confirm("Are you sure you want to delete this room? Associated schedules will also be deleted.")) {
    db.rooms = db.rooms.filter(rm => rm.id !== id);
    db.schedules = db.schedules.filter(sch => sch.room_id !== id);
    saveDatabase();
    showToast("Room and related schedules deleted successfully!", "danger");
  }
}

function clearRoomForm() {
  document.getElementById('roomForm').reset();
  document.getElementById('room-id').value = "";
}


// --- WATERFALL SUBJECT SHARING ENGINE ---
async function runWaterfallScheduler() {
  const subjectTitle = document.getElementById('batch-subject').value.trim();
  const courseInput = document.getElementById('batch-course').value.trim();
  const yearLevel = parseInt(document.getElementById('batch-year').value, 10);
  const units = parseInt(document.getElementById('batch-units').value, 10) || 2;
  const lec_hours = parseInt(document.getElementById('batch-lec-hours').value, 10) || 0;
  const lab_hours = parseInt(document.getElementById('batch-lab-hours').value, 10) || 0;

  const preferredRoomId = document.getElementById('waterfall-room').value;
  const logContainer = document.getElementById('autoSchedulerResults');
  const consoleEl = document.getElementById('schedulerConsole');

  if (!subjectTitle || !courseInput) {
    showToast("Please enter Subject Title and Course/Department!", "danger");
    return;
  }

  // Parse courseInput: support multiple comma-separated courses with optional colon section count
  // e.g. "bsit:4, bscs:2" or "bsit, bscs"
  const defaultSections = parseInt(document.getElementById('batch-sections-count').value, 10) || 10;
  const courseParts = courseInput.split(',').map(part => part.trim()).filter(Boolean);
  
  const coursesToProcess = [];
  courseParts.forEach(part => {
    if (part.includes(':')) {
      const [cName, sCountStr] = part.split(':').map(p => p.trim());
      const sCount = parseInt(sCountStr, 10) || defaultSections;
      coursesToProcess.push({ courseName: cName.toUpperCase(), sections: sCount });
    } else {
      coursesToProcess.push({ courseName: part.toUpperCase(), sections: defaultSections });
    }
  });

  if (coursesToProcess.length === 0) {
    showToast("Please enter at least one valid Course/Department!", "danger");
    return;
  }

  // Find all participating teacher checkboxes
  const selectedTeacherIds = Array.from(waterfallSelectedTeachers);
  if (selectedTeacherIds.length === 0) {
    showToast("Please select at least one participating teacher!", "danger");
    return;
  }

  logContainer.classList.remove('d-none');
  const courseSummary = coursesToProcess.map(c => `${c.courseName} (${c.sections} sections)`).join(', ');
  consoleEl.innerHTML = `Starting Waterfall Batch Auto-Generator for: <strong>${subjectTitle}</strong> [${courseSummary}]...<br>`;

  // Dynamically add subjects/sections to the database if they don't exist yet, or just collect them
  // We'll create distinct section codes like A, B, C, D... etc based on sections count per course
  const createdSubjects = [];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  coursesToProcess.forEach(item => {
    const cName = item.courseName;
    const sCount = item.sections;
    
    for (let i = 0; i < sCount; i++) {
      const sectionLetter = alphabet[i] || String(i + 1);
      const sectionCode = `${yearLevel}${sectionLetter}`;

      // Look if already exists in db.subjects to prevent duplicate creation
      let existingSub = db.subjects.find(s => 
        s.title_and_code === subjectTitle && 
        s.course === cName && 
        s.year_level === yearLevel && 
        s.block_section === sectionCode
      );

      if (!existingSub) {
        existingSub = {
          id: 's_batch_' + uniqueId(),
          title_and_code: subjectTitle,
          course: cName,
          year_level: yearLevel,
          block_section: sectionCode,
          units: units,
          lec_hours: lec_hours,
          lab_hours: lab_hours,
          is_major: (subjectTitle.toUpperCase().includes('CC') || subjectTitle.toUpperCase().includes('IM') || subjectTitle.toUpperCase().includes('PF') || subjectTitle.toUpperCase().includes('PROGRAMMING')) ? 1 : 0
        };
        db.subjects.push(existingSub);
      }
      createdSubjects.push(existingSub);
    }
  });

  // Persist the newly created batch subjects to database
  await saveDatabase();

  // Filter createdSubjects that are currently unscheduled
  const scheduledSubjectIds = new Set(db.schedules.map(sch => sch.subject_id));
  const subjectsToSchedule = createdSubjects.filter(s => !scheduledSubjectIds.has(s.id));

  if (subjectsToSchedule.length === 0) {
    consoleEl.innerHTML += `<span class="text-warning">All requested sections for "${subjectTitle}" are already scheduled. No new actions taken.</span><br>`;
    showToast("All sections of this subject are already scheduled!", "warning");
    return;
  }

  consoleEl.innerHTML += `Found <strong class="text-primary">${subjectsToSchedule.length} unscheduled sections</strong> to split-load among <strong class="text-primary">${selectedTeacherIds.length} teachers</strong>.<br>`;

  // Read target duration from batch-hours dropdown as requested
  const targetDuration = parseFloat(document.getElementById('batch-hours').value) || 1.5;

  consoleEl.innerHTML += `Duration configured to: <strong>${targetDuration} Hour(s)</strong> per block (Year Level: ${yearLevel}, Units: ${units}).<br>`;

  // Build standard list of timeslots, heavily prioritized to minimize empty daily gaps (compress schedules for a day with only lunch break).
  const standardTimeSlots = [
    // 3 Hour blocks (7:00 AM to 7:00 PM)
    { start: "07:00", end: "10:00", dur: 3 },
    { start: "08:00", end: "11:00", dur: 3 },
    { start: "13:00", end: "16:00", dur: 3 },
    { start: "16:00", end: "19:00", dur: 3 },
    
    // 2 Hour blocks (7:00 AM to 7:00 PM)
    { start: "07:00", end: "09:00", dur: 2 },
    { start: "08:00", end: "10:00", dur: 2 },
    { start: "10:00", end: "12:00", dur: 2 },
    { start: "13:00", end: "15:00", dur: 2 },
    { start: "15:00", end: "17:00", dur: 2 },
    { start: "17:00", end: "19:00", dur: 2 },
    { start: "16:00", end: "18:00", dur: 2 },

    // 1.5 Hour blocks (7:00 AM to 7:00 PM)
    { start: "07:00", end: "08:30", dur: 1.5 },
    { start: "07:30", end: "09:00", dur: 1.5 },
    { start: "09:00", end: "10:30", dur: 1.5 },
    { start: "10:30", end: "12:00", dur: 1.5 },
    { start: "13:00", end: "14:30", dur: 1.5 },
    { start: "14:30", end: "16:00", dur: 1.5 },
    { start: "16:00", end: "17:30", dur: 1.5 },
    { start: "17:30", end: "19:00", dur: 1.5 },
    
    // 1 Hour blocks (7:00 AM to 7:00 PM)
    { start: "07:00", end: "08:00", dur: 1 },
    { start: "08:00", end: "09:00", dur: 1 },
    { start: "09:00", end: "10:00", dur: 1 },
    { start: "10:00", end: "11:00", dur: 1 },
    { start: "11:00", end: "12:00", dur: 1 },
    { start: "13:00", end: "14:00", dur: 1 },
    { start: "14:00", end: "15:00", dur: 1 },
    { start: "15:00", end: "16:00", dur: 1 },
    { start: "16:00", end: "17:00", dur: 1 },
    { start: "17:00", end: "18:00", dur: 1 },
    { start: "18:00", end: "19:00", dur: 1 }
  ];

  const batchDaysSetting = document.getElementById("batch-days-count") ? document.getElementById("batch-days-count").value : "all";
  const standardDays = getFilteredStandardDays(batchDaysSetting);
  let successfullyScheduled = 0;

  for (let subject of subjectsToSchedule) {
    let isScheduled = false;
    let conflictsEncountered = new Set();
    
    // Waterfall logic: Sort participating teachers dynamically for each section by their current workload unit counts (ascending)
    const participatingTeachers = db.instructors
      .filter(t => selectedTeacherIds.includes(t.id))
      .sort((a, b) => calculateTeacherTotalUnits(a.id) - calculateTeacherTotalUnits(b.id));

    consoleEl.innerHTML += `Scheduling Section: <strong>${subject.course} ${subject.block_section}</strong>...<br>`;

    const filteredSlots = standardTimeSlots.filter(s => s.dur === targetDuration).concat(standardTimeSlots.filter(s => s.dur !== targetDuration));

    // Sort and filter rooms using getPrioritizedRooms based on subject type and preferred room
    let sortedRooms = getPrioritizedRooms(subject, db.rooms);
    if (preferredRoomId) {
      sortedRooms = [...sortedRooms].sort((a, b) => {
        if (a.id === preferredRoomId) return -1;
        if (b.id === preferredRoomId) return 1;
        return 0;
      });
    }

    for (let teacher of participatingTeachers) {
      const isPartTime = teacher.designation === 'Part-time' || teacher.designation === 'Part-time Teacher';

      // Part-time schedules prefer Saturday and Evening blocks
      const sortedDays = [...standardDays].sort((a, b) => {
        if (isPartTime) {
          if (a === 'S' && b !== 'S') return -1;
          if (b === 'S' && a !== 'S') return 1;
        }
        return 0;
      });

      const sortedSlots = [...filteredSlots].sort((a, b) => {
        if (isPartTime) {
          const aIsEve = timesOverlap(a.start, a.end, "16:00", "19:00");
          const bIsEve = timesOverlap(b.start, b.end, "16:00", "19:00");
          if (aIsEve && !bIsEve) return -1;
          if (!aIsEve && bIsEve) return 1;
        }
        return 0;
      });

      for (let room of sortedRooms) {

        for (let day of sortedDays) {
          for (let slot of sortedSlots) {
            
            const candidate = {
              id: 'temp_' + uniqueId(),
              instructor_id: teacher.id,
              room_id: room.id,
              day,
              time_start: slot.start,
              time_end: slot.end,
              subject_id: subject.id
            };

            const validation = validateSchedule(candidate);
            if (validation.valid) {
              candidate.id = uniqueId();
              db.schedules.push(candidate);
              isScheduled = true;
              successfullyScheduled++;
              consoleEl.innerHTML += `&nbsp;&nbsp;<span class="text-success">✔ Waterfall Assigned:</span> ${teacher.name} (${calculateTeacherTotalUnits(teacher.id)} units) -> Room: ${room.name} on ${day} (${slot.start}-${slot.end})<br>`;
              break;
            } else {
              validation.errors.forEach(err => conflictsEncountered.add(err));
            }
          }
          if (isScheduled) break;
        }
        if (isScheduled) break;
      }
      if (isScheduled) break;
    }

    if (!isScheduled) {
      consoleEl.innerHTML += `&nbsp;&nbsp;<span class="text-danger">✖ Waterfall Failed:</span> Could not find valid conflict-free slot for this section among chosen instructors.<br>`;
      if (conflictsEncountered.size > 0) {
        consoleEl.innerHTML += `&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-warning fw-bold">Conflicts observed:</span><br>`;
        Array.from(conflictsEncountered).slice(0, 5).forEach(err => {
          consoleEl.innerHTML += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="bi bi-exclamation-triangle text-warning me-1"></i> ${err}<br>`;
        });
      }
    }
  }

  await saveDatabase();
  renderSchedulesTable();
  updateStats();

  const failedCount = subjectsToSchedule.length - successfullyScheduled;
  const isSuccess = failedCount === 0;
  const alertType = isSuccess ? 'success' : 'warning';
  const alertTitle = isSuccess ? 'Batch Generator Completed Successfully!' : 'Batch Generator Finished with Conflicts';
  const alertMsg = `Successfully scheduled ${successfullyScheduled} out of ${subjectsToSchedule.length} section(s).` + 
    (!isSuccess ? ` ${failedCount} section(s) encountered conflicts (teacher load/availability, room, or section overlap). See execution logs below for conflict breakdown.` : '');

  showGlobalAlert(alertTitle, alertMsg, alertType);
  showToast(alertMsg, isSuccess ? 'success' : 'warning');
}

// --- PRINT LAYOUT GENERATOR (Matching the Image) ---
function renderOfficialPrintout() {
  const teacherId = document.getElementById('print-teacher-select').value;
  const container = document.getElementById('printout-container');
  const outerSheet = document.getElementById('print-sheet');

  if (!teacherId) {
    container.innerHTML = '<div class="text-center py-5">Please add or select an instructor to preview assignment printout!</div>';
    if (outerSheet) outerSheet.innerHTML = container.innerHTML;
    return;
  }

  const teacher = db.instructors.find(t => t.id === teacherId);
  if (!teacher) return;

  const teacherSchedules = db.schedules.filter(s => s.instructor_id === teacher.id);

  const printFormatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hrs, mins] = timeStr.split(':').map(Number);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    let formattedHrs = hrs % 12 || 12;
    return `${formattedHrs}${mins > 0 ? ':' + String(mins).padStart(2, '0') : ''}`;
  };

  const getFullTimeSpan = (sch) => {
    const s = printFormatTime(sch.time_start);
    const e = printFormatTime(sch.time_end);
    const [eHrs] = sch.time_end.split(':').map(Number);
    const ampm = eHrs >= 12 ? 'PM' : 'AM';
    return `${s}-${e} ${ampm}`;
  };

  let tableRows = '';
  let totalLec = 0;
  let totalLab = 0;
  let totalUnits = 0;

  teacherSchedules.forEach(sch => {
    const sub = db.subjects.find(s => s.id === sch.subject_id);
    const rm = db.rooms.find(r => r.id === sch.room_id);
    
    const subjectName = sub ? sub.title_and_code : 'Administrative Service';
    const courseCode = sch.course || (sub ? sub.course : '');
    const blockSec = sch.block_section || (sub ? sub.block_section : '');
    const section = (courseCode || blockSec) ? `${courseCode} ${blockSec}`.trim() : 'N/A';
    const day = sch.day;
    const room = rm ? rm.name : 'N/A';
    const units = sub ? sub.units : 0;
    const lec = sub ? sub.lec_hours : 0;
    const lab = sub ? sub.lab_hours : 0;

    totalLec += lec;
    totalLab += lab;
    totalUnits += units;

    tableRows += `
      <tr>
        <td class="text-center">COLLEGE</td>
        <td>${subjectName}</td>
        <td class="text-center">${section}</td>
        <td class="text-center">${day}</td>
        <td class="text-center">${getFullTimeSpan(sch)}</td>
        <td class="text-center">${room}</td>
        <td class="text-center"></td>
        <td class="text-center fw-bold">${units}</td>
        <td class="text-center">${lec}</td>
        <td class="text-center">${lab}</td>
      </tr>
    `;
  });

  if (teacherSchedules.length === 0) {
    tableRows = `
      <tr>
        <td colspan="10" class="text-center text-muted py-4">No academic subjects assigned currently. Create some schedules manually or with auto-generate.</td>
      </tr>
    `;
  }

  const collegeLoad = totalLec + totalLab;
  const adminHrs = teacher.admin_load ? 40 : 0;
  
  const htmlContent = `
    <!-- Top SIBT Official Header logo -->
    <div class="d-flex align-items-center mb-4 border-bottom pb-3">
      <div class="me-3">
        <div class="rounded-circle bg-dark d-flex align-items-center justify-content-center text-white text-center" style="width: 70px; height: 70px; font-size: 8px; font-weight: bold;">
          SIBT LOGO
        </div>
      </div>
      <div class="flex-grow-1">
        <h4 class="official-title mb-1 text-center" style="font-size: 1.25rem;">SOUTHWESTERN INSTITUTE OF BUSINESS AND TECHNOLOGY, INC.</h4>
        <div class="text-uppercase text-center small text-muted font-monospace fw-bold" style="font-size: 0.7rem; letter-spacing: 1px;">
          NAUTICAL HIGHWAY, PANGGULAYAN, PINAMALAYAN, ORIENTAL MINDORO
        </div>
        <div class="text-center small text-muted" style="font-size: 0.75rem;">
          Contact Nos.: +63917-127-8500 | +63912-448-6518
        </div>
      </div>
    </div>

    <!-- Instructor Credentials Meta Info -->
    <div class="row g-2 mb-4" style="font-size: 0.85rem;">
      <div class="col-6">
        <div class="d-flex"><span class="fw-bold" style="width: 110px;">NAME:</span> <span class="border-bottom border-dark flex-grow-1 fw-bold">${teacher.name}</span></div>
        <div class="d-flex mt-2"><span class="fw-bold" style="width: 110px;">DESIGNATION:</span> <span class="border-bottom border-dark flex-grow-1">${teacher.designation}</span></div>
        <div class="d-flex mt-2"><span class="fw-bold" style="width: 110px;">DEGREE:</span> <span class="border-bottom border-dark flex-grow-1">${teacher.degree || 'College Instructor'}</span></div>
      </div>
      <div class="col-6">
        <div class="d-flex"><span class="fw-bold" style="width: 150px;">AREA:</span> <span class="border-bottom border-dark flex-grow-1">${teacher.area || 'ACADEMICS'}</span></div>
        <div class="d-flex mt-2"><span class="fw-bold" style="width: 150px;">EFFECTIVITY DATE:</span> <span class="border-bottom border-dark flex-grow-1">${teacher.effectivity_date || 'July 13, 2026'}</span></div>
        <div class="d-flex mt-2"><span class="fw-bold" style="width: 150px;">EMPLOYEE NO.:</span> <span class="border-bottom border-dark flex-grow-1">${teacher.employee_no || '-'}</span></div>
      </div>
    </div>

    <p style="font-size: 0.85rem;" class="mb-3">
      Sir/Madam:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The College has assigned you to teach the following course/s stated below for the First Semester of AY 2026 – 2027.
    </p>

    <!-- Administrative Load Section if Program Head / Admin -->
    ${teacher.admin_load ? `
    <div class="mb-3">
      <table class="official-table w-100 mb-3 text-center">
        <thead>
          <tr>
            <th style="width: 15%;">OFFICE</th>
            <th style="width: 45%;">ADMINISTRATIVE LOAD</th>
            <th style="width: 15%;">DAY</th>
            <th style="width: 15%;">TIME</th>
            <th style="width: 10%;">TOTAL NO. OF HOURS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="fw-bold">COMLAB</td>
            <td>${teacher.admin_load}</td>
            <td>Monday-Friday</td>
            <td>7:00am-4:00pm</td>
            <td class="fw-bold">${adminHrs}</td>
          </tr>
          <tr class="fw-bold bg-light">
            <td colspan="4" class="text-end">TOTAL</td>
            <td>${adminHrs}</td>
          </tr>
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Main Academic Teaching Load Table -->
    <table class="official-table w-100 mb-3">
      <thead>
        <tr>
          <th rowspan="2" style="width: 10%;">OFFICE</th>
          <th rowspan="2" style="width: 35%;">TEACHING LOAD</th>
          <th rowspan="2" style="width: 10%;">SECTION</th>
          <th rowspan="2" style="width: 7%;">DAY</th>
          <th rowspan="2" style="width: 12%;">TIME</th>
          <th rowspan="2" style="width: 10%;">ROOM</th>
          <th rowspan="2" style="width: 6%;">CLASS SIZE</th>
          <th rowspan="2" style="width: 5%;">UNIT</th>
          <th colspan="2" style="width: 10%;">NO. OF HOURS</th>
        </tr>
        <tr>
          <th>LEC</th>
          <th>LAB</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr class="fw-bold bg-light">
          <td colspan="7" class="text-end">TOTAL</td>
          <td class="text-center">${totalUnits}</td>
          <td class="text-center">${totalLec}</td>
          <td class="text-center">${totalLab}</td>
        </tr>
      </tbody>
    </table>

    <!-- Table Summary and Approvals -->
    <div class="row g-3">
      <div class="col-7">
        <p style="font-size: 0.75rem; text-align: justify;" class="line-height-1 text-muted mb-3">
          This Teaching Assignment is subject to pertinent College policies.<br>
          If you agree to the above details, please signify your acceptance by signing the lower left-hand corner and returning this form to the Dean of Academics.
        </p>
      </div>
      <div class="col-5">
        <!-- Summary Box identical to image -->
        <table class="official-summary-table w-100 text-end mb-4" style="border: 1px solid #000;">
          <thead class="table-light text-center fw-bold">
            <tr>
              <th colspan="3" style="font-size: 0.8rem; padding: 4px;">Summary:</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Administrative Load</td>
              <td class="text-center" style="width: 30%;" colspan="2">${teacher.admin_load ? adminHrs : 0}</td>
            </tr>
            <tr>
              <td rowspan="2" class="text-start valign-middle">Teaching Load</td>
              <td class="text-center" style="font-size: 0.75rem;">SHS</td>
              <td class="text-center" style="width: 25%;">0</td>
            </tr>
            <tr>
              <td class="text-center" style="font-size: 0.75rem;">College</td>
              <td class="text-center fw-bold">${collegeLoad}</td>
            </tr>
            <tr>
              <td>Lab (x2)</td>
              <td class="text-center" colspan="2">${totalLab}</td>
            </tr>
            <tr>
              <td>(*) Extra Teaching Load</td>
              <td class="text-center" colspan="2">0</td>
            </tr>
            <tr>
              <td>(**) Substitution</td>
              <td class="text-center" colspan="2">0</td>
            </tr>
            <tr class="fw-bold bg-light">
              <td>Total No. of Units</td>
              <td class="text-center" colspan="2">${totalUnits + (teacher.admin_load ? 4 : 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Official Signatures Area matching image layout -->
    <div class="row mt-4" style="font-size: 0.8rem;">
      <div class="col-6 mb-4">
        <p class="mb-4">Prepared by:</p>
        <div class="fw-bold">CAREN ROSE L TOJEDO, LPT., MAED.</div>
        <div class="text-muted small">Dean of Academics</div>
      </div>
      <div class="col-6 mb-4">
        <p class="mb-4">Conforme:</p>
        <div style="border-bottom: 1px solid #000; width: 80%; height: 20px;"></div>
        <div class="text-muted small mt-1">College Instructor Name</div>
      </div>

      <div class="col-6">
        <p class="mb-4">Approved by:</p>
        <div class="fw-bold text-uppercase">Maila M Morales, LPT., CHRA</div>
        <div class="text-muted small">HRD Director,</div>
      </div>
      <div class="col-6">
        <p class="mb-4">Noted by:</p>
        <div class="fw-bold text-uppercase">Jayvie Erol C. Lizardo, MBA</div>
        <div class="text-muted small">Chief Administrative Officer</div>
      </div>
    </div>

    <!-- Footnote Meta CC -->
    <div class="mt-4 pt-3 border-top" style="font-size: 0.65rem; color: #777;">
      CC:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;Office of the College Secretary<br>
      &nbsp;&nbsp;&nbsp;&nbsp;Finance Office<br>
      &nbsp;&nbsp;&nbsp;&nbsp;Office of the Registrar<br>
      &nbsp;&nbsp;&nbsp;&nbsp;HR and Development Office
    </div>
  `;

  container.innerHTML = htmlContent;
  if (outerSheet) {
    outerSheet.innerHTML = htmlContent;
  }
}

// Redirect schedule board filter to print view immediately
function openPrintForFiltered() {
  const teacherId = document.getElementById('filter-teacher').value;
  if (!teacherId) {
    showToast("Please filter by a specific Teacher before trying to view their official assignment form!", "danger");
    return;
  }
  switchTab('print');
  document.getElementById('print-teacher-select').value = teacherId;
  renderOfficialPrintout();
}

// Bulk delete action methods
function bulkDeleteSchedules() {
  if (selectedScheduleIds.size === 0) return;
  if (confirm(`Are you sure you want to delete ${selectedScheduleIds.size} selected schedule(s)?`)) {
    db.schedules = db.schedules.filter(sch => !selectedScheduleIds.has(sch.id));
    selectedScheduleIds.clear();
    saveDatabase();
    showToast("Selected schedules deleted successfully!");
  }
}

function bulkDeleteTeachers() {
  if (selectedTeacherIds_manage.size === 0) return;
  if (confirm(`Are you sure you want to delete ${selectedTeacherIds_manage.size} selected instructor(s)? Their associated schedules will remain with blank instructor assignments.`)) {
    const idsToDelete = Set ? Array.from(selectedTeacherIds_manage) : [];
    db.instructors = db.instructors.filter(t => !selectedTeacherIds_manage.has(t.id));
    db.schedules.forEach(sch => {
      if (selectedTeacherIds_manage.has(sch.instructor_id)) {
        sch.instructor_id = "";
      }
    });
    selectedTeacherIds_manage.clear();
    saveDatabase();
    showToast("Selected instructors deleted. Associated schedules preserved with blank instructor.", "warning");
  }
}

function bulkDeleteSubjects() {
  if (selectedSubjectIds.size === 0) return;
  if (confirm(`Are you sure you want to delete ${selectedSubjectIds.size} selected subject(s)? This will also delete their associated schedules.`)) {
    db.subjects = db.subjects.filter(s => !selectedSubjectIds.has(s.id));
    db.schedules = db.schedules.filter(sch => !selectedSubjectIds.has(sch.subject_id));
    selectedSubjectIds.clear();
    saveDatabase();
    showToast("Selected subjects deleted successfully!", "danger");
  }
}

function bulkDeleteRooms() {
  if (selectedRoomIds.size === 0) return;
  if (confirm(`Are you sure you want to delete ${selectedRoomIds.size} selected room(s)? This will also delete their associated schedules.`)) {
    db.rooms = db.rooms.filter(r => !selectedRoomIds.has(r.id));
    db.schedules = db.schedules.filter(sch => !selectedRoomIds.has(sch.room_id));
    selectedRoomIds.clear();
    saveDatabase();
    showToast("Selected rooms deleted successfully!", "danger");
  }
}

// Per-Section Generator Logic
function updateSectionBlockOptions() {
  const courseEl = document.getElementById('section-course');
  const yearEl = document.getElementById('section-year');
  const blockEl = document.getElementById('section-block');
  if (!yearEl || !blockEl) return;

  const course = courseEl ? courseEl.value : '';
  const y = parseInt(yearEl.value, 10) || 1;
  const currentVal = blockEl.value;

  // Filter sections matching course and year level
  const matchingSections = (db.sections || []).filter(sec => {
    if (course && sec.course !== course) return false;
    if (sec.year_level !== y) return false;
    return true;
  });

  if (matchingSections.length > 0) {
    blockEl.innerHTML = matchingSections.map(sec =>
      `<option value="${sec.section_name}" ${currentVal === sec.section_name ? 'selected' : ''}>${sec.section_name}</option>`
    ).join('');
  } else {
    // Fallback default options
    blockEl.innerHTML = `
      <option value="${y}A" ${currentVal === y+'A' ? 'selected' : ''}>${y}A</option>
      <option value="${y}B" ${currentVal === y+'B' ? 'selected' : ''}>${y}B</option>
      <option value="${y}C" ${currentVal === y+'C' ? 'selected' : ''}>${y}C</option>
      <option value="${y}D" ${currentVal === y+'D' ? 'selected' : ''}>${y}D</option>
    `;
  }
}

function loadSectionSubjects() {
  const courseEl = document.getElementById('section-course');
  const yearEl = document.getElementById('section-year');
  const semesterEl = document.getElementById('section-semester');
  const blockEl = document.getElementById('section-block');
  const curriculumEl = document.getElementById('section-curriculum');
  const listEl = document.getElementById('section-subjects-list');
  const countEl = document.getElementById('section-subject-count');

  if (!courseEl || !yearEl || !listEl) return;

  updateSectionBlockOptions();

  const course = courseEl.value;
  const year = parseInt(yearEl.value, 10);
  const semester = semesterEl ? semesterEl.value : 'all';
  const block = blockEl ? blockEl.value : '';
  const curriculum = curriculumEl ? curriculumEl.value : 'all';

  const normCourse = (course || '').trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  // Filter subjects matching Course, Year, Semester, and Curriculum
  let matching = db.subjects.filter(s => {
    const sCourse = (s.course || '').trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (sCourse !== normCourse) return false;

    const sYear = parseInt(String(s.year_level || '').replace(/\D/g, ''), 10) || 1;
    if (sYear !== year) return false;

    if (semester !== 'all') {
      const sSem = parseInt(s.semester || 1, 10);
      if (sSem !== parseInt(semester, 10)) return false;
    }

    if (curriculum !== 'all') {
      const cType = (s.curriculum_type || 'new').toLowerCase();
      if (cType !== curriculum.toLowerCase()) return false;
    }
    return true;
  });

  if (countEl) countEl.innerText = `${matching.length} Subject${matching.length !== 1 ? 's' : ''} Found`;

  if (matching.length === 0) {
    listEl.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No matching subjects found for ${course} Year ${year} (${curriculum.toUpperCase()} Curriculum). Add subjects in Manage Data if needed.</td></tr>`;
    return;
  }

  // Teacher dropdown options
  let teacherOpts = '<option value="" disabled selected>Select Instructor...</option>';
  db.instructors.forEach(t => {
    teacherOpts += `<option value="${t.id}">${t.name} (${t.designation})</option>`;
  });

  let html = '';
  matching.forEach(s => {
    const curBadge = (s.curriculum_type === 'old') ? '<span class="badge bg-warning text-dark">Old</span>' : '<span class="badge bg-primary">New</span>';
    const defaultHours = s.lab_hours > 0 ? "3" : (s.lec_hours ? String(s.lec_hours) : "1.5");
    html += `
      <tr>
        <td class="fw-semibold">${s.title_and_code}</td>
        <td>${curBadge} ${s.is_major ? '<span class="badge bg-info text-dark">Major</span>' : ''}</td>
        <td class="text-center fw-bold">${s.units}</td>
        <td class="text-center">${s.lec_hours}/${s.lab_hours}</td>
        <td>
          <select class="form-select form-select-sm section-hours-select" data-subject-id="${s.id}">
            <option value="1" ${defaultHours === "1" ? "selected" : ""}>1 Hour</option>
            <option value="1.5" ${defaultHours === "1.5" ? "selected" : ""}>1.5 Hours</option>
            <option value="2" ${defaultHours === "2" ? "selected" : ""}>2 Hours</option>
            <option value="3" ${defaultHours === "3" ? "selected" : ""}>3 Hours</option>
          </select>
        </td>
        <td>
          <select class="form-select form-select-sm section-days-select" data-subject-id="${s.id}">
            <option value="all" selected>All Days</option>
            <option value="1">1 Day / wk</option>
            <option value="2">2 Days / wk</option>
            <option value="3">3 Days / wk</option>
          </select>
        </td>
        <td>
          <select class="form-select form-select-sm section-instructor-select" data-subject-id="${s.id}">
            ${teacherOpts}
          </select>
        </td>
      </tr>
    `;
  });

  listEl.innerHTML = html;
}

// --- SINGLE TEACHER MULTI-SECTION ENGINE ---
async function runSingleTeacherScheduler() {
  const subjectTitle = document.getElementById('single-subject').value.trim();
  const courseInput = document.getElementById('single-course').value.trim();
  const yearLevel = parseInt(document.getElementById('single-year').value, 10) || 1;
  const sectionsCount = parseInt(document.getElementById('single-sections').value, 10) || 3;
  const teacherId = document.getElementById('single-mode-teacher').value;
  const daysSetting = document.getElementById('single-days-count') ? document.getElementById('single-days-count').value : "all";

  const logContainer = document.getElementById('autoSchedulerResults');
  const consoleEl = document.getElementById('schedulerConsole');

  if (!subjectTitle || !courseInput || !teacherId) {
    showToast("Please fill in Subject Title, Course, and select an Instructor!", "danger");
    return;
  }

  const teacher = db.instructors.find(t => t.id === teacherId);
  if (!teacher) {
    showToast("Selected teacher not found!", "danger");
    return;
  }

  if (logContainer) logContainer.classList.remove('d-none');
  if (consoleEl) consoleEl.innerHTML = `Starting Single Teacher Generator for <strong>${teacher.name}</strong>: <strong>${subjectTitle}</strong> (${courseInput.toUpperCase()} - ${sectionsCount} sections)...<br>`;

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const createdSubjects = [];

  for (let i = 0; i < sectionsCount; i++) {
    const sectionLetter = alphabet[i] || String(i + 1);
    const sectionCode = `${yearLevel}${sectionLetter}`;

    let existingSub = db.subjects.find(s => 
      s.title_and_code.toLowerCase() === subjectTitle.toLowerCase() && 
      s.course.toLowerCase() === courseInput.toLowerCase() && 
      s.year_level === yearLevel && 
      s.block_section === sectionCode
    );

    if (!existingSub) {
      existingSub = {
        id: 's_single_' + uniqueId(),
        title_and_code: subjectTitle,
        course: courseInput.toUpperCase(),
        year_level: yearLevel,
        block_section: sectionCode,
        units: 3,
        lec_hours: 2,
        lab_hours: 0,
        is_major: 0
      };
      db.subjects.push(existingSub);
    }
    createdSubjects.push(existingSub);
  }

  await saveDatabase();

  const targetDuration = parseFloat(document.getElementById('single-hours') ? document.getElementById('single-hours').value : 1.5) || 1.5;

  const standardTimeSlots = [
    // 3 Hour blocks
    { start: "07:00", end: "10:00", dur: 3 },
    { start: "08:00", end: "11:00", dur: 3 },
    { start: "13:00", end: "16:00", dur: 3 },
    { start: "16:00", end: "19:00", dur: 3 },
    
    // 2 Hour blocks
    { start: "07:00", end: "09:00", dur: 2 },
    { start: "08:00", end: "10:00", dur: 2 },
    { start: "10:00", end: "12:00", dur: 2 },
    { start: "13:00", end: "15:00", dur: 2 },
    { start: "15:00", end: "17:00", dur: 2 },
    { start: "17:00", end: "19:00", dur: 2 },
    { start: "16:00", end: "18:00", dur: 2 },

    // 1.5 Hour blocks
    { start: "07:00", end: "08:30", dur: 1.5 },
    { start: "07:30", end: "09:00", dur: 1.5 },
    { start: "09:00", end: "10:30", dur: 1.5 },
    { start: "10:30", end: "12:00", dur: 1.5 },
    { start: "13:00", end: "14:30", dur: 1.5 },
    { start: "14:30", end: "16:00", dur: 1.5 },
    { start: "16:00", end: "17:30", dur: 1.5 },
    { start: "17:30", end: "19:00", dur: 1.5 },

    // 1 Hour blocks
    { start: "07:00", end: "08:00", dur: 1 },
    { start: "08:00", end: "09:00", dur: 1 },
    { start: "09:00", end: "10:00", dur: 1 },
    { start: "10:00", end: "11:00", dur: 1 },
    { start: "11:00", end: "12:00", dur: 1 },
    { start: "13:00", end: "14:00", dur: 1 },
    { start: "14:00", end: "15:00", dur: 1 },
    { start: "15:00", end: "16:00", dur: 1 },
    { start: "16:00", end: "17:00", dur: 1 },
    { start: "17:00", end: "18:00", dur: 1 },
    { start: "18:00", end: "19:00", dur: 1 }
  ];

  const filteredSlots = standardTimeSlots.filter(s => s.dur === targetDuration).concat(standardTimeSlots.filter(s => s.dur !== targetDuration));
  const standardDays = getFilteredStandardDays(daysSetting);

  let scheduledCount = 0;
  let failedCount = 0;

  for (let subject of createdSubjects) {
    // Check if already scheduled
    if (db.schedules.some(sch => sch.subject_id === subject.id && sch.instructor_id === teacher.id)) {
      consoleEl.innerHTML += `Section <strong>${subject.course} ${subject.block_section}</strong> is already scheduled for ${teacher.name}.<br>`;
      scheduledCount++;
      continue;
    }

    let isScheduled = false;
    const conflictsEncountered = new Set();

    dayLoop:
    for (let day of standardDays) {
      for (let slot of filteredSlots) {
        const candidate = {
          id: 'temp_' + uniqueId(),
          instructor_id: teacher.id,
          room_id: null,
          day,
          time_start: slot.start,
          time_end: slot.end,
          subject_id: subject.id
        };

        const roomsToTry = getPrioritizedRooms(subject, db.rooms);
        const availableRoom = roomsToTry.find(r => {
          candidate.room_id = r.id;
          const validation = validateSchedule(candidate);
          if (validation.valid) {
            return true;
          } else {
            validation.errors.forEach(err => conflictsEncountered.add(err));
            return false;
          }
        });

        if (availableRoom) {
          const newSch = {
            id: uniqueId(),
            instructor_id: teacher.id,
            room_id: availableRoom.id,
            day,
            time_start: slot.start,
            time_end: slot.end,
            subject_id: subject.id
          };
          db.schedules.push(newSch);
          scheduledCount++;
          isScheduled = true;
          consoleEl.innerHTML += `&nbsp;&nbsp;<span class="text-success">✔ Assigned:</span> ${teacher.name} -> ${subject.course} ${subject.block_section} in Room ${availableRoom.name} on ${day} (${slot.start}-${slot.end})<br>`;
          break dayLoop;
        }
      }
    }

    if (!isScheduled) {
      failedCount++;
      consoleEl.innerHTML += `&nbsp;&nbsp;<span class="text-danger">✖ Failed:</span> Could not schedule ${subject.course} ${subject.block_section} for ${teacher.name}.<br>`;
      if (conflictsEncountered.size > 0) {
        consoleEl.innerHTML += `&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-warning fw-bold">Conflicts observed:</span><br>`;
        Array.from(conflictsEncountered).slice(0, 5).forEach(err => {
          consoleEl.innerHTML += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="bi bi-exclamation-triangle text-warning me-1"></i> ${err}<br>`;
        });
      }
    }
  }

  await saveDatabase();
  renderSchedulesTable();
  updateStats();

  const isSuccess = failedCount === 0;
  const alertType = isSuccess ? 'success' : 'warning';
  const alertTitle = isSuccess ? 'Single Teacher Generator Successful!' : 'Single Teacher Generator Finished with Conflicts';
  const alertMsg = `Scheduled ${scheduledCount} out of ${sectionsCount} section(s) for instructor ${teacher.name}.` + 
    (!isSuccess ? ` ${failedCount} section(s) encountered conflicts.` : '');
  
  showGlobalAlert(alertTitle, alertMsg, alertType);
  showToast(alertMsg, isSuccess ? 'success' : 'warning');
}

async function runPerSectionScheduler() {
  const courseEl = document.getElementById('section-course');
  const yearEl = document.getElementById('section-year');
  const blockEl = document.getElementById('section-block');
  const curriculumEl = document.getElementById('section-curriculum');

  if (!courseEl || !yearEl || !blockEl) return;

  const course = courseEl.value;
  const year = parseInt(yearEl.value, 10);
  const block = blockEl.value;
  const curriculum = curriculumEl ? curriculumEl.value : 'new';

  const listEl = document.getElementById('section-subjects-list');
  const selects = listEl ? listEl.querySelectorAll('.section-instructor-select') : [];

  if (selects.length === 0) {
    showToast("No subjects to schedule for selected section!", "danger");
    return;
  }

  // Validate that all subjects have an assigned instructor selected
  let missingInstructor = false;
  selects.forEach(sel => {
    if (!sel.value) missingInstructor = true;
  });

  if (missingInstructor) {
    showToast("Please select an instructor for all subjects in the section before generating!", "danger");
    return;
  }

  const logContainer = document.getElementById('autoSchedulerResults');
  const consoleEl = document.getElementById('schedulerConsole');
  if (logContainer) logContainer.classList.remove('d-none');
  if (consoleEl) consoleEl.innerHTML = `Starting Per-Section Auto-Scheduler for <strong>${course} ${year}${block}</strong> (${curriculum.toUpperCase()} Curriculum)...<br>`;

  let scheduledCount = 0;
  let unscheduledCount = 0;
  window.lastSectionConflictsList = [];

  for (let sel of selects) {
    const subId = sel.getAttribute('data-subject-id');
    const assignedTeacherId = sel.value;
    const sub = db.subjects.find(s => s.id === subId);
    if (!sub) continue;

    // Get number of days setting specific to this subject row
    const daysSelect = listEl ? listEl.querySelector(`.section-days-select[data-subject-id="${subId}"]`) : null;
    const subjectDaysSetting = daysSelect ? daysSelect.value : 'all';

    // Get hours duration setting specific to this subject row
    const hoursSelect = listEl ? listEl.querySelector(`.section-hours-select[data-subject-id="${subId}"]`) : null;
    const rowHours = hoursSelect ? parseFloat(hoursSelect.value) : null;

    // Update target block section
    sub.block_section = block;

    // Prevent duplicate scheduling if subject is already scheduled for this section
    if (db.schedules.some(sch => sch.subject_id === sub.id)) {
      consoleEl.innerHTML += `<span class="text-info">ℹ Already Scheduled:</span> ${sub.title_and_code} (${sub.course} ${year}${block}) is already in schedule.<br>`;
      scheduledCount++;
      continue;
    }

    let teachersToTry = [];
    if (assignedTeacherId) {
      const teacherObj = db.instructors.find(t => t.id === assignedTeacherId);
      if (teacherObj) teachersToTry = [teacherObj];
    } else {
      teachersToTry = [...db.instructors];
    }

    if (teachersToTry.length === 0) {
      consoleEl.innerHTML += `<span class="text-danger">✖ Failed:</span> No instructors available for ${sub.title_and_code}.<br>`;
      unscheduledCount++;
      continue;
    }

    const days = getFilteredStandardDays(subjectDaysSetting);

    const targetDuration = rowHours || (sub.lab_hours > 0 ? 3 : (parseFloat(sub.lec_hours) || 1.5));
    const standardTimeSlots = [
      // 3 Hour blocks
      { start: "07:00", end: "10:00", dur: 3 },
      { start: "08:00", end: "11:00", dur: 3 },
      { start: "13:00", end: "16:00", dur: 3 },
      { start: "16:00", end: "19:00", dur: 3 },
      
      // 2 Hour blocks
      { start: "07:00", end: "09:00", dur: 2 },
      { start: "08:00", end: "10:00", dur: 2 },
      { start: "10:00", end: "12:00", dur: 2 },
      { start: "13:00", end: "15:00", dur: 2 },
      { start: "15:00", end: "17:00", dur: 2 },
      { start: "17:00", end: "19:00", dur: 2 },
      { start: "16:00", end: "18:00", dur: 2 },

      // 1.5 Hour blocks
      { start: "07:00", end: "08:30", dur: 1.5 },
      { start: "07:30", end: "09:00", dur: 1.5 },
      { start: "09:00", end: "10:30", dur: 1.5 },
      { start: "10:30", end: "12:00", dur: 1.5 },
      { start: "13:00", end: "14:30", dur: 1.5 },
      { start: "14:30", end: "16:00", dur: 1.5 },
      { start: "16:00", end: "17:30", dur: 1.5 },
      { start: "17:30", end: "19:00", dur: 1.5 },

      // 1 Hour blocks
      { start: "07:00", end: "08:00", dur: 1 },
      { start: "08:00", end: "09:00", dur: 1 },
      { start: "09:00", end: "10:00", dur: 1 },
      { start: "10:00", end: "11:00", dur: 1 },
      { start: "11:00", end: "12:00", dur: 1 },
      { start: "13:00", end: "14:00", dur: 1 },
      { start: "14:00", end: "15:00", dur: 1 },
      { start: "15:00", end: "16:00", dur: 1 },
      { start: "16:00", end: "17:00", dur: 1 },
      { start: "17:00", end: "18:00", dur: 1 },
      { start: "18:00", end: "19:00", dur: 1 }
    ];

    const timeslots = standardTimeSlots.filter(s => s.dur === targetDuration).concat(standardTimeSlots.filter(s => s.dur !== targetDuration));

    let scheduled = false;

    const sectionConflicts = new Set();

    teacherLoop:
    for (let teacher of teachersToTry) {
      for (let day of days) {
        for (let slot of timeslots) {
          const candidate = {
            id: 'temp_' + uniqueId(),
            instructor_id: teacher.id,
            room_id: null,
            day: day,
            time_start: slot.start,
            time_end: slot.end,
            subject_id: sub.id,
            course: course,
            year_level: year,
            block_section: `${year}${block}`
          };

          const roomsToTry = getPrioritizedRooms(sub, db.rooms);
          const availableRoom = roomsToTry.find(r => {
            candidate.room_id = r.id;
            const validation = validateSchedule(candidate);
            if (validation.valid) {
              return true;
            } else {
              validation.errors.forEach(err => sectionConflicts.add(err));
              return false;
            }
          });

          if (availableRoom) {
            const newSch = {
              id: uniqueId(),
              instructor_id: teacher.id,
              room_id: availableRoom.id,
              day: day,
              time_start: slot.start,
              time_end: slot.end,
              subject_id: sub.id,
              course: course,
              year_level: year,
              block_section: block
            };
            db.schedules.push(newSch);
            scheduledCount++;
            scheduled = true;
            consoleEl.innerHTML += `<span class="text-success">✔ Scheduled:</span> ${sub.title_and_code} (${sub.course} ${year}${block}) with ${teacher.name} in ${availableRoom.name} [${day} ${slot.start}-${slot.end}]<br>`;
            break teacherLoop;
          }
        }
      }
    }

    if (!scheduled) {
      unscheduledCount++;
      const conflictMsg = `Subject "${sub.title_and_code}" (${course} ${year}${block}): Could not find a conflict-free slot.`;
      const reasons = Array.from(sectionConflicts);
      window.lastSectionConflictsList.push({
        subject: sub.title_and_code,
        message: conflictMsg,
        reasons: reasons.length > 0 ? reasons : ["No available teacher/room timeslot combination satisfied constraints."]
      });

      consoleEl.innerHTML += `<span class="text-danger">✖ Failed:</span> No conflict-free slot for ${sub.title_and_code}.<br>`;
      if (sectionConflicts.size > 0) {
        consoleEl.innerHTML += `&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-warning fw-bold">Conflicts observed:</span><br>`;
        reasons.slice(0, 5).forEach(err => {
          consoleEl.innerHTML += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="bi bi-exclamation-triangle text-warning me-1"></i> ${err}<br>`;
        });
      }
    }
  }

  saveDatabase();
  renderSchedulesTable();
  updateStats();

  const viewConflictsBtn = document.getElementById('viewSectionConflictsBtn');
  const conflictCountSpan = document.getElementById('sectionConflictCount');

  if (unscheduledCount > 0) {
    if (viewConflictsBtn) viewConflictsBtn.classList.remove('d-none');
    if (conflictCountSpan) conflictCountSpan.innerText = unscheduledCount;
  } else {
    if (viewConflictsBtn) viewConflictsBtn.classList.add('d-none');
    if (conflictCountSpan) conflictCountSpan.innerText = '0';
  }

  const isSuccess = unscheduledCount === 0;
  const alertType = isSuccess ? 'success' : 'warning';
  const alertTitle = isSuccess ? 'Per-Section Scheduling Successful!' : 'Per-Section Scheduling Finished with Conflicts';
  const alertMsg = `Scheduled ${scheduledCount} out of ${selects.length} subjects for section ${course} ${year}${block}.` + 
    (!isSuccess ? ` ${unscheduledCount} subject(s) could not be scheduled due to teacher, room, time, or section conflicts.` : '');
  
  showGlobalAlert(alertTitle, alertMsg, alertType);
  showToast(alertMsg, isSuccess ? 'success' : 'warning');
}

function openConflictsModal() {
  const modalList = document.getElementById('conflictsModalList');
  if (!modalList) return;

  const conflicts = window.lastSectionConflictsList || [];
  if (conflicts.length === 0) {
    modalList.innerHTML = `<div class="p-3 text-center text-muted">No specific conflicts recorded. All subjects scheduled cleanly.</div>`;
  } else {
    let html = '';
    conflicts.forEach((c, idx) => {
      html += `
        <div class="list-group-item p-3">
          <div class="d-flex w-100 justify-content-between align-items-center mb-1">
            <h6 class="mb-0 fw-bold text-danger"><i class="bi bi-exclamation-circle me-1"></i> ${c.subject}</h6>
            <span class="badge bg-danger">Conflict #${idx + 1}</span>
          </div>
          <p class="mb-2 text-dark small fw-semibold">${c.message}</p>
          <div class="bg-light p-2 rounded border">
            <span class="text-muted small fw-bold d-block mb-1">Observed Constraint Breaches:</span>
            <ul class="mb-0 ps-3 small text-secondary">
              ${c.reasons.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    });
    modalList.innerHTML = html;
  }

  const modalEl = document.getElementById('conflictsModal');
  if (modalEl) {
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }
}

function scrollToSectionLog() {
  openConflictsModal();
}

// Initialize on document load
document.addEventListener('DOMContentLoaded', async () => {
  await loadDatabase();

  // Pre-load logic and first rendering
  populateFormSelects();
  updateStats();
  renderAllViews();
  
  // Tab switch listener for Per-Section tab
  const secTab = document.getElementById('tab-mode-section');
  if (secTab) {
    secTab.addEventListener('shown.bs.tab', loadSectionSubjects);
    secTab.addEventListener('click', loadSectionSubjects);
  }

  // Connect realtime end time calculation
  const startEl = document.getElementById('input-time-start');
  if (startEl) {
    startEl.addEventListener('change', calculateTimeEnd);
  }
});
