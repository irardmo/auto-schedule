
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
    {
        "id": "s1",
        "title_and_code": "Computer Programming 1 CC 102",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "s1b",
        "title_and_code": "Introduction to Computing CC 101",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "s2",
        "title_and_code": "SYSTEM ADMIN AND MAINTENANCE SA 101",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "s3",
        "title_and_code": "Social and Professional Issues SP 101",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "s4",
        "title_and_code": "FUNDAMENTALS OF DATABASE SYSTEM IM 101",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "s5",
        "title_and_code": "FUNDAMENTALS OF DATABASE SYSTEM IM 101",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "s6",
        "title_and_code": "OBJECT ORIENTED PROGRAMMING PF 101",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "s7",
        "title_and_code": "OBJECT ORIENTED PROGRAMMING PF 101",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "s8",
        "title_and_code": "National Service Training Program 1 NSTP 1",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "s9",
        "title_and_code": "Physical Education PE 101",
        "course": "BSIT",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "s10",
        "title_and_code": "Physical Education PE 101",
        "course": "BSIT",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "s11",
        "title_and_code": "Physical Education PE 101",
        "course": "BSIT",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "s12",
        "title_and_code": "Physical Education PE 101",
        "course": "BSIT",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "s13",
        "title_and_code": "Physical Education PE 101",
        "course": "BSIT",
        "year_level": 3,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "s14",
        "title_and_code": "Physical Education PE 101",
        "course": "BSIT",
        "year_level": 3,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "s15",
        "title_and_code": "Information Assurance & Security IAS 101",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "s16",
        "title_and_code": "Web Systems and Technologies WS 101",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "s17",
        "title_and_code": "Capstone Project 1 CAP 101",
        "course": "BSIT",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "s18",
        "title_and_code": "Capstone Project 2 CAP 102",
        "course": "BSIT",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "so1",
        "title_and_code": "Basic Computer Concepts & Logic Formulation IT 101",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "so2",
        "title_and_code": "Computer Programming C++ IT 102",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "so3",
        "title_and_code": "Visual Basic Programming IT 201",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "so4",
        "title_and_code": "Database Management System FoxPro/SQL IT 202",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "so5",
        "title_and_code": "Operating Systems & Utility Software IT 203",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "so6",
        "title_and_code": "Computer Hardware & Networking Fundamentals IT 301",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "so7",
        "title_and_code": "Systems Analysis and Design SAD IT 302",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "so8",
        "title_and_code": "Web Page Development HTML/CSS IT 303",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "so9",
        "title_and_code": "Software Engineering & IT Management IT 401",
        "course": "BSIT",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "so10",
        "title_and_code": "IT Practicum / OJT 480 Hours IT 402",
        "course": "BSIT",
        "year_level": 4,
        "units": 6,
        "lec_hours": 0,
        "lab_hours": 6,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "so11",
        "title_and_code": "Physical Education 1 Physical Fitness PE 1",
        "course": "BSIT",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "so12",
        "title_and_code": "Physical Education 2 Rhythmic Activities PE 2",
        "course": "BSIT",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "so13",
        "title_and_code": "NSTP 1 Civic Welfare Training NSTP 1",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o101",
        "title_and_code": "GE 101 Understanding The Self (General Psychology)",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o102",
        "title_and_code": "GE 102 Sining ng Pakikipagtalastasan",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o103",
        "title_and_code": "GE EL 101 Entrepreneurial Mind",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o104",
        "title_and_code": "GE EL 103 Environmental Science",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o105",
        "title_and_code": "GE EL 104 Gender and Society",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o106",
        "title_and_code": "CRIM 111 Introduction to Criminology",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o107",
        "title_and_code": "CLJ 121 Introduction to Philippine Criminal Justice",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o109",
        "title_and_code": "PE 181 Fundamentals of Martial Arts",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o110",
        "title_and_code": "GE 103 Mathematics in Modern World (Plane Trigonometry)",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o111",
        "title_and_code": "GE 104 Purposive Communication",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o112",
        "title_and_code": "GE 105 PAGBASA AT PAGSULAT SA IBAT-IBANG DISIPLINA",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o113",
        "title_and_code": "CDI 131 Fundamentals of Investigation and Intelligence",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 4,
        "lec_hours": 4,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o114",
        "title_and_code": "LEA 151 Law Enforcement Organization and Administration",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 4,
        "lec_hours": 4,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o115",
        "title_and_code": "LEA 152 Comparative Models in Policing",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o117",
        "title_and_code": "PE 182 Arnis and Disarming Technique",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o118",
        "title_and_code": "EHC 171 ENHANCEMENT COURSE 1",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o119",
        "title_and_code": "GE 106 SCIENCE, TECHNOLOGY AND SOCIETY",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o120",
        "title_and_code": "GE 107 THE CONTEMPORARY WORLD",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o121",
        "title_and_code": "GE EL 102 PHILIPPINE LITERATURE",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o122",
        "title_and_code": "FORENSIC 141 Forensic Photography",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o123",
        "title_and_code": "CA 161 Institutional Corrections",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o124",
        "title_and_code": "CFLM-1 Character Formation, Nationalism and Patriotism",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o125",
        "title_and_code": "CRIM 112 Theories of Crime Causation",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o126",
        "title_and_code": "CDI 132 Specialized Crime Investigation 1 with Legal Medicine",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o127",
        "title_and_code": "PE 183 First Aid and Water Safety",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o128",
        "title_and_code": "GE 108 ETHICS",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o129",
        "title_and_code": "GE 109 READINGS ON PHILIPPINE HISTORY",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o130",
        "title_and_code": "GE 110 ART APPRECIATION",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o131",
        "title_and_code": "ADGE General Chemistry (Organic)",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o132",
        "title_and_code": "FORENSIC 142 Personal Identification Techniques",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o133",
        "title_and_code": "CRIM 113 Human Behavior and Victimology",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o134",
        "title_and_code": "LEA 153 Introduction to Industrial Security Concepts",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o135",
        "title_and_code": "PE 184 Fundamentals of Marksmanship",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o136",
        "title_and_code": "EHC 172 ENHANCEMENT COURSE 2",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o137",
        "title_and_code": "RZL LIFE AND WORKS OF RIZAL",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o138",
        "title_and_code": "CFLM-2 Character Formation with Leadership, Decision Making, Management and Administration",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o139",
        "title_and_code": "CLJ 122 Human Rights Education",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o140",
        "title_and_code": "CLJ 123 Criminal Law (Book 1)",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o141",
        "title_and_code": "FORENSIC 143 Forensic Chemistry and Toxicology",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 5,
        "lec_hours": 3,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o142",
        "title_and_code": "CDI 133 Specialized Crime Investigation 2 with Simulation on Interrogation and Interview",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o143",
        "title_and_code": "CDI 134 Traffic Management and Accident Investigation with Driving",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o144",
        "title_and_code": "LEA 154 Law Enforcement Operations and Planning with Crime Mapping",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o145",
        "title_and_code": "CA 162 Non-Institutional Corrections",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o146",
        "title_and_code": "CLJ 124 Criminal Law (Book 2)",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 4,
        "lec_hours": 4,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o147",
        "title_and_code": "CRIM 114 Professional Conduct and Ethical Standards",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o148",
        "title_and_code": "CRIM 115 Juvenile Delinquency and Juvenile Justice System",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 4,
        "lec_hours": 4,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o149",
        "title_and_code": "FORENSIC 114 Questioned Documents Examination",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o150",
        "title_and_code": "FORENSIC 115 Lie Detection Techniques",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o151",
        "title_and_code": "CDI 135 Technical English 1 (Technical Report Writing and Presentation)",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o152",
        "title_and_code": "EHC 3 ENHANCEMENT COURSE 3",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o153",
        "title_and_code": "CA 163 Therapeutic Modalities",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o154",
        "title_and_code": "CLJ 125 Evidence",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o155",
        "title_and_code": "CRIM 116 Dispute Resolution and Crises/Incidents Management",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o156",
        "title_and_code": "CRIM 117 Criminological Research1 (Research Methods with Applied Statistics)",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o157",
        "title_and_code": "CDI 136 Fire Protection and Arson Investigation",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o158",
        "title_and_code": "CDI 137 Vice and Drug Education and Control",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o159",
        "title_and_code": "CP 191 Internship (On-the Job Training)",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 0,
        "lab_hours": 3,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o160",
        "title_and_code": "CLJ 126 Criminal Procedure and Court Testimony",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o161",
        "title_and_code": "FORENSIC 146 Forensic Ballistics",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o162",
        "title_and_code": "CRIM 118 Criminological Research 2(Thesis Writing and Presentation",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o163",
        "title_and_code": "CDI 138 Technical English 2 (Legal Forms)",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o164",
        "title_and_code": "CDI 139 Introduction to Cybercrime and Environmental Laws and Protection",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_o165",
        "title_and_code": "CP 192 Internship (On-the Job Training)",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 0,
        "lab_hours": 3,
        "is_major": 1,
        "curriculum_type": "old"
    },
    {
        "id": "crim_n101",
        "title_and_code": "GE 101 Understanding the Self (General Psychology)",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n102",
        "title_and_code": "GE 106 Science, Technology, and Society",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n103",
        "title_and_code": "LEA 1 Law Enforcement Organization and Administration",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 4,
        "lec_hours": 4,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n104",
        "title_and_code": "CFLM-1 Character Formation, Nationalism and Patriotism",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n105",
        "title_and_code": "GE EL 105 Gender and Society",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n106",
        "title_and_code": "CRIM 1 Introduction To Criminology",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n107",
        "title_and_code": "CLJ 1 Introduction To Philippine Criminal Justice System",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n108",
        "title_and_code": "NSTP 1 Reserve Officers\u2019 Training Corps 1",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n109",
        "title_and_code": "PATHFIT 1 Fundamentals Of Martial Arts",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n110",
        "title_and_code": "CRIM 2 Theories of Crime Causation",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n111",
        "title_and_code": "GE 103 Mathematics In Modern World (Plane Trigonometry)",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n112",
        "title_and_code": "GE 104 Purposive Communication",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n113",
        "title_and_code": "GE EL 1 Advanced Computer",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n114",
        "title_and_code": "GE 108 Ethics",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n115",
        "title_and_code": "CRIM 3 Human Behavior and Victimology",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n116",
        "title_and_code": "LEA 2 Comparative Models in Policing",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n117",
        "title_and_code": "CDI 1 Fundamentals Of Investigation and Intelligence",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 4,
        "lec_hours": 4,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n118",
        "title_and_code": "NSTP 2 Reserve Officers\u2019 Training Corps 2",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n119",
        "title_and_code": "PATHFIT 2 Arnis And Disarming Technique",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n120",
        "title_and_code": "CFLM 2 Character Formation w/ Leadership, Decision Making Management & Administration",
        "course": "BSCRIM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n121",
        "title_and_code": "LEA 3 Introduction to Industrial Security Concepts",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n122",
        "title_and_code": "GE 107 The Contemporary World",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n123",
        "title_and_code": "CRIM 4 Professional Conduct and Ethical Standards",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n124",
        "title_and_code": "CA 1 Institutional Corrections",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n125",
        "title_and_code": "FORENSIC 1 Forensic Photography",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n126",
        "title_and_code": "CDI 2 Specialized Crime Investigation 1 with Legal Medicine",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n127",
        "title_and_code": "CRIM 5 Juvenile Delinquency and Juvenile Justice System",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n128",
        "title_and_code": "LEA 4 Law Enforcement Operations and Planning with Crime Mapping",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n129",
        "title_and_code": "PATHFIT 3 First Aid and Water Safety",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n130",
        "title_and_code": "RZL Life and Works of Rizal",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n131",
        "title_and_code": "GE 109 Readings On Philippine History",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n132",
        "title_and_code": "GE 110 Art Appreciation",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n133",
        "title_and_code": "GE EL 2 Information Assistance & Security",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n134",
        "title_and_code": "ADGE General Chemistry (Organic)",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n135",
        "title_and_code": "FORENSIC 2 Personal Identification Techniques",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n136",
        "title_and_code": "CDI 3 Specialized Crime Investigation 2 With Simulation on Interrogation and Interview",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n137",
        "title_and_code": "CA2 Non-Institutional Corrections",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n138",
        "title_and_code": "CDI 4 Traffic Management and Accident Investigation with Driving",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n139",
        "title_and_code": "PATHFIT 4 Fundamentals of Marksmanship",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n140",
        "title_and_code": "CDI 5 Technical English 1 (Technical Report Writing and Presentation)",
        "course": "BSCRIM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n141",
        "title_and_code": "CLJ 2 Human Rights Education",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n142",
        "title_and_code": "CLJ 3 Criminal Law (Book 1)",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n143",
        "title_and_code": "FORENSIC 5 Lie Detection Techniques",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n144",
        "title_and_code": "STAT 111 Statistics",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n145",
        "title_and_code": "FORENSIC 3 Forensic Chemistry and Toxicology",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 5,
        "lec_hours": 3,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n146",
        "title_and_code": "CRIM 7 Criminological Research1 (Research Methods with Applied Statistics)",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n147",
        "title_and_code": "CA 3 Therapeutic Modalities",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n148",
        "title_and_code": "FORENSIC 4 Questioned Documents Examination",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n149",
        "title_and_code": "EHC 1 Criminology Enhancement Course 1",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n150",
        "title_and_code": "CRIM 8 Criminological Research 2(Thesis Writing and Presentation",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n151",
        "title_and_code": "CLJ 4 Criminal Law (Book 2)",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 4,
        "lec_hours": 4,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n152",
        "title_and_code": "CRIM 6 Dispute Resolution and Crises/Incidents Management",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n153",
        "title_and_code": "FORENSIC 6 Forensic Ballistics",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n154",
        "title_and_code": "CDI 6 Fire Protection and Arson Investigation",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n155",
        "title_and_code": "CDI 9 Introduction To Cybercrime and Environmental Laws and Protection",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n156",
        "title_and_code": "EHC 2 Criminology Enhancement Course 2",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n157",
        "title_and_code": "CDI 7 Vice And Drug Education and Control",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n158",
        "title_and_code": "CDI 8 Technical English 2 (Legal Forms)",
        "course": "BSCRIM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n159",
        "title_and_code": "CLJ 5 Evidence",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n160",
        "title_and_code": "CP 1 Internship (On-The Job Training) 270 hrs",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 0,
        "lab_hours": 3,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n161",
        "title_and_code": "CLJ 6 Criminal Procedure And Court Testimony",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "crim_n162",
        "title_and_code": "CP 2 Internship (On-The Job Training) 270 hrs",
        "course": "BSCRIM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 0,
        "lab_hours": 3,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n1",
        "title_and_code": "Understanding the Self GE 101",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n2",
        "title_and_code": "Basic English Grammar GE 102",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n3",
        "title_and_code": "Philippine Literature GE EL 102",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n4",
        "title_and_code": "Introduction to Linguistics EL 100",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n5",
        "title_and_code": "Language, Culture and Society EL 101",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n6",
        "title_and_code": "Computer 1 Comp 101",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n7",
        "title_and_code": "Physical Fitness PATHFIT 1",
        "course": "BSED",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n8",
        "title_and_code": "Structures of English EL 102",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n9",
        "title_and_code": "National Service Training Program 1 NSTP 1",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n10",
        "title_and_code": "Principles and Theories of Language Acquisition and Learning EL 103",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n11",
        "title_and_code": "Mathematics in the Modern World GE 103",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n12",
        "title_and_code": "Purposive Communication GE 104",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n13",
        "title_and_code": "The Child and Adolescent Learner and Learning Principles PROF ED 1",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n14",
        "title_and_code": "Language Programs and Policies in Multilingual Societies EL 104",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n15",
        "title_and_code": "Language Learning Materials Development EL 105",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n16",
        "title_and_code": "The Teaching Profession PROFED2",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n17",
        "title_and_code": "Rhythmic Activities PATHFIT 2",
        "course": "BSED",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n18",
        "title_and_code": "Teaching and Assessment of Literature Studies EL106",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n19",
        "title_and_code": "National Service Training Program 2 NSTP 2",
        "course": "BSED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n20",
        "title_and_code": "Science, Technology and Society GE 106",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n21",
        "title_and_code": "The Contemporary World GE 107",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n22",
        "title_and_code": "Teaching and Assessment of the Macro skills EL107",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n23",
        "title_and_code": "Teaching and Assessment of Grammar EL108",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n24",
        "title_and_code": "Speech and Theater Arts EL 109",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n25",
        "title_and_code": "Children and Adolescent Literature EL111",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n26",
        "title_and_code": "Mythology and Folklore EL112",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n27",
        "title_and_code": "Public Speaking and Debate GE 105",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n28",
        "title_and_code": "Dual Sports and Games PATHFIT 3",
        "course": "BSED",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n29",
        "title_and_code": "Ethics GE 108",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n30",
        "title_and_code": "Readings on Philippine History GE 109",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n31",
        "title_and_code": "Art Appreciation GE 110",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n32",
        "title_and_code": "The Teacher and the Community, School Culture and Organizational Leadership PROFED3",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n33",
        "title_and_code": "Survey of Philippine Literature in English EL113",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n34",
        "title_and_code": "Survey of Afro-Asian Literature EL114",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n35",
        "title_and_code": "Team Sport and Games PATHFIT 4",
        "course": "BSED",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n36",
        "title_and_code": "Survey of English and American Literature EL115",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n37",
        "title_and_code": "Contemporary and Popular Literature EL116",
        "course": "BSED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n38",
        "title_and_code": "Life and Works of Rizal RZL",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n39",
        "title_and_code": "Statistics GE 111",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n40",
        "title_and_code": "Foundation of Special and Inclusive Education PROFED4",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n41",
        "title_and_code": "Facilitating Learner-Centered Teaching PROF ED 5",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n42",
        "title_and_code": "Literary Criticism EL117",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n43",
        "title_and_code": "Technical Writing EL118",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n44",
        "title_and_code": "Assessment of Learning 1 PROFED 6",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n45",
        "title_and_code": "FIELD STUDY 1 (Observations of Teaching) FS1",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n46",
        "title_and_code": "Language Research 1 RES 1",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n47",
        "title_and_code": "Stylistics and Discourse Analysis ELEC1",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n48",
        "title_and_code": "FIELD STUDY 2 (Participation and Teaching Assistanship) FS2",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n49",
        "title_and_code": "Remedial Instruction ELEC2",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n50",
        "title_and_code": "Assessment of Learning 2 PROF ED7",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n51",
        "title_and_code": "The Teacher and the School Curriculum PROF ED 9",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n52",
        "title_and_code": "Campus Journalism EL 119",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n53",
        "title_and_code": "Building and Enhancing New Literacies Across the Curriculum PROF ED 10",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n54",
        "title_and_code": "Technology for Teaching and Learning 1 PROF ED 8",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n55",
        "title_and_code": "Language Research 2 RES 2",
        "course": "BSED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n56",
        "title_and_code": "Educational Enhancement Course 2 EHC2",
        "course": "BSED",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n57",
        "title_and_code": "Technology for Teaching and Learning 2 (Teaching in Language Education) EL120",
        "course": "BSED",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsed_n58",
        "title_and_code": "TEACHING INTERNSHIP EL-TIB",
        "course": "BSED",
        "year_level": 4,
        "units": 6,
        "lec_hours": 6,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n1",
        "title_and_code": "Understanding The Self GE 101",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n2",
        "title_and_code": "Entrepreneurial Mind GE EL 101",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n3",
        "title_and_code": "Fundamentals Of Customs And Tariff Management TM 1",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n4",
        "title_and_code": "Entrepreneurial Management ELC 1",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n5",
        "title_and_code": "Physical Fitness PATHFIT 1",
        "course": "BSCA",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n6",
        "title_and_code": "Intro To Supply Chain Mgt SCM 1",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n7",
        "title_and_code": "Border Control & Security CM 1",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n8",
        "title_and_code": "Philippine Literature GE EL 102",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n9",
        "title_and_code": "National Service Training Program 1 NSTP 1",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n10",
        "title_and_code": "Mathematics In the Modern World GE 103",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n11",
        "title_and_code": "Purposive Communication GE 104",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n12",
        "title_and_code": "Advance Computer COMP 102",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n13",
        "title_and_code": "Warehouse Operations Mgt SCM 2",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n14",
        "title_and_code": "Customs Operations & Cargo Handling CM 2",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n15",
        "title_and_code": "Exercise-Based Fitness Activities PATHFIT 2",
        "course": "BSCA",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n16",
        "title_and_code": "Commodiy Classification System TM 2",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n17",
        "title_and_code": "Obligation And Contract SBEC 1",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n18",
        "title_and_code": "National Service Training Program 2 NSTP 2",
        "course": "BSCA",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n19",
        "title_and_code": "Science, Technology, and Society GE 106",
        "course": "BSCA",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n20",
        "title_and_code": "The Contemporary World GE 107",
        "course": "BSCA",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n21",
        "title_and_code": "Taxation (Income and Business Taxation) SBEC 2",
        "course": "BSCA",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n22",
        "title_and_code": "Indigenous Creative Arts GE EL 103",
        "course": "BSCA",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n23",
        "title_and_code": "Procurement And Inventory Management SCM 3",
        "course": "BSCA",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n24",
        "title_and_code": "Customs Valuation System TM 3",
        "course": "BSCA",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n25",
        "title_and_code": "Customs Warehousing CM 3",
        "course": "BSCA",
        "year_level": 2,
        "units": 5,
        "lec_hours": 5,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n26",
        "title_and_code": "Group Exercise (Aerobics, Yoga, Etc.) PATHFIT 3",
        "course": "BSCA",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n27",
        "title_and_code": "Ethics GE 108",
        "course": "BSCA",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n28",
        "title_and_code": "Readings On Philippine History GE 109",
        "course": "BSCA",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n29",
        "title_and_code": "Transportation Management SCM 4",
        "course": "BSCA",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n30",
        "title_and_code": "Customs Clearance CM 4",
        "course": "BSCA",
        "year_level": 2,
        "units": 5,
        "lec_hours": 5,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n31",
        "title_and_code": "Operations Management CMBE 1",
        "course": "BSCA",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n32",
        "title_and_code": "Customs Appraisal And Assessment TM 4",
        "course": "BSCA",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n33",
        "title_and_code": "Financial Management EL 2",
        "course": "BSCA",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n34",
        "title_and_code": "Sports PATHFIT 4",
        "course": "BSCA",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n35",
        "title_and_code": "Statistics GE 111",
        "course": "BSCA",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n36",
        "title_and_code": "Life And Works of Rizal RZL",
        "course": "BSCA",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n37",
        "title_and_code": "Customs Proceeding CM 5",
        "course": "BSCA",
        "year_level": 3,
        "units": 5,
        "lec_hours": 5,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n38",
        "title_and_code": "Excise Taxes, Liquidation of Duty and Surcharges TM 5",
        "course": "BSCA",
        "year_level": 3,
        "units": 5,
        "lec_hours": 5,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n39",
        "title_and_code": "International Marketing EL 3",
        "course": "BSCA",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n40",
        "title_and_code": "Strategic Management CMBE 2",
        "course": "BSCA",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n41",
        "title_and_code": "Thesis Writing 1 RES 1",
        "course": "BSCA",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n42",
        "title_and_code": "Gender And Society GE 112",
        "course": "BSCA",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n43",
        "title_and_code": "Customs Post Clearance Audit and Fraud Detection CM 6",
        "course": "BSCA",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n44",
        "title_and_code": "Special Duties and Trade Remedies TM6",
        "course": "BSCA",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n45",
        "title_and_code": "International Trade Organizations, Agreements, and Rules of Origin TM7",
        "course": "BSCA",
        "year_level": 3,
        "units": 5,
        "lec_hours": 5,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n46",
        "title_and_code": "Thesis Writing 2 RES 2",
        "course": "BSCA",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n47",
        "title_and_code": "Ethics And Standards of The Customs Broker CM 7",
        "course": "BSCA",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n48",
        "title_and_code": "Competencies Assessment in Customs Management CM 8",
        "course": "BSCA",
        "year_level": 4,
        "units": 5,
        "lec_hours": 5,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n49",
        "title_and_code": "Competencies Assessment in Tariff Management TM 8",
        "course": "BSCA",
        "year_level": 4,
        "units": 5,
        "lec_hours": 5,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsca_n50",
        "title_and_code": "Internship/Practicum for Customs Administration (600HRS) INTERN",
        "course": "BSCA",
        "year_level": 4,
        "units": 6,
        "lec_hours": 6,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n1",
        "title_and_code": "Understanding The Self GE 101",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n2",
        "title_and_code": "Good Manners And Right Conduct VED",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n3",
        "title_and_code": "Philippine Literature GE EL 102",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n4",
        "title_and_code": "Teaching Math In The Primary Grades MATH 1",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n5",
        "title_and_code": "Computer 1 COMP 101",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n6",
        "title_and_code": "Physical Fitness PATHFIT 1",
        "course": "BEED",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n7",
        "title_and_code": "National Service Training Program 1 NSTP 1",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n8",
        "title_and_code": "The Child And Adolescent Learners And Learning Principles PROF ED 1",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n9",
        "title_and_code": "Teaching English In The Elementary Grades (Language Arts) ENG 1",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n10",
        "title_and_code": "Mathematics in the Modern World GE 103",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n11",
        "title_and_code": "Purposive Communication GE 104",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n12",
        "title_and_code": "Pagbasa At Pagsulat Sa Ibat-Ibang Disiplina GE 105",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n13",
        "title_and_code": "Teaching Science In The Elementary Grades (Biology And Chemistry) SCI 1",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n14",
        "title_and_code": "Teaching Math In The Intermediate Grades MATH 2",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n15",
        "title_and_code": "Rhythmic Activities PATHFIT 2",
        "course": "BEED",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n16",
        "title_and_code": "National Service Training Program 2 NSTP 2",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n17",
        "title_and_code": "The Teaching Profession PROF ED 2",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n18",
        "title_and_code": "Teaching Music In The Elementary Grades MUSIC",
        "course": "BEED",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n19",
        "title_and_code": "Science, Technology And Society GE 106",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n20",
        "title_and_code": "The Contemporary World GE 107",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n21",
        "title_and_code": "Foundation Of Special And Inclusive Education PROF ED 4",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n22",
        "title_and_code": "Life And Works Of Rizal RZL",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n23",
        "title_and_code": "Dual Sports And Games PATHFIT 3",
        "course": "BEED",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n24",
        "title_and_code": "The Teacher And The Community, School Culture And Organizational Leadership PROF ED 3",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n25",
        "title_and_code": "Teaching English In The Elementary Grades Through Literature ENG 2",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n26",
        "title_and_code": "Pagtuturo Ng Filipino Sa Elementarya - Estraktura At Gamit Ng Wikang Filipino FIL",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n27",
        "title_and_code": "Teaching Science In The Elementary Grades (Physics, Space And Earth Science) SCI 2",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n28",
        "title_and_code": "Ethics GE 108",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n29",
        "title_and_code": "Readings On Philippine History GE 109",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n30",
        "title_and_code": "Art Appreciation GE 110",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n31",
        "title_and_code": "Team Sports And Games PATHFIT 4",
        "course": "BEED",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n32",
        "title_and_code": "Facilitating Learner-Centered Teaching PROF ED 5",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n33",
        "title_and_code": "Assessment In Learning 1 PROF ED 6",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n34",
        "title_and_code": "Technology For Teaching And Elementary Grades TTL",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n35",
        "title_and_code": "Content And Pedagogy In The Mother Tongue MTB-MLE",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n36",
        "title_and_code": "Pagtuturo And Filipino Sa Elementarya - Panitikan Ng Pilipinas FIL",
        "course": "BEED",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n37",
        "title_and_code": "Statistics GE 111",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n38",
        "title_and_code": "Educational Research 1 EDUC RES 1",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n39",
        "title_and_code": "Teaching Social Studies In The Elementary Grades (Philippine History And Government) SSC 1",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n40",
        "title_and_code": "Assessment In Learning 2 PROF ED 7",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n41",
        "title_and_code": "Technology For Teaching And Learning PROF ED 8",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n42",
        "title_and_code": "Edukasyong Pantahanan At Pangkabuhayan TLE",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n43",
        "title_and_code": "Teaching Arts In The Elementary Grades ARTS",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n44",
        "title_and_code": "Field Study 1 FS 1",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n45",
        "title_and_code": "Educational Enhancement Course EHC 1",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n46",
        "title_and_code": "The Teacher And The School Curriculum PROF ED 9",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n47",
        "title_and_code": "Teaching Social Studies In The Elementary Grades (Culture And Geography) SSC 2",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n48",
        "title_and_code": "Teaching Pe And Health In The Elementary Grades PEH",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n49",
        "title_and_code": "Edukasyong Pantahanan At Pangkabuhayan With Entrepreneurship TLE",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n50",
        "title_and_code": "Field Study 2 FS",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n51",
        "title_and_code": "Building And Enhancing New Literacies Across The Curriculum. PROF ED 10",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n52",
        "title_and_code": "Educational Research 2 EDUC RES 2",
        "course": "BEED",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n53",
        "title_and_code": "Educational Enhancement Course 2 EHC 2",
        "course": "BEED",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n54",
        "title_and_code": "Teaching Multigrade Classes ED ELEC",
        "course": "BEED",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "beed_n55",
        "title_and_code": "Teaching Internship PT",
        "course": "BEED",
        "year_level": 4,
        "units": 6,
        "lec_hours": 6,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n1",
        "title_and_code": "Understanding the Self GE 101",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n2",
        "title_and_code": "Sining ng Pakikipagtalastasan GE 102",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n3",
        "title_and_code": "Entrepreneurial Mind GE EL 101",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n4",
        "title_and_code": "Computer Programming 1 CC 102",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n5",
        "title_and_code": "Movement Competency Training PATHFIT 1",
        "course": "BSIT",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n6",
        "title_and_code": "National Service Training Program 1 NSTP 1",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n7",
        "title_and_code": "Introduction to Computing CC 101",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n8",
        "title_and_code": "Discrete Mathematics MS 101",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n9",
        "title_and_code": "Mathematics in the Modern World GE 103",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n10",
        "title_and_code": "Purposive Communication GE 104",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n11",
        "title_and_code": "Pagbasa at Pagsulat sa Iba\u2019t Ibang Disiplina GE 105",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n12",
        "title_and_code": "Information Technology Fundamentals CC 104",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n13",
        "title_and_code": "Exercise-Based Fitness Activities PATHFIT 2",
        "course": "BSIT",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n14",
        "title_and_code": "National Service Training Program 2 NSTP 2",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n15",
        "title_and_code": "Computer Programming 2 CC 103",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n16",
        "title_and_code": "Quantitative Methods MS 102",
        "course": "BSIT",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n17",
        "title_and_code": "Science, Technology, and Society GE 106",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n18",
        "title_and_code": "The Contemporary World GE 107",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n19",
        "title_and_code": "Philippine Literature GE EL 102",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n20",
        "title_and_code": "Indigenous Creative Arts GE EL 103",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n21",
        "title_and_code": "Group Exercise PATHFIT 3",
        "course": "BSIT",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n22",
        "title_and_code": "Event Driven Programming PF 102",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n23",
        "title_and_code": "Fundamentals of Database Systems IM 101",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n24",
        "title_and_code": "Object-Oriented Programming PF 101",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n25",
        "title_and_code": "Business Ethics GE 108",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n26",
        "title_and_code": "Readings in Philippine History GE 109",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n27",
        "title_and_code": "Art Appreciation GE 110",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n28",
        "title_and_code": "Sports PATHFIT 4",
        "course": "BSIT",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n29",
        "title_and_code": "Data Structures and Algorithms CC 106",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n30",
        "title_and_code": "Information Management CC 105",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n31",
        "title_and_code": "Info Assurance and Security 1 IAS 101",
        "course": "BSIT",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n32",
        "title_and_code": "Statistics GE 111",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n33",
        "title_and_code": "Life and Works of Rizal RZL",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n34",
        "title_and_code": "App Dev. & Emerging Technologies CC 107",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n35",
        "title_and_code": "Networking 1 NET 101",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n36",
        "title_and_code": "Intro to Human-Computer Interaction HCI 101",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n37",
        "title_and_code": "System Admin & Maintenance SA 101",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n38",
        "title_and_code": "Social and Professional Issues SP 101",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n39",
        "title_and_code": "Web Systems and Technology WS 101",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n40",
        "title_and_code": "Integrative Programming & Technologies IPT 101",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n41",
        "title_and_code": "Networking 2 NET 102",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n42",
        "title_and_code": "Info Assurance and Security 2 IAS 102",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n43",
        "title_and_code": "System Integration and Architecture 1 SIA 101",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n44",
        "title_and_code": "Capstone Project and Research 1 CAP 101",
        "course": "BSIT",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n45",
        "title_and_code": "System Integration and Architecture 2 SIA 102",
        "course": "BSIT",
        "year_level": 4,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n46",
        "title_and_code": "Platform Technologies PT 101",
        "course": "BSIT",
        "year_level": 4,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n47",
        "title_and_code": "Multimedia and Animation IT 101",
        "course": "BSIT",
        "year_level": 4,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n48",
        "title_and_code": "Human-Computer Interaction 2 HCI 102",
        "course": "BSIT",
        "year_level": 4,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n49",
        "title_and_code": "Capstone Project and Research 2 CAP 102",
        "course": "BSIT",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsit_n50",
        "title_and_code": "Practicum (600 hours) PRAC 101",
        "course": "BSIT",
        "year_level": 4,
        "units": 6,
        "lec_hours": 6,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n1",
        "title_and_code": "Understanding The Self GE 101",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n2",
        "title_and_code": "Sining Ng Pakikipagtalastasan GE 102",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n3",
        "title_and_code": "Entrepreurial Mind GE EL 101",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n4",
        "title_and_code": "Business Finance (For Non-Abm) (NABMB 153)",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n5",
        "title_and_code": "Computer 1 COMP 101",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n6",
        "title_and_code": "Physical Fitness PTHFIT 1",
        "course": "BSHM",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n7",
        "title_and_code": "National Service Training Program 1 NSTP 1",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n8",
        "title_and_code": "Philippine Culture and Tourism Geography THC 111",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n9",
        "title_and_code": "Operations Management BME 141",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n10",
        "title_and_code": "Mathematics In The Modern World GE 103",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n11",
        "title_and_code": "Purposive Communication GE 104",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n12",
        "title_and_code": "Pagbasa At Pagsulat Sa Ibat-Ibang Disiplina GE 105",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n13",
        "title_and_code": "Kitchen Essentials And Basic Food Preparations HPC 121",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n14",
        "title_and_code": "Advance Computer COMP 102",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n15",
        "title_and_code": "Rhytmic Activities PATHFIT 2",
        "course": "BSHM",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n16",
        "title_and_code": "National Service Training Program 2 NSTP 2",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n17",
        "title_and_code": "Risk Management As Applied To Safety, Security And Sanitation THC 112",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n18",
        "title_and_code": "Business Marketing (NABMB 152)",
        "course": "BSHM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n19",
        "title_and_code": "Science, Technology and Society GE 106",
        "course": "BSHM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n20",
        "title_and_code": "The Contemporary World GE 107",
        "course": "BSHM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n21",
        "title_and_code": "Philippine Literature GE EL 102",
        "course": "BSHM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n22",
        "title_and_code": "Indigenous Creative Arts GE EL 103",
        "course": "BSHM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n23",
        "title_and_code": "Dual Sports and Games PATHFIT 3",
        "course": "BSHM",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n24",
        "title_and_code": "Quality Service Management in Tourism and Hospitality THC 113",
        "course": "BSHM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n25",
        "title_and_code": "Applied Economics (For Non-Abm) (NABMB 154)",
        "course": "BSHM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n26",
        "title_and_code": "Life And Works Of Rizal RZL",
        "course": "BSHM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n27",
        "title_and_code": "Ethics GE 108",
        "course": "BSHM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n28",
        "title_and_code": "Readings On Philippine History GE 109",
        "course": "BSHM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n29",
        "title_and_code": "Art Appreciation GE 110",
        "course": "BSHM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n30",
        "title_and_code": "Team Sports And Games PATHFIT 4",
        "course": "BSHM",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n31",
        "title_and_code": "Legal Aspects in Tourism and Hospitality THC 114",
        "course": "BSHM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n32",
        "title_and_code": "Fundamentals In Food Service Operation HPC 122",
        "course": "BSHM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 1,
        "lab_hours": 2,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n33",
        "title_and_code": "Culinary Fundamentals HMPE 131",
        "course": "BSHM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n34",
        "title_and_code": "Strategic Management BME 142",
        "course": "BSHM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n35",
        "title_and_code": "Statistics GE 111",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n36",
        "title_and_code": "Macro Perspective of Tourism and Hospitality THC 115",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n37",
        "title_and_code": "Professional Development and Applied Ethics THC 116",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n38",
        "title_and_code": "Fundamentals In Lodging Operations HPC 123",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n39",
        "title_and_code": "Food And Beverage Operation HMPE 132",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n40",
        "title_and_code": "Housekeeping Operations HMPE 133",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n41",
        "title_and_code": "Fundamentals Of Accounting (For Non- Abm) NABMB 155",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n42",
        "title_and_code": "Hospitality Research 1 RESEARCH 1",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n43",
        "title_and_code": "Multicultural Diversity in Workplace for The Tourism Professional THC 117",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n44",
        "title_and_code": "Micro Perspective of Tourism and Hospitality THC 118",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n45",
        "title_and_code": "Applied Business Tools and Technologies HPC 124",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n46",
        "title_and_code": "Front Office Operation HMPE 134",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n47",
        "title_and_code": "Room Division Management HMPE 135",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n48",
        "title_and_code": "Supply Chain Management in Hospitality Industry HPC 125",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n49",
        "title_and_code": "Foreign Language 1 (Spanish) HPC 128",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n50",
        "title_and_code": "Hospitality Research 2 RESEARCH 2",
        "course": "BSHM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n51",
        "title_and_code": "Introduction To Meetings, Incentives, Conferences and Events Management (MICE) HPC 126",
        "course": "BSHM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n52",
        "title_and_code": "Ergonometric And Facilities Planning for The Hospitality Industry HPC 127",
        "course": "BSHM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n53",
        "title_and_code": "Foreign Language 2 (Spanish) HPC 129",
        "course": "BSHM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n54",
        "title_and_code": "Tourism And Hospitality Marketing THC 119",
        "course": "BSHM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n55",
        "title_and_code": "Entrepreneurship In Tourism and Hospitality THC 120",
        "course": "BSHM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bshm_n56",
        "title_and_code": "INTERNSHIP/PRACTICUM INT",
        "course": "BSHM",
        "year_level": 4,
        "units": 6,
        "lec_hours": 6,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n1",
        "title_and_code": "Understanding The Self GE 101",
        "course": "BSBA-MM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n2",
        "title_and_code": "Entrepreneurial Mind GE EL 101",
        "course": "BSBA-MM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n3",
        "title_and_code": "Philippine Literature GE EL 102",
        "course": "BSBA-MM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n4",
        "title_and_code": "Basic Microeconomics BUS CORE 111",
        "course": "BSBA-MM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n5",
        "title_and_code": "Professional Salesmanship PROF COR MM 121",
        "course": "BSBA-MM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n6",
        "title_and_code": "Physical Fitness PATHFIT 1",
        "course": "BSBA-MM",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n7",
        "title_and_code": "National Service Training Program 1 NSTP 1",
        "course": "BSBA-MM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n8",
        "title_and_code": "Mathematics in the Modern World GE 103",
        "course": "BSBA-MM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n9",
        "title_and_code": "Purposive Communication GE 104",
        "course": "BSBA-MM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n10",
        "title_and_code": "Ethics GE 108",
        "course": "BSBA-MM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n11",
        "title_and_code": "Business Law (Obligation And Contracts) BUS CORE 112",
        "course": "BSBA-MM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n12",
        "title_and_code": "Personal Finance MM ELEC 131",
        "course": "BSBA-MM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n13",
        "title_and_code": "Rhytmic Activities PATHFIT 2",
        "course": "BSBA-MM",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n14",
        "title_and_code": "National Service Training Program 2 NSTP 2",
        "course": "BSBA-MM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n15",
        "title_and_code": "Science, Technology And Society GE 106",
        "course": "BSBA-MM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n16",
        "title_and_code": "The Contemporary World GE 107",
        "course": "BSBA-MM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n17",
        "title_and_code": "Indigenous Creative Arts GE EL 103",
        "course": "BSBA-MM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n18",
        "title_and_code": "Operations Management (Tqm) BME 141",
        "course": "BSBA-MM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n19",
        "title_and_code": "Good Governance And Social Responsibility BUS CORE 113",
        "course": "BSBA-MM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n20",
        "title_and_code": "Marketing Management PROF COR MM 122",
        "course": "BSBA-MM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n21",
        "title_and_code": "Dual Sports And Games PATHFIT 3",
        "course": "BSBA-MM",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n22",
        "title_and_code": "Readings On Philippine History GE 109",
        "course": "BSBA-MM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n23",
        "title_and_code": "Art Appreciation GE 110",
        "course": "BSBA-MM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n24",
        "title_and_code": "Income Taxation BUS CORE 114",
        "course": "BSBA-MM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n25",
        "title_and_code": "Strategic Management BME 142",
        "course": "BSBA-MM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n26",
        "title_and_code": "Distribution Management PROF COR MM 123",
        "course": "BSBA-MM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n27",
        "title_and_code": "Advertising PROF COR MM 124",
        "course": "BSBA-MM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n28",
        "title_and_code": "Team Sports And Games PATHFIT 4",
        "course": "BSBA-MM",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n29",
        "title_and_code": "Statistics GE 111",
        "course": "BSBA-MM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n30",
        "title_and_code": "Life And Works Of Rizal RZL",
        "course": "BSBA-MM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n31",
        "title_and_code": "Human Resource Management BUS CORE 115",
        "course": "BSBA-MM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n32",
        "title_and_code": "Business Research BUS CORE 116",
        "course": "BSBA-MM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n33",
        "title_and_code": "Product Management PROF COR MM 125",
        "course": "BSBA-MM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n34",
        "title_and_code": "Franchising MM ELEC 132",
        "course": "BSBA-MM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n35",
        "title_and_code": "Web Development COMP 104",
        "course": "BSBA-MM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n36",
        "title_and_code": "Retail Management PROF COR MM 126",
        "course": "BSBA-MM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n37",
        "title_and_code": "Pricing Strategy PROF COR MM 127",
        "course": "BSBA-MM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n38",
        "title_and_code": "Marketing Research PROF COR MM 128",
        "course": "BSBA-MM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n39",
        "title_and_code": "Consumer Behavior MM ELEC 133",
        "course": "BSBA-MM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n40",
        "title_and_code": "Sales Management MM ELEC 134",
        "course": "BSBA-MM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n41",
        "title_and_code": "Industrial/Agricultural Marketing MM ELEC 135",
        "course": "BSBA-MM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n42",
        "title_and_code": "Research 1 THESIS 1",
        "course": "BSBA-MM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n43",
        "title_and_code": "International Business And Trade BUS CORE 117",
        "course": "BSBA-MM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n44",
        "title_and_code": "Special Topics In Marketing Management MM ELEC 136",
        "course": "BSBA-MM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n45",
        "title_and_code": "Research 2 THESIS 2",
        "course": "BSBA-MM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_mm_n46",
        "title_and_code": "INTERNSHIP INT",
        "course": "BSBA-MM",
        "year_level": 4,
        "units": 6,
        "lec_hours": 6,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n1",
        "title_and_code": "Understanding The Self GE 101",
        "course": "BSBA-FM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n2",
        "title_and_code": "Entrepreneurial Mind GE EL 101",
        "course": "BSBA-FM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n3",
        "title_and_code": "Philippine Literature GE EL 102",
        "course": "BSBA-FM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n4",
        "title_and_code": "Financial Management PROF COR FM 121",
        "course": "BSBA-FM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n5",
        "title_and_code": "Basic Microeconomics BUS CORE 111",
        "course": "BSBA-FM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n6",
        "title_and_code": "Physical Fitness PATHFIT 1",
        "course": "BSBA-FM",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n7",
        "title_and_code": "National Service Training Program 1 NSTP 1",
        "course": "BSBA-FM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n8",
        "title_and_code": "Mathematics in the Modern World GE 103",
        "course": "BSBA-FM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n9",
        "title_and_code": "Purposive Communication GE 104",
        "course": "BSBA-FM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n10",
        "title_and_code": "Ethics GE 108",
        "course": "BSBA-FM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n11",
        "title_and_code": "Personal Finance FM ELEC 131",
        "course": "BSBA-FM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n12",
        "title_and_code": "Business Law (Obligation And Contracts) BUS CORE 112",
        "course": "BSBA-FM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n13",
        "title_and_code": "Rhythmic Activities PATHFIT 2",
        "course": "BSBA-FM",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n14",
        "title_and_code": "National Service Training Program 2 NSTP 2",
        "course": "BSBA-FM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n15",
        "title_and_code": "Science, Technology, and Society GE 106",
        "course": "BSBA-FM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n16",
        "title_and_code": "The Contemporary World GE 107",
        "course": "BSBA-FM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n17",
        "title_and_code": "Indigenous Creative Arts GE EL 103",
        "course": "BSBA-FM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n18",
        "title_and_code": "Banking And Financial Institution PROF COR FM 122",
        "course": "BSBA-FM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n19",
        "title_and_code": "Operations Management (Tqm) BME 141",
        "course": "BSBA-FM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n20",
        "title_and_code": "Good Governance And Social Responsibility BUS CORE 113",
        "course": "BSBA-FM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n21",
        "title_and_code": "Dual Sports And Games PATHFIT 3",
        "course": "BSBA-FM",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n22",
        "title_and_code": "Readings On Philippine History GE 109",
        "course": "BSBA-FM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n23",
        "title_and_code": "Art Appreciation GE 110",
        "course": "BSBA-FM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n24",
        "title_and_code": "Income Taxation BUSCORE 114",
        "course": "BSBA-FM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n25",
        "title_and_code": "Investment And Portfolio Management PROF COR FM 123",
        "course": "BSBA-FM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n26",
        "title_and_code": "Capital Market PROF COR FM 124",
        "course": "BSBA-FM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n27",
        "title_and_code": "Strategic Management BME 142",
        "course": "BSBA-FM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n28",
        "title_and_code": "Team Sports And Games PATHFIT 4",
        "course": "BSBA-FM",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n29",
        "title_and_code": "STATISTICS GE 111",
        "course": "BSBA-FM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n30",
        "title_and_code": "LIFE AND WORKS OF RIZAL RZL",
        "course": "BSBA-FM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n31",
        "title_and_code": "HUMAN RESOURCE MANAGEMENT BUS CORE 115",
        "course": "BSBA-FM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n32",
        "title_and_code": "BUSINESS RESEARCH BUS CORE 116",
        "course": "BSBA-FM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n33",
        "title_and_code": "FINANCIAL ANALYSIS AND REPORTING PROF COR FM 125",
        "course": "BSBA-FM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n34",
        "title_and_code": "CREDIT AND COLLECTION PROF COR FM 126",
        "course": "BSBA-FM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n35",
        "title_and_code": "INTRODUCTION  TO COMPUTING COMP 104",
        "course": "BSBA-FM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n36",
        "title_and_code": "MONETARY POLICY AND CENTRAL BANKING PROF COR FM 127",
        "course": "BSBA-FM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n37",
        "title_and_code": "SPECIAL TOPICS IN FINANCIAL MANGEMENT PROF COR FM 128",
        "course": "BSBA-FM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n38",
        "title_and_code": "BEHAVIORAL FINANCE FM ELEC 132",
        "course": "BSBA-FM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n39",
        "title_and_code": "TREASURY MANAGEMENT FM ELEC 133",
        "course": "BSBA-FM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n40",
        "title_and_code": "MUTUAL FUND FM ELEC 134",
        "course": "BSBA-FM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n41",
        "title_and_code": "RESEARCH 1 THESIS 1",
        "course": "BSBA-FM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n42",
        "title_and_code": "INTERNATIONAL BUSINESS AND TRADE BUS CORE 117",
        "course": "BSBA-FM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n43",
        "title_and_code": "ENTREPRENEURIAL MANAGEMENT FM ELEC 135",
        "course": "BSBA-FM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n44",
        "title_and_code": "RISK MANAGEMENT FM ELEC 136",
        "course": "BSBA-FM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n45",
        "title_and_code": "RESEARCH 2 THESIS 2",
        "course": "BSBA-FM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_fm_n46",
        "title_and_code": "INTERNSHIP INT",
        "course": "BSBA-FM",
        "year_level": 4,
        "units": 6,
        "lec_hours": 6,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n1",
        "title_and_code": "Understanding The Self GE 101",
        "course": "BSBA-HRDM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n2",
        "title_and_code": "Entrepreneurial Mind GE EL 101",
        "course": "BSBA-HRDM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n3",
        "title_and_code": "Human Resource Management MGT 1",
        "course": "BSBA-HRDM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n4",
        "title_and_code": "Philippine Literature GE EL 102",
        "course": "BSBA-HRDM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n5",
        "title_and_code": "Basic Microeconomics BUS CORE 111",
        "course": "BSBA-HRDM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n6",
        "title_and_code": "Physical Fitness PATHFIT 1",
        "course": "BSBA-HRDM",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n7",
        "title_and_code": "National Service Training Program 1 NSTP 1",
        "course": "BSBA-HRDM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n8",
        "title_and_code": "Mathematics In Modern World GE 103",
        "course": "BSBA-HRDM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n9",
        "title_and_code": "Purposive Communication GE 104",
        "course": "BSBA-HRDM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n10",
        "title_and_code": "Ethics GE 108",
        "course": "BSBA-HRDM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n11",
        "title_and_code": "Business Law (Obligation And Contract) BUSCORE 112",
        "course": "BSBA-HRDM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n12",
        "title_and_code": "Personal Finance HRM ELEC 1",
        "course": "BSBA-HRDM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n13",
        "title_and_code": "Rhytmic Activities PATHFIT 2",
        "course": "BSBA-HRDM",
        "year_level": 1,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n14",
        "title_and_code": "National Service Training Program 2 NSTP 2",
        "course": "BSBA-HRDM",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n15",
        "title_and_code": "Science, Technology, and Society GE 106",
        "course": "BSBA-HRDM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n16",
        "title_and_code": "The Contemporary World GE 107",
        "course": "BSBA-HRDM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n17",
        "title_and_code": "Administrative And Office Management HRM 1",
        "course": "BSBA-HRDM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n18",
        "title_and_code": "Labor Law And Legislation HRM 2",
        "course": "BSBA-HRDM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n19",
        "title_and_code": "Good Governance And Social Responsibility BUS CORE 113",
        "course": "BSBA-HRDM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n20",
        "title_and_code": "Operations Management BME 141",
        "course": "BSBA-HRDM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n21",
        "title_and_code": "Dual Sports And Games PATHFIT 3",
        "course": "BSBA-HRDM",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n22",
        "title_and_code": "Readings On Philippine History GE 109",
        "course": "BSBA-HRDM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n23",
        "title_and_code": "Art Appreciation GE 110",
        "course": "BSBA-HRDM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n24",
        "title_and_code": "Income Taxation BUS CORE 114",
        "course": "BSBA-HRDM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n25",
        "title_and_code": "Advance Computer COMP 102",
        "course": "BSBA-HRDM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n26",
        "title_and_code": "Recruitment And Selection HRM 3",
        "course": "BSBA-HRDM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n27",
        "title_and_code": "Strategic Management BME 142",
        "course": "BSBA-HRDM",
        "year_level": 2,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n28",
        "title_and_code": "Team Sports And Games PATHFIT 4",
        "course": "BSBA-HRDM",
        "year_level": 2,
        "units": 2,
        "lec_hours": 2,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n29",
        "title_and_code": "Statistics GE 111",
        "course": "BSBA-HRDM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n30",
        "title_and_code": "Life And Works Of Rizal RZL",
        "course": "BSBA-HRDM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n31",
        "title_and_code": "Environmental Science GE EL 104",
        "course": "BSBA-HRDM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 0,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n32",
        "title_and_code": "Marketing Management HRM ELEC 2",
        "course": "BSBA-HRDM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n33",
        "title_and_code": "Training And Development HRM 4",
        "course": "BSBA-HRDM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n34",
        "title_and_code": "Business Research BUS CORE 116",
        "course": "BSBA-HRDM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n35",
        "title_and_code": "Business English And Correspondence ENG 2",
        "course": "BSBA-HRDM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n36",
        "title_and_code": "Project Management HRM ELEC 3",
        "course": "BSBA-HRDM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n37",
        "title_and_code": "Compensation And Administration HRM 5",
        "course": "BSBA-HRDM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n38",
        "title_and_code": "Labor Relations And Negotiations HRM 6",
        "course": "BSBA-HRDM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n39",
        "title_and_code": "Special Topics In HRDM HRM 7",
        "course": "BSBA-HRDM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n40",
        "title_and_code": "Thesis Writing 1 THESIS 1",
        "course": "BSBA-HRDM",
        "year_level": 3,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n41",
        "title_and_code": "Organizational Development HRM 8",
        "course": "BSBA-HRDM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n42",
        "title_and_code": "International Business and Trade BUS CORE 117",
        "course": "BSBA-HRDM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n43",
        "title_and_code": "Entrepreneurial Management HRM ELEC 4",
        "course": "BSBA-HRDM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n44",
        "title_and_code": "Thesis Writing 2 THESIS 2",
        "course": "BSBA-HRDM",
        "year_level": 4,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "bsba_hrdm_n45",
        "title_and_code": "INTERNSHIP INT",
        "course": "BSBA-HRDM",
        "year_level": 4,
        "units": 6,
        "lec_hours": 6,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "scs1",
        "title_and_code": "Discrete Mathematics CS 101",
        "course": "BSCS",
        "year_level": 1,
        "units": 3,
        "lec_hours": 3,
        "lab_hours": 0,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "scs2",
        "title_and_code": "Data Structures & Algorithms CS 102",
        "course": "BSCS",
        "year_level": 2,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    },
    {
        "id": "scs3",
        "title_and_code": "Artificial Intelligence CS 201",
        "course": "BSCS",
        "year_level": 3,
        "units": 3,
        "lec_hours": 2,
        "lab_hours": 1,
        "is_major": 1,
        "curriculum_type": "new"
    }
],
  schedules: [
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
  const blockEl = document.getElementById('section-block');
  const curriculumEl = document.getElementById('section-curriculum');
  const listEl = document.getElementById('section-subjects-list');
  const countEl = document.getElementById('section-subject-count');

  if (!courseEl || !yearEl || !listEl) return;

  const course = courseEl.value;
  const year = parseInt(yearEl.value, 10);
  const block = blockEl ? blockEl.value : '';
  const curriculum = curriculumEl ? curriculumEl.value : 'all';

  const normCourse = (course || '').trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  // Filter subjects matching Course, Year, and Curriculum
  let matching = db.subjects.filter(s => {
    const sCourse = (s.course || '').trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (sCourse !== normCourse) return false;

    const sYear = parseInt(String(s.year_level || '').replace(/\D/g, ''), 10) || 1;
    if (sYear !== year) return false;

    if (curriculum !== 'all') {
      const cType = (s.curriculum_type || 'new').toLowerCase();
      if (cType !== curriculum.toLowerCase()) return false;
    }
    return true;
  });

  if (countEl) countEl.innerText = `${matching.length} Subject${matching.length !== 1 ? 's' : ''} Found`;

  if (matching.length === 0) {
    listEl.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No matching subjects found for ${course} Year ${year} (${curriculum.toUpperCase()} Curriculum). Add subjects in Manage Data if needed.</td></tr>`;
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
    html += `
      <tr>
        <td class="fw-semibold">${s.title_and_code}</td>
        <td>${curBadge} ${s.is_major ? '<span class="badge bg-info text-dark">Major</span>' : ''}</td>
        <td class="text-center fw-bold">${s.units}</td>
        <td class="text-center">${s.lec_hours}/${s.lab_hours}</td>
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

  const standardDays = getFilteredStandardDays(daysSetting);
  const timeslots = [
    { start: "07:00", end: "09:00" },
    { start: "08:00", end: "10:00" },
    { start: "10:00", end: "12:00" },
    { start: "13:00", end: "15:00" },
    { start: "15:00", end: "17:00" },
    { start: "17:00", end: "19:00" }
  ];

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
      for (let slot of timeslots) {
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
  const sectionDaysSetting = document.getElementById("section-days-count") ? document.getElementById("section-days-count").value : "all";

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

    const days = getFilteredStandardDays(sectionDaysSetting);
    const timeslots = [
      { start: '07:00', end: '09:00' },
      { start: '08:00', end: '10:00' },
      { start: '10:00', end: '12:00' },
      { start: '13:00', end: '15:00' },
      { start: '15:00', end: '17:00' },
      { start: '17:00', end: '19:00' }
    ];

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
