<?php
session_start();
include('../includes/db.php'); // Menghubungkan ke database

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$filter_user = $_GET['user'] ?? 'all'; // Filter berdasarkan user (semua atau spesifik)

// Ambil data nama user untuk filter
$userQuery = "SELECT id, username FROM users WHERE role != 'admin'";
$userResult = $conn->query($userQuery);
$users = $userResult->fetch_all(MYSQLI_ASSOC);

// Ambil total order
$totalOrdersQuery = "SELECT COUNT(*) as total_orders FROM orders";
$totalOrdersResult = $conn->query($totalOrdersQuery);
$totalOrders = $totalOrdersResult->fetch_assoc()['total_orders'];

// Ambil order hari ini
$todayOrdersQuery = "SELECT COUNT(*) as today_orders FROM orders WHERE DATE(created_at) = CURDATE()";
$todayOrdersResult = $conn->query($todayOrdersQuery);
$todayOrders = $todayOrdersResult->fetch_assoc()['today_orders'];

// Ambil total pendapatan
$totalIncomeQuery = "SELECT SUM(total) as total_income FROM orders";
$totalIncomeResult = $conn->query($totalIncomeQuery);
$totalIncome = $totalIncomeResult->fetch_assoc()['total_income'];

// Ambil order yang belum selesai
$unfinishedOrdersQuery = "SELECT COUNT(*) as unfinished_orders FROM orders WHERE status IN ('pending', 'progress')";
$unfinishedOrdersResult = $conn->query($unfinishedOrdersQuery);
$unfinishedOrders = $unfinishedOrdersResult->fetch_assoc()['unfinished_orders'];

// Ambil daftar pesanan berdasarkan filter user
$orderQuery = "SELECT * FROM orders";
if ($filter_user !== 'all') {
    // Jika memilih user tertentu, filter berdasarkan user_id
    $orderQuery .= " WHERE user_id = '$filter_user'";
}
$orderQuery .= " ORDER BY created_at DESC LIMIT 10"; // Batasi untuk 10 order terbaru
$orderResult = $conn->query($orderQuery);

// Pastikan kita mendapatkan hasil query
if ($orderResult->num_rows > 0) {
    $orders = $orderResult->fetch_all(MYSQLI_ASSOC);
} else {
    $orders = []; // Jika tidak ada pesanan, kirim array kosong
}

echo json_encode([
    'success' => true,
    'data' => [
        'totalOrders' => $totalOrders,
        'ordersToday' => $todayOrders,
        'totalIncome' => $totalIncome,
        'unfinishedOrders' => $unfinishedOrders,
        'orders' => $orders,
        'users' => $users // Menambahkan data user
    ]
]);

$conn->close();

?>
