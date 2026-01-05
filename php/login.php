<?php
session_start();
include '../includes/db.php'; // Koneksi ke database

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Query untuk mengecek username dan password
    $query = "SELECT id, username, password, role FROM users WHERE username = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Cek password (gunakan bcrypt untuk pengecekan password hash di produksi)
        if (password_verify($password, $user['password'])) {
            // Set session untuk user yang berhasil login
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role']; // Simpan role

            // Kirim respons sukses ke AJAX
            echo json_encode([
                'success' => true, 
                'message' => 'Login berhasil!', 
                'role' => $user['role']  // Kirim role ke JS
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Username atau password salah.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Username atau password salah.']);
    }

    $stmt->close();
    $conn->close();
}
?>


