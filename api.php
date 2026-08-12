<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// XAMPP Default MySQL Database Configurations
$host = "localhost";
$db_name = "sibt_scheduling";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host={$host}", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database and tables automatically if they do not exist
    $conn->exec("CREATE DATABASE IF NOT EXISTS `{$db_name}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;");
    $conn->exec("USE `{$db_name}`;");

    // Create Instructors
    $conn->exec("CREATE TABLE IF NOT EXISTS instructors (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        designation VARCHAR(100) NOT NULL,
        degree VARCHAR(255),
        area VARCHAR(100) DEFAULT 'ACADEMICS',
        employee_no VARCHAR(50),
        effectivity_date VARCHAR(100),
        admin_load VARCHAR(255),
        max_units INT NOT NULL DEFAULT 24
    ) ENGINE=InnoDB;");

    // Create Rooms
    $conn->exec("CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        room_type VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB;");

    // Create Subjects
    $conn->exec("CREATE TABLE IF NOT EXISTS subjects (
        id VARCHAR(50) PRIMARY KEY,
        title_and_code VARCHAR(255) NOT NULL,
        course VARCHAR(100) NOT NULL,
        year_level INT NOT NULL,
        block_section VARCHAR(50) NOT NULL,
        units INT NOT NULL,
        lec_hours INT NOT NULL DEFAULT 0,
        lab_hours INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB;");

    // Create Schedules
    $conn->exec("CREATE TABLE IF NOT EXISTS schedules (
        id VARCHAR(50) PRIMARY KEY,
        instructor_id VARCHAR(50),
        room_id VARCHAR(50),
        day VARCHAR(50) NOT NULL,
        time_start VARCHAR(10) NOT NULL,
        time_end VARCHAR(10) NOT NULL,
        subject_id VARCHAR(50),
        FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;");

    // Auto-seed table if instructors are completely empty
    $check = $conn->query("SELECT COUNT(*) FROM instructors")->fetchColumn();
    if ($check == 0) {
        $conn->exec("INSERT INTO instructors (id, name, designation, degree, area, employee_no, effectivity_date, admin_load, max_units) VALUES
        ('t1', 'KENT LIWANAGAN', 'Regular Teacher', 'College Faculty', 'ACADEMICS', '0105', 'July 13, 2026', '', 24),
        ('t2', 'GERARDO MICIANO', 'Program Head', 'BSIT', 'ADMINISTRATION', '0321', 'June 23, 2026', 'CIT Program Head', 18),
        ('t3', 'CAREN ROSE L TOJEDO, LPT., MAED.', 'Director', 'Dean of Academics', 'ACADEMICS', '0001', 'June 01, 2026', 'Dean of Academics', 15),
        ('t4', 'MAILA M MORALES, LPT., CHRA', 'Admin', 'HRD Director', 'ADMINISTRATION', '0002', 'July 01, 2026', 'HRD Director', 9);");

        $conn->exec("INSERT INTO rooms (id, name, room_type) VALUES
        ('r1', 'COMLAB', 'Laboratory'),
        ('r2', 'W- ComLab', 'Laboratory'),
        ('r3', 'T-COMLAB', 'Laboratory'),
        ('r4', 'TH-COMLAB', 'Laboratory'),
        ('r5', 'HS-101', 'Lecture'),
        ('r6', 'TH-203', 'Lecture'),
        ('r7', 'T-204', 'Lecture');");

        $conn->exec("INSERT INTO subjects (id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours) VALUES
        ('s1', 'Computer Programming 1 CC102', 'BSIT', 1, '1A', 3, 2, 2),
        ('s2', 'SYSTEM ADMIN AND MAINTENANCE SA 101', 'BSIT', 3, '3', 3, 2, 2),
        ('s3', 'Social and Professional Issues SP 101', 'BSIT', 3, '3', 3, 3, 0),
        ('s4', 'FUNDAMENTALS OF DATABASE SYSTEM IM 101', 'BSIT', 2, '2A', 3, 2, 2),
        ('s5', 'FUNDAMENTALS OF DATABASE SYSTEM IM 101', 'BSIT', 2, '2B', 3, 2, 2),
        ('s6', 'OBJECT ORIENTED PROGRAMMING PF 101', 'BSIT', 2, '2A', 3, 2, 2),
        ('s7', 'OBJECT ORIENTED PROGRAMMING PF 101', 'BSIT', 2, '2B', 3, 2, 2),
        ('s8', 'National Service Training Program 1 NSTP 1', 'BSIT', 1, '1A', 3, 3, 0);");

        $conn->exec("INSERT INTO schedules (id, instructor_id, room_id, day, time_start, time_end, subject_id) VALUES
        ('sch1', 't1', 'r2', 'W', '08:00', '11:00', 's1'),
        ('sch2', 't1', 'r1', 'S', '12:00', '14:00', 's2'),
        ('sch3', 't1', 'r5', 'F', '15:00', '17:00', 's3'),
        ('sch4', 't2', 'r6', 'TTH', '08:00', '09:00', 's4'),
        ('sch5', 't2', 'r7', 'TTH', '09:00', '10:00', 's5'),
        ('sch6', 't2', 'r6', 'TTH', '10:00', '11:00', 's6'),
        ('sch7', 't2', 'r7', 'TTH', '11:00', '12:00', 's7'),
        ('sch8', 't2', 'r1', 'M', '09:00', '10:00', 's8');");
    }

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $e->getMessage()]);
    exit();
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Process API Request routing
switch ($action) {
    case 'get_all':
        // Retrieve whole SIBT database package
        $instructors = $conn->query("SELECT * FROM instructors")->fetchAll(PDO::FETCH_ASSOC);
        $rooms = $conn->query("SELECT * FROM rooms")->fetchAll(PDO::FETCH_ASSOC);
        $subjects = $conn->query("SELECT * FROM subjects")->fetchAll(PDO::FETCH_ASSOC);
        $schedules = $conn->query("SELECT * FROM schedules")->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode([
            "status" => "success",
            "instructors" => $instructors,
            "rooms" => $rooms,
            "subjects" => $subjects,
            "schedules" => $schedules
        ]);
        break;

    case 'save_database':
        // Overwrite full state from request payload (useful for bulk operations / autoscheduling engine reset)
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $conn->beginTransaction();
            try {
                // Clear state
                $conn->exec("DELETE FROM schedules");
                $conn->exec("DELETE FROM subjects");
                $conn->exec("DELETE FROM rooms");
                $conn->exec("DELETE FROM instructors");

                // Bulk inserts
                if (isset($data['instructors']) && is_array($data['instructors'])) {
                    $stmt = $conn->prepare("INSERT INTO instructors (id, name, designation, degree, area, employee_no, effectivity_date, admin_load, max_units) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    foreach ($data['instructors'] as $ins) {
                        $stmt->execute([
                            $ins['id'], $ins['name'], $ins['designation'],
                            $ins['degree'] ?? '', $ins['area'] ?? 'ACADEMICS',
                            $ins['employee_no'] ?? '', $ins['effectivity_date'] ?? '',
                            $ins['admin_load'] ?? '', $ins['max_units'] ?? 24
                        ]);
                    }
                }

                if (isset($data['rooms']) && is_array($data['rooms'])) {
                    $stmt = $conn->prepare("INSERT INTO rooms (id, name, room_type) VALUES (?, ?, ?)");
                    foreach ($data['rooms'] as $rm) {
                        $stmt->execute([$rm['id'], $rm['name'], $rm['room_type']]);
                    }
                }

                if (isset($data['subjects']) && is_array($data['subjects'])) {
                    $stmt = $conn->prepare("INSERT INTO subjects (id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                    foreach ($data['subjects'] as $sub) {
                        $stmt->execute([
                            $sub['id'], $sub['title_and_code'], $sub['course'],
                            $sub['year_level'], $sub['block_section'],
                            $sub['units'], $sub['lec_hours'], $sub['lab_hours']
                        ]);
                    }
                }

                if (isset($data['schedules']) && is_array($data['schedules'])) {
                    $stmt = $conn->prepare("INSERT INTO schedules (id, instructor_id, room_id, day, time_start, time_end, subject_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    foreach ($data['schedules'] as $sch) {
                        $stmt->execute([
                            $sch['id'], $sch['instructor_id'], $sch['room_id'],
                            $sch['day'], $sch['time_start'], $sch['time_end'], $sch['subject_id']
                        ]);
                    }
                }

                $conn->commit();
                echo json_encode(["status" => "success", "message" => "Full database synced and saved successfully."]);
            } catch (Exception $e) {
                $conn->rollBack();
                echo json_encode(["status" => "error", "message" => "Transaction failed: " . $e->getMessage()]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "No valid JSON payload provided."]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Unknown endpoint action target requested."]);
        break;
}
?>
