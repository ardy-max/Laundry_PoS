<?php
session_start();

include '../includes/db.php';
require '../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Pastikan session sudah ada dan user ID valid
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    die('Unauthorized');
}

$user_id = $_SESSION['user_id'];

// Mendapatkan data filter dan nama file dari input JSON
$inputData = json_decode(file_get_contents('php://input'), true);

// Jika input bukan JSON (misal form post biasa), fallback ke $_POST
if (!$inputData) {
    // Coba ambil dari POST jika ada
    $filters = [
        'start_date' => $_POST['start_date'] ?? null,
        'end_date' => $_POST['end_date'] ?? null,
        'customer_name' => $_POST['customer_name'] ?? null
    ];
    $filename = $_POST['filename'] ?? 'report';
} else {
    $filters = $inputData['filters'] ?? [];
    $filename = $inputData['filename'] ?? 'report';
}

if (empty($filename)) {
    $filename = 'report_' . date('Ymd_His');
}

// Tambahkan ekstensi .xlsx jika belum ada
if (!preg_match('/\.xlsx$/', $filename)) {
    $filename .= '.xlsx';
}

// Persiapkan variabel filter
$start_date = $filters['start_date'] ?? null;
$end_date = $filters['end_date'] ?? null;
$customer_name = $filters['customer_name'] ?? null;

// Query dasar untuk mengambil data transaksi (sama seperti reports.php)
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

// Eksekusi query
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$data = mysqli_fetch_all($result, MYSQLI_ASSOC);

// Membuat Spreadsheet
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Set header untuk file Excel
$sheet->setCellValue('A1', 'Start Date')
      ->setCellValue('B1', 'End Date')
      ->setCellValue('C1', 'Order ID')
      ->setCellValue('D1', 'Customer Name')
      ->setCellValue('E1', 'Payment Status')
      ->setCellValue('F1', 'Total')
      ->setCellValue('G1', 'Payment Amount');

// Menyisipkan data laporan
$row = 2;
foreach ($data as $order) {
    $sheet->setCellValue('A' . $row, $order['start_date'])
          ->setCellValue('B' . $row, $order['end_date'])
          ->setCellValue('C' . $row, $order['order_id'])
          ->setCellValue('D' . $row, $order['customer_name'])
          ->setCellValue('E' . $row, $order['payment_status'])
          ->setCellValue('F' . $row, $order['total'])
          ->setCellValue('G' . $row, $order['payment_amount']);
    $row++;
}

// Autoresize kolom
foreach(range('A','G') as $columnID) {
    $sheet->getColumnDimension($columnID)->setAutoSize(true);
}

// Log ke database (jika tabel reports ada)
// Kita lakukan ini sebelum output file
try {
    $log_query = "INSERT INTO reports (type, period_start, period_end, file_name, generated_by) VALUES ('monthly', ?, ?, ?, ?)";
    $log_stmt = $conn->prepare($log_query);
    if ($log_stmt) {
        // Handle null values for partial dates
        $p_start = $start_date ?? date('Y-m-d');
        $p_end = $end_date ?? date('Y-m-d');
        $log_stmt->bind_param("sssi", $p_start, $p_end, $filename, $user_id);
        $log_stmt->execute();
    }
} catch (Exception $e) {
    // Ignore error logging if table doesn't exist or other DB error, to ensure user gets the file
}

// Bersihkan output buffer agar file tidak corrupt
if (ob_get_length()) ob_end_clean();

// Set header untuk download file
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="' . $filename . '"');
header('Cache-Control: max-age=0');

// Simpan ke output
$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
