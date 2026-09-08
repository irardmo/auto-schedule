-- Southwestern Institute of Business and Technology, Inc. (SIBT) MySQL Database Schema
-- Optimized for XAMPP (Apache, MySQL/MariaDB, PHP) and phpMyAdmin

CREATE DATABASE IF NOT EXISTS sibt_scheduling;
USE sibt_scheduling;

-- 1. Instructors Table
CREATE TABLE IF NOT EXISTS instructors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(100) NOT NULL, -- e.g., 'Licensed Teacher', 'Regular Teacher', 'Admin', 'Director', 'Program Head'
    degree VARCHAR(255),
    area VARCHAR(100) DEFAULT 'ACADEMICS',
    employee_no VARCHAR(50),
    effectivity_date VARCHAR(100),
    admin_load VARCHAR(255),
    max_units INT NOT NULL DEFAULT 24
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    room_type VARCHAR(50) NOT NULL -- 'Both', 'Lecture', 'Laboratory'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) NOT NULL,
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0,
    curriculum_type VARCHAR(20) DEFAULT 'new'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
    id VARCHAR(50) PRIMARY KEY,
    instructor_id VARCHAR(50),
    room_id VARCHAR(50),
    day VARCHAR(50) NOT NULL, -- 'M', 'T', 'W', 'TH', 'F', 'S', 'MT', 'TTH', 'MWF', 'Monday-Friday'
    time_start VARCHAR(10) NOT NULL,
    time_end VARCHAR(10) NOT NULL,
    subject_id VARCHAR(50),
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==================== SIBT SEED DATA ====================

-- 1. Seed Instructors
INSERT IGNORE INTO instructors (id, name, designation, degree, area, employee_no, effectivity_date, admin_load, max_units) VALUES
('t1', 'KENT LIWANAGAN', 'Regular Teacher', 'College Faculty', 'ACADEMICS', '0105', 'July 13, 2026', '', 24),
('t2', 'GERARDO MICIANO', 'Program Head', 'BSIT', 'ADMINISTRATION', '0321', 'June 23, 2026', 'CIT Program Head', 18),
('t3', 'CAREN ROSE L TOJEDO, LPT., MAED.', 'Director', 'Dean of Academics', 'ACADEMICS', '0001', 'June 01, 2026', 'Dean of Academics', 15),
('t4', 'MAILA M MORALES, LPT., CHRA', 'Admin', 'HRD Director', 'ADMINISTRATION', '0002', 'July 01, 2026', 'HRD Director', 9);

-- 2. Seed Rooms
INSERT IGNORE INTO rooms (id, name, room_type) VALUES
('r1', 'COMLAB', 'Laboratory'),
('r2', 'W- ComLab', 'Laboratory'),
('r3', 'T-COMLAB', 'Laboratory'),
('r4', 'TH-COMLAB', 'Laboratory'),
('r5', 'HS-101', 'Lecture'),
('r6', 'TH-203', 'Lecture'),
('r7', 'T-204', 'Lecture'),
('r8', 'CRIMLAB', 'Laboratory'),
('r9', '205', 'Lecture'),
('r10', '206', 'Lecture'),
('r11', '207', 'Lecture'),
('r12', '208', 'Lecture'),
('r13', 'HS102', 'Lecture'),
('r14', 'HS103', 'Lecture'),
('r15', 'HS104', 'Lecture'),
('r16', 'HS105', 'Lecture'),
('r17', 'HS106', 'Lecture'),
('r18', 'HS107', 'Lecture'),
('r19', 'HS108', 'Lecture'),
('r20', 'HS109', 'Lecture'),
('r21', 'HS110', 'Lecture'),
('r22', 'Library 1', 'Both'),
('r23', 'Library 2', 'Both'),
('r24', 'TBL Room', 'Both');

-- 3. Seed Subjects (BSIT New Curriculum, BSIT Old Curriculum, and Program Subjects)
INSERT IGNORE INTO subjects (id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major, curriculum_type) VALUES
-- BSIT NEW CURRICULUM
('s1', 'Computer Programming 1 CC102', 'BSIT', 1, '1A', 3, 2, 2, 1, 'new'),
('s1b', 'Introduction to Computing CC101', 'BSIT', 1, '1A', 3, 3, 0, 1, 'new'),
('s2', 'SYSTEM ADMIN AND MAINTENANCE SA 101', 'BSIT', 3, '3', 3, 2, 2, 1, 'new'),
('s3', 'Social and Professional Issues SP 101', 'BSIT', 3, '3', 3, 3, 0, 0, 'new'),
('s4', 'FUNDAMENTALS OF DATABASE SYSTEM IM 101', 'BSIT', 2, '2A', 3, 2, 2, 1, 'new'),
('s5', 'FUNDAMENTALS OF DATABASE SYSTEM IM 101', 'BSIT', 2, '2B', 3, 2, 2, 1, 'new'),
('s6', 'OBJECT ORIENTED PROGRAMMING PF 101', 'BSIT', 2, '2A', 3, 2, 2, 1, 'new'),
('s7', 'OBJECT ORIENTED PROGRAMMING PF 101', 'BSIT', 2, '2B', 3, 2, 2, 1, 'new'),
('s8', 'National Service Training Program 1 NSTP 1', 'BSIT', 1, '1A', 3, 3, 0, 0, 'new'),
('s9', 'Physical Education PE 101', 'BSIT', 1, '1A', 2, 2, 0, 0, 'new'),
('s10', 'Physical Education PE 101', 'BSIT', 1, '1B', 2, 2, 0, 0, 'new'),
('s11', 'Physical Education PE 101', 'BSIT', 2, '2A', 2, 2, 0, 0, 'new'),
('s12', 'Physical Education PE 101', 'BSIT', 2, '2B', 2, 2, 0, 0, 'new'),
('s13', 'Physical Education PE 101', 'BSIT', 3, '3A', 2, 2, 0, 0, 'new'),
('s14', 'Physical Education PE 101', 'BSIT', 3, '3B', 2, 2, 0, 0, 'new'),
('s15', 'Information Assurance & Security IAS 101', 'BSIT', 3, '3A', 3, 2, 2, 1, 'new'),
('s16', 'Web Systems and Technologies WS 101', 'BSIT', 3, '3A', 3, 2, 2, 1, 'new'),
('s17', 'Capstone Project 1 CAP 101', 'BSIT', 4, '4A', 3, 3, 0, 1, 'new'),
('s18', 'Capstone Project 2 CAP 102', 'BSIT', 4, '4A', 3, 3, 0, 1, 'new'),

