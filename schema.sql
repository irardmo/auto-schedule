-- Relational SQLite / PostgreSQL Database Schema for SIBT Scheduling System

-- 1. Instructors Table (Stores instructor profiles and max unit rules)
CREATE TABLE instructors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    designation TEXT NOT NULL CHECK (designation IN ('Licensed Teacher', 'Regular Teacher', 'Part-time', 'Part-time Teacher', 'Admin', 'Director', 'Program Head')),
    degree TEXT,
    area TEXT DEFAULT 'ACADEMICS',
    employee_no TEXT,
    effectivity_date TEXT,
    admin_load TEXT,
    max_units INTEGER NOT NULL DEFAULT 24
);

-- 2. Rooms Table
CREATE TABLE rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    room_type TEXT NOT NULL CHECK (room_type IN ('Both', 'Lecture', 'Laboratory'))
);

-- 3. Subjects Table
CREATE TABLE subjects (
    id TEXT PRIMARY KEY,
    title_and_code TEXT NOT NULL, -- Combined subject title and code, e.g. "Computer Programming 1 CC102"
    course TEXT NOT NULL,        -- e.g. "BSIT"
    year_level INTEGER NOT NULL CHECK (year_level BETWEEN 1 AND 4),
    block_section TEXT NOT NULL, -- e.g. "1A"
    units INTEGER NOT NULL,
    lec_hours INTEGER NOT NULL DEFAULT 0,
    lab_hours INTEGER NOT NULL DEFAULT 0,
    is_major INTEGER NOT NULL DEFAULT 0
);

-- 4. Schedules Table (Holds active assignments and connects entities with foreign keys)
CREATE TABLE schedules (
    id TEXT PRIMARY KEY,
    instructor_id TEXT,
    room_id TEXT,
    day TEXT NOT NULL CHECK (day IN ('M', 'T', 'W', 'TH', 'F', 'S', 'MT', 'TTH', 'MWF', 'Monday-Friday')),
    time_start TEXT NOT NULL, -- Format HH:MM
    time_end TEXT NOT NULL,   -- Format HH:MM
    subject_id TEXT,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);
