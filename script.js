
function getFilteredStandardDays(selectedSetting) {
  const allDays = ["M", "T", "W", "TH", "F", "S", "MT", "TTH", "MWF"];
  if (!selectedSetting || selectedSetting === 'all') return allDays;
  const count = parseInt(selectedSetting, 10);
  if (count === 1) return ["M", "T", "W", "TH", "F", "S"];
  if (count === 2) return ["MT", "TTH"];
  if (count === 3) return ["MWF"];
  return allDays;
}

// Southwestern Institute of Business and Technology (SIBT) Scheduling Logic Engine

// Initialize Database structure
let db = {
  instructors: [],
  rooms: [],
  subjects: [],
  schedules: []
};

let selectedScheduleIds = new Set();
let selectedTeacherIds_manage = new Set();
let selectedSubjectIds = new Set();
let selectedRoomIds = new Set();

let schedulesCurrentPage = 1;
let instructorsCurrentPage = 1;
let subjectsCurrentPage = 1;
let roomsCurrentPage = 1;
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

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === adjustedPage ? 'active' : '';
    navEl.innerHTML += `
      <li class="page-item ${activeClass}">
        <a class="page-link" href="#" onclick="event.preventDefault(); ${changePageFuncName}(${i})">${i}</a>
      </li>
    `;
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
  instructors: [
    {
      id: "t1",
      name: "KENT LIWANAGAN",
      designation: "Regular Teacher", // Limit: 24 units
      degree: "College Faculty",
      area: "ACADEMICS",
      employee_no: "0105",
      effectivity_date: "July 13, 2026",
      admin_load: "",
      max_units: 24
    },
    {
      id: "t2",
      name: "GERARDO MICIANO",
      designation: "Program Head", // Limit: 18 units
      degree: "BSIT",
      area: "ADMINISTRATION",
      employee_no: "0321",
      effectivity_date: "June 23, 2026",
      admin_load: "CIT Program Head",
      max_units: 18
    },
    {
      id: "t3",
      name: "CAREN ROSE L TOJEDO, LPT., MAED.",
      designation: "Director", // Limit: 15 units
      degree: "Dean of Academics",
      area: "ACADEMICS",
      employee_no: "0001",
      effectivity_date: "June 01, 2026",
      admin_load: "Dean of Academics",
      max_units: 15
    },
    {
      id: "t4",
      name: "MAILA M MORALES, LPT., CHRA",
      designation: "Admin", // Limit: 9 units
      degree: "HRD Director",
      area: "ADMINISTRATION",
      employee_no: "0002",
      effectivity_date: "July 01, 2026",
      admin_load: "HRD Director",
      max_units: 9
    }
  ],
  rooms: [
    { id: "r1", name: "COMLAB", room_type: "Laboratory" },
    { id: "r2", name: "CRIMLAB", room_type: "Laboratory" },
    { id: "r3", name: "203", room_type: "Lecture" },
    { id: "r4", name: "204", room_type: "Lecture" },
    { id: "r5", name: "205", room_type: "Lecture" },
    { id: "r6", name: "206", room_type: "Lecture" },
    { id: "r7", name: "207", room_type: "Lecture" },
    { id: "r8", name: "208", room_type: "Lecture" },
    { id: "r9", name: "HS-101", room_type: "Lecture" },
    { id: "r10", name: "HS-102", room_type: "Lecture" },
    { id: "r11", name: "HS-103", room_type: "Lecture" },
    { id: "r12", name: "HS-104", room_type: "Lecture" },
    { id: "r13", name: "HS-105", room_type: "Lecture" },
    { id: "r14", name: "HS-106", room_type: "Lecture" },
    { id: "r15", name: "HS-107", room_type: "Lecture" },
    { id: "r16", name: "HS-108", room_type: "Lecture" },
    { id: "r17", name: "HS-109", room_type: "Lecture" },
    { id: "r18", name: "HS110", room_type: "Lecture" },
    { id: "r19", name: "Library 1", room_type: "Special Room" },
    { id: "r20", name: "Library 2", room_type: "Special Room" },
    { id: "r21", name: "TBL Room", room_type: "Special Room" }
  ],
    subjects: [
    {"id": "bsit_new_1", "title_and_code": "GE 101 - Understanding The Self", "course": "BSIT", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_2", "title_and_code": "GE 102 - Siring Ng Pakipagtalastasan", "course": "BSIT", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_3", "title_and_code": "GE EL 101 - Entrepreneurial Mind", "course": "BSIT", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_4", "title_and_code": "COMP 101 - Introduction to Computing", "course": "BSIT", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_5", "title_and_code": "COMP 102 - Computer Programming 1", "course": "BSIT", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_6", "title_and_code": "PATHFIT 1 - Physical Fitness", "course": "BSIT", "year_level": 1, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_7", "title_and_code": "NSTP 1 - National Service Training Program 1", "course": "BSIT", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_8", "title_and_code": "GE 103 - Mathematics in the Modern World", "course": "BSIT", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_9", "title_and_code": "GE 104 - Purposive Communication", "course": "BSIT", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_10", "title_and_code": "GE 105 - Pagbasa At Pagsulat Sa Ibat-Ibang Disiplina", "course": "BSIT", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_11", "title_and_code": "COMP 103 - Computer Programming 2", "course": "BSIT", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_12", "title_and_code": "PATHFIT 2 - Rhythmic Activities", "course": "BSIT", "year_level": 1, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_13", "title_and_code": "NSTP 2 - National Service Training Program 2", "course": "BSIT", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_14", "title_and_code": "IT 101 - Data Structures and Algorithms", "course": "BSIT", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_15", "title_and_code": "GE 106 - Science, Technology and Society", "course": "BSIT", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_16", "title_and_code": "GE 107 - The Contemporary World", "course": "BSIT", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_17", "title_and_code": "GE EL 102 - Philippine Literature", "course": "BSIT", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_18", "title_and_code": "IT 102 - Information Management (Database)", "course": "BSIT", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_19", "title_and_code": "IT 103 - Object-Oriented Programming", "course": "BSIT", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_20", "title_and_code": "PATHFIT 3 - Dual Sports and Games", "course": "BSIT", "year_level": 2, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_21", "title_and_code": "IT 104 - Networking 1 (Fundamentals)", "course": "BSIT", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_22", "title_and_code": "GE 108 - Ethics", "course": "BSIT", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_23", "title_and_code": "GE 109 - Readings On Philippine History", "course": "BSIT", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_24", "title_and_code": "GE 110 - Art Appreciation", "course": "BSIT", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_25", "title_and_code": "IT 105 - Web Systems and Technologies", "course": "BSIT", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_26", "title_and_code": "IT 106 - Networking 2 (Advanced)", "course": "BSIT", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_27", "title_and_code": "PATHFIT 4 - Team Sports and Games", "course": "BSIT", "year_level": 2, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_28", "title_and_code": "IT 107 - Systems Analysis and Design", "course": "BSIT", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_29", "title_and_code": "GE 111 - Statistics", "course": "BSIT", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_30", "title_and_code": "RZL - Life and Works of Rizal", "course": "BSIT", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsit_new_31", "title_and_code": "IT 108 - Mobile Application Development", "course": "BSIT", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_32", "title_and_code": "IT 109 - Information Assurance and Security 1", "course": "BSIT", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_33", "title_and_code": "IT 110 - Capstone Project 1", "course": "BSIT", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_34", "title_and_code": "IT 111 - Human Computer Interaction", "course": "BSIT", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_35", "title_and_code": "IT 112 - Information Assurance and Security 2", "course": "BSIT", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_36", "title_and_code": "IT 113 - Capstone Project 2", "course": "BSIT", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_37", "title_and_code": "IT 114 - Systems Integration and Architecture", "course": "BSIT", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_38", "title_and_code": "IT 115 - Social and Professional Issues in IT", "course": "BSIT", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_39", "title_and_code": "IT 116 - Advanced Database Systems", "course": "BSIT", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsit_new_40", "title_and_code": "IT 117 - Practicum / Internship (486 Hours)", "course": "BSIT", "year_level": 4, "semester": 1, "units": 6, "lec_hours": 6, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_1", "title_and_code": "GE 101 - Understanding The Self", "course": "BEED", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_2", "title_and_code": "GE 102 - Siring Ng Pakipagtalastasan", "course": "BEED", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_3", "title_and_code": "GE EL 101 - Entrepreneurial Mind", "course": "BEED", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_4", "title_and_code": "GE EL 102 - Philippine Literature", "course": "BEED", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_5", "title_and_code": "MATH 101 - College Algebra", "course": "BEED", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_6", "title_and_code": "PATHFIT 1 - Physical Fitness", "course": "BEED", "year_level": 1, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_7", "title_and_code": "NSTP 1 - National Service Training Program 1", "course": "BEED", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_8", "title_and_code": "EDUC 1 - The Child and Adolescent Learners and Learning Principles", "course": "BEED", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_9", "title_and_code": "GE 103 - Mathematics in the Modern World", "course": "BEED", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_10", "title_and_code": "GE 104 - Purposive Communication", "course": "BEED", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_11", "title_and_code": "GE 105 - Pagbasa At Pagsulat Sa Ibat-Ibang Disiplina", "course": "BEED", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_12", "title_and_code": "COMP 101 - Computer 1", "course": "BEED", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_13", "title_and_code": "PATHFIT 2 - Rhythmic Activities", "course": "BEED", "year_level": 1, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_14", "title_and_code": "NSTP 2 - National Service Training Program 2", "course": "BEED", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_15", "title_and_code": "EDUC 2 - The Teaching Profession", "course": "BEED", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_16", "title_and_code": "EDUC 3 - The Teacher and the Community, School Culture and Organizational Leadership", "course": "BEED", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_17", "title_and_code": "GE 106 - Science, Technology and Society", "course": "BEED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_18", "title_and_code": "GE 107 - The Contemporary World", "course": "BEED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_19", "title_and_code": "GE EL 103 - Indigenous Creative Arts", "course": "BEED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_20", "title_and_code": "PATHFIT 3 - Dual Sports and Games", "course": "BEED", "year_level": 2, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_21", "title_and_code": "EDUC 4 - Foundation of Special and Inclusive Education", "course": "BEED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_22", "title_and_code": "EED 1 - Teaching Math in the Primary Grades", "course": "BEED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_23", "title_and_code": "EED 2 - Teaching Social Studies in Elementary Grades (Culture and Geography)", "course": "BEED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_24", "title_and_code": "EED 3 - Pagtuturo ng Filipino sa Elementatya (I) - Estruktura at Gamit ng Wikang Filipino", "course": "BEED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_25", "title_and_code": "EED 4 - Teaching Science in Elementary Grades (Biology and Chemistry)", "course": "BEED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_26", "title_and_code": "GE 108 - Ethics", "course": "BEED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_27", "title_and_code": "GE 109 - Readings On Philippine History", "course": "BEED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_28", "title_and_code": "GE 110 - Art Appreciation", "course": "BEED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_29", "title_and_code": "PATHFIT 4 - Team Sports and Games", "course": "BEED", "year_level": 2, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_30", "title_and_code": "EDUC 5 - Facilitating Learner-Centered Teaching", "course": "BEED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_31", "title_and_code": "EED 5 - Teaching Music in Elementary Grades", "course": "BEED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_32", "title_and_code": "EED 6 - Teaching Arts in the Elementary Grades", "course": "BEED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_33", "title_and_code": "EED 7 - Teaching Physical Education and Health in Elementary Grades", "course": "BEED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_34", "title_and_code": "EED 8 - Pagtuturo ng Filipino sa Elementary (II) - Panitikan ng Pilipinas", "course": "BEED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_35", "title_and_code": "GE 111 - Statistics", "course": "BEED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_36", "title_and_code": "RZL - Life and Works of Rizal", "course": "BEED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "beed_new_37", "title_and_code": "EDUC 6 - Assessment in Learning 1", "course": "BEED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_38", "title_and_code": "EDUC 7 - Technology for Teaching and Learning 1", "course": "BEED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_39", "title_and_code": "EDUC 8 - Curriculum Development and Evaluation", "course": "BEED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_40", "title_and_code": "EED 9 - Teaching Science in Elementary Grades (Physics, Earth and Space Science)", "course": "BEED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_41", "title_and_code": "EED 10 - Teaching Math in the Intermediate Grades", "course": "BEED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_42", "title_and_code": "EED 11 - Good Manners and Right Conduct (GMRC)", "course": "BEED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_43", "title_and_code": "EDUC 9 - Assessment in Learning 2", "course": "BEED", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_44", "title_and_code": "EDUC 10 - Building and Enhancing New Literacies Across Curriculum", "course": "BEED", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_45", "title_and_code": "EDUC 11 - Research in Education 1", "course": "BEED", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_46", "title_and_code": "EED 12 - Teaching English in the Elementary Grades (Language Arts)", "course": "BEED", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_47", "title_and_code": "EED 13 - Teaching Social Studies in Elementary Grades (Philippine History and Government)", "course": "BEED", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_48", "title_and_code": "EED 14 - Technology for Teaching and Learning 2", "course": "BEED", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_49", "title_and_code": "EED 15 - Teaching English in the Elementary Grades through Literature", "course": "BEED", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_50", "title_and_code": "EED 16 - Research in Education 2", "course": "BEED", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_51", "title_and_code": "EDUC 12 - Field Study 1 (Observation of Teaching-Learning in Actual School Environment)", "course": "BEED", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_52", "title_and_code": "EDUC 13 - Field Study 2 (Participation and Teaching Assistantship)", "course": "BEED", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "beed_new_53", "title_and_code": "EDUC 14 - Teaching Internship", "course": "BEED", "year_level": 4, "semester": 2, "units": 6, "lec_hours": 6, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_1", "title_and_code": "GE 101 - Understanding The Self", "course": "BSED", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_2", "title_and_code": "GE 102 - Siring Ng Pakipagtalastasan", "course": "BSED", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_3", "title_and_code": "GE EL 101 - Entrepreneurial Mind", "course": "BSED", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_4", "title_and_code": "GE EL 102 - Philippine Literature", "course": "BSED", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_5", "title_and_code": "MATH 101 - College Algebra", "course": "BSED", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_6", "title_and_code": "PATHFIT 1 - Physical Fitness", "course": "BSED", "year_level": 1, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_7", "title_and_code": "NSTP 1 - National Service Training Program 1", "course": "BSED", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_8", "title_and_code": "EDUC 1 - The Child and Adolescent Learners and Learning Principles", "course": "BSED", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_9", "title_and_code": "GE 103 - Mathematics in the Modern World", "course": "BSED", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_10", "title_and_code": "GE 104 - Purposive Communication", "course": "BSED", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_11", "title_and_code": "GE 105 - Pagbasa At Pagsulat Sa Ibat-Ibang Disiplina", "course": "BSED", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_12", "title_and_code": "COMP 101 - Computer 1", "course": "BSED", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_13", "title_and_code": "PATHFIT 2 - Rhythmic Activities", "course": "BSED", "year_level": 1, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_14", "title_and_code": "NSTP 2 - National Service Training Program 2", "course": "BSED", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_15", "title_and_code": "EDUC 2 - The Teaching Profession", "course": "BSED", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_16", "title_and_code": "EDUC 3 - The Teacher and the Community, School Culture and Organizational Leadership", "course": "BSED", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_17", "title_and_code": "GE 106 - Science, Technology and Society", "course": "BSED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_18", "title_and_code": "GE 107 - The Contemporary World", "course": "BSED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_19", "title_and_code": "GE EL 103 - Indigenous Creative Arts", "course": "BSED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_20", "title_and_code": "PATHFIT 3 - Dual Sports and Games", "course": "BSED", "year_level": 2, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_21", "title_and_code": "EDUC 4 - Foundation of Special and Inclusive Education", "course": "BSED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_22", "title_and_code": "ENG 101 - Anatomy and Structure of English", "course": "BSED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_23", "title_and_code": "ENG 102 - Introduction to Linguistics", "course": "BSED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_24", "title_and_code": "ENG 103 - Mythology and Folklore", "course": "BSED", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_25", "title_and_code": "GE 108 - Ethics", "course": "BSED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_26", "title_and_code": "GE 109 - Readings On Philippine History", "course": "BSED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_27", "title_and_code": "GE 110 - Art Appreciation", "course": "BSED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_28", "title_and_code": "PATHFIT 4 - Team Sports and Games", "course": "BSED", "year_level": 2, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_29", "title_and_code": "EDUC 5 - Facilitating Learner-Centered Teaching", "course": "BSED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_30", "title_and_code": "ENG 104 - Language, Culture and Society", "course": "BSED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_31", "title_and_code": "ENG 105 - Teaching and Assessment of Macro Skills", "course": "BSED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_32", "title_and_code": "ENG 106 - Speech and Theater Arts", "course": "BSED", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_33", "title_and_code": "GE 111 - Statistics", "course": "BSED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_34", "title_and_code": "RZL - Life and Works of Rizal", "course": "BSED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsed_new_35", "title_and_code": "EDUC 6 - Assessment in Learning 1", "course": "BSED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_36", "title_and_code": "EDUC 7 - Technology for Teaching and Learning 1", "course": "BSED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_37", "title_and_code": "EDUC 8 - Curriculum Development and Evaluation", "course": "BSED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_38", "title_and_code": "ENG 107 - Teaching and Assessment of Grammar", "course": "BSED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_39", "title_and_code": "ENG 108 - Teaching and Assessment of Literature Studies", "course": "BSED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_40", "title_and_code": "ENG 109 - Literary Criticism", "course": "BSED", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_41", "title_and_code": "EDUC 9 - Assessment in Learning 2", "course": "BSED", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_42", "title_and_code": "EDUC 10 - Building and Enhancing New Literacies Across Curriculum", "course": "BSED", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_43", "title_and_code": "EDUC 11 - Research in Education 1", "course": "BSED", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_44", "title_and_code": "ENG 110 - Technology for Teaching and Learning 2 (Language Education)", "course": "BSED", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_45", "title_and_code": "ENG 111 - Campus Journalism", "course": "BSED", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_46", "title_and_code": "ENG 112 - Research in Education 2 (English Specialization)", "course": "BSED", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_47", "title_and_code": "EDUC 12 - Field Study 1 (Observation of Teaching-Learning in Actual School Environment)", "course": "BSED", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_48", "title_and_code": "EDUC 13 - Field Study 2 (Participation and Teaching Assistantship)", "course": "BSED", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsed_new_49", "title_and_code": "EDUC 14 - Teaching Internship", "course": "BSED", "year_level": 4, "semester": 2, "units": 6, "lec_hours": 6, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsca_new_1", "title_and_code": "GE 101 - Understanding The Self", "course": "BSCA", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_2", "title_and_code": "GE 102 - Siring Ng Pakipagtalastasan", "course": "BSCA", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_3", "title_and_code": "GE EL 101 - Entrepreneurial Mind", "course": "BSCA", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_4", "title_and_code": "CA 101 - Customs Laws, Rules and Regulations", "course": "BSCA", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsca_new_5", "title_and_code": "COMP 101 - Computer 1", "course": "BSCA", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_6", "title_and_code": "PATHFIT 1 - Physical Fitness", "course": "BSCA", "year_level": 1, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_7", "title_and_code": "NSTP 1 - National Service Training Program 1", "course": "BSCA", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_8", "title_and_code": "GE 103 - Mathematics in the Modern World", "course": "BSCA", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_9", "title_and_code": "GE 104 - Purposive Communication", "course": "BSCA", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_10", "title_and_code": "GE 105 - Pagbasa At Pagsulat Sa Ibat-Ibang Disiplina", "course": "BSCA", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_11", "title_and_code": "CA 102 - Tariff Laws, Rules and Regulations", "course": "BSCA", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsca_new_12", "title_and_code": "PATHFIT 2 - Rhythmic Activities", "course": "BSCA", "year_level": 1, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_13", "title_and_code": "NSTP 2 - National Service Training Program 2", "course": "BSCA", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_14", "title_and_code": "BUS CORE 111 - Basic Microeconomics", "course": "BSCA", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_15", "title_and_code": "GE 106 - Science, Technology and Society", "course": "BSCA", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_16", "title_and_code": "GE 107 - The Contemporary World", "course": "BSCA", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_17", "title_and_code": "GE EL 102 - Philippine Literature", "course": "BSCA", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_18", "title_and_code": "GE EL 103 - Indigenous Creative Arts", "course": "BSCA", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_19", "title_and_code": "CA 103 - Customs Clearance and Documentation", "course": "BSCA", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsca_new_20", "title_and_code": "PATHFIT 3 - Dual Sports and Games", "course": "BSCA", "year_level": 2, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_21", "title_and_code": "BME 141 - Operations Management (Tqm)", "course": "BSCA", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_22", "title_and_code": "GE 108 - Ethics", "course": "BSCA", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_23", "title_and_code": "GE 109 - Readings On Philippine History", "course": "BSCA", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_24", "title_and_code": "GE 110 - Art Appreciation", "course": "BSCA", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_25", "title_and_code": "CA 104 - International Trade and Logistics", "course": "BSCA", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsca_new_26", "title_and_code": "PATHFIT 4 - Team Sports and Games", "course": "BSCA", "year_level": 2, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_27", "title_and_code": "BUSCORE 112 - Business Law (Obligation And Contracts)", "course": "BSCA", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_28", "title_and_code": "BUSCORE 113 - Good Governance And Social Responsibility", "course": "BSCA", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_29", "title_and_code": "GE 111 - Statistics", "course": "BSCA", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_30", "title_and_code": "RZL - Life and Works of Rizal", "course": "BSCA", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_31", "title_and_code": "CA 105 - Customs Brokerage Practice and Ethics", "course": "BSCA", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsca_new_32", "title_and_code": "CA 106 - Warehousing Operations and Management", "course": "BSCA", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsca_new_33", "title_and_code": "CA 107 - Supply Chain Management", "course": "BSCA", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsca_new_34", "title_and_code": "BUSCORE 116 - Business Research", "course": "BSCA", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_35", "title_and_code": "CA 108 - Export-Import Management and Documentation", "course": "BSCA", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsca_new_36", "title_and_code": "CA 109 - Customs Valuation and Classification", "course": "BSCA", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsca_new_37", "title_and_code": "CA 110 - Research in Customs Administration 1", "course": "BSCA", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsca_new_38", "title_and_code": "BME 142 - Strategic Management", "course": "BSCA", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_39", "title_and_code": "BUSCORE 117 - International Business And Trade", "course": "BSCA", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsca_new_40", "title_and_code": "CA 111 - Research in Customs Administration 2", "course": "BSCA", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsca_new_41", "title_and_code": "CA 112 - Practicum / Internship (300 Hours)", "course": "BSCA", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsca_new_42", "title_and_code": "CA 113 - Customs Brokerage Integration and Review", "course": "BSCA", "year_level": 4, "semester": 2, "units": 6, "lec_hours": 6, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_1", "title_and_code": "GE 101 - Understanding The Self", "course": "BSCRIM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_2", "title_and_code": "GE 106 - Science, Technology and Society", "course": "BSCRIM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_3", "title_and_code": "LEA 1 - Law Enforcement Organization and Administration (Inter-Agency Approach)", "course": "BSCRIM", "year_level": 1, "semester": 1, "units": 4, "lec_hours": 4, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_4", "title_and_code": "CFLM-1 - Character Formation, Nationalism and Patriotism", "course": "BSCRIM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_5", "title_and_code": "GE EL 105 - Gender and Society", "course": "BSCRIM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_6", "title_and_code": "CRIM 1 - Introduction to Criminology", "course": "BSCRIM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_7", "title_and_code": "CLJ 1 - Introduction to Philippine Criminal Justice System", "course": "BSCRIM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_8", "title_and_code": "NSTP 1 - Reserve Officers' Training Corps 1 / CWTS 1", "course": "BSCRIM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_9", "title_and_code": "PATHFIT 1 - Fundamentals of Marksmanship / Physical Fitness", "course": "BSCRIM", "year_level": 1, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_10", "title_and_code": "CRIM 2 - Theories of Crime Causation", "course": "BSCRIM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_11", "title_and_code": "GE 103 - Mathematics In Modern World (Plane Trigonometry)", "course": "BSCRIM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_12", "title_and_code": "GE 104 - Purposive Communication", "course": "BSCRIM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_13", "title_and_code": "GE EL 1 - Advanced Computer", "course": "BSCRIM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_14", "title_and_code": "GE 108 - Ethics", "course": "BSCRIM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_15", "title_and_code": "CRIM 3 - Human Behavior and Victimology", "course": "BSCRIM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_16", "title_and_code": "LEA 2 - Comparative Models in Policing", "course": "BSCRIM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_17", "title_and_code": "CDI 1 - Fundamentals Of Investigation and Intelligence", "course": "BSCRIM", "year_level": 1, "semester": 2, "units": 4, "lec_hours": 4, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_18", "title_and_code": "NSTP 2 - Reserve Officers' Training Corps 2", "course": "BSCRIM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_19", "title_and_code": "PATHFIT 2 - Arnis And Disarming Technique", "course": "BSCRIM", "year_level": 1, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_20", "title_and_code": "CFLM 2 - Character Formation w/ Leadership, Decision Making, Management and Administration", "course": "BSCRIM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_21", "title_and_code": "LEA 3 - Introduction to Industrial Security Concepts", "course": "BSCRIM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_22", "title_and_code": "GE 107 - The Contemporary World", "course": "BSCRIM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_23", "title_and_code": "CRIM 4 - Professional Conduct and Ethical Standards", "course": "BSCRIM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_24", "title_and_code": "CA 1 - Institutional Corrections", "course": "BSCRIM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_25", "title_and_code": "FORENSIC 1 - Forensic Photography", "course": "BSCRIM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_26", "title_and_code": "CDI 2 - Specialized Crime Investigation 1 With Legal Medicine", "course": "BSCRIM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_27", "title_and_code": "CRIM 5 - Juvenile Delinquency and Juvenile Justice System", "course": "BSCRIM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_28", "title_and_code": "LEA 4 - Law Enforcement Operations and Planning with Crime Mapping", "course": "BSCRIM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_29", "title_and_code": "PATHFIT 3 - First Aid and Water Safety", "course": "BSCRIM", "year_level": 2, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_30", "title_and_code": "RZL - Life and Works of Rizal", "course": "BSCRIM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_31", "title_and_code": "GE 109 - Readings On Philippine History", "course": "BSCRIM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_32", "title_and_code": "GE 110 - Art Appreciation", "course": "BSCRIM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_33", "title_and_code": "GE EL 2 - Information Assistance & Security", "course": "BSCRIM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_34", "title_and_code": "ADGE - General Chemistry (Organic)", "course": "BSCRIM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_35", "title_and_code": "FORENSIC 2 - Personal Identification Techniques", "course": "BSCRIM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_36", "title_and_code": "CDI 3 - Specialized Crime Investigation 2 With Simulation on Interrogation & Interview", "course": "BSCRIM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_37", "title_and_code": "CA 2 - Non-Institutional Corrections", "course": "BSCRIM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_38", "title_and_code": "CDI 4 - Traffic Management and Accident Investigation with Driving", "course": "BSCRIM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_39", "title_and_code": "PATHFIT 4 - Fundamentals of Marksmanship", "course": "BSCRIM", "year_level": 2, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_40", "title_and_code": "CDI 5 - Technical English 1 (Technical Report Writing)", "course": "BSCRIM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_41", "title_and_code": "CLJ 2 - Human Rights Education", "course": "BSCRIM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_42", "title_and_code": "CLJ 3 - Criminal Law (Book 1)", "course": "BSCRIM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_43", "title_and_code": "FORENSIC 3 - Lie Detection and Interrogation", "course": "BSCRIM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_44", "title_and_code": "STAT 111 - Statistics", "course": "BSCRIM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bscrim_new_45", "title_and_code": "FORENSIC 4 - Forensic Chemistry and Toxicology", "course": "BSCRIM", "year_level": 3, "semester": 1, "units": 5, "lec_hours": 3, "lab_hours": 2, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_46", "title_and_code": "CRIM 7 - Criminological Research 1 (Research Methods and Applied Statistics)", "course": "BSCRIM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_47", "title_and_code": "CA 3 - Therapeutic Modalities", "course": "BSCRIM", "year_level": 3, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_48", "title_and_code": "FORENSIC 5 - Questioned Document Examination", "course": "BSCRIM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_49", "title_and_code": "EHC 1 - Criminology Enhancement Course 1", "course": "BSCRIM", "year_level": 3, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_50", "title_and_code": "CRIM 8 - Criminological Research 2 (Thesis Writing and Presentation)", "course": "BSCRIM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_51", "title_and_code": "CLJ 4 - Criminal Law (Book 2)", "course": "BSCRIM", "year_level": 3, "semester": 2, "units": 4, "lec_hours": 4, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_52", "title_and_code": "CRIM 6 - Dispute Resolution and Crises/Incidents Management", "course": "BSCRIM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_53", "title_and_code": "FORENSIC 6 - Forensic Ballistics", "course": "BSCRIM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_54", "title_and_code": "CDI 6 - Fire Protection and Arson Investigation", "course": "BSCRIM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_55", "title_and_code": "CDI 9 - Introduction To Cybercrime and Environmental Laws and Protection", "course": "BSCRIM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_56", "title_and_code": "EHC 2 - Criminology Enhancement Course 2", "course": "BSCRIM", "year_level": 3, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_57", "title_and_code": "CDI 7 - Vice And Drug Education and Control", "course": "BSCRIM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_58", "title_and_code": "CDI 8 - Technical English 2 (Legal Forms)", "course": "BSCRIM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_59", "title_and_code": "CLJ 5 - Evidence", "course": "BSCRIM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_60", "title_and_code": "CP 1 - Internship (On-The Job Training 1) 270 hours", "course": "BSCRIM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 0, "lab_hours": 3, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_61", "title_and_code": "CLJ 6 - Criminal Procedure And Court Testimony", "course": "BSCRIM", "year_level": 4, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bscrim_new_62", "title_and_code": "CP 2 - Internship (On-The Job Training) 270 hours", "course": "BSCRIM", "year_level": 4, "semester": 2, "units": 3, "lec_hours": 0, "lab_hours": 3, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_1", "title_and_code": "GE 101 - Understanding The Self", "course": "BSHM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_2", "title_and_code": "GE 102 - Siring Ng Pakipagtalastasan", "course": "BSHM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_3", "title_and_code": "GE EL 101 - Entrepreneurial Mind", "course": "BSHM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_4", "title_and_code": "NABMB 153 - Business Finance (For Non-Abm)", "course": "BSHM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_5", "title_and_code": "COMP 101 - Computer 1", "course": "BSHM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_6", "title_and_code": "PATHFIT 1 - Physical Fitness", "course": "BSHM", "year_level": 1, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_7", "title_and_code": "NSTP 1 - National Service Training Program 1", "course": "BSHM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_8", "title_and_code": "THC 111 - Philippine Culture and Tourism Geography", "course": "BSHM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_9", "title_and_code": "BME 141 - Operations Management", "course": "BSHM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_10", "title_and_code": "GE 103 - Mathematics in The Modern World", "course": "BSHM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_11", "title_and_code": "GE 104 - Purposive Communication", "course": "BSHM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_12", "title_and_code": "GE 105 - Pagbasa At Pagsulat Sa Ibat-Ibang Disiplina", "course": "BSHM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_13", "title_and_code": "HPC 121 - Kitchen Essentials And Basic Food Preparations", "course": "BSHM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_14", "title_and_code": "COMP 102 - Advance Computer", "course": "BSHM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_15", "title_and_code": "PATHFIT 2 - Rhythmic Activities", "course": "BSHM", "year_level": 1, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_16", "title_and_code": "NSTP 2 - National Service Training Program 2", "course": "BSHM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_17", "title_and_code": "THC 112 - Risk Management As Applied To Safety, Security And Sanitation", "course": "BSHM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_18", "title_and_code": "NABMB 152 - Business Marketing", "course": "BSHM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_19", "title_and_code": "GE 106 - Science, Technology and Society", "course": "BSHM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_20", "title_and_code": "GE 107 - The Contemporary World", "course": "BSHM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_21", "title_and_code": "GE EL 102 - Philippine Literature", "course": "BSHM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_22", "title_and_code": "GE EL 103 - Indigenous Creative Arts", "course": "BSHM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_23", "title_and_code": "PATHFIT 3 - Dual Sports and Games", "course": "BSHM", "year_level": 2, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_24", "title_and_code": "THC 113 - Quality Service Management in Tourism and Hospitality", "course": "BSHM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_25", "title_and_code": "NABMB 154 - Applied Economics (For Non-Abm)", "course": "BSHM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_26", "title_and_code": "RZL - Life And Works Of Rizal", "course": "BSHM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_27", "title_and_code": "GE 108 - Ethics", "course": "BSHM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_28", "title_and_code": "GE 109 - Readings On Philippine History", "course": "BSHM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_29", "title_and_code": "GE 110 - Art Appreciation", "course": "BSHM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_30", "title_and_code": "PATHFIT 4 - Team Sports And Games", "course": "BSHM", "year_level": 2, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_31", "title_and_code": "THC 114 - Legal Aspects in Tourism and Hospitality", "course": "BSHM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_32", "title_and_code": "HPC 122 - Fundamentals Is In Food Service Operation", "course": "BSHM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 1, "lab_hours": 2, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_33", "title_and_code": "HMPE 131 - Culinary Arts", "course": "BSHM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_34", "title_and_code": "BME 142 - Strategic Management", "course": "BSHM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_35", "title_and_code": "GE 111 - Statistics", "course": "BSHM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_36", "title_and_code": "THC 115 - Macro Perspective of Tourism and Hospitality", "course": "BSHM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_37", "title_and_code": "THC 116 - Professional Development and Applied Ethics", "course": "BSHM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_38", "title_and_code": "HPC 123 - Fundamentals In Lodging Operations", "course": "BSHM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_39", "title_and_code": "HMPE 132 - Food And Beverage Operation", "course": "BSHM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_40", "title_and_code": "HMPE 133 - Housekeeping Operations", "course": "BSHM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_41", "title_and_code": "NABMB 155 - Fundamentals Of Accounting (For Non-Abm)", "course": "BSHM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bshm_new_42", "title_and_code": "RESEARCH 1 - Hospitality Research 1", "course": "BSHM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_43", "title_and_code": "THC 117 - Multicultural Diversity in Workplace for The Tourism Professional", "course": "BSHM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_44", "title_and_code": "THC 118 - Micro Perspective of Tourism and Hospitality", "course": "BSHM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_45", "title_and_code": "HPC 124 - Applied Business Tools and Technologies", "course": "BSHM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_46", "title_and_code": "HMPE 134 - Front Office Operation", "course": "BSHM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_47", "title_and_code": "HMPE 135 - Room Division Management", "course": "BSHM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_48", "title_and_code": "HPC 125 - Supply Chain Management in Hospitality Industry", "course": "BSHM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_49", "title_and_code": "HPC 128 - Foreign Language 1", "course": "BSHM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_50", "title_and_code": "RESEARCH 2 - Hospitality Research 2", "course": "BSHM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_51", "title_and_code": "HPC 126 - Introduction To Meetings, Incentives, Conferences and Events Management (MICE) (Events Mgt - NC III)", "course": "BSHM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_52", "title_and_code": "HPC 127 - Ergonomics And Facilities Planning for The Hospitality Industry", "course": "BSHM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_53", "title_and_code": "HPC 129 - Foreign Language 2", "course": "BSHM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_54", "title_and_code": "THC 119 - Tourism And Hospitality Marketing", "course": "BSHM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_55", "title_and_code": "THC 120 - Entrepreneurship In Tourism and Hospitality", "course": "BSHM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bshm_new_56", "title_and_code": "INT - INTERNSHIP/PRACTICUM (600 HRS)", "course": "BSHM", "year_level": 4, "semester": 2, "units": 6, "lec_hours": 0, "lab_hours": 6, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_1", "title_and_code": "GE 101 - Understanding The Self", "course": "BSBA-FM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_2", "title_and_code": "GE EL 101 - Entrepreneurial Mind", "course": "BSBA-FM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_3", "title_and_code": "GE EL 102 - Philippine Literature", "course": "BSBA-FM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_4", "title_and_code": "PROF COR FM 121 - Financial Management", "course": "BSBA-FM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_5", "title_and_code": "BUS CORE 111 - Basic Microeconomics", "course": "BSBA-FM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_6", "title_and_code": "PATHFIT 1 - Physical Fitness", "course": "BSBA-FM", "year_level": 1, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_7", "title_and_code": "NSTP 1 - National Service Training Program 1", "course": "BSBA-FM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_8", "title_and_code": "GE 103 - Mathematics in Modern World", "course": "BSBA-FM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_9", "title_and_code": "GE 104 - Purposive Communication", "course": "BSBA-FM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_10", "title_and_code": "GE 108 - Ethics", "course": "BSBA-FM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_11", "title_and_code": "FM ELEC 131 - Personal Finance", "course": "BSBA-FM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_12", "title_and_code": "BUS CORE 112 - Business Law (Obligation And Contracts)", "course": "BSBA-FM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_13", "title_and_code": "PATHFIT 2 - Rhythmic Activities", "course": "BSBA-FM", "year_level": 1, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_14", "title_and_code": "NSTP 2 - National Service Training Program 2", "course": "BSBA-FM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_15", "title_and_code": "GE 106 - Science, Technology and Society", "course": "BSBA-FM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_16", "title_and_code": "GE 107 - The Contemporary World", "course": "BSBA-FM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_17", "title_and_code": "GE EL 103 - Indigenous Creative Arts", "course": "BSBA-FM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_18", "title_and_code": "PROF COR FM 122 - Banking And Financial Institutions", "course": "BSBA-FM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_19", "title_and_code": "BME 141 - Operations Management (Tqm)", "course": "BSBA-FM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_20", "title_and_code": "BUS CORE 113 - Good Governance And Social Responsibility", "course": "BSBA-FM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_21", "title_and_code": "PATHFIT 3 - Dual Sports And Games", "course": "BSBA-FM", "year_level": 2, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_22", "title_and_code": "GE 109 - Readings On Philippine History", "course": "BSBA-FM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_23", "title_and_code": "GE 110 - Art Appreciation", "course": "BSBA-FM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_24", "title_and_code": "BUSCORE 115 - Income Taxation", "course": "BSBA-FM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_25", "title_and_code": "PROF COR FM 123 - Investment And Portfolio Management", "course": "BSBA-FM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_26", "title_and_code": "PROF COR FM 124 - Capital Market", "course": "BSBA-FM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_27", "title_and_code": "BME 142 - Strategic Management", "course": "BSBA-FM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_28", "title_and_code": "PATHFIT 4 - Team Sports And Games", "course": "BSBA-FM", "year_level": 2, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_29", "title_and_code": "GE 111 - STATISTICS", "course": "BSBA-FM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_30", "title_and_code": "RZL - LIFE AND WORKS OF RIZAL", "course": "BSBA-FM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_31", "title_and_code": "BUS CORE 114 - HUMAN RESOURCE MANAGEMENT", "course": "BSBA-FM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_32", "title_and_code": "BUS CORE 116 - BUSINESS RESEARCH", "course": "BSBA-FM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_33", "title_and_code": "PROF COR FM 125 - FINANCIAL ANALYSIS & REPORTING", "course": "BSBA-FM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_34", "title_and_code": "PROF COR FM 126 - CREDIT AND COLLECTION", "course": "BSBA-FM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_35", "title_and_code": "COMP 104 - INTRODUCTION TO E-COMMERCE", "course": "BSBA-FM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_36", "title_and_code": "PROF COR FM 127 - MONETARY POLICY AND CENTRAL BANKING", "course": "BSBA-FM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_37", "title_and_code": "PROF COR FM 128 - SPECIAL TOPICS IN FINANCIAL MANGEMENT", "course": "BSBA-FM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_38", "title_and_code": "FM ELEC 132 - BEHAVIORAL FINANCE", "course": "BSBA-FM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_39", "title_and_code": "FM ELEC 133 - TREASURY MANAGEMENT", "course": "BSBA-FM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_40", "title_and_code": "FM ELEC 134 - MUTUAL FUND", "course": "BSBA-FM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_41", "title_and_code": "THESIS 1 - RESEARCH 1", "course": "BSBA-FM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_42", "title_and_code": "BUS CORE 117 - INTERNATIONAL BUSINESS AND TRADE", "course": "BSBA-FM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_fm_new_43", "title_and_code": "FM ELEC 135 - ENTREPRENEURIAL MANAGEMENT", "course": "BSBA-FM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_44", "title_and_code": "FM ELEC 136 - RISK MANAGEMENT", "course": "BSBA-FM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_45", "title_and_code": "THESIS 2 - RESEARCH 2", "course": "BSBA-FM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_fm_new_46", "title_and_code": "INT - INTERNSHIP (600hrs)", "course": "BSBA-FM", "year_level": 4, "semester": 2, "units": 6, "lec_hours": 0, "lab_hours": 6, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_1", "title_and_code": "GE 101 - Understanding The Self", "course": "BSBA-HRDM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_2", "title_and_code": "GE EL 101 - Entrepreneurial Mind", "course": "BSBA-HRDM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_3", "title_and_code": "MGT 1 - Human Resource Management", "course": "BSBA-HRDM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_4", "title_and_code": "GE EL 102 - Philippine Literature", "course": "BSBA-HRDM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_5", "title_and_code": "BUS CORE 111 - Basic Microeconomics", "course": "BSBA-HRDM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_6", "title_and_code": "PATHFIT 1 - Physical Fitness", "course": "BSBA-HRDM", "year_level": 1, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_7", "title_and_code": "NSTP 1 - National Service Training Program 1", "course": "BSBA-HRDM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_8", "title_and_code": "GE 103 - Mathematics in Modern World", "course": "BSBA-HRDM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_9", "title_and_code": "GE 104 - Purposive Communication", "course": "BSBA-HRDM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_10", "title_and_code": "GE 108 - Ethics", "course": "BSBA-HRDM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_11", "title_and_code": "BUSCORE 112 - Business Law (Obligation And Contract)", "course": "BSBA-HRDM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_12", "title_and_code": "HRM ELEC 1 - Personal Finance", "course": "BSBA-HRDM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_13", "title_and_code": "PATHFIT 2 - Rhythmic Activities", "course": "BSBA-HRDM", "year_level": 1, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_14", "title_and_code": "NSTP 2 - National Service Training Program 2", "course": "BSBA-HRDM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_15", "title_and_code": "GE 106 - Science, Technology and Society", "course": "BSBA-HRDM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_16", "title_and_code": "GE 107 - The Contemporary World", "course": "BSBA-HRDM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_17", "title_and_code": "HRM 1 - Administrative And Office Management", "course": "BSBA-HRDM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_18", "title_and_code": "HRM 2 - Labor Law And Legislation", "course": "BSBA-HRDM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_19", "title_and_code": "BUS CORE 113 - Good Governance And Social Responsibility", "course": "BSBA-HRDM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_20", "title_and_code": "BME 141 - Operations Management", "course": "BSBA-HRDM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_21", "title_and_code": "PATHFIT 3 - Dual Sports And Games", "course": "BSBA-HRDM", "year_level": 2, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_22", "title_and_code": "GE 109 - Readings On Philippine History", "course": "BSBA-HRDM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_23", "title_and_code": "GE 110 - Art Appreciation", "course": "BSBA-HRDM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_24", "title_and_code": "BUS CORE 115 - Income Taxation", "course": "BSBA-HRDM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_25", "title_and_code": "COMP 102 - Advance Computer", "course": "BSBA-HRDM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_26", "title_and_code": "HRM 3 - Recruitment And Selection", "course": "BSBA-HRDM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_27", "title_and_code": "BME 142 - Strategic Management", "course": "BSBA-HRDM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_28", "title_and_code": "PATHFIT 4 - Team Sports And Games", "course": "BSBA-HRDM", "year_level": 2, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_29", "title_and_code": "GE 111 - Statistics", "course": "BSBA-HRDM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_30", "title_and_code": "RZL - Life And Works Of Rizal", "course": "BSBA-HRDM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_31", "title_and_code": "GE EL 104 - Environmental Science", "course": "BSBA-HRDM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_32", "title_and_code": "HRM ELEC 2 - Marketing Management", "course": "BSBA-HRDM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_33", "title_and_code": "HRM 4 - Training And Development", "course": "BSBA-HRDM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_34", "title_and_code": "BUS CORE 116 - Business Research", "course": "BSBA-HRDM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_35", "title_and_code": "ENG 2 - Business English And Correspondence", "course": "BSBA-HRDM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_36", "title_and_code": "HRM ELEC 3 - Project Management", "course": "BSBA-HRDM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_37", "title_and_code": "HRM 5 - Compensation And Benefits", "course": "BSBA-HRDM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_38", "title_and_code": "HRM 6 - Labor Relations", "course": "BSBA-HRDM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_39", "title_and_code": "HRM 7 - Special Topics in Human Resource Management", "course": "BSBA-HRDM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_40", "title_and_code": "THESIS 1 - Thesis Writing 1", "course": "BSBA-HRDM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_41", "title_and_code": "HRM 8 - Organizational Behavior", "course": "BSBA-HRDM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_42", "title_and_code": "BUS CORE 117 - International Business And Trade", "course": "BSBA-HRDM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_43", "title_and_code": "HRM ELEC 4 - Entrepreneurial Management", "course": "BSBA-HRDM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_44", "title_and_code": "THESIS 2 - Thesis Writing 2", "course": "BSBA-HRDM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_hrdm_new_45", "title_and_code": "INT - INTERNSHIP (600hrs)", "course": "BSBA-HRDM", "year_level": 4, "semester": 2, "units": 6, "lec_hours": 0, "lab_hours": 6, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_1", "title_and_code": "GE 101 - Understanding The Self", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_2", "title_and_code": "GE EL 101 - Entrepreneurial Mind", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_3", "title_and_code": "GE EL 102 - Philippine Literature", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_4", "title_and_code": "BUS CORE 111 - Basic Microeconomics", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_5", "title_and_code": "PROF COR MM 121 - Professional Salesmanship", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_6", "title_and_code": "PATHFIT 1 - Physical Fitness", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_7", "title_and_code": "NSTP 1 - National Service Training Program 1", "course": "BSBA-MM", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_8", "title_and_code": "GE 103 - Mathematics in the Modern World", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_9", "title_and_code": "GE 104 - Purposive Communication", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_10", "title_and_code": "GE 108 - Ethics", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_11", "title_and_code": "BUS CORE 112 - Business Law (Obligation And Contracts)", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_12", "title_and_code": "MM ELEC 131 - Personal Finance", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_13", "title_and_code": "PATHFIT 2 - Rhythmic Activities", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_14", "title_and_code": "NSTP 2 - National Service Training Program 2", "course": "BSBA-MM", "year_level": 1, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_15", "title_and_code": "GE 106 - Science, Technology And Society", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_16", "title_and_code": "GE 107 - The Contemporary World", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_17", "title_and_code": "GE EL 103 - Indigenous Creative Arts", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_18", "title_and_code": "BME 141 - Operations Management (Tqm)", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_19", "title_and_code": "BUS CORE 113 - Good Governance And Social Responsibility", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_20", "title_and_code": "PROF COR MM 122 - Marketing Management", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_21", "title_and_code": "PATHFIT 3 - Dual Sports And Games", "course": "BSBA-MM", "year_level": 2, "semester": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_22", "title_and_code": "GE 109 - Readings On Philippine History", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_23", "title_and_code": "GE 110 - Art Appreciation", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_24", "title_and_code": "BUS CORE 115 - Income Taxation", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_25", "title_and_code": "BME 142 - Strategic Management", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_26", "title_and_code": "PROF COR MM 123 - Distribution Management", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_27", "title_and_code": "PROF COR MM 124 - Advertising", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_28", "title_and_code": "PATHFIT 4 - Team Sports And Games", "course": "BSBA-MM", "year_level": 2, "semester": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_29", "title_and_code": "GE 111 - Statistics", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_30", "title_and_code": "RZL - Life And Works Of Rizal", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_31", "title_and_code": "BUS CORE 114 - Human Resource Management", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_32", "title_and_code": "BUS CORE 116 - Business Research", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_33", "title_and_code": "PROF COR MM 125 - Product Management", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_34", "title_and_code": "MM ELEC 132 - Franchising", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_35", "title_and_code": "COMP 104 - Web Development", "course": "BSBA-MM", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_36", "title_and_code": "PROF COR MM 126 - Retail Management", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_37", "title_and_code": "PROF COR MM 127 - Pricing Strategy", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_38", "title_and_code": "PROF COR MM 128 - Marketing Research", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_39", "title_and_code": "MM ELEC 133 - Consumer Behavior", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_40", "title_and_code": "MM ELEC 134 - Sales Management", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_41", "title_and_code": "MM ELEC 135 - Industrial/Agri-Business Marketing", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_42", "title_and_code": "THESIS 1 - Research 1", "course": "BSBA-MM", "year_level": 3, "semester": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_43", "title_and_code": "BUS CORE 117 - International Business And Trade", "course": "BSBA-MM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "new"},
    {"id": "bsba_mm_new_44", "title_and_code": "MM ELEC 136 - Special Topics In Marketing Management", "course": "BSBA-MM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_45", "title_and_code": "THESIS 2 - Research 2", "course": "BSBA-MM", "year_level": 4, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "bsba_mm_new_46", "title_and_code": "INT - INTERNSHIP", "course": "BSBA-MM", "year_level": 4, "semester": 2, "units": 6, "lec_hours": 0, "lab_hours": 6, "is_major": 1, "curriculum_type": "new"},
    {"id": "scs1", "title_and_code": "Discrete Mathematics CS 101", "course": "BSCS", "year_level": 1, "semester": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "new"},
    {"id": "scs2", "title_and_code": "Data Structures & Algorithms CS 102", "course": "BSCS", "year_level": 2, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "scs3", "title_and_code": "Artificial Intelligence CS 201", "course": "BSCS", "year_level": 3, "semester": 1, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "new"},
    {"id": "so1", "title_and_code": "Basic Computer Concepts & Logic Formulation IT 101", "course": "BSIT", "year_level": 1, "units": 3, "lec_hours": 2, "lab_hours": 2, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "so2", "title_and_code": "Computer Programming C++ IT 102", "course": "BSIT", "year_level": 1, "units": 3, "lec_hours": 2, "lab_hours": 2, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "so3", "title_and_code": "Visual Basic Programming IT 201", "course": "BSIT", "year_level": 2, "units": 3, "lec_hours": 2, "lab_hours": 2, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "so4", "title_and_code": "Database Management System FoxPro/SQL IT 202", "course": "BSIT", "year_level": 2, "units": 3, "lec_hours": 2, "lab_hours": 2, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "so5", "title_and_code": "Operating Systems & Utility Software IT 203", "course": "BSIT", "year_level": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "so6", "title_and_code": "Computer Hardware & Networking Fundamentals IT 301", "course": "BSIT", "year_level": 3, "units": 3, "lec_hours": 2, "lab_hours": 2, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "so7", "title_and_code": "Systems Analysis and Design SAD IT 302", "course": "BSIT", "year_level": 3, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "so8", "title_and_code": "Web Page Development HTML/CSS IT 303", "course": "BSIT", "year_level": 3, "units": 3, "lec_hours": 2, "lab_hours": 2, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "so9", "title_and_code": "Software Engineering & IT Management IT 401", "course": "BSIT", "year_level": 4, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "so10", "title_and_code": "IT Practicum / OJT 480 Hours IT 402", "course": "BSIT", "year_level": 4, "units": 6, "lec_hours": 0, "lab_hours": 6, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "so11", "title_and_code": "Physical Education 1 Physical Fitness PE 1", "course": "BSIT", "year_level": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 1},
    {"id": "so12", "title_and_code": "Physical Education 2 Rhythmic Activities PE 2", "course": "BSIT", "year_level": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 2},
    {"id": "so13", "title_and_code": "NSTP 1 Civic Welfare Training NSTP 1", "course": "BSIT", "year_level": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o101", "title_and_code": "GE 101 Understanding The Self (General Psychology)", "course": "BSCRIM", "year_level": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o102", "title_and_code": "GE 102 Sining ng Pakikipagtalastasan", "course": "BSCRIM", "year_level": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o103", "title_and_code": "GE EL 101 Entrepreneurial Mind", "course": "BSCRIM", "year_level": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o104", "title_and_code": "GE EL 103 Environmental Science", "course": "BSCRIM", "year_level": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o105", "title_and_code": "GE EL 104 Gender and Society", "course": "BSCRIM", "year_level": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o106", "title_and_code": "CRIM 111 Introduction to Criminology", "course": "BSCRIM", "year_level": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o107", "title_and_code": "CLJ 121 Introduction to Philippine Criminal Justice", "course": "BSCRIM", "year_level": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o109", "title_and_code": "PE 181 Fundamentals of Martial Arts", "course": "BSCRIM", "year_level": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o110", "title_and_code": "GE 103 Mathematics in Modern World (Plane Trigonometry)", "course": "BSCRIM", "year_level": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o111", "title_and_code": "GE 104 Purposive Communication", "course": "BSCRIM", "year_level": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o112", "title_and_code": "GE 105 PAGBASA AT PAGSULAT SA IBAT-IBANG DISIPLINA", "course": "BSCRIM", "year_level": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o113", "title_and_code": "CDI 131 Fundamentals of Investigation and Intelligence", "course": "BSCRIM", "year_level": 1, "units": 4, "lec_hours": 4, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o114", "title_and_code": "LEA 151 Law Enforcement Organization and Administration", "course": "BSCRIM", "year_level": 1, "units": 4, "lec_hours": 4, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o115", "title_and_code": "LEA 152 Comparative Models in Policing", "course": "BSCRIM", "year_level": 1, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o117", "title_and_code": "PE 182 Arnis and Disarming Technique", "course": "BSCRIM", "year_level": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o118", "title_and_code": "EHC 171 ENHANCEMENT COURSE 1", "course": "BSCRIM", "year_level": 1, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o119", "title_and_code": "GE 106 SCIENCE, TECHNOLOGY AND SOCIETY", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o120", "title_and_code": "GE 107 THE CONTEMPORARY WORLD", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o121", "title_and_code": "GE EL 102 PHILIPPINE LITERATURE", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o122", "title_and_code": "FORENSIC 141 Forensic Photography", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o123", "title_and_code": "CA 161 Institutional Corrections", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o124", "title_and_code": "CFLM-1 Character Formation, Nationalism and Patriotism", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o125", "title_and_code": "CRIM 112 Theories of Crime Causation", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o126", "title_and_code": "CDI 132 Specialized Crime Investigation 1 with Legal Medicine", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o127", "title_and_code": "PE 183 First Aid and Water Safety", "course": "BSCRIM", "year_level": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o128", "title_and_code": "GE 108 ETHICS", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o129", "title_and_code": "GE 109 READINGS ON PHILIPPINE HISTORY", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o130", "title_and_code": "GE 110 ART APPRECIATION", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o131", "title_and_code": "ADGE General Chemistry (Organic)", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o132", "title_and_code": "FORENSIC 142 Personal Identification Techniques", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o133", "title_and_code": "CRIM 113 Human Behavior and Victimology", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o134", "title_and_code": "LEA 153 Introduction to Industrial Security Concepts", "course": "BSCRIM", "year_level": 2, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o135", "title_and_code": "PE 184 Fundamentals of Marksmanship", "course": "BSCRIM", "year_level": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o136", "title_and_code": "EHC 172 ENHANCEMENT COURSE 2", "course": "BSCRIM", "year_level": 2, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o137", "title_and_code": "RZL LIFE AND WORKS OF RIZAL", "course": "BSCRIM", "year_level": 3, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 0, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o138", "title_and_code": "CFLM-2 Character Formation with Leadership, Decision Making, Management and Administration", "course": "BSCRIM", "year_level": 3, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o139", "title_and_code": "CLJ 122 Human Rights Education", "course": "BSCRIM", "year_level": 3, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o140", "title_and_code": "CLJ 123 Criminal Law (Book 1)", "course": "BSCRIM", "year_level": 3, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o141", "title_and_code": "FORENSIC 143 Forensic Chemistry and Toxicology", "course": "BSCRIM", "year_level": 3, "units": 5, "lec_hours": 3, "lab_hours": 2, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o142", "title_and_code": "CDI 133 Specialized Crime Investigation 2 with Simulation on Interrogation and Interview", "course": "BSCRIM", "year_level": 3, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o143", "title_and_code": "CDI 134 Traffic Management and Accident Investigation with Driving", "course": "BSCRIM", "year_level": 3, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o144", "title_and_code": "LEA 154 Law Enforcement Operations and Planning with Crime Mapping", "course": "BSCRIM", "year_level": 3, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o145", "title_and_code": "CA 162 Non-Institutional Corrections", "course": "BSCRIM", "year_level": 3, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o146", "title_and_code": "CLJ 124 Criminal Law (Book 2)", "course": "BSCRIM", "year_level": 3, "units": 4, "lec_hours": 4, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o147", "title_and_code": "CRIM 114 Professional Conduct and Ethical Standards", "course": "BSCRIM", "year_level": 3, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o148", "title_and_code": "CRIM 115 Juvenile Delinquency and Juvenile Justice System", "course": "BSCRIM", "year_level": 3, "units": 4, "lec_hours": 4, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o149", "title_and_code": "FORENSIC 114 Questioned Documents Examination", "course": "BSCRIM", "year_level": 3, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o150", "title_and_code": "FORENSIC 115 Lie Detection Techniques", "course": "BSCRIM", "year_level": 3, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o151", "title_and_code": "CDI 135 Technical English 1 (Technical Report Writing and Presentation)", "course": "BSCRIM", "year_level": 3, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o152", "title_and_code": "EHC 3 ENHANCEMENT COURSE 3", "course": "BSCRIM", "year_level": 3, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o153", "title_and_code": "CA 163 Therapeutic Modalities", "course": "BSCRIM", "year_level": 4, "units": 2, "lec_hours": 2, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o154", "title_and_code": "CLJ 125 Evidence", "course": "BSCRIM", "year_level": 4, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o155", "title_and_code": "CRIM 116 Dispute Resolution and Crises/Incidents Management", "course": "BSCRIM", "year_level": 4, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o156", "title_and_code": "CRIM 117 Criminological Research1 (Research Methods with Applied Statistics)", "course": "BSCRIM", "year_level": 4, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o157", "title_and_code": "CDI 136 Fire Protection and Arson Investigation", "course": "BSCRIM", "year_level": 4, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o158", "title_and_code": "CDI 137 Vice and Drug Education and Control", "course": "BSCRIM", "year_level": 4, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 1},
    {"id": "crim_o159", "title_and_code": "CP 191 Internship (On-the Job Training)", "course": "BSCRIM", "year_level": 4, "units": 3, "lec_hours": 0, "lab_hours": 3, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o160", "title_and_code": "CLJ 126 Criminal Procedure and Court Testimony", "course": "BSCRIM", "year_level": 4, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o161", "title_and_code": "FORENSIC 146 Forensic Ballistics", "course": "BSCRIM", "year_level": 4, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o162", "title_and_code": "CRIM 118 Criminological Research 2(Thesis Writing and Presentation", "course": "BSCRIM", "year_level": 4, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o163", "title_and_code": "CDI 138 Technical English 2 (Legal Forms)", "course": "BSCRIM", "year_level": 4, "units": 3, "lec_hours": 3, "lab_hours": 0, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o164", "title_and_code": "CDI 139 Introduction to Cybercrime and Environmental Laws and Protection", "course": "BSCRIM", "year_level": 4, "units": 3, "lec_hours": 2, "lab_hours": 1, "is_major": 1, "curriculum_type": "old", "semester": 2},
    {"id": "crim_o165", "title_and_code": "CP 192 Internship (On-the Job Training)", "course": "BSCRIM", "year_level": 4, "units": 3, "lec_hours": 0, "lab_hours": 3, "is_major": 1, "curriculum_type": "old", "semester": 2}
  ],  schedules: [
    {
      id: "sch1",
      instructor_id: "t1",
      room_id: "r2", // W- ComLab
      day: "W",
      time_start: "08:00",
      time_end: "11:00",
      subject_id: "s1" // Computer Programming 1 CC102
    },
    {
      id: "sch2",
      instructor_id: "t1",
      room_id: "r1", // COMLAB
      day: "S",
      time_start: "12:00",
      time_end: "14:00",
      subject_id: "s2" // SYSTEM ADMIN AND MAINTENANCE SA 101
    },
    {
      id: "sch3",
      instructor_id: "t1",
      room_id: "r5", // HS-101
      day: "F",
      time_start: "15:00",
      time_end: "17:00",
      subject_id: "s3" // Social and Professional Issues SP 101
    },
    {
      id: "sch4",
      instructor_id: "t2",
      room_id: "r6", // TH-203
      day: "TTH",
      time_start: "08:00",
      time_end: "09:00",
      subject_id: "s4" // FUNDAMENTALS OF DATABASE SYSTEM IM 101 (BSIT-2A)
    },
    {
      id: "sch5",
      instructor_id: "t2",
      room_id: "r7", // T-204
      day: "TTH",
      time_start: "09:00",
      time_end: "10:00",
      subject_id: "s5" // FUNDAMENTALS OF DATABASE SYSTEM IM 101 (BSIT-2B)
    },
    {
      id: "sch6",
      instructor_id: "t2",
      room_id: "r6", // TH-203
      day: "TTH",
      time_start: "10:00",
      time_end: "11:00",
      subject_id: "s6" // OBJECT ORIENTED PROGRAMMING PF 101 (BSIT-2A)
    },
    {
      id: "sch7",
      instructor_id: "t2",
      room_id: "r7", // T-204
      day: "TTH",
      time_start: "11:00",
      time_end: "12:00",
      subject_id: "s7" // OBJECT ORIENTED PROGRAMMING PF 101 (BSIT-2B)
    },
    {
      id: "sch8",
      instructor_id: "t2",
      room_id: "r1", // COMLAB
      day: "M",
      time_start: "09:00",
      time_end: "10:00",
      subject_id: "s8" // National Service Training Program 1 NSTP 1
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
  try {
    const response = await fetch(`${API_URL}?action=get_all`);
    const result = await response.json();
    if (result && result.status === 'success') {
      db.instructors = (result.instructors || []).map(i => ({
        ...i,
        max_units: parseInt(i.max_units, 10)
      }));
      db.rooms = result.rooms || [];
      db.subjects = (result.subjects || []).map(s => ({
        ...s,
        year_level: parseInt(s.year_level, 10),
        units: parseInt(s.units, 10),
        lec_hours: parseInt(s.lec_hours, 10),
        lab_hours: parseInt(s.lab_hours, 10),
        is_major: parseInt(s.is_major || 0, 10)
      }));
      db.schedules = result.schedules || [];
      
      // Keep local storage copy updated for complete sync
      localStorage.setItem('sibt_scheduling_db', JSON.stringify(db));
      console.log("Database successfully synced with XAMPP MySQL backend.");
    } else {
      throw new Error("API returned non-success status");
    }
  } catch (e) {
    console.warn("Could not sync with MySQL database. Using offline local storage mode instead.", e);
    // Offline local storage fallback
    const saved = localStorage.getItem('sibt_scheduling_db');
    if (saved) {
      try {
        db = JSON.parse(saved);
        // Ensure values are numbers in localstorage too
        db.instructors = (db.instructors || []).map(i => ({ ...i, max_units: parseInt(i.max_units, 10) }));
        db.subjects = (db.subjects || []).map(s => ({
          ...s,
          year_level: parseInt(s.year_level, 10),
          units: parseInt(s.units, 10),
          lec_hours: parseInt(s.lec_hours, 10),
          lab_hours: parseInt(s.lab_hours, 10),
          is_major: parseInt(s.is_major || 0, 10)
        }));
      } catch (parseErr) {
        db = JSON.parse(JSON.stringify(demoData));
      }
    } else {
      db = JSON.parse(JSON.stringify(demoData));
    }
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

// Day Overlap check
function daysOverlap(day1, day2) {
  if (day1 === day2) return true;
  if (day1 === 'MT' && (day2 === 'M' || day2 === 'T')) return true;
  if (day2 === 'MT' && (day1 === 'M' || day1 === 'T')) return true;
  if (day1 === 'TTH' && (day2 === 'T' || day2 === 'TH')) return true;
  if (day2 === 'TTH' && (day1 === 'T' || day1 === 'TH')) return true;
  if (day1 === 'MWF' && (day2 === 'M' || day2 === 'W' || day2 === 'F')) return true;
  if (day2 === 'MWF' && (day1 === 'M' || day1 === 'W' || day1 === 'F')) return true;
  if (day1 === 'Monday-Friday' || day2 === 'Monday-Friday') return true;
  return false;
}

// Get constituent single days from a composite day code
function getConstituentDays(dayStr) {
  if (!dayStr) return [];
  if (dayStr === 'MT') return ['M', 'T'];
  if (dayStr === 'TTH') return ['T', 'TH'];
  if (dayStr === 'MWF') return ['M', 'W', 'F'];
  if (dayStr === 'Monday-Friday') return ['M', 'T', 'W', 'TH', 'F'];
  return [dayStr]; // e.g. M, T, W, TH, F, S
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
  // Hide all panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.add('d-none');
  });
  // Un-active all nav items
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // Show active panel
  const panel = document.getElementById(`panel-${tabName}`);
  if (panel) panel.classList.remove('d-none');

  // Highlight active link
  const link = document.getElementById(`tab-${tabName}`);
  if (link) link.classList.add('active');

  // Render sub-views depending on tab
  if (tabName === 'print') {
    populatePrintTeachers();
    renderOfficialPrintout();
  } else if (tabName === 'manual') {
    populateFormSelects();
    checkRealtimeConflict();
  }
}

// Switch between settings manage tables
function switchManageSubTab(subTab) {
  document.querySelectorAll('.manage-panel').forEach(panel => {
    panel.classList.add('d-none');
  });
  const subPanel = document.getElementById(`manage-${subTab}`);
  if (subPanel) subPanel.classList.remove('d-none');

  document.querySelectorAll('#manageSubTabs .list-group-item').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
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
  document.getElementById('stat-instructors').innerText = db.instructors.length;
  document.getElementById('stat-subjects').innerText = db.subjects.length;
  document.getElementById('stat-rooms').innerText = db.rooms.length;
  document.getElementById('stat-schedules').innerText = db.schedules.length;
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
  roomSel.innerHTML = '<option value="">Select Room...</option>';
  db.rooms.forEach(r => {
    roomSel.innerHTML += `<option value="${r.id}">${r.name} (${r.room_type})</option>`;
  });

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
  filterTeacher.innerHTML = '<option value="">All Teachers</option>';
  db.instructors.forEach(t => {
    filterTeacher.innerHTML += `<option value="${t.id}">${t.name}</option>`;
  });

  // Course Selector filter
  const filterCourse = document.getElementById('filter-course');
  filterCourse.innerHTML = '<option value="">All Courses</option>';
  const courses = [...new Set(db.subjects.map(s => s.course))];
  courses.forEach(c => {
    filterCourse.innerHTML += `<option value="${c}">${c}</option>`;
  });

  // Blocks filter
  const filterBlock = document.getElementById('filter-block');
  filterBlock.innerHTML = '<option value="">All Blocks</option>';
  const blocks = [...new Set(db.subjects.map(s => s.block_section).filter(Boolean))];
  blocks.forEach(b => {
    filterBlock.innerHTML += `<option value="${b}">${b}</option>`;
  });

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
  renderSchedulesTable();
  renderInstructorsTable();
  renderSubjectsTable();
  renderRoomsTable();
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
    
    if (activeFilters.teacher && sch.instructor_id !== activeFilters.teacher) return false;
    if (activeFilters.subject && (!sub || sub.title_and_code !== activeFilters.subject)) return false;
    if (sub) {
      if (activeFilters.course && sub.course !== activeFilters.course) return false;
      if (activeFilters.year && sub.year_level !== parseInt(activeFilters.year)) return false;
      if (activeFilters.block && (sub.block_section || '') !== activeFilters.block) return false;
    }
    return true;
  });

  document.getElementById('filtered-count').innerText = `Showing ${filtered.length} records`;

  if (filtered.length === 0) {
    document.getElementById('noSchedulesMsg').style.display = 'block';
    document.getElementById('scheduleTable').style.display = 'none';
    return;
  }

  document.getElementById('noSchedulesMsg').style.display = 'none';
  document.getElementById('scheduleTable').style.display = 'table';

  // Sort by day, time start
  const dayOrder = { "M": 1, "T": 2, "W": 3, "TH": 4, "F": 5, "S": 6, "MT": 1.5, "TTH": 2.5, "MWF": 1.2, "Monday-Friday": 0.5 };
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

  pagedItems.forEach(sch => {
    const teacher = db.instructors.find(t => t.id === sch.instructor_id);
    const room = db.rooms.find(r => r.id === sch.room_id);
    const subject = db.subjects.find(s => s.id === sch.subject_id);

    const tName = teacher ? teacher.name : 'Unknown';
    const rName = room ? room.name : 'Unknown';
    const subTitle = subject ? subject.title_and_code : 'Unknown';
    const course = subject ? subject.course : '-';
    const year = subject ? subject.year_level : '-';
    const block = (subject && subject.block_section) ? subject.block_section : '-';
    const lec = subject ? subject.lec_hours : 0;
    const lab = subject ? subject.lab_hours : 0;

    // Standard 12 hour formatting for rendering
    const formatTime = (timeStr) => {
      if (!timeStr) return '-';
      const [hrs, mins] = timeStr.split(':').map(Number);
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      const formattedHrs = hrs % 12 || 12;
      return `${formattedHrs}:${String(mins).padStart(2, '0')} ${ampm}`;
    };

    listEl.innerHTML += `
      <tr>
        <td><input type="checkbox" class="form-check-input chk-bulk-schedules" value="${sch.id}" onchange="toggleItemSelection('schedules', '${sch.id}', this.checked)"></td>
        <td class="fw-bold text-dark">${tName}</td>
        <td><span class="badge bg-secondary py-1 px-2">${rName}</span></td>
        <td class="fw-bold text-primary">${sch.day}</td>
        <td>${formatTime(sch.time_start)}</td>
        <td>${formatTime(sch.time_end)}</td>
        <td class="text-center">${year}</td>
        <td>${course} ${block}</td>
        <td class="text-wrap small text-muted" style="max-width: 200px;">${subTitle}</td>
        <td>${course}</td>
        <td class="text-center fw-medium">${lec}</td>
        <td class="text-center fw-medium">${lab}</td>
        <td class="text-end">
          <button class="btn btn-outline-info btn-xs py-0 px-1 me-1" onclick="editSchedule('${sch.id}')" title="Edit Schedule">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-outline-danger btn-xs py-0 px-1" onclick="deleteSchedule('${sch.id}')" title="Delete Schedule">
            <i class="bi bi-trash-fill"></i>
          </button>
        </td>
      </tr>
    `;
  });
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

  pagedItems.forEach(t => {
    table.innerHTML += `
      <tr>
        <td><input type="checkbox" class="form-check-input chk-bulk-teachers" value="${t.id}" onchange="toggleItemSelection('teachers', '${t.id}', this.checked)"></td>
        <td class="fw-bold">${t.name}</td>
        <td><span class="badge bg-light text-dark border">${t.designation}</span></td>
        <td>${t.degree || '-'}</td>
        <td>${t.area || '-'}</td>
        <td>${t.employee_no || '-'}</td>
        <td class="text-center fw-semibold text-primary">${t.max_units}</td>
        <td class="text-end">
          <button class="btn btn-outline-dark btn-sm py-1 px-2 me-1" onclick="editTeacher('${t.id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm py-1 px-2" onclick="deleteTeacher('${t.id}')">
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

  pagedItems.forEach(s => {
    const typeBadge = s.is_major 
      ? '<span class="badge bg-danger">Major</span>' 
      : '<span class="badge bg-secondary">General</span>';

    table.innerHTML += `
      <tr>
        <td><input type="checkbox" class="form-check-input chk-bulk-subjects" value="${s.id}" onchange="toggleItemSelection('subjects', '${s.id}', this.checked)"></td>
        <td class="fw-bold text-dark">${s.title_and_code}</td>
        <td>${s.course}</td>
        <td>${typeBadge}</td>
        <td>${s.year_level} Year</td>
        <td class="text-center fw-bold text-primary">${s.units}</td>
        <td class="text-center">${s.lec_hours} / ${s.lab_hours}</td>
        <td class="text-end">
          <button class="btn btn-outline-dark btn-sm py-1 px-2 me-1" onclick="editSubject('${s.id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm py-1 px-2" onclick="deleteSubject('${s.id}')">
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

  pagedItems.forEach(r => {
    table.innerHTML += `
      <tr>
        <td><input type="checkbox" class="form-check-input chk-bulk-rooms" value="${r.id}" onchange="toggleItemSelection('rooms', '${r.id}', this.checked)"></td>
        <td class="fw-bold">${r.name}</td>
        <td>
          <span class="badge ${r.room_type === 'Laboratory' ? 'bg-primary' : r.room_type === 'Lecture' ? 'bg-success' : 'bg-warning'} text-white">
            ${r.room_type}
          </span>
        </td>
        <td class="text-end">
          <button class="btn btn-outline-dark btn-sm py-1 px-2 me-1" onclick="editRoom('${r.id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm py-1 px-2" onclick="deleteRoom('${r.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

// --- FORM ADD / EDIT / DELETE ACTIONS ---

// SCHEDULE
document.getElementById('scheduleForm').addEventListener('submit', function(e) {
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
  if (confirm("Are you sure you want to delete this instructor? This will also remove all their associated schedules.")) {
    db.instructors = db.instructors.filter(ins => ins.id !== id);
    db.schedules = db.schedules.filter(sch => sch.instructor_id !== id);
    saveDatabase();
    showToast("Instructor and related schedules deleted successfully!", "danger");
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
  if (s && document.getElementById('subject-id')) {
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
  const form = document.getElementById('subjectForm');
  if (form) form.reset();
  const idEl = document.getElementById('subject-id');
  if (idEl) idEl.value = "";
  const majorEl = document.getElementById('subject-is-major');
  if (majorEl) majorEl.checked = false;
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

// --- INTELLIGENT AUTO-SCHEDULER ENGINE ---
// Schedules all un-scheduled subjects sequentially while satisfying all conflict conditions.
function runAutoScheduler() {
  const overwrite = document.getElementById('overwriteSchedules').checked;
  const logContainer = document.getElementById('autoSchedulerResults');
  const consoleEl = document.getElementById('schedulerConsole');
  
  logContainer.classList.remove('d-none');
  consoleEl.innerHTML = `Starting Intelligent Auto-Scheduling engine...<br>`;

  if (overwrite) {
    db.schedules = [];
    consoleEl.innerHTML += `<span class="text-warning">Cleared existing schedules as selected.</span><br>`;
  }

  // Define Standard Time slots and days available for schedule blocks
  // Adding more evening/afternoon slots for High School Room constraints if needed
  const standardTimeSlots = [
    // 2 Hour blocks (7:00 AM to 7:00 PM)
    { start: "07:00", end: "09:00", dur: 2 },
    { start: "08:00", end: "10:00", dur: 2 },
    { start: "10:00", end: "12:00", dur: 2 },
    { start: "13:00", end: "15:00", dur: 2 },
    { start: "15:00", end: "17:00", dur: 2 },
    { start: "17:00", end: "19:00", dur: 2 },
    { start: "16:00", end: "18:00", dur: 2 },
    
    // 3 Hour blocks (7:00 AM to 7:00 PM)
    { start: "07:00", end: "10:00", dur: 3 },
    { start: "08:00", end: "11:00", dur: 3 },
    { start: "09:00", end: "12:00", dur: 3 },
    { start: "13:00", end: "16:00", dur: 3 },
    { start: "16:00", end: "19:00", dur: 3 },
    
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

  const autoDaysSetting = document.getElementById("auto-days-count") ? document.getElementById("auto-days-count").value : "all";
  const standardDays = getFilteredStandardDays(autoDaysSetting);

  let scheduledCount = 0;
  let unscheduledCount = 0;

  const scheduledSubjectIds = new Set(db.schedules.map(sch => sch.subject_id));

  // Sort subjects to prioritize major subjects first
  // major subjects (is_major === 1) should be scheduled first to prioritize COMLAB and CRIMLAB
  const sortedSubjects = [...db.subjects].sort((a, b) => {
    return (b.is_major || 0) - (a.is_major || 0);
  });

  // Loop through all subjects
  sortedSubjects.forEach(subject => {
    if (scheduledSubjectIds.has(subject.id)) {
      consoleEl.innerHTML += `Subject: <span class="text-info">${subject.title_and_code}</span> is already scheduled.<br>`;
      scheduledCount++;
      return;
    }

    let isScheduled = false;
    consoleEl.innerHTML += `Scheduling subject: <strong>${subject.title_and_code}</strong> (${subject.is_major ? '<span class="text-danger fw-bold">MAJOR</span>' : 'GENERAL'} - ${subject.course} Year ${subject.year_level})...<br>`;

    const targetDuration = subject.lab_hours > 0 ? 3 : 2; // labs prefer 3 hours, lectures prefer 2
    const filteredSlots = standardTimeSlots.filter(s => s.dur === targetDuration).concat(standardTimeSlots.filter(s => s.dur !== targetDuration));

    // Sort rooms based on major vs general subject room priorities, with special rooms (Library 1, 2, TBL) as absolute last resource:
    const sortedRooms = [...db.rooms].sort((a, b) => {
      const aSpecial = isSpecialRoom(a.name);
      const bSpecial = isSpecialRoom(b.name);

      // If one is special and the other is not, the special room goes to the end
      if (aSpecial && !bSpecial) return 1;
      if (!aSpecial && bSpecial) return -1;
      if (aSpecial && bSpecial) return 0; // maintain relative order of special rooms

      const isALab = a.name.toUpperCase().includes('COMLAB') || a.name.toUpperCase().includes('CRIMLAB');
      const isBLab = b.name.toUpperCase().includes('COMLAB') || b.name.toUpperCase().includes('CRIMLAB');
      
      if (subject.is_major) {
        // Prioritize lab rooms
        if (isALab && !isBLab) return -1;
        if (!isALab && isBLab) return 1;
      } else {
        // Prioritize non-lab rooms first
        if (!isALab && isBLab) return -1;
        if (isALab && !isBLab) return 1;
      }
      return 0;
    });

    // Waterfall logic for choosing teachers: Always prioritize instructors with fewer units currently assigned
    const sortedTeachers = [...db.instructors].sort((a, b) => {
      return calculateTeacherTotalUnits(a.id) - calculateTeacherTotalUnits(b.id);
    });

    let conflictsEncountered = new Set();

    for (let teacher of sortedTeachers) {
      const isPartTime = teacher.designation === 'Part-time' || teacher.designation === 'Part-time Teacher';

      // Prefer Saturday (S) and Evening time blocks (4 PM to 7 PM) for part-time schedules
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
        if (subject.lab_hours > 0 && room.room_type === 'Lecture') continue; // Lab classes need ComLab/CrimLab
        if (subject.lab_hours === 0 && room.room_type === 'Laboratory' && room.name !== 'COMLAB' && room.name !== 'CRIMLAB') continue; 

        // For auto-scheduler (which finds any room): if the subject is general (non-lab and non-major),
        // do NOT put them on COMLAB, CRIMLAB, or the 3 special case rooms (Library 1, 2, TBL Room)
        if (subject.lab_hours === 0 && !subject.is_major) {
          const rNameUpper = room.name.toUpperCase();
          const isComLab = rNameUpper.includes('COMLAB');
          const isCrimLab = rNameUpper.includes('CRIMLAB');
          const isSpecial = isSpecialRoom(room.name);
          if (isComLab || isCrimLab || isSpecial) {
            continue;
          }
        }

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
              scheduledCount++;
              consoleEl.innerHTML += `&nbsp;&nbsp;<span class="text-success">✔ Assigned:</span> ${teacher.name} inside ${room.name} on ${day} (${slot.start}-${slot.end})<br>`;
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
      unscheduledCount++;
      consoleEl.innerHTML += `&nbsp;&nbsp;<span class="text-danger">✖ Failed:</span> No conflict-free slots found for ${subject.title_and_code}.<br>`;
      if (conflictsEncountered.size > 0) {
        consoleEl.innerHTML += `&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-warning fw-bold">Conflicts observed:</span><br>`;
        Array.from(conflictsEncountered).slice(0, 5).forEach(err => {
          consoleEl.innerHTML += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="bi bi-exclamation-triangle text-warning me-1"></i> ${err}<br>`;
        });
      }
    }
  });

  document.getElementById('log-total-subjects').innerText = db.subjects.length;
  document.getElementById('log-scheduled').innerText = scheduledCount;
  document.getElementById('log-unscheduled').innerText = unscheduledCount;
  
  const statusEl = document.getElementById('schedulerStatusBadge');
  if (unscheduledCount === 0) {
    statusEl.className = "badge bg-success";
    statusEl.innerText = "Complete Success";
  } else {
    statusEl.className = "badge bg-warning text-dark";
    statusEl.innerText = "Partially Scheduled";
  }

  saveDatabase();

  const isSuccess = unscheduledCount === 0;
  const alertType = isSuccess ? 'success' : 'warning';
  const alertTitle = isSuccess ? 'Auto-Scheduler Engine Completed Successfully!' : 'Auto-Scheduler Finished with Conflicts';
  const alertMsg = `Scheduled ${scheduledCount} out of ${db.subjects.length} subjects.` + 
    (!isSuccess ? ` ${unscheduledCount} subject(s) could not be scheduled conflict-free. Check the execution logs for details.` : '');

  showGlobalAlert(alertTitle, alertMsg, alertType);
  showToast(alertMsg, isSuccess ? 'success' : 'warning');
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

    // Sort rooms: If a specific room is preferred, put it first in the list
    const sortedRooms = [...db.rooms].sort((a, b) => {
      if (preferredRoomId) {
        if (a.id === preferredRoomId) return -1;
        if (b.id === preferredRoomId) return 1;
      }
      return 0;
    });

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
        if (subject.lab_hours > 0 && room.room_type === 'Lecture') continue;
        if (subject.lab_hours === 0 && room.room_type === 'Laboratory' && room.name !== 'COMLAB' && room.name !== 'CRIMLAB') continue;

        // If 'Any' room is selected, do NOT put them on COMLAB, CRIMLAB, or the 3 special case rooms (Library 1, 2, TBL Room)
        if (!preferredRoomId) {
          const rNameUpper = room.name.toUpperCase();
          const isComLab = rNameUpper.includes('COMLAB');
          const isCrimLab = rNameUpper.includes('CRIMLAB');
          const isSpecial = isSpecialRoom(room.name);
          if (isComLab || isCrimLab || isSpecial) {
            continue;
          }
        }

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
    const section = sub ? `${sub.course} ${sub.block_section}` : 'N/A';
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
  if (confirm(`Are you sure you want to delete ${selectedTeacherIds_manage.size} selected instructor(s)? This will also delete their associated schedules.`)) {
    db.instructors = db.instructors.filter(t => !selectedTeacherIds_manage.has(t.id));
    db.schedules = db.schedules.filter(sch => !selectedTeacherIds_manage.has(sch.instructor_id));
    selectedTeacherIds_manage.clear();
    saveDatabase();
    showToast("Selected instructors deleted successfully!", "danger");
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
function loadSectionSubjects() {
  const courseEl = document.getElementById('section-course');
  const yearEl = document.getElementById('section-year');
  const semesterEl = document.getElementById('section-semester');
  const blockEl = document.getElementById('section-block');
  const curriculumEl = document.getElementById('section-curriculum');
  const listEl = document.getElementById('section-subjects-list');
  const countEl = document.getElementById('section-subject-count');

  if (!courseEl || !yearEl || !listEl) return;

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

        const availableRoom = db.rooms.find(r => {
          if (isSpecialRoom(r.name)) return false; // prefer regular standard rooms
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
            subject_id: sub.id
          };

          const availableRoom = db.rooms.find(r => {
            if (sub.is_major && (sub.title_and_code.toLowerCase().includes('computer') || sub.title_and_code.toLowerCase().includes('programming'))) {
              if (r.name.toUpperCase() !== 'COMLAB') return false;
            }

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
              subject_id: sub.id
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
      consoleEl.innerHTML += `<span class="text-danger">✖ Failed:</span> No conflict-free slot for ${sub.title_and_code}.<br>`;
      if (sectionConflicts.size > 0) {
        consoleEl.innerHTML += `&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-warning fw-bold">Conflicts observed:</span><br>`;
        Array.from(sectionConflicts).slice(0, 5).forEach(err => {
          consoleEl.innerHTML += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="bi bi-exclamation-triangle text-warning me-1"></i> ${err}<br>`;
        });
      }
    }
  }

  saveDatabase();
  renderSchedulesTable();
  updateStats();

  const isSuccess = unscheduledCount === 0;
  const alertType = isSuccess ? 'success' : 'warning';
  const alertTitle = isSuccess ? 'Per-Section Scheduling Successful!' : 'Per-Section Scheduling Finished with Conflicts';
  const alertMsg = `Scheduled ${scheduledCount} out of ${selects.length} subjects for section ${course} ${year}${block}.` + 
    (!isSuccess ? ` ${unscheduledCount} subject(s) could not be scheduled due to teacher, room, time, or section conflicts.` : '');
  
  showGlobalAlert(alertTitle, alertMsg, alertType);
  showToast(alertMsg, isSuccess ? 'success' : 'warning');
}

// Initialize on document load
document.addEventListener('DOMContentLoaded', () => {
  loadDatabase();

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