-- BSIT OLD CURRICULUM
('so1', 'Basic Computer Concepts & Logic Formulation IT 101', 'BSIT', 1, '1A', 3, 2, 2, 1, 'old'),
('so2', 'Computer Programming C++ IT 102', 'BSIT', 1, '1A', 3, 2, 2, 1, 'old'),
('so3', 'Visual Basic Programming IT 201', 'BSIT', 2, '2A', 3, 2, 2, 1, 'old'),
('so4', 'Database Management System FoxPro/SQL IT 202', 'BSIT', 2, '2A', 3, 2, 2, 1, 'old'),
('so5', 'Operating Systems & Utility Software IT 203', 'BSIT', 2, '2A', 3, 3, 0, 1, 'old'),
('so6', 'Computer Hardware & Networking Fundamentals IT 301', 'BSIT', 3, '3A', 3, 2, 2, 1, 'old'),
('so7', 'Systems Analysis and Design SAD IT 302', 'BSIT', 3, '3A', 3, 3, 0, 1, 'old'),
('so8', 'Web Page Development HTML/CSS IT 303', 'BSIT', 3, '3A', 3, 2, 2, 1, 'old'),
('so9', 'Software Engineering & IT Management IT 401', 'BSIT', 4, '4A', 3, 3, 0, 1, 'old'),
('so10', 'IT Practicum / OJT 480 Hours IT 402', 'BSIT', 4, '4A', 6, 0, 6, 1, 'old'),
('so11', 'Old Physical Education 1 Physical Fitness PE 1', 'BSIT', 1, '1A', 2, 2, 0, 0, 'old'),
('so12', 'Old Physical Education 2 Rhythmic Activities PE 2', 'BSIT', 1, '1A', 2, 2, 0, 0, 'old'),
('so13', 'Old NSTP 1 Civic Welfare Training NSTP 1', 'BSIT', 1, '1A', 3, 3, 0, 0, 'old'),

-- OTHER SIBT PROGRAMS
('scs1', 'Discrete Mathematics CS 101', 'BSCS', 1, '1A', 3, 3, 0, 1, 'new'),
('scs2', 'Data Structures & Algorithms CS 102', 'BSCS', 2, '2A', 3, 2, 2, 1, 'new'),
('scs3', 'Artificial Intelligence CS 201', 'BSCS', 3, '3A', 3, 2, 2, 1, 'new'),
('sba1', 'Financial Management BA 101', 'BSBA', 1, '1A', 3, 3, 0, 1, 'new'),
('sba2', 'Principles of Marketing BA 102', 'BSBA', 2, '2A', 3, 3, 0, 1, 'new'),
('shm1', 'Food and Beverage Service HM 101', 'BSHM', 1, '1A', 3, 2, 2, 1, 'new'),
('shm2', 'Front Office Operations HM 102', 'BSHM', 2, '2A', 3, 2, 2, 1, 'new'),
('stm1', 'Principles of Tourism TM 101', 'BSTM', 1, '1A', 3, 3, 0, 1, 'new'),
('scrim1', 'Introduction to Criminology CRIM 101', 'BSCRIM', 1, '1A', 3, 3, 0, 1, 'new'),
('scrim2', 'Forensic Photography CRIM 102', 'BSCRIM', 2, '2A', 3, 2, 2, 1, 'new'),
('seed1', 'Child & Adolescent Development EED 101', 'BEED', 1, '1A', 3, 3, 0, 1, 'new'),
('sed1', 'Principles of Teaching SED 101', 'BSED', 1, '1A', 3, 3, 0, 1, 'new');

-- 4. Seed Initial Sample Schedules
INSERT IGNORE INTO schedules (id, instructor_id, room_id, day, time_start, time_end, subject_id) VALUES
('sch1', 't1', 'r2', 'W', '08:00', '11:00', 's1'),
('sch2', 't2', 'r1', 'M', '13:00', '16:00', 's2');

