<?php
session_start();
// Termasuk koneksi database
include('../includes/db.php');

// Ambil ID user dari session
$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    // Mengambil data pengguna berdasarkan ID
    $stmt = $conn->prepare("SELECT username, email FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Data ditemukan
        $user = $result->fetch_assoc();
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        // Tidak ada data
        echo json_encode(['success' => false, 'message' => 'User tidak ditemukan']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Mengambil data dari frontend (username, email, password)
    $data = json_decode(file_get_contents('php://input'), true);
    $username = isset($data['username']) ? $data['username'] : '';
    $email = isset($data['email']) ? $data['email'] : '';
    $password = isset($data['password']) ? $data['password'] : '';

    // Validasi username tidak boleh kosong
    if (empty($username)) {
        echo json_encode(['success' => false, 'message' => 'Username tidak boleh kosong']);
        exit;
    }

    // Validasi email dengan format yang benar (nama@gmail.com)
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Email harus dalam format yang valid (misalnya nama@gmail.com)']);
        exit;
    }

    // Validasi password jika ada perubahan
    if ($password && strlen($password) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password minimal 6 karakter']);
        exit;
    }

    // Update data pengguna berdasarkan ID
    try {
        if ($password) {
            // Jika password diubah, hash password baru
            $stmt = $conn->prepare("UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?");
            $stmt->execute([$username, $email, password_hash($password, PASSWORD_DEFAULT), $user_id]);
        } else {
            // Jika tidak ada perubahan password
            $stmt = $conn->prepare("UPDATE users SET username = ?, email = ? WHERE id = ?");
            $stmt->execute([$username, $email, $user_id]);
        }

        echo json_encode(['success' => true, 'message' => 'Pengaturan berhasil diperbarui']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Terjadi kesalahan saat memperbarui pengaturan: ' . $e->getMessage()]);
    }
}
?>
