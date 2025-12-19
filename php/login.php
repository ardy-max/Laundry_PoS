<?php
session_start();
include '../includes/db.php'; // Koneksi ke database

// Ambil data dari form
$username = $_POST['username'];
$password = $_POST['password'];

// Query untuk mengambil data pengguna berdasarkan username
$query = "SELECT * FROM users WHERE username = '$username' LIMIT 1";
$result = mysqli_query($conn, $query);
$user = mysqli_fetch_assoc($result);

if ($user) {
    // Verifikasi password menggunakan bcrypt
    if (password_verify($password, $user['password'])) {
        // Jika login berhasil, simpan username di session
        $_SESSION['username'] = $user['username'];
        $response = array("success" => true, "message" => "Login berhasil");
    } else {
        // Password salah
        $response = array("success" => false, "message" => "Password salah");
    }
} else {
    // Username tidak ditemukan
    $response = array("success" => false, "message" => "Username tidak ditemukan");
}

echo json_encode($response);
?>


