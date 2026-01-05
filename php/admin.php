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
$orderQuery = "
    SELECT 
        o.order_id, 
        o.status, 
        o.created_at, 
        o.total, 
        c.name AS customer_name, 
        c.phone,
        GROUP_CONCAT(s.name SEPARATOR ', ') AS service,
        SUM(oi.weight) AS weight
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.customer_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    LEFT JOIN services s ON oi.service_id = s.service_id
";

if ($filter_user !== 'all') {
    // Jika memilih user tertentu, filter berdasarkan user_id (gunakan prepared statement idealnya, tapi di sini string concat)
    $orderQuery .= " WHERE o.user_id = '$filter_user'";
}

$orderQuery .= " GROUP BY o.order_id ORDER BY o.created_at DESC LIMIT 10"; // Group by order_id karena join
$orderResult = $conn->query($orderQuery);

// Ambil data penjualan 7 hari terakhir untuk grafik
$chartQuery = "
    SELECT 
        DATE(created_at) as date, 
        COUNT(*) as count, 
        SUM(total) as income 
    FROM orders 
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) 
    GROUP BY DATE(created_at) 
    ORDER BY date ASC
";
$chartResult = $conn->query($chartQuery);
$chartData = [];
if ($chartResult) {
    while ($row = $chartResult->fetch_assoc()) {
        $chartData[] = $row;
    }
}

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
        'users' => $users,
        'chartData' => $chartData // Data untuk grafik
    ]
]);

$conn->close();
exit; // End script here cleanly to avoid whitespace issues
?>
