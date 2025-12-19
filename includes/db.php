<?php
$host = 'localhost'; // Host database
$user = 'root'; // Username untuk koneksi
$password = ''; // Password untuk koneksi
$dbname = 'laundrypos_database'; // Nama database

// Koneksi ke MySQL
$conn = new mysqli($host, $user, $password, $dbname);

// Set karakter set koneksi ke utf8mb4
mysqli_set_charset($conn, "utf8mb4");

// Cek apakah koneksi berhasil
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}
?>
