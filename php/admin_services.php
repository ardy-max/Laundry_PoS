<?php
session_start();
include('../includes/db.php');

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

function sendResponse($success, $message = '') {
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// HANDLE ACTIONS (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    if ($action === 'add') {
        $name = $input['name'] ?? '';
        $price = floatval($input['price'] ?? 0);

        if (empty($name) || $price < 0) {
            sendResponse(false, 'Name and valid Price required');
        }

        $stmt = $conn->prepare("INSERT INTO services (name, price) VALUES (?, ?)");
        $stmt->bind_param("sd", $name, $price);
        
        if ($stmt->execute()) sendResponse(true, 'Service added');
        else sendResponse(false, 'Failed to add service');

    } elseif ($action === 'edit') {
        $id = $input['service_id'] ?? 0;
        $name = $input['name'] ?? '';
        $price = floatval($input['price'] ?? 0);

        if ($id <= 0 || empty($name) || $price < 0) {
            sendResponse(false, 'Invalid data');
        }

        $stmt = $conn->prepare("UPDATE services SET name = ?, price = ? WHERE service_id = ?");
        $stmt->bind_param("sdi", $name, $price, $id);

        if ($stmt->execute()) sendResponse(true, 'Service updated');
        else sendResponse(false, 'Failed to update service');

    } elseif ($action === 'delete') {
        $id = $input['service_id'] ?? 0;
        if ($id <= 0) sendResponse(false, 'Invalid ID');

        $stmt = $conn->prepare("DELETE FROM services WHERE service_id = ?");
        $stmt->bind_param("i", $id);

        try {
            if ($stmt->execute()) sendResponse(true, 'Service deleted');
            else sendResponse(false, 'Failed to delete service');
        } catch (mysqli_sql_exception $e) {
            sendResponse(false, 'Cannot delete service: It is being used in orders.');
        }
    }

    exit;
}

// HANDLE LIST (GET)
$query = "SELECT service_id, name, price FROM services ORDER BY name ASC";
$result = $conn->query($query);
$services = $result ? $result->fetch_all(MYSQLI_ASSOC) : [];

echo json_encode([
    'success' => true,
    'data' => ['services' => $services]
]);

$conn->close();
?>
