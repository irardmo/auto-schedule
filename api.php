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
        lab_hours INT NOT NULL DEFAULT 0,
        is_major INT NOT NULL DEFAULT 0
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
                    $stmt = $conn->prepare("INSERT INTO subjects (id, title_and_code, course, year_level, block_section, units, lec_hours, lab_hours, is_major) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    foreach ($data['subjects'] as $sub) {
                        $stmt->execute([
                            $sub['id'], $sub['title_and_code'], $sub['course'], 
                            $sub['year_level'], $sub['block_section'], 
                            $sub['units'], $sub['lec_hours'], $sub['lab_hours'],
                            $sub['is_major'] ?? 0
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
