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

$stmt->close();
$conn->close();

// Mengirim data sebagai JSON
echo json_encode($orders);
?>
