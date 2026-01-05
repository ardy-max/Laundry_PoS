<?php
session_start();
// Cek apakah session 'user_id' ada
if (!isset($_SESSION['user_id'])) {
    // Jika tidak ada session, redirect ke halaman login
    header("Location: /Laundry_Pos/login.html");
    exit;
}

include('../includes/db.php');



header('Content-Type: application/json');



$userId = (int) $_SESSION['user_id'];

// Ambil data order + nama customer (JOIN)
$query = "
    SELECT 
        o.order_id,
        c.name AS customer_name,
        o.status,
        o.created_at AS order_date,
        o.total
    FROM orders o
    JOIN customers c ON c.customer_id = o.customer_id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
    LIMIT 50
";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($row = $result->fetch_assoc()) {
    // Normalisasi output agar frontend stabil
    $orders[] = [
        'order_id'       => (int)$row['order_id'],
        'customer_name'  => $row['customer_name'],
        'status'         => $row['status'],                 // pending | progress | complete
        'order_date'     => $row['order_date'],             // datetime
        'total'          => (float)$row['total'],            // numeric
    ];
}

// Statistik dashboard (gunakan created_at + total)
$query_stats = "
    SELECT
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total ELSE 0 END), 0) AS total_sales,
        COALESCE(SUM(CASE WHEN YEAR(created_at)=YEAR(CURDATE()) AND MONTH(created_at)=MONTH(CURDATE()) THEN total ELSE 0 END), 0) AS monthly_sales,
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status = 'progress' THEN 1 ELSE 0 END) AS orders_in_progress
    FROM orders
    WHERE user_id = ?
";
$stmt_stats = $conn->prepare($query_stats);
$stmt_stats->bind_param("i", $userId);
$stmt_stats->execute();
$stats = $stmt_stats->get_result()->fetch_assoc();

$statistics = [
    'total_sales'        => (float)$stats['total_sales'],
    'monthly_sales'      => (float)$stats['monthly_sales'],
    'orders_in_progress' => (int)$stats['orders_in_progress'],
    'total_orders'       => (int)$stats['total_orders'],
];

$stmt->close();
$stmt_stats->close();
$conn->close();

echo json_encode([
    'orders' => $orders,
    'statistics' => $statistics
]);
