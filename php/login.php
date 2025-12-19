<?php
session_start();
include '../includes/db.php'; // Koneksi ke database

// Cek apakah form login telah disubmit
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Ambil data dari form
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Validasi input
    if (empty($username) || empty($password)) {
        echo json_encode(["success" => false, "message" => "Username dan Password tidak boleh kosong!"]);
        exit;
    }

    // Cek apakah username ada di database
    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Username tidak ditemukan!"]);
        exit;
    }

    // Ambil data user
    $user = $result->fetch_assoc();

    // Verifikasi password
    if (password_verify($password, $user['password'])) {
        // Set session user_id
        $_SESSION['user_id'] = $user['id'];  // Simpan user_id di session

        echo json_encode(["success" => true, "message" => "Login berhasil"]);
    } else {
        echo json_encode(["success" => false, "message" => "Password salah!"]);
    }

    $stmt->close();
    $conn->close();
}
?>


