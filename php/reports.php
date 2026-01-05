<?php
session_start();

include '../includes/db.php';
require '../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Pastikan session sudah ada dan user ID valid
if (!isset($_SESSION['user_id'])) {
    die(json_encode(['success' => false, 'message' => 'Session expired or not logged in']));
}


$user_id = $_SESSION['user_id'];



// Ambil parameter filter dari URL
$start_date = $_GET['start_date'] ?? null;
$end_date = $_GET['end_date'] ?? null;
$customer_name = $_GET['customer_name'] ?? null;

// Query dasar untuk mengambil data transaksi
$query = "SELECT o.order_id, 
                 o.created_at AS start_date, 
                 o.estimated_completion AS end_date, 
                 c.name AS customer_name, 
                 o.total, 
                 p.amount AS payment_amount, 
                 p.status AS payment_status
          FROM orders o
          JOIN customers c ON o.customer_id = c.customer_id
          JOIN payments p ON o.order_id = p.order_id
          WHERE o.user_id = ?";

// Menambahkan filter berdasarkan tanggal
if ($start_date && $end_date) {

    $start = $start_date . " 00:00:00";
    $end   = $end_date   . " 23:59:59";

    $query .= "
        AND (
            o.created_at BETWEEN '$start' AND '$end'
            OR
            o.estimated_completion BETWEEN '$start' AND '$end'
        )
    ";

} elseif ($start_date) {

    $start = $start_date . " 00:00:00";
    $end   = $start_date . " 23:59:59";

    $query .= "
        AND (
            o.created_at BETWEEN '$start' AND '$end'
            OR
            o.estimated_completion BETWEEN '$start' AND '$end'
        )
    ";

} elseif ($end_date) {

    $start = $end_date . " 00:00:00";
    $end   = $end_date . " 23:59:59";

    $query .= "
        AND (
            o.created_at BETWEEN '$start' AND '$end'
            OR
            o.estimated_completion BETWEEN '$start' AND '$end'
        )
    ";
}

// Filter berdasarkan nama pelanggan
if ($customer_name) {
    $query .= " AND c.name LIKE '%$customer_name%'";
}

// Eksekusi query
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

// Ambil data transaksi
$data = mysqli_fetch_all($result, MYSQLI_ASSOC);

// Mengambil order_id untuk dihitung di order_items
$order_ids = array_column($data, 'order_id');

// Periksa apakah $order_ids memiliki data yang valid
if (empty($order_ids)) {
    $total_revenue = 0;
    $total_transactions = 0;
    echo json_encode([
        'success' => true,
        'data' => [],
        'summary' => [
            'total_transactions' => $total_transactions,
            'total_revenue' => $total_revenue
        ]
    ]);
    exit;
}

// Hitung total transaksi
$total_transactions = count($order_ids);

// Hitung total revenue hanya dari `total` di tabel `orders`
$total_revenue = array_sum(array_column($data, 'total'));

// Kirim data ke frontend dengan format yang benar
echo json_encode([
    'success' => true,
    'data' => $data,
    'summary' => [
        'total_transactions' => $total_transactions,
        'total_revenue' => $total_revenue
    ]
]);




?>