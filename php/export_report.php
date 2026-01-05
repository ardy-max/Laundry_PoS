<?php
session_start();

include '../includes/db.php';
require '../vendor/autoload.php';
$user_id = $_SESSION['user_id'];  // Ambil user_id dari session


// Mendapatkan data filter dan nama file dari frontend
$inputData = json_decode(file_get_contents('php://input'), true);
$filters = $inputData['filters'];
$filename = $inputData['filename']; // Nama file yang diinginkan

// Ambil tanggal mulai dan tanggal akhir dari input filter
$period_start = $_POST['start_date'];
$period_end = $_POST['end_date'];

// Menggunakan PhpSpreadsheet untuk membuat file Excel (pastikan sudah diinstal)
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

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

// Menyisipkan data laporan ke dalam spreadsheet (asumsikan data ada dalam $data)
$row = 2; // Baris pertama untuk data dimulai setelah header
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

// Menyimpan file Excel ke folder 'export'
$exportDir = 'export/';
if (!file_exists($exportDir)) {
    mkdir($exportDir, 0777, true); // Membuat folder export jika belum ada
}

$writer = new Xlsx($spreadsheet);
$writer->save($exportDir . $filename);

// Menyimpan data laporan ke tabel 'reports' setelah file diekspor
$query = "INSERT INTO reports (type, period_start, period_end, file_name, generated_by) 
          VALUES ('monthly', ?, ?, ?, ?)";

// Menyiapkan statement dan menyimpan data ke database
$stmt = $conn->prepare($query);
$stmt->bind_param("sssi", $period_start, $period_end, $filename, $user_id);

// Mengeksekusi query
if ($stmt->execute()) {
    echo "Laporan berhasil diekspor dan disimpan.";
} else {
    echo "Gagal menyimpan laporan: " . $stmt->error;
}