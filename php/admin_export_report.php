<?php
session_start();

include '../includes/db.php';
require '../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    die('Unauthorized');
}

$inputData = json_decode(file_get_contents('php://input'), true);
$filters = $inputData['filters'] ?? [];
$filename = $inputData['filename'] ?? 'admin_report_' . date('Ymd_His');

if (!preg_match('/\.xlsx$/', $filename)) {
    $filename .= '.xlsx';
}

$start_date = $filters['start_date'] ?? null;
$end_date = $filters['end_date'] ?? null;
$customer_name = $filters['customer_name'] ?? null;

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

if ($customer_name) {
    $escaped_name = $conn->real_escape_string($customer_name);
    $query .= " AND c.name LIKE '%$escaped_name%'";
}

$query .= " ORDER BY o.created_at DESC";

$result = $conn->query($query);
$data = $result ? $result->fetch_all(MYSQLI_ASSOC) : [];

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Header
$sheet->setCellValue('A1', 'Date')
      ->setCellValue('B1', 'Order ID')
      ->setCellValue('C1', 'Customer')
      ->setCellValue('D1', 'Cashier')
      ->setCellValue('E1', 'Status')
      ->setCellValue('F1', 'Total')
      ->setCellValue('G1', 'Payment Amount');

$row = 2;
foreach ($data as $d) {
    $sheet->setCellValue('A' . $row, $d['start_date'])
          ->setCellValue('B' . $row, $d['order_id'])
          ->setCellValue('C' . $row, $d['customer_name'])
          ->setCellValue('D' . $row, $d['cashier_name']) // Extra column for Admin
          ->setCellValue('E' . $row, $d['payment_status'])
          ->setCellValue('F' . $row, $d['total'])
          ->setCellValue('G' . $row, $d['payment_amount']);
    $row++;
}

foreach(range('A','G') as $col) {
    $sheet->getColumnDimension($col)->setAutoSize(true);
}

if (ob_get_length()) ob_end_clean();

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="' . $filename . '"');
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
?>
