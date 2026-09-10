<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';

// XAMPP Default MySQL Database Configurations
$host = "localhost";
$db_name = "sibt_scheduling";
$username = "root";
$password = "";

$courseTables = [
    'bsit_subject_new', 'bsit_subject_old',
    'beed_subject_new', 'beed_subject_old',
    'bsed_subject_new', 'bsed_subject_old',
    'bsca_subject_new', 'bsca_subject_old',
    'bscrim_subject_new', 'bscrim_subject_old',
    'bshm_subject_new', 'bshm_subject_old',
    'bsba_fm_subject_new', 'bsba_fm_subject_old',
    'bsba_hrdm_subject_new', 'bsba_hrdm_subject_old',
    'bsba_mm_subject_new', 'bsba_mm_subject_old',
    'bscs_subject_new', 'bscs_subject_old'
];

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

    // Create Course-Specific Subject Tables
    foreach ($courseTables as $tbl) {
        $conn->exec("CREATE TABLE IF NOT EXISTS {$tbl} (
            id VARCHAR(50) PRIMARY KEY,
            title_and_code VARCHAR(255) NOT NULL,
            course VARCHAR(100) NOT NULL,
            year_level INT NOT NULL,
            semester INT NOT NULL DEFAULT 1,
            units INT NOT NULL,
            lec_hours INT NOT NULL DEFAULT 0,
            lab_hours INT NOT NULL DEFAULT 0,
            is_major INT NOT NULL DEFAULT 0,
            curriculum_type VARCHAR(20) DEFAULT 'new'
        ) ENGINE=InnoDB;");
    }

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
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;");

} catch (PDOException $e) {
    // MySQL connection error fallback
}

// Process API Request routing
switch ($action) {
    case 'get_all':
        // Retrieve whole SIBT database package
        $instructors = $conn ? $conn->query("SELECT * FROM instructors")->fetchAll(PDO::FETCH_ASSOC) : [];
        $rooms = $conn ? $conn->query("SELECT * FROM rooms")->fetchAll(PDO::FETCH_ASSOC) : [];
        $schedules = $conn ? $conn->query("SELECT * FROM schedules")->fetchAll(PDO::FETCH_ASSOC) : [];

        $subjects = [];
        if ($conn) {
            foreach ($courseTables as $tbl) {
                try {
                    $tblSubs = $conn->query("SELECT * FROM {$tbl}")->fetchAll(PDO::FETCH_ASSOC);
                    if ($tblSubs) {
                        $subjects = array_merge($subjects, $tblSubs);
                    }
                } catch (Exception $e) {}
            }
        }

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
        if ($data && $conn) {
            $conn->beginTransaction();
            try {
                // Clear state
                $conn->exec("DELETE FROM schedules");
                foreach ($courseTables as $tbl) {
                    try {
                        $conn->exec("DELETE FROM {$tbl}");
                    } catch (Exception $e) {}
                }
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
                    foreach ($data['subjects'] as $sub) {
                        $c = strtolower(str_replace(['-', ' '], '_', $sub['course'] ?? 'bsit'));
                        $ct = strtolower($sub['curriculum_type'] ?? 'new');
                        $targetTbl = "{$c}_subject_{$ct}";
                        if (!in_array($targetTbl, $courseTables)) {
                            $targetTbl = "bsit_subject_new";
                        }
                        $stmt = $conn->prepare("INSERT INTO {$targetTbl} (id, title_and_code, course, year_level, semester, units, lec_hours, lab_hours, is_major, curriculum_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                        $stmt->execute([
                            $sub['id'], $sub['title_and_code'], $sub['course'], 
                            $sub['year_level'], $sub['semester'] ?? 1,
                            $sub['units'], $sub['lec_hours'], $sub['lab_hours'],
                            $sub['is_major'] ?? 0,
                            $sub['curriculum_type'] ?? 'new'
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
            echo json_encode(["status" => "error", "message" => "No valid JSON payload or DB connection error."]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Unknown endpoint action target requested."]);
        break;
}
?>
