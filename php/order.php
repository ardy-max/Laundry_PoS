<?php
session_start();
include('../includes/db.php');  // Koneksi database

// Pastikan pengguna sudah login
if (!isset($_SESSION['user_id'])) {
    header('Location: login.html');  // Jika belum login, alihkan ke halaman login
    exit;
}

// Ambil data dari form (pastikan form sudah disubmit)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_SESSION['user_id'];
    $cashier_id = $_POST['cashier_id']; // ID kasir yang dipilih
    $customer_name = $_POST['customer_name'];
    $phone_number = $_POST['phone_number'];
    $service_id = $_POST['service_id']; // ID layanan yang dipilih
    $weight_quantity = $_POST['weight_quantity'];
    $price = $_POST['price'];
    $estimated_completion = $_POST['estimated_completion'];
    $status = 'pending'; // Default status order

    // Menyimpan order ke dalam database
    $query = "INSERT INTO orders (user_id, cashier_id, customer_name, phone_number, service_id, weight_quantity, price, estimated_completion, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("iissiddds", $user_id, $cashier_id, $customer_name, $phone_number, $service_id, $weight_quantity, $price, $estimated_completion, $status);

    if ($stmt->execute()) {
        // Kirim respons sukses ke frontend
        echo "Order successfully created!";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
}
?>
