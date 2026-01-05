<?php
session_start();
include('../includes/db.php');

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['order_id'])) {
    echo json_encode([
        "success" => false,
        "message" => "Order ID missing"
    ]);
    exit;
}

$order_id = (int) $data['order_id'];
$user_id  = (int) $_SESSION['user_id'];
$role = $_SESSION['role'] ?? 'user';

if ($role === 'admin') {
    // Admin bebas hapus order siapa saja
    $stmt = $conn->prepare("DELETE FROM orders WHERE order_id = ?");
    $stmt->bind_param("i", $order_id);
} else {
    // User biasa hanya boleh hapus milik sendiri
    $stmt = $conn->prepare("DELETE FROM orders WHERE order_id = ? AND user_id = ?");
    $stmt->bind_param("ii", $order_id, $user_id);
}

$stmt->execute();

if ($stmt->affected_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => ($role === 'admin') ? "Order tidak ditemukan" : "Order tidak ditemukan atau bukan milik anda"
    ]);
    exit;
}

echo json_encode([
    "success" => true
]);