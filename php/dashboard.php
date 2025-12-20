<?php
session_start();
include ('../includes/db.php');

// Pastikan pengguna sudah login
if (!isset($_SESSION['user_id'])) {
    header('Location: login.html');  // Jika belum login, alihkan ke halaman login
    exit;
}

// Ambil data order dari database
$query = "SELECT * FROM orders WHERE user_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

// Menyimpan data order dalam array
$orders = array();
while ($order = $result->fetch_assoc()) {
    $orders[] = $order;  // Menambahkan order ke dalam array
}

// Query untuk mengambil statistik
$query_stats = "SELECT 
                    SUM(price) AS total_sales,
                    COUNT(*) AS total_orders,
                    COUNT(CASE WHEN status = 'in progress' THEN 1 END) AS orders_in_progress,
                    SUM(CASE WHEN MONTH(order_date) = MONTH(CURRENT_DATE()) THEN price ELSE 0 END) AS monthly_sales
                FROM orders
                WHERE user_id = ?";
$stmt_stats = $conn->prepare($query_stats);
$stmt_stats->bind_param("i", $_SESSION['user_id']);
$stmt_stats->execute();
$result_stats = $stmt_stats->get_result();
$stats = $result_stats->fetch_assoc();

// Menyusun data statistik untuk dikirim ke frontend
$statistics = array(
    'total_sales' => $stats['total_sales'],
    'monthly_sales' => $stats['monthly_sales'],
    'orders_in_progress' => $stats['orders_in_progress'],
    'total_orders' => $stats['total_orders']
);

// Menutup statement dan koneksi
$stmt->close();
$stmt_stats->close();
$conn->close();

// Mengirim data pesanan dan statistik sebagai JSON
$response = array(
    'orders' => $orders,
    'statistics' => $statistics
);

echo json_encode($response);
?>

