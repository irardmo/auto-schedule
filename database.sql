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
('so11', 'Old Physical Education 1 Physical Fitness PE 1', 'BSIT', 1, '1A', 2, 2, 0, 0, 'old'),
('so12', 'Old Physical Education 2 Rhythmic Activities PE 2', 'BSIT', 1, '1A', 2, 2, 0, 0, 'old'),
('so13', 'Old NSTP 1 Civic Welfare Training NSTP 1', 'BSIT', 1, '1A', 3, 3, 0, 0, 'old'),
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
('beed_o1', 'Child & Adolescent Development EED 1', 'BEED', 1, '1A', 3, 3, 0, 1, 'old'),
('beed_o2', 'Principles of Teaching 1 EED 2', 'BEED', 1, '1A', 3, 3, 0, 1, 'old'),
('beed_o3', 'Educational Technology 1 ET 1', 'BEED', 2, '2A', 3, 2, 2, 1, 'old'),
('beed_o4', 'Curriculum Development EED 3', 'BEED', 2, '2A', 3, 3, 0, 1, 'old'),
('beed_o5', 'Assessment of Student Learning 1 ASL 1', 'BEED', 3, '3A', 3, 3, 0, 1, 'old'),
('beed_o6', 'Old Practice Teaching EED 4', 'BEED', 4, '4A', 6, 0, 6, 1, 'old'),
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
('bsed_o1', 'Old Principles of Teaching SED 1', 'BSED', 1, '1A', 3, 3, 0, 1, 'old'),
('bsed_o2', 'Developmental Reading SED 2', 'BSED', 1, '1A', 3, 3, 0, 1, 'old'),
('bsed_o3', 'Educational Technology 2 ET 2', 'BSED', 2, '2A', 3, 2, 2, 1, 'old'),
('bsed_o4', 'Campus Journalism SED 3', 'BSED', 3, '3A', 3, 3, 0, 1, 'old'),
('bsed_o5', 'Old Secondary Practice Teaching SED 4', 'BSED', 4, '4A', 6, 0, 6, 1, 'old'),
('bsca_n1', 'Fundamentals of Customs Admin CUA 101', 'BSCA', 1, '1A', 3, 3, 0, 1, 'new'),
('bsca_n2', 'Customs Tariff and Classification CUA 102', 'BSCA', 1, '1A', 3, 3, 0, 1, 'new'),
('bsca_n3', 'Customs Clearance and Procedure CUA 103', 'BSCA', 2, '2A', 3, 3, 0, 1, 'new'),
('bsca_n4', 'Warehouse Operations Mgt SCM 102', 'BSCA', 2, '2A', 3, 3, 0, 1, 'new'),
('bsca_n5', 'Border Control and Security CUA 104', 'BSCA', 3, '3A', 3, 3, 0, 1, 'new'),
('bsca_n6', 'Customs Practicum / Internship CUA 105', 'BSCA', 4, '4A', 6, 0, 6, 1, 'new'),
('bsca_o1', 'Old Customs Laws and Tariff CUA 1', 'BSCA', 1, '1A', 3, 3, 0, 1, 'old'),
('bsca_o2', 'Old Customs Documentation CUA 2', 'BSCA', 2, '2A', 3, 3, 0, 1, 'old'),
('bsca_o3', 'Old International Trade & Cargo CUA 3', 'BSCA', 3, '3A', 3, 3, 0, 1, 'old'),
('bsca_o4', 'Old Customs Practicum CUA 4', 'BSCA', 4, '4A', 6, 0, 6, 1, 'old'),
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
('crim_o3', 'Old Criminal Investigation CDI 101', 'BSCRIM', 2, '2A', 3, 3, 0, 1, 'old'),
('crim_o4', 'Old Forensic Photography FORENSIC 101', 'BSCRIM', 2, '2A', 3, 2, 1, 1, 'old'),
('crim_o5', 'Old Criminology Internship CRIM 102', 'BSCRIM', 4, '4A', 6, 0, 6, 1, 'old'),
('hm_n1', 'Kitchen Essentials and Basic Food Preparation HPC 101', 'BSHM', 1, '1A', 3, 2, 1, 1, 'new'),
('hm_n2', 'Food and Beverage Service Operations HPC 102', 'BSHM', 1, '1A', 3, 2, 1, 1, 'new'),
('hm_n3', 'Front Office Operations HPC 103', 'BSHM', 2, '2A', 3, 2, 1, 1, 'new'),
('hm_n4', 'Housekeeping Operations HPC 104', 'BSHM', 2, '2A', 3, 2, 1, 1, 'new'),
('hm_n5', 'Culinary Fundamentals HPC 121', 'BSHM', 3, '3A', 3, 2, 1, 1, 'new'),
('hm_n6', 'Hospitality Internship 600 Hours BSHM INT', 'BSHM', 4, '4A', 6, 0, 6, 1, 'new'),
('hm_o1', 'Introduction to Hospitality Industry HM 1', 'BSHM', 1, '1A', 3, 3, 0, 1, 'old'),
('hm_o2', 'Old Food and Beverage Service HM 2', 'BSHM', 1, '1A', 3, 2, 1, 1, 'old'),
('hm_o3', 'Old Front Office Management HM 3', 'BSHM', 2, '2A', 3, 2, 1, 1, 'old'),
('hm_o4', 'Old Hospitality Practicum HM 4', 'BSHM', 4, '4A', 6, 0, 6, 1, 'old'),
('fm_n1', 'Financial Management PROF COR FM 1', 'BSBA-FM', 1, '1A', 3, 3, 0, 1, 'new'),
('fm_n2', 'Basic Microeconomics BUS CORE 111', 'BSBA-FM', 1, '1A', 3, 3, 0, 1, 'new'),
('fm_n3', 'Business Law Obligations and Contracts BUS CORE 112', 'BSBA-FM', 1, '1A', 3, 3, 0, 1, 'new'),
('fm_n4', 'Investment and Portfolio Management PROF COR FM 2', 'BSBA-FM', 2, '2A', 3, 3, 0, 1, 'new'),
('fm_n5', 'Monetary Policy and Central Banking FM ELEC 1', 'BSBA-FM', 3, '3A', 3, 3, 0, 1, 'new'),
('fm_n6', 'Financial Management Internship INT 600', 'BSBA-FM', 4, '4A', 6, 0, 6, 1, 'new'),
('fm_o1', 'Basic Microeconomics BUS 101', 'BSBA-FM', 1, '1A', 3, 3, 0, 1, 'old'),
('fm_o2', 'Old Financial Management FM 101', 'BSBA-FM', 1, '1A', 3, 3, 0, 1, 'old'),
('fm_o3', 'Old Credit and Collection FM 102', 'BSBA-FM', 2, '2A', 3, 3, 0, 1, 'old'),
('fm_o4', 'Old FM Internship FM 103', 'BSBA-FM', 4, '4A', 6, 0, 6, 1, 'old'),
('hrdm_n1', 'Human Resource Management MGT 1', 'BSBA-HRDM', 1, '1A', 3, 3, 0, 1, 'new'),
('hrdm_n2', 'Administrative and Office Management HRM 1', 'BSBA-HRDM', 2, '2A', 3, 3, 0, 1, 'new'),
('hrdm_n3', 'Labor Law and Legislation HRM 2', 'BSBA-HRDM', 2, '2A', 3, 3, 0, 1, 'new'),
('hrdm_n4', 'Recruitment and Selection HRM 3', 'BSBA-HRDM', 2, '2A', 3, 3, 0, 1, 'new'),
('hrdm_n5', 'Training and Development HRM 4', 'BSBA-HRDM', 3, '3A', 3, 3, 0, 1, 'new'),
('hrdm_n6', 'Compensation and Benefits HRM 5', 'BSBA-HRDM', 3, '3A', 3, 3, 0, 1, 'new'),
('hrdm_n7', 'HRDM Internship 600 Hours HRM INT', 'BSBA-HRDM', 4, '4A', 6, 0, 6, 1, 'new'),
('hrdm_o1', 'Principles of Management MGT 101', 'BSBA-HRDM', 1, '1A', 3, 3, 0, 1, 'old'),
('hrdm_o2', 'Human Behavior in Organization MGT 102', 'BSBA-HRDM', 1, '1A', 3, 3, 0, 1, 'old'),
('hrdm_o3', 'Old Recruitment and Selection HRDM 101', 'BSBA-HRDM', 2, '2A', 3, 3, 0, 1, 'old'),
('hrdm_o4', 'Old HRDM Practicum HRDM 102', 'BSBA-HRDM', 4, '4A', 6, 0, 6, 1, 'old'),
('mm_n1', 'Principles of Marketing PROF COR MM 1', 'BSBA-MM', 1, '1A', 3, 3, 0, 1, 'new'),
('mm_n2', 'Professional Salesmanship PROF COR MM 2', 'BSBA-MM', 1, '1A', 3, 3, 0, 1, 'new'),
('mm_n3', 'Distribution Management PROF COR MM 3', 'BSBA-MM', 2, '2A', 3, 3, 0, 1, 'new'),
('mm_n4', 'Advertising and Sales Promotion MM 124', 'BSBA-MM', 2, '2A', 3, 3, 0, 1, 'new'),
('mm_n5', 'Retail Management MM 125', 'BSBA-MM', 3, '3A', 3, 3, 0, 1, 'new'),
('mm_n6', 'Marketing Internship 600 Hours MM INT', 'BSBA-MM', 4, '4A', 6, 0, 6, 1, 'new'),
('mm_o1', 'Old Principles of Marketing MM 101', 'BSBA-MM', 1, '1A', 3, 3, 0, 1, 'old'),
('mm_o2', 'Old Consumer Behavior MM 102', 'BSBA-MM', 2, '2A', 3, 3, 0, 1, 'old'),
('mm_o3', 'Old Marketing Research MM 103', 'BSBA-MM', 3, '3A', 3, 3, 0, 1, 'old'),
('mm_o4', 'Old Marketing Internship MM 104', 'BSBA-MM', 4, '4A', 6, 0, 6, 1, 'old'),
('scs1', 'Discrete Mathematics CS 101', 'BSCS', 1, '1A', 3, 3, 0, 1, 'new'),
('scs2', 'Data Structures & Algorithms CS 102', 'BSCS', 2, '2A', 3, 2, 2, 1, 'new'),
('scs3', 'Artificial Intelligence CS 201', 'BSCS', 3, '3A', 3, 2, 2, 1, 'new');

-- 5. Seed Initial Sample Schedules
INSERT IGNORE INTO schedules (id, instructor_id, room_id, day, time_start, time_end, subject_id) VALUES
('sch1', 't1', 'r2', 'W', '08:00', '11:00', 's1'),
('sch2', 't2', 'r1', 'M', '13:00', '16:00', 's2');
