<?php
session_start();
include('../includes/db.php'); // Menghubungkan ke database

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Ambil data nama user
$userQuery = "SELECT id, username, role FROM users WHERE role != 'admin'"; // Mengambil semua user kecuali admin
$userResult = $conn->query($userQuery);
$users = $userResult->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    'success' => true,
    'data' => [
        'users' => $users // Kirimkan data users ke frontend
    ]
]);

$conn->close();
?>
