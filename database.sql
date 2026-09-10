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

-- 3. Master Subjects Table
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

-- 3a. Specific Course & Curriculum Tables
CREATE TABLE IF NOT EXISTS bsit_subject_new (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSIT',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bsit_subject_old (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSIT',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS beed_subject_new (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BEED',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS beed_subject_old (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BEED',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bsed_subject_new (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSED',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bsed_subject_old (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSED',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bsca_subject_new (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSCA',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bsca_subject_old (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSCA',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bscrim_subject_new (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSCRIM',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bscrim_subject_old (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSCRIM',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bshm_subject_new (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSHM',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bshm_subject_old (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSHM',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bsba_fm_subject_new (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSBA-FM',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bsba_fm_subject_old (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSBA-FM',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bsba_hrdm_subject_new (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSBA-HRDM',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bsba_hrdm_subject_old (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSBA-HRDM',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bsba_mm_subject_new (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSBA-MM',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bsba_mm_subject_old (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSBA-MM',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bscs_subject_new (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSCS',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bscs_subject_old (
    id VARCHAR(50) PRIMARY KEY,
    title_and_code VARCHAR(255) NOT NULL,
    course VARCHAR(100) DEFAULT 'BSCS',
    year_level INT NOT NULL,
    block_section VARCHAR(50) NOT NULL,
    units INT NOT NULL,
    lec_hours INT NOT NULL DEFAULT 0,
    lab_hours INT NOT NULL DEFAULT 0,
    is_major INT NOT NULL DEFAULT 0
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
('r2', 'CRIMLAB', 'Laboratory'),
('r3', '203', 'Lecture'),
('r4', '204', 'Lecture'),
('r5', '205', 'Lecture'),
('r6', '206', 'Lecture'),
('r7', '207', 'Lecture'),
('r8', '208', 'Lecture'),
('r9', 'HS-101', 'Lecture'),
('r10', 'HS-102', 'Lecture'),
('r11', 'HS-103', 'Lecture'),
('r12', 'HS-104', 'Lecture'),
('r13', 'HS-105', 'Lecture'),
('r14', 'HS-106', 'Lecture'),
('r15', 'HS-107', 'Lecture'),
('r16', 'HS-108', 'Lecture'),
('r17', 'HS-109', 'Lecture'),
('r18', 'HS-110', 'Lecture'),
('r19', 'Library 1', 'Special Room'),
('r20', 'Library 2', 'Special Room'),
('r21', 'TBL Room', 'Special Room');

-- 3. Seed Master Subjects (All SIBT Programs Old & New Curriculums)
INSERT IGNORE INTO subjects (id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major, curriculum_type) VALUES
('s1', 'Computer Programming 1 CC 102', 'BSIT', 1, '1A', 3, 2, 2, 1, 'new'),
('s1b', 'Introduction to Computing CC 101', 'BSIT', 1, '1A', 3, 3, 0, 1, 'new'),
('s2', 'SYSTEM ADMIN AND MAINTENANCE SA 101', 'BSIT', 3, '3A', 3, 2, 2, 1, 'new'),
('s3', 'Social and Professional Issues SP 101', 'BSIT', 3, '3A', 3, 3, 0, 0, 'new'),
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
('so11', 'Physical Education 1 Physical Fitness PE 1', 'BSIT', 1, '1A', 2, 2, 0, 0, 'old'),
('so12', 'Physical Education 2 Rhythmic Activities PE 2', 'BSIT', 1, '1A', 2, 2, 0, 0, 'old'),
('so13', 'NSTP 1 Civic Welfare Training NSTP 1', 'BSIT', 1, '1A', 3, 3, 0, 0, 'old'),
('beed_n1', 'Understanding the Self GE 101', 'BEED', 1, '1A', 3, 3, 0, 0, 'new'),
('beed_n2', 'Child and Adolescent Learners EED 101', 'BEED', 1, '1A', 3, 3, 0, 1, 'new'),
('beed_n3', 'Teaching Math in Primary Grades EED 102', 'BEED', 1, '1A', 3, 3, 0, 1, 'new'),
('beed_n4', 'Good Manners and Right Conduct GMRC 101', 'BEED', 1, '1A', 3, 3, 0, 1, 'new'),
('beed_n5', 'Physical Education 1 PE 101', 'BEED', 1, '1A', 2, 2, 0, 0, 'new'),
('beed_n6', 'NSTP 1 Civic Welfare Training NSTP 1', 'BEED', 1, '1A', 3, 3, 0, 0, 'new'),
('beed_n7', 'Teaching Science in Elementary Grades EED 103', 'BEED', 2, '2A', 3, 3, 0, 1, 'new'),
('beed_n8', 'Teaching Social Studies in Elementary EED 104', 'BEED', 2, '2A', 3, 3, 0, 1, 'new'),
('beed_n9', 'Technology for Teaching and Learning 1 TTL 101', 'BEED', 2, '2A', 3, 2, 2, 1, 'new'),
('beed_n10', 'Assessment in Learning 1 ASL 101', 'BEED', 3, '3A', 3, 3, 0, 1, 'new'),
('beed_n11', 'Field Study 1 Observation of Teaching FS 101', 'BEED', 4, '4A', 3, 1, 2, 1, 'new'),
('beed_n12', 'Teaching Internship / Practice Teaching INT 101', 'BEED', 4, '4A', 6, 0, 6, 1, 'new'),
('beed_o1', 'Understanding the Self GE 101', 'BEED', 1, '1A', 3, 3, 0, 0, 'old'),
('beed_o2', 'Sining ng Pakikipagtalastasan GE 102', 'BEED', 1, '1A', 3, 3, 0, 0, 'old'),
('beed_o3', 'Entrepreneurial Mind GE EL 101', 'BEED', 1, '1A', 3, 3, 0, 0, 'old'),
('beed_o4', 'Social Arts 1 SIBTECH 101', 'BEED', 1, '1A', 3, 3, 0, 0, 'old'),
('beed_o5', 'Computer 1 COMP 101', 'BEED', 1, '1A', 3, 2, 1, 1, 'old'),
('beed_o6', 'Movement Competency Training PATHFIT 1', 'BEED', 1, '1A', 2, 2, 0, 0, 'old'),
('beed_o7', 'National Service Training Program NSTP 1', 'BEED', 1, '1A', 3, 3, 0, 0, 'old'),
('beed_o8', 'The Child and Adolescent Learners and Learning PROF ED 1', 'BEED', 1, '1A', 3, 3, 0, 1, 'old'),
('beed_o9', 'Teaching English in the Elementary Grades (Language Arts) ENG 1', 'BEED', 1, '1A', 3, 3, 0, 1, 'old'),
('beed_o10', 'Mathematics in Modern World GE 103', 'BEED', 1, '1A', 3, 3, 0, 0, 'old'),
('beed_o11', 'Purposive Communication GE 104', 'BEED', 1, '1A', 3, 3, 0, 0, 'old'),
('beed_o12', 'Pagbasa at Pagsulat sa Ibat-Ibang Disiplina GE 105', 'BEED', 1, '1A', 3, 3, 0, 0, 'old'),
('beed_o13', 'Social Arts 2 SIBTECH 102', 'BEED', 1, '1A', 3, 3, 0, 0, 'old'),
('beed_o14', 'Advance Computer COMP 102', 'BEED', 1, '1A', 3, 2, 1, 1, 'old'),
('beed_o15', 'Exercise-Based Fitness Activities PATHFIT 2', 'BEED', 1, '1A', 2, 2, 0, 0, 'old'),
('beed_o16', 'National Service Training Program 2 NSTP 2', 'BEED', 1, '1A', 3, 3, 0, 0, 'old'),
('beed_o17', 'The Teaching Profession PROF ED 2', 'BEED', 1, '1A', 3, 3, 0, 1, 'old'),
('beed_o18', 'Education Enhancement Course 1 EHC 1', 'BEED', 1, '1A', 2, 2, 0, 1, 'old'),
('beed_o19', 'Science, Technology and Society GE 106', 'BEED', 2, '2A', 3, 3, 0, 0, 'old'),
('beed_o20', 'The Contemporary World GE 107', 'BEED', 2, '2A', 3, 3, 0, 0, 'old'),
('beed_o21', 'Philippine Literature GE EL 102', 'BEED', 2, '2A', 3, 3, 0, 0, 'old'),
('beed_o22', 'Indigenous Creative Arts GE EL 103', 'BEED', 2, '2A', 3, 3, 0, 0, 'old'),
('beed_o23', 'Group Exercise (Aerobics, Yoga, etc.) PATHFIT 3', 'BEED', 2, '2A', 2, 2, 0, 0, 'old'),
('beed_o24', 'The Teacher and the Community, School Culture and Organisational Leadership PROF ED 3', 'BEED', 2, '2A', 3, 3, 0, 1, 'old'),
('beed_o25', 'Teaching Math in the Primary Grades MATH 1', 'BEED', 2, '2A', 3, 3, 0, 1, 'old'),
('beed_o26', 'Teaching English in the Elementary Grades Through Literature ENG 2', 'BEED', 2, '2A', 3, 3, 0, 1, 'old'),
('beed_o27', 'Ethics GE 108', 'BEED', 2, '2A', 3, 3, 0, 0, 'old'),
('beed_o28', 'Readings on Philippine History GE 109', 'BEED', 2, '2A', 3, 3, 0, 0, 'old'),
('beed_o29', 'Art Appreciation GE 110', 'BEED', 2, '2A', 3, 3, 0, 0, 'old'),
('beed_o30', 'Sports PATHFIT 4', 'BEED', 2, '2A', 2, 2, 0, 0, 'old'),
('beed_o31', 'Foundation of Special and Inclusive Education PROF ED 4', 'BEED', 2, '2A', 3, 3, 0, 1, 'old'),
('beed_o32', 'Facilitating Learner-Centered Teaching PROF ED 5', 'BEED', 2, '2A', 3, 3, 0, 1, 'old'),
('beed_o33', 'Teaching Science in the Elementary Grades (Biology and Chemistry) SCI 1', 'BEED', 2, '2A', 3, 3, 0, 1, 'old'),
('beed_o34', 'Teaching Math in the Intermediate Grades MATH 2', 'BEED', 2, '2A', 3, 3, 0, 1, 'old'),
('beed_o35', 'Education Enhancement Course 2 EHC 2', 'BEED', 2, '2A', 2, 2, 0, 1, 'old'),
('beed_o36', 'Statistics GE 111', 'BEED', 3, '3A', 3, 3, 0, 0, 'old'),
('beed_o37', 'Life and Works of Rizal RZL', 'BEED', 3, '3A', 3, 3, 0, 0, 'old'),
('beed_o38', 'Content and Pedagogy in the Mother Tongue MTB-MLE', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o39', 'Assessment in Learning 1 PROF ED 6', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o40', 'Technology for Teaching and Learning PROF ED 7', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o41', 'Teaching Social Studies in the Elementary Grades (Philippine History and Government) SSC 1', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o42', 'Pagtuturo ng Filipino sa Elementarya - Estraktura at Gamit ng Wikang Filipino FIL', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o43', 'Edukasyong Pantahanan at Pangkabuhayan TLE', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o44', 'Teaching Science in the Elementary Grades (Physics, Space and Earth Science) SCI 2', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o45', 'Assessment in Learning 2 PROF ED 8', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o46', 'The Teacher and the School Curriculum PROF ED 9', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o47', 'Teaching Social Studies in the Elementary Grades (Culture and Geography) SSC 2', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o48', 'Pagtuturo ng Filipino sa Elementarya - Panitikan FIL 2', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o49', 'Edukasyong Pantahanan at Pangkabuhayan with Entrepreneurship TLE 2', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o50', 'Teaching Music in the Elementary Grades MUSIC', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o51', 'Field Study 1 FS 1', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o52', 'Teaching PE and Health in the Elementary Grades PEH', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o53', 'Education Enhancement Course 3 EHC 3', 'BEED', 3, '3A', 2, 2, 0, 1, 'old'),
('beed_o54', 'Building and Enhancing New Literacies Across the Curriculum PROF ED 10', 'BEED', 4, '4A', 3, 3, 0, 1, 'old'),
('beed_o55', 'Good Manners and Right Conduct VED', 'BEED', 4, '4A', 3, 3, 0, 1, 'old'),
('beed_o56', 'Technology for Teaching and Elementary Grades TTL', 'BEED', 4, '4A', 3, 3, 0, 1, 'old'),
('beed_o57', 'Teaching Arts in the Elementary Grades ARTS', 'BEED', 4, '4A', 3, 3, 0, 1, 'old'),
('beed_o58', 'Field Study 2 FS 2', 'BEED', 4, '4A', 3, 3, 0, 1, 'old'),
('beed_o59', 'Teaching Multigrade Classes ED ELEC', 'BEED', 4, '4A', 3, 3, 0, 1, 'old'),
('beed_o60', 'Educational Research 1 EDUC RES 1', 'BEED', 4, '4A', 3, 3, 0, 1, 'old'),
('beed_o61', 'Educational Research 2 EDUC RES 2', 'BEED', 4, '4A', 3, 3, 0, 1, 'old'),
('beed_o62', 'Teaching Internship PT', 'BEED', 4, '4A', 6, 0, 6, 1, 'old'),
('beed_o63', 'Mock Board Course EHC 4', 'BEED', 4, '4A', 2, 2, 0, 1, 'old'),
('bsed_n1', 'Understanding the Self GE 101', 'BSED', 1, '1A', 3, 3, 0, 0, 'new'),
('bsed_n2', 'Basic English Grammar GE 102', 'BSED', 1, '1A', 3, 3, 0, 1, 'new'),
('bsed_n3', 'Introduction to Linguistics EL 100', 'BSED', 1, '1A', 3, 3, 0, 1, 'new'),
('bsed_n4', 'Language, Culture and Society EL 101', 'BSED', 1, '1A', 3, 3, 0, 1, 'new'),
('bsed_n5', 'Structures of English EL 102', 'BSED', 1, '1A', 3, 3, 0, 1, 'new'),
('bsed_n6', 'Teaching and Assessment of Grammar EL 103', 'BSED', 2, '2A', 3, 3, 0, 1, 'new'),
('bsed_n7', 'Mythology and Folklore EL 104', 'BSED', 2, '2A', 3, 3, 0, 1, 'new'),
('bsed_n8', 'Technology for Teaching and Learning 2 TTL 102', 'BSED', 3, '3A', 3, 2, 2, 1, 'new'),
('bsed_n9', 'Field Study 2 FS 102', 'BSED', 4, '4A', 3, 1, 2, 1, 'new'),
('bsed_n10', 'Teaching Internship BSED INT 101', 'BSED', 4, '4A', 6, 0, 6, 1, 'new'),
('bsed_o1', 'Principles of Teaching SED 1', 'BSED', 1, '1A', 3, 3, 0, 1, 'old'),
('bsed_o2', 'Developmental Reading SED 2', 'BSED', 1, '1A', 3, 3, 0, 1, 'old'),
('bsed_o3', 'Educational Technology 2 ET 2', 'BSED', 2, '2A', 3, 2, 2, 1, 'old'),
('bsed_o4', 'Campus Journalism SED 3', 'BSED', 3, '3A', 3, 3, 0, 1, 'old'),
('bsed_o5', 'Secondary Practice Teaching SED 4', 'BSED', 4, '4A', 6, 0, 6, 1, 'old'),
('bsca_n1', 'Fundamentals of Customs Admin CUA 101', 'BSCA', 1, '1A', 3, 3, 0, 1, 'new'),
('bsca_n2', 'Customs Tariff and Classification CUA 102', 'BSCA', 1, '1A', 3, 3, 0, 1, 'new'),
('bsca_n3', 'Customs Clearance and Procedure CUA 103', 'BSCA', 2, '2A', 3, 3, 0, 1, 'new'),
('bsca_n4', 'Warehouse Operations Mgt SCM 102', 'BSCA', 2, '2A', 3, 3, 0, 1, 'new'),
('bsca_n5', 'Border Control and Security CUA 104', 'BSCA', 3, '3A', 3, 3, 0, 1, 'new'),
('bsca_n6', 'Customs Practicum / Internship CUA 105', 'BSCA', 4, '4A', 6, 0, 6, 1, 'new'),
('bsca_o1', 'Understanding the Self GE 101', 'BSCA', 1, '1A', 3, 3, 0, 0, 'old'),
('bsca_o2', 'Sining ng Pakikipagtalastasan GE 102', 'BSCA', 1, '1A', 3, 3, 0, 0, 'old'),
('bsca_o3', 'Entrepreneurial Mind GE EL 101', 'BSCA', 1, '1A', 3, 3, 0, 0, 'old'),
('bsca_o4', 'Social Arts 1 SIBTECH 101', 'BSCA', 1, '1A', 3, 3, 0, 0, 'old'),
('bsca_o5', 'Computer 1 COMP 101', 'BSCA', 1, '1A', 3, 2, 1, 1, 'old'),
('bsca_o6', 'Fundamentals of Customs and Tariff Management TM 1', 'BSCA', 1, '1A', 3, 3, 0, 1, 'old'),
('bsca_o7', 'Entrepreneurial Management ELC 1', 'BSCA', 1, '1A', 3, 3, 0, 1, 'old'),
('bsca_o8', 'Movement Competency Training PATHFIT 1', 'BSCA', 1, '1A', 2, 2, 0, 0, 'old'),
('bsca_o9', 'National Service Training Program NSTP 1', 'BSCA', 1, '1A', 3, 3, 0, 0, 'old'),
('bsca_o10', 'Mathematics in the Modern World GE 103', 'BSCA', 1, '1A', 3, 3, 0, 0, 'old'),
('bsca_o11', 'Purposive Communication GE 104', 'BSCA', 1, '1A', 3, 3, 0, 0, 'old'),
('bsca_o12', 'Pagbasa at Pagsulat sa Ibat-Ibang Disiplina GE 105', 'BSCA', 1, '1A', 3, 3, 0, 0, 'old'),
('bsca_o13', 'Social Arts 2 SIBTECH 102', 'BSCA', 1, '1A', 3, 3, 0, 0, 'old'),
('bsca_o14', 'Advance Computer COMP 102', 'BSCA', 1, '1A', 3, 2, 1, 1, 'old'),
('bsca_o15', 'Intro to Supply Chain Mgt SCM 1', 'BSCA', 1, '1A', 3, 3, 0, 1, 'old'),
('bsca_o16', 'Border Control & Security CM 1', 'BSCA', 1, '1A', 3, 3, 0, 1, 'old'),
('bsca_o17', 'Exercise-Based Fitness Activities PATHFIT 2', 'BSCA', 1, '1A', 2, 2, 0, 0, 'old'),
('bsca_o18', 'National Service Training Program 2 NSTP 2', 'BSCA', 1, '1A', 3, 3, 0, 0, 'old'),
('bsca_o19', 'Science, Technology and Society GE 106', 'BSCA', 2, '2A', 3, 3, 0, 0, 'old'),
('bsca_o20', 'The Contemporary World GE 107', 'BSCA', 2, '2A', 3, 3, 0, 0, 'old'),
('bsca_o21', 'Philippine Literature GE EL 102', 'BSCA', 2, '2A', 3, 3, 0, 0, 'old'),
('bsca_o22', 'Indigenous Creative Arts GE EL 103', 'BSCA', 2, '2A', 3, 3, 0, 0, 'old'),
('bsca_o23', 'Warehouse Operations Mgt SCM 2', 'BSCA', 2, '2A', 3, 3, 0, 1, 'old'),
('bsca_o24', 'Customs Operations & Cargo Handling CM 2', 'BSCA', 2, '2A', 3, 3, 0, 1, 'old'),
('bsca_o25', 'Commodity Classification System TM 2', 'BSCA', 2, '2A', 3, 3, 0, 1, 'old'),
('bsca_o26', 'Group Exercise (Aerobics, Yoga, etc.) PATHFIT 3', 'BSCA', 2, '2A', 2, 2, 0, 0, 'old'),
('bsca_o27', 'Business Ethics GE 108', 'BSCA', 2, '2A', 3, 3, 0, 0, 'old'),
('bsca_o28', 'Readings on Philippine History GE 109', 'BSCA', 2, '2A', 3, 3, 0, 0, 'old'),
('bsca_o29', 'Obligation and Contract SBEC 1', 'BSCA', 2, '2A', 3, 3, 0, 1, 'old'),
('bsca_o30', 'Taxation (Income and Business Taxation) SBEC 2', 'BSCA', 2, '2A', 3, 3, 0, 1, 'old'),
('bsca_o31', 'Procurement and Inventory Management SCM 3', 'BSCA', 2, '2A', 3, 3, 0, 1, 'old'),
('bsca_o32', 'Customs Valuation System TM 3', 'BSCA', 2, '2A', 3, 3, 0, 1, 'old'),
('bsca_o33', 'Customs Warehousing CM 3', 'BSCA', 2, '2A', 5, 5, 0, 1, 'old'),
('bsca_o34', 'Sports PATHFIT 4', 'BSCA', 2, '2A', 2, 2, 0, 0, 'old'),
('bsca_o35', 'Statistics GE 111', 'BSCA', 3, '3A', 3, 3, 0, 0, 'old'),
('bsca_o36', 'Life and Works of Rizal RZL', 'BSCA', 3, '3A', 3, 3, 0, 0, 'old'),
('bsca_o37', 'Transportation Management SCM 4', 'BSCA', 3, '3A', 3, 3, 0, 1, 'old'),
('bsca_o38', 'Customs Clearance CM 4', 'BSCA', 3, '3A', 5, 5, 0, 1, 'old'),
('bsca_o39', 'Operations Management CMBE 1', 'BSCA', 3, '3A', 3, 3, 0, 1, 'old'),
('bsca_o40', 'Customs Appraisal and Assessment TM 4', 'BSCA', 3, '3A', 3, 3, 0, 1, 'old'),
('bsca_o41', 'Thesis Writing 1 RES 1', 'BSCA', 3, '3A', 3, 3, 0, 1, 'old'),
('bsca_o42', 'Financial Management EL 2', 'BSCA', 3, '3A', 3, 3, 0, 1, 'old'),
('bsca_o43', 'Gender and Society GE 112', 'BSCA', 3, '3A', 3, 3, 0, 0, 'old'),
('bsca_o44', 'Customs Proceeding CM 5', 'BSCA', 3, '3A', 5, 5, 0, 1, 'old'),
('bsca_o45', 'Excise Taxes, Liquidation of Duty and Surcharges TM 5', 'BSCA', 3, '3A', 5, 5, 0, 1, 'old'),
('bsca_o46', 'International Marketing EL 3', 'BSCA', 3, '3A', 3, 3, 0, 1, 'old'),
('bsca_o47', 'Thesis Writing 2 RES 2', 'BSCA', 3, '3A', 3, 3, 0, 1, 'old'),
('bsca_o48', 'Strategic Management CMBE 2', 'BSCA', 3, '3A', 3, 3, 0, 1, 'old'),
('bsca_o49', 'Customs Post Clearance Audit and Fraud Detection CM 6', 'BSCA', 3, '3A', 3, 3, 0, 1, 'old'),
('bsca_o50', 'Internship/Practicum for Customs Administration (400hrs) INTERN', 'BSCA', 3, '3A', 4, 4, 0, 1, 'old'),
('bsca_o51', 'Ethics and Standards of the Customs Profession CM 7', 'BSCA', 4, '4A', 3, 3, 0, 1, 'old'),
('bsca_o52', 'Special Duties and Trade Remedies TM 6', 'BSCA', 4, '4A', 3, 3, 0, 1, 'old'),
('bsca_o53', 'International Trade Decisions, Agreements and Foreign Trade Issues TM 7', 'BSCA', 4, '4A', 5, 5, 0, 1, 'old'),
('bsca_o54', 'Competencies Assessment in Customs Management CM 8', 'BSCA', 4, '4A', 5, 5, 0, 1, 'old'),
('bsca_o55', 'Competencies Assessment in Tariff Management TM 8', 'BSCA', 4, '4A', 5, 5, 0, 1, 'old'),
('crim_n1', 'Law Enforcement Organization LEA 1', 'BSCRIM', 1, '1A', 4, 4, 0, 1, 'new'),
('crim_n2', 'Character Formation 1 CRIM 101', 'BSCRIM', 1, '1A', 3, 3, 0, 1, 'new'),
('crim_n3', 'Human Behavior and Criminology CRIM 3', 'BSCRIM', 1, '1A', 3, 3, 0, 1, 'new'),
('crim_n4', 'Fundamentals of Criminal Investigation CDI 1', 'BSCRIM', 1, '1A', 4, 4, 0, 1, 'new'),
('crim_n5', 'Forensic Photography FORENSIC 1', 'BSCRIM', 2, '2A', 3, 2, 1, 1, 'new'),
('crim_n6', 'Personal Identification Techniques FORENSIC 2', 'BSCRIM', 2, '2A', 3, 2, 1, 1, 'new'),
('crim_n7', 'Traffic Management and Accident Investigation CDI 4', 'BSCRIM', 2, '2A', 3, 3, 0, 1, 'new'),
('crim_n8', 'Fundamentals of Marksmanship PATHFIT 4', 'BSCRIM', 2, '2A', 2, 2, 0, 0, 'new'),
('crim_n9', 'Criminological Research CRIM 102', 'BSCRIM', 3, '3A', 3, 3, 0, 1, 'new'),
('crim_n10', 'Criminology Internship / OJT CRIM INT', 'BSCRIM', 4, '4A', 6, 0, 6, 1, 'new'),
('crim_o1', 'Introduction to Criminology CRIM 1', 'BSCRIM', 1, '1A', 3, 3, 0, 1, 'old'),
('crim_o2', 'Police Organization and Administration LEA 101', 'BSCRIM', 1, '1A', 3, 3, 0, 1, 'old'),
('crim_o3', 'Criminal Investigation CDI 101', 'BSCRIM', 2, '2A', 3, 3, 0, 1, 'old'),
('crim_o4', 'Forensic Photography FORENSIC 101', 'BSCRIM', 2, '2A', 3, 2, 1, 1, 'old'),
('crim_o5', 'Criminology Internship CRIM 102', 'BSCRIM', 4, '4A', 6, 0, 6, 1, 'old'),
('hm_n1', 'Kitchen Essentials and Basic Food Preparation HPC 101', 'BSHM', 1, '1A', 3, 2, 1, 1, 'new'),
('hm_n2', 'Food and Beverage Service Operations HPC 102', 'BSHM', 1, '1A', 3, 2, 1, 1, 'new'),
('hm_n3', 'Front Office Operations HPC 103', 'BSHM', 2, '2A', 3, 2, 1, 1, 'new'),
('hm_n4', 'Housekeeping Operations HPC 104', 'BSHM', 2, '2A', 3, 2, 1, 1, 'new'),
('hm_n5', 'Culinary Fundamentals HPC 121', 'BSHM', 3, '3A', 3, 2, 1, 1, 'new'),
('hm_n6', 'Hospitality Internship 600 Hours BSHM INT', 'BSHM', 4, '4A', 6, 0, 6, 1, 'new'),
('hm_o1', 'Introduction to Hospitality Industry HM 1', 'BSHM', 1, '1A', 3, 3, 0, 1, 'old'),
('hm_o2', 'Food and Beverage Service HM 2', 'BSHM', 1, '1A', 3, 2, 1, 1, 'old'),
('hm_o3', 'Front Office Management HM 3', 'BSHM', 2, '2A', 3, 2, 1, 1, 'old'),
('hm_o4', 'Hospitality Practicum HM 4', 'BSHM', 4, '4A', 6, 0, 6, 1, 'old'),
('fm_n1', 'Financial Management PROF COR FM 1', 'BSBA-FM', 1, '1A', 3, 3, 0, 1, 'new'),
('fm_n2', 'Basic Microeconomics BUS CORE 111', 'BSBA-FM', 1, '1A', 3, 3, 0, 1, 'new'),
('fm_n3', 'Business Law Obligations and Contracts BUS CORE 112', 'BSBA-FM', 1, '1A', 3, 3, 0, 1, 'new'),
('fm_n4', 'Investment and Portfolio Management PROF COR FM 2', 'BSBA-FM', 2, '2A', 3, 3, 0, 1, 'new'),
('fm_n5', 'Monetary Policy and Central Banking FM ELEC 1', 'BSBA-FM', 3, '3A', 3, 3, 0, 1, 'new'),
('fm_n6', 'Financial Management Internship INT 600', 'BSBA-FM', 4, '4A', 6, 0, 6, 1, 'new'),
('fm_o1', 'Basic Microeconomics BUS 101', 'BSBA-FM', 1, '1A', 3, 3, 0, 1, 'old'),
('fm_o2', 'Financial Management FM 101', 'BSBA-FM', 1, '1A', 3, 3, 0, 1, 'old'),
('fm_o3', 'Credit and Collection FM 102', 'BSBA-FM', 2, '2A', 3, 3, 0, 1, 'old'),
('fm_o4', 'FM Internship FM 103', 'BSBA-FM', 4, '4A', 6, 0, 6, 1, 'old'),
('hrdm_n1', 'Human Resource Management MGT 1', 'BSBA-HRDM', 1, '1A', 3, 3, 0, 1, 'new'),
('hrdm_n2', 'Administrative and Office Management HRM 1', 'BSBA-HRDM', 2, '2A', 3, 3, 0, 1, 'new'),
('hrdm_n3', 'Labor Law and Legislation HRM 2', 'BSBA-HRDM', 2, '2A', 3, 3, 0, 1, 'new'),
('hrdm_n4', 'Recruitment and Selection HRM 3', 'BSBA-HRDM', 2, '2A', 3, 3, 0, 1, 'new'),
('hrdm_n5', 'Training and Development HRM 4', 'BSBA-HRDM', 3, '3A', 3, 3, 0, 1, 'new'),
('hrdm_n6', 'Compensation and Benefits HRM 5', 'BSBA-HRDM', 3, '3A', 3, 3, 0, 1, 'new'),
('hrdm_n7', 'HRDM Internship 600 Hours HRM INT', 'BSBA-HRDM', 4, '4A', 6, 0, 6, 1, 'new'),
('hrdm_o1', 'Principles of Management MGT 101', 'BSBA-HRDM', 1, '1A', 3, 3, 0, 1, 'old'),
('hrdm_o2', 'Human Behavior in Organization MGT 102', 'BSBA-HRDM', 1, '1A', 3, 3, 0, 1, 'old'),
('hrdm_o3', 'Recruitment and Selection HRDM 101', 'BSBA-HRDM', 2, '2A', 3, 3, 0, 1, 'old'),
('hrdm_o4', 'HRDM Practicum HRDM 102', 'BSBA-HRDM', 4, '4A', 6, 0, 6, 1, 'old'),
('mm_n1', 'Principles of Marketing PROF COR MM 1', 'BSBA-MM', 1, '1A', 3, 3, 0, 1, 'new'),
('mm_n2', 'Professional Salesmanship PROF COR MM 2', 'BSBA-MM', 1, '1A', 3, 3, 0, 1, 'new'),
('mm_n3', 'Distribution Management PROF COR MM 3', 'BSBA-MM', 2, '2A', 3, 3, 0, 1, 'new'),
('mm_n4', 'Advertising and Sales Promotion MM 124', 'BSBA-MM', 2, '2A', 3, 3, 0, 1, 'new'),
('mm_n5', 'Retail Management MM 125', 'BSBA-MM', 3, '3A', 3, 3, 0, 1, 'new'),
('mm_n6', 'Marketing Internship 600 Hours MM INT', 'BSBA-MM', 4, '4A', 6, 0, 6, 1, 'new'),
('mm_o1', 'Principles of Marketing MM 101', 'BSBA-MM', 1, '1A', 3, 3, 0, 1, 'old'),
('mm_o2', 'Consumer Behavior MM 102', 'BSBA-MM', 2, '2A', 3, 3, 0, 1, 'old'),
('mm_o3', 'Marketing Research MM 103', 'BSBA-MM', 3, '3A', 3, 3, 0, 1, 'old'),
('mm_o4', 'Marketing Internship MM 104', 'BSBA-MM', 4, '4A', 6, 0, 6, 1, 'old'),
('scs1', 'Discrete Mathematics CS 101', 'BSCS', 1, '1A', 3, 3, 0, 1, 'new'),
('scs2', 'Data Structures & Algorithms CS 102', 'BSCS', 2, '2A', 3, 2, 2, 1, 'new'),
('scs3', 'Artificial Intelligence CS 201', 'BSCS', 3, '3A', 3, 2, 2, 1, 'new');

-- Seed Specific Course & Curriculum Tables from Master Subjects
INSERT IGNORE INTO bsit_subject_new SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSIT' AND curriculum_type='new';
INSERT IGNORE INTO bsit_subject_old SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSIT' AND curriculum_type='old';

INSERT IGNORE INTO beed_subject_new SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BEED' AND curriculum_type='new';
INSERT IGNORE INTO beed_subject_old SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BEED' AND curriculum_type='old';

INSERT IGNORE INTO bsed_subject_new SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSED' AND curriculum_type='new';
INSERT IGNORE INTO bsed_subject_old SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSED' AND curriculum_type='old';

INSERT IGNORE INTO bsca_subject_new SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSCA' AND curriculum_type='new';
INSERT IGNORE INTO bsca_subject_old SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSCA' AND curriculum_type='old';

INSERT IGNORE INTO bscrim_subject_new SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSCRIM' AND curriculum_type='new';
INSERT IGNORE INTO bscrim_subject_old SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSCRIM' AND curriculum_type='old';

INSERT IGNORE INTO bshm_subject_new SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSHM' AND curriculum_type='new';
INSERT IGNORE INTO bshm_subject_old SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSHM' AND curriculum_type='old';

INSERT IGNORE INTO bsba_fm_subject_new SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSBA-FM' AND curriculum_type='new';
INSERT IGNORE INTO bsba_fm_subject_old SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSBA-FM' AND curriculum_type='old';

INSERT IGNORE INTO bsba_hrdm_subject_new SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSBA-HRDM' AND curriculum_type='new';
INSERT IGNORE INTO bsba_hrdm_subject_old SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSBA-HRDM' AND curriculum_type='old';

INSERT IGNORE INTO bsba_mm_subject_new SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSBA-MM' AND curriculum_type='new';
INSERT IGNORE INTO bsba_mm_subject_old SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSBA-MM' AND curriculum_type='old';

INSERT IGNORE INTO bscs_subject_new SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSCS' AND curriculum_type='new';
INSERT IGNORE INTO bscs_subject_old SELECT id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major FROM subjects WHERE course='BSCS' AND curriculum_type='old';

-- 5. Seed Initial Sample Schedules
INSERT IGNORE INTO schedules (id, instructor_id, room_id, day, time_start, time_end, subject_id) VALUES
('sch1', 't1', 'r2', 'W', '08:00', '11:00', 's1'),
('sch2', 't2', 'r1', 'M', '13:00', '16:00', 's2');
