<?php
session_start();
include('../includes/db.php');

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Helper function to send simple response
function sendResponse($success, $message = '') {
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// HANDLE ACTIONS (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    if ($action === 'add') {
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'user';

        if (empty($username) || empty($password)) {
            sendResponse(false, 'Username and Password required');
        }

        // Check if username exists
        $check = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $check->bind_param("s", $username);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            sendResponse(false, 'Username already exists');
        }

        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $username, $hashed, $role);
        
        if ($stmt->execute()) sendResponse(true, 'User added');
        else sendResponse(false, 'Failed to add user');

    } elseif ($action === 'edit') {
        $id = $input['id'] ?? 0;
        $username = $input['username'] ?? '';
        $role = $input['role'] ?? 'user';

        if ($id <= 0 || empty($username)) {
            sendResponse(false, 'Invalid data');
        }

        $stmt = $conn->prepare("UPDATE users SET username = ?, role = ? WHERE id = ?");
        $stmt->bind_param("ssi", $username, $role, $id);

        if ($stmt->execute()) sendResponse(true, 'User updated');
        else sendResponse(false, 'Failed to update user');

    } elseif ($action === 'delete') {
        $id = $input['id'] ?? 0;
        if ($id <= 0) sendResponse(false, 'Invalid ID');

        // Prevent deleting self? (Optional, but good practice)
        if ($id == $_SESSION['user_id']) {
            sendResponse(false, 'Cannot delete yourself');
        }

        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) sendResponse(true, 'User deleted');
        else sendResponse(false, 'Failed to delete user');

    } elseif ($action === 'reset_password') {
        $id = $input['id'] ?? 0;
        $newPass = $input['new_password'] ?? '123456'; // Default if not provided
        
        if ($id <= 0) sendResponse(false, 'Invalid ID');

        $hashed = password_hash($newPass, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->bind_param("si", $hashed, $id);

        if ($stmt->execute()) sendResponse(true, 'Password reset to ' . $newPass);
        else sendResponse(false, 'Failed to reset password');
    }

    exit;
}

// HANDLE LIST (GET)
$userQuery = "SELECT id, username, role FROM users ORDER BY role ASC, username ASC";
$userResult = $conn->query($userQuery);
$users = $userResult ? $userResult->fetch_all(MYSQLI_ASSOC) : [];

echo json_encode([
    'success' => true,
    'data' => ['users' => $users]
]);

$conn->close();
?>
