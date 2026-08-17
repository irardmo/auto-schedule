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
    master_degree VARCHAR(255),
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

INSERT IGNORE INTO instructors (id, name, designation, degree, master_degree, area, employee_no, effectivity_date, admin_load, max_units) VALUES
('t1', 'KENT LIWANAGAN', 'Regular Teacher', 'BSIT', 'MSIT', 'ACADEMICS', '0105', 'July 13, 2026', '', 24),
('t2', 'GERARDO MICIANO', 'Program Head', 'BSIT', 'MSIT', 'ADMINISTRATION', '0321', 'June 23, 2026', 'CIT Program Head', 18),
('t3', 'CAREN ROSE L TOJEDO, LPT., MAED.', 'Director', 'BSED, LPT', 'MAED', 'ACADEMICS', '0001', 'June 01, 2026', 'Dean of Academics', 15),
('t4', 'MAILA M MORALES, LPT., CHRA', 'Admin', 'BSBA, LPT, CHRA', 'MBA', 'ADMINISTRATION', '0002', 'July 01, 2026', 'HRD Director', 9);

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

INSERT IGNORE INTO subjects (id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major) VALUES
('s1', 'Computer Programming 1 CC102', 'BSIT', 1, '1A', 3, 2, 2, 1),
('s2', 'SYSTEM ADMIN AND MAINTENANCE SA 101', 'BSIT', 3, '3', 3, 2, 2, 1),
('s3', 'Social and Professional Issues SP 101', 'BSIT', 3, '3', 3, 3, 0, 0),
('s4', 'FUNDAMENTALS OF DATABASE SYSTEM IM 101', 'BSIT', 2, '2A', 3, 2, 2, 1),
('s5', 'FUNDAMENTALS OF DATABASE SYSTEM IM 101', 'BSIT', 2, '2B', 3, 2, 2, 1),
('s6', 'OBJECT ORIENTED PROGRAMMING PF 101', 'BSIT', 2, '2A', 3, 2, 2, 1),
('s7', 'OBJECT ORIENTED PROGRAMMING PF 101', 'BSIT', 2, '2B', 3, 2, 2, 1),
('s8', 'National Service Training Program 1 NSTP 1', 'BSIT', 1, '1A', 3, 3, 0, 0);

INSERT IGNORE INTO schedules (id, instructor_id, room_id, day, time_start, time_end, subject_id) VALUES
('sch1', 't1', 'r2', 'W', '08:00', '11:00', 's1'),
('sch2', 't1', 'r1', 'S', '12:00', '14:00', 's2'),
('sch3', 't1', 'r5', 'F', '15:00', '17:00', 's3'),
('sch4', 't2', 'r6', 'TTH', '08:00', '09:00', 's4'),
('sch5', 't2', 'r7', 'TTH', '09:00', '10:00', 's5'),
('sch6', 't2', 'r6', 'TTH', '10:00', '11:00', 's6'),
('sch7', 't2', 'r7', 'TTH', '11:00', '12:00', 's7'),
('sch8', 't2', 'r1', 'M', '09:00', '10:00', 's8');
