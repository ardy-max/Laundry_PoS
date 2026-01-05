<?php
session_start();

include '../includes/db.php';

// Pastikan session sudah ada
if (!isset($_SESSION['user_id'])) {
    die(json_encode(['success' => false, 'message' => 'Unauthorized']));
}

// Ambil parameter filter dari URL
$start_date = $_GET['start_date'] ?? null;
$end_date = $_GET['end_date'] ?? null;
$customer_name = $_GET['customer_name'] ?? null;

// Query dasar untuk mengambil data transaksi (SEMUA user)
$query = "SELECT o.order_id, 
                 o.created_at AS start_date, 
                 o.estimated_completion AS end_date, 
                 c.name AS customer_name,
                 u.username AS cashier_name,
                 o.total, 
                 p.amount AS payment_amount, 
                 p.status AS payment_status
          FROM orders o
          JOIN customers c ON o.customer_id = c.customer_id
          LEFT JOIN payments p ON o.order_id = p.order_id
          LEFT JOIN users u ON o.user_id = u.id
          WHERE 1=1"; 

// Menambahkan filter berdasarkan tanggal
if ($start_date && $end_date) {
    $start = $start_date . " 00:00:00";
    $end   = $end_date   . " 23:59:59";
    $query .= " AND (o.created_at BETWEEN '$start' AND '$end' OR o.estimated_completion BETWEEN '$start' AND '$end')";
} elseif ($start_date) {
    $start = $start_date . " 00:00:00";
    $end   = $start_date . " 23:59:59";
    $query .= " AND (o.created_at BETWEEN '$start' AND '$end' OR o.estimated_completion BETWEEN '$start' AND '$end')";
} elseif ($end_date) {
    $start = $end_date . " 00:00:00";
    $end   = $end_date . " 23:59:59";
    $query .= " AND (o.created_at BETWEEN '$start' AND '$end' OR o.estimated_completion BETWEEN '$start' AND '$end')";
}

// Filter berdasarkan nama pelanggan
if ($customer_name) {
    $escaped_name = $conn->real_escape_string($customer_name);
    $query .= " AND c.name LIKE '%$escaped_name%'";
}

$query .= " ORDER BY o.created_at DESC";

// Eksekusi query
$result = $conn->query($query);
$data = [];
if ($result) {
    $data = $result->fetch_all(MYSQLI_ASSOC);
}

// Hitung Summary
$total_transactions = count($data);
$total_revenue = array_sum(array_column($data, 'total'));

echo json_encode([
    'success' => true,
    'data' => $data,
    'summary' => [
        'total_transactions' => $total_transactions,
        'total_revenue' => $total_revenue
    ]
]);
?>
