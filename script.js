// Southwestern Institute of Business and Technology (SIBT) Scheduling Logic Engine

// Initialize Database structure
let db = {
  instructors: [],
  rooms: [],
  subjects: [],
  schedules: []
};

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
    { id: "r2", name: "W- ComLab", room_type: "Laboratory" },
    { id: "r3", name: "T-COMLAB", room_type: "Laboratory" },
    { id: "r4", name: "TH-COMLAB", room_type: "Laboratory" },
    { id: "r5", name: "HS-101", room_type: "Lecture" },
    { id: "r6", name: "TH-203", room_type: "Lecture" },
    { id: "r7", name: "T-204", room_type: "Lecture" },
    { id: "r8", name: "CRIMLAB", room_type: "Laboratory" },
    { id: "r9", name: "205", room_type: "Lecture" },
    { id: "r10", name: "206", room_type: "Lecture" },
    { id: "r11", name: "207", room_type: "Lecture" },
    { id: "r12", name: "208", room_type: "Lecture" },
    { id: "r13", name: "HS102", room_type: "Lecture" },
    { id: "r14", name: "HS103", room_type: "Lecture" },
    { id: "r15", name: "HS104", room_type: "Lecture" },
    { id: "r16", name: "HS105", room_type: "Lecture" },
    { id: "r17", name: "HS106", room_type: "Lecture" },
    { id: "r18", name: "HS107", room_type: "Lecture" },
    { id: "r19", name: "HS108", room_type: "Lecture" },
    { id: "r20", name: "HS109", room_type: "Lecture" },
    { id: "r21", name: "HS110", room_type: "Lecture" },
    { id: "r22", name: "Library 1", room_type: "Both" },
    { id: "r23", name: "Library 2", room_type: "Both" },
    { id: "r24", name: "TBL Room", room_type: "Both" }
  ],
  subjects: [
    {
      id: "s1",
      title_and_code: "Computer Programming 1 CC102",
      course: "BSIT",
      year_level: 1,
      block_section: "1A",
      units: 3,
      lec_hours: 2,
      lab_hours: 2,
      is_major: 1
    },
    {
      id: "s2",
      title_and_code: "SYSTEM ADMIN AND MAINTENANCE SA 101",
      course: "BSIT",
      year_level: 3,
      block_section: "3",
      units: 3,
      lec_hours: 2,
      lab_hours: 2,
      is_major: 1
    },
    {
      id: "s3",
      title_and_code: "Social and Professional Issues SP 101",
      course: "BSIT",
      year_level: 3,
      block_section: "3",
      units: 3,
      lec_hours: 3,
      lab_hours: 0,
      is_major: 0
    },
    {
      id: "s4",
      title_and_code: "FUNDAMENTALS OF DATABASE SYSTEM IM 101",
      course: "BSIT",
      year_level: 2,
      block_section: "2A",
      units: 3,
      lec_hours: 2,
      lab_hours: 2,
      is_major: 1
    },
    {
      id: "s5",
      title_and_code: "FUNDAMENTALS OF DATABASE SYSTEM IM 101",
      course: "BSIT",
      year_level: 2,
      block_section: "2B",
      units: 3,
      lec_hours: 2,
      lab_hours: 2,
      is_major: 1
    },
    {
      id: "s6",
      title_and_code: "OBJECT ORIENTED PROGRAMMING PF 101",
      course: "BSIT",
      year_level: 2,
      block_section: "2A",
      units: 3,
      lec_hours: 2,
      lab_hours: 2,
      is_major: 1
    },
    {
      id: "s7",
      title_and_code: "OBJECT ORIENTED PROGRAMMING PF 101",
      course: "BSIT",
      year_level: 2,
      block_section: "2B",
      units: 3,
      lec_hours: 2,
      lab_hours: 2,
      is_major: 1
    },
    {
      id: "s8",
      title_and_code: "National Service Training Program 1 NSTP 1",
      course: "BSIT",
      year_level: 1,
      block_section: "1A",
      units: 3,
      lec_hours: 3,
      lab_hours: 0,
      is_major: 0
    },
    {
      id: "s9",
      title_and_code: "Physical Education PE 101",
      course: "BSIT",
      year_level: 1,
      block_section: "1A",
      units: 2,
      lec_hours: 2,
      lab_hours: 0,
      is_major: 0
    },
    {
      id: "s10",
      title_and_code: "Physical Education PE 101",
      course: "BSIT",
      year_level: 1,
      block_section: "1B",
      units: 2,
      lec_hours: 2,
      lab_hours: 0,
      is_major: 0
    },
    {
      id: "s11",
      title_and_code: "Physical Education PE 101",
      course: "BSIT",
      year_level: 2,
      block_section: "2A",
      units: 2,
      lec_hours: 2,
      lab_hours: 0,
      is_major: 0
    },
    {
      id: "s12",
      title_and_code: "Physical Education PE 101",
      course: "BSIT",
      year_level: 2,
      block_section: "2B",
      units: 2,
      lec_hours: 2,
      lab_hours: 0,
      is_major: 0
    },
    {
      id: "s13",
      title_and_code: "Physical Education PE 101",
      course: "BSIT",
      year_level: 3,
      block_section: "3A",
      units: 2,
      lec_hours: 2,
      lab_hours: 0,
      is_major: 0
    },
    {
      id: "s14",
      title_and_code: "Physical Education PE 101",
      course: "BSIT",
      year_level: 3,
      block_section: "3B",
      units: 2,
      lec_hours: 2,
      lab_hours: 0,
      is_major: 0
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
              existingSubject.block_section === subject.block_section) {
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

// Fill forms correctly on subject select
function autofillSubjectDetails() {
  const subId = document.getElementById('input-subject').value;
  if (!subId) return;

  const sub = db.subjects.find(s => s.id === subId);
  if (sub) {
    document.getElementById('input-course').value = sub.course;
    document.getElementById('input-year').value = sub.year_level;
    document.getElementById('input-block').value = sub.block_section;
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
  const subjectId = document.getElementById('input-subject').value;
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

// TOAST NOTIFICATIONS
function showToast(message, type = "success") {
  const toastEl = document.getElementById('actionToast');
  const msgEl = document.getElementById('toastMsg');
  if (!toastEl || !msgEl) return;

  msgEl.innerText = message;
  toastEl.className = `toast align-items-center text-white border-0 ${type === 'success' ? 'bg-success' : 'bg-danger'}`;

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
  teacherSel.innerHTML = '<option value="">Select Teacher...</option>';
  db.instructors.forEach(t => {
    teacherSel.innerHTML += `<option value="${t.id}">${t.name} (${t.designation})</option>`;
  });

  // Room selector
  const roomSel = document.getElementById('input-room');
  roomSel.innerHTML = '<option value="">Select Room...</option>';
  db.rooms.forEach(r => {
    roomSel.innerHTML += `<option value="${r.id}">${r.name} (${r.room_type})</option>`;
  });

  // Subject selector
  const subSel = document.getElementById('input-subject');
  subSel.innerHTML = '<option value="">Select Subject...</option>';
  db.subjects.forEach(s => {
    subSel.innerHTML += `<option value="${s.id}">${s.title_and_code} - Sec ${s.course} ${s.year_level}${s.block_section}</option>`;
  });

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
  const blocks = [...new Set(db.subjects.map(s => s.block_section))];
  blocks.forEach(b => {
    filterBlock.innerHTML += `<option value="${b}">${b}</option>`;
  });

  // Waterfall / Batch Generate Selects Population
  const existingList = document.getElementById('existing-subjects-list');
  if (existingList) {
    existingList.innerHTML = '';
    const uniqueTitles = [...new Set(db.subjects.map(s => s.title_and_code))];
    uniqueTitles.forEach(title => {
      existingList.innerHTML += `<option value="${title}">`;
    });
  }

  const waterfallRm = document.getElementById('waterfall-room');
  if (waterfallRm) {
    waterfallRm.innerHTML = '<option value="">Any available room</option>';
    db.rooms.forEach(r => {
      waterfallRm.innerHTML += `<option value="${r.id}">${r.name} (${r.room_type})</option>`;
    });
  }

  const waterfallTeachersDiv = document.getElementById('waterfall-instructors-list');
  if (waterfallTeachersDiv) {
    waterfallTeachersDiv.innerHTML = '';
    db.instructors.forEach(t => {
      waterfallTeachersDiv.innerHTML += `
        <div class="col-md-6 col-12">
          <div class="form-check">
            <input class="form-check-input waterfall-teacher-checkbox" type="checkbox" value="${t.id}" id="chk-wf-${t.id}">
            <label class="form-check-label small fw-medium" for="chk-wf-${t.id}">
              ${t.name} <span class="text-primary">(${getMaxUnitsForDesignation(t.designation)} max)</span>
            </label>
          </div>
        </div>
      `;
    });
  }
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
  year: "",
  block: ""
};

function applyFilters() {
  activeFilters.teacher = document.getElementById('filter-teacher').value;
  activeFilters.course = document.getElementById('filter-course').value;
  activeFilters.year = document.getElementById('filter-year').value;
  activeFilters.block = document.getElementById('filter-block').value;
  renderSchedulesTable();
}

function resetFilters() {
  document.getElementById('filter-teacher').value = "";
  document.getElementById('filter-course').value = "";
  document.getElementById('filter-year').value = "";
  document.getElementById('filter-block').value = "";
  activeFilters = { teacher: "", course: "", year: "", block: "" };
  renderSchedulesTable();
}

function renderSchedulesTable() {
  const listEl = document.getElementById('scheduleList');
  if (!listEl) return;
  listEl.innerHTML = '';

  let filtered = db.schedules.filter(sch => {
    const t = db.instructors.find(i => i.id === sch.instructor_id);
    const sub = db.subjects.find(s => s.id === sch.subject_id);

    if (activeFilters.teacher && sch.instructor_id !== activeFilters.teacher) return false;
    if (sub) {
      if (activeFilters.course && sub.course !== activeFilters.course) return false;
      if (activeFilters.year && sub.year_level !== parseInt(activeFilters.year)) return false;
      if (activeFilters.block && sub.block_section !== activeFilters.block) return false;
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

  filtered.forEach(sch => {
    const teacher = db.instructors.find(t => t.id === sch.instructor_id);
    const room = db.rooms.find(r => r.id === sch.room_id);
    const subject = db.subjects.find(s => s.id === sch.subject_id);

    const tName = teacher ? teacher.name : 'Unknown';
    const rName = room ? room.name : 'Unknown';
    const subTitle = subject ? subject.title_and_code : 'Unknown';
    const course = subject ? subject.course : '-';
    const year = subject ? subject.year_level : '-';
    const block = subject ? subject.block_section : '-';
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

  db.instructors.forEach(t => {
    table.innerHTML += `
      <tr>
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

  db.subjects.forEach(s => {
    const typeBadge = s.is_major
      ? '<span class="badge bg-danger">Major</span>'
      : '<span class="badge bg-secondary">General</span>';

    table.innerHTML += `
      <tr>
        <td class="fw-bold text-dark">${s.title_and_code}</td>
        <td>${s.course}</td>
        <td>${typeBadge}</td>
        <td>${s.year_level} Year</td>
        <td>Block ${s.block_section}</td>
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

  db.rooms.forEach(r => {
    table.innerHTML += `
      <tr>
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
  const subject_id = document.getElementById('input-subject').value;

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

  if (id) {
    // Edit existing schedule
    const index = db.schedules.findIndex(s => s.id === id);
    if (index !== -1) {
      db.schedules[index] = candidate;
      showToast("Schedule updated successfully!");
    }
  } else {
    // Add new schedule
    db.schedules.push(candidate);
    showToast("New schedule created successfully!");
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
    document.getElementById('input-subject').value = sch.subject_id;

    // Calculate duration choice manually based on hours
    const sMinutes = parseTimeToMinutes(sch.time_start);
    const eMinutes = parseTimeToMinutes(sch.time_end);
    const durHours = (eMinutes - sMinutes) / 60;
    document.getElementById('input-duration').value = String(durHours);

    // Populate read-only values
    const sub = db.subjects.find(s => s.id === sch.subject_id);
    if (sub) {
      document.getElementById('input-course').value = sub.course;
      document.getElementById('input-year').value = sub.year_level;
      document.getElementById('input-block').value = sub.block_section;
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
  document.getElementById('saveScheduleBtn').innerHTML = '<i class="bi bi-calendar-plus"></i> Add Schedule';
  checkRealtimeConflict();
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
  const block_section = document.getElementById('subject-block').value;
  const units = parseInt(document.getElementById('subject-units').value);
  const lec_hours = parseInt(document.getElementById('subject-lec').value);
  const lab_hours = parseInt(document.getElementById('subject-lab').value);
  const is_major = document.getElementById('subject-is-major').checked ? 1 : 0;

  const subject = {
    id: id || uniqueId(),
    title_and_code,
    course,
    year_level,
    block_section,
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
    document.getElementById('subject-block').value = s.block_section;
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
    { start: "08:00", end: "10:00", dur: 2 },
    { start: "10:00", end: "12:00", dur: 2 },
    { start: "12:00", end: "14:00", dur: 2 },
    { start: "14:00", end: "16:00", dur: 2 },
    { start: "16:00", end: "18:00", dur: 2 },
    { start: "17:00", end: "19:00", dur: 2 }, // Perfect for HS Mon-Thu evening slots
    // 3 Hour blocks
    { start: "08:00", end: "11:00", dur: 3 },
    { start: "12:00", end: "15:00", dur: 3 },
    { start: "15:00", end: "18:00", dur: 3 },
    { start: "16:00", end: "19:00", dur: 3 }, // Perfect for HS Mon-Wed slots
    // 1 and 1.5 Hour Blocks
    { start: "08:00", end: "09:00", dur: 1 },
    { start: "09:00", end: "10:00", dur: 1 },
    { start: "10:00", end: "11:00", dur: 1 },
    { start: "11:00", end: "12:00", dur: 1 },
    { start: "13:00", end: "14:30", dur: 1.5 },
    { start: "14:30", end: "16:00", dur: 1.5 }
  ];

  const standardDays = ["M", "T", "W", "TH", "F", "S", "MT", "TTH", "MWF"];

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
    consoleEl.innerHTML += `Scheduling subject: <strong>${subject.title_and_code}</strong> (${subject.is_major ? '<span class="text-danger fw-bold">MAJOR</span>' : 'GENERAL'} - Section: ${subject.course} ${subject.year_level}${subject.block_section})...<br>`;

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
  showToast(`Auto-Scheduler finished. ${scheduledCount} successfully scheduled, ${unscheduledCount} failed.`);
}

// --- WATERFALL SUBJECT SHARING ENGINE ---
async function runWaterfallScheduler() {
  const subjectTitle = document.getElementById('batch-subject').value.trim();
  const course = document.getElementById('batch-course').value.trim();
  const yearLevel = parseInt(document.getElementById('batch-year').value, 10);
  const numSections = parseInt(document.getElementById('batch-sections-count').value, 10) || 1;
  const units = parseInt(document.getElementById('batch-units').value, 10) || 3;
  const lec_hours = parseInt(document.getElementById('batch-lec-hours').value, 10) || 0;
  const lab_hours = parseInt(document.getElementById('batch-lab-hours').value, 10) || 0;

  const preferredRoomId = document.getElementById('waterfall-room').value;
  const logContainer = document.getElementById('autoSchedulerResults');
  const consoleEl = document.getElementById('schedulerConsole');

  if (!subjectTitle || !course) {
    showToast("Please enter Subject Title and Course/Department!", "danger");
    return;
  }

  // Find all participating teacher checkboxes
  const selectedTeacherIds = Array.from(document.querySelectorAll('.waterfall-teacher-checkbox:checked')).map(cb => cb.value);
  if (selectedTeacherIds.length === 0) {
    showToast("Please select at least one participating teacher!", "danger");
    return;
  }

  logContainer.classList.remove('d-none');
  consoleEl.innerHTML = `Starting Waterfall Batch Auto-Generator for: <strong>${subjectTitle}</strong> (${course})...<br>`;

  // Dynamically add subjects/sections to the database if they don't exist yet, or just collect them
  // We'll create distinct section codes like A, B, C, D... etc based on numSections
  const createdSubjects = [];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < numSections; i++) {
    const sectionLetter = alphabet[i] || String(i + 1);
    const sectionCode = `${yearLevel}${sectionLetter}`;

    // Look if already exists in db.subjects to prevent duplicate creation
    let existingSub = db.subjects.find(s =>
      s.title_and_code === subjectTitle &&
      s.course === course &&
      s.year_level === yearLevel &&
      s.block_section === sectionCode
    );

    if (!existingSub) {
      existingSub = {
        id: 's_batch_' + uniqueId(),
        title_and_code: subjectTitle,
        course: course,
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

  // 1st Year: 3 Units means 3 hours duration.
  // Higher Years (2, 3, 4): 3 Units means 2 hours duration.
  let targetDuration = 2;
  if (units === 3) {
    if (yearLevel === 1) {
      targetDuration = 3;
    } else {
      targetDuration = 2;
    }
  } else {
    targetDuration = lec_hours + lab_hours || units;
  }

  consoleEl.innerHTML += `Duration configured to: <strong>${targetDuration} Hour(s)</strong> per block (Year Level: ${yearLevel}, Units: ${units}).<br>`;

  // Build standard list of timeslots, heavily prioritized to minimize empty daily gaps (compress schedules for a day with only lunch break).
  // Standard compression timeslots list starting sequentially:
  // Mon-Sat:
  // AM Block 1: 08:00 - 10:00 (2h) or 08:00 - 11:00 (3h)
  // AM Block 2: 10:00 - 12:00 (2h) (follows AM Block 1 perfectly)
  // LUNCH BREAK: 12:00 - 13:00 / 12:00 - 14:00
  // PM Block 1: 13:00 - 15:00 (2h) or 13:00 - 16:00 (3h)
  // PM Block 2: 15:00 - 17:00 (2h) (follows PM Block 1 perfectly)
  // Evening Block: 17:00 - 19:00 (2h) (follows PM Block 2 perfectly)
  const standardTimeSlots = [
    // 3 Hour blocks (ideal for 1st year 3 units)
    { start: "08:00", end: "11:00", dur: 3 },
    { start: "13:00", end: "16:00", dur: 3 }, // Perfect PM block starting post-lunch
    { start: "16:00", end: "19:00", dur: 3 }, // Evening block

    // 2 Hour blocks
    { start: "08:00", end: "10:00", dur: 2 },
    { start: "10:00", end: "12:00", dur: 2 }, // Back-to-back with 8-10, stops at lunch 12
    { start: "13:00", end: "15:00", dur: 2 }, // Starts right after lunch at 1
    { start: "15:00", end: "17:00", dur: 2 }, // Back-to-back with 1-3 PM
    { start: "17:00", end: "19:00", dur: 2 }, // Back-to-back with 3-5 PM

    // 1 Hour blocks
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

  const standardDays = ["M", "T", "W", "TH", "F", "S", "MT", "TTH", "MWF"];
  let successfullyScheduled = 0;

  for (let subject of subjectsToSchedule) {
    let isScheduled = false;

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
    }
  }

  await saveDatabase();
  showToast(`Waterfall Allocation complete. Successfully scheduled ${successfullyScheduled}/${subjectsToSchedule.length} sections!`);
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

// Initialize on document load
document.addEventListener('DOMContentLoaded', () => {
  loadDatabase();

  // Pre-load logic and first rendering
  populateFormSelects();
  updateStats();
  renderAllViews();

  // Connect realtime end time calculation
  const startEl = document.getElementById('input-time-start');
  if (startEl) {
    startEl.addEventListener('change', calculateTimeEnd);
  }
});
