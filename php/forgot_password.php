<?php
session_start();
include('../includes/db.php');  // Koneksi ke database

// Masukkan file PHPMailer
require '../vendor/autoload.php';  // Path ke autoload.php yang dihasilkan Composer

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Proses Pengiriman OTP
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['email']) && !isset($_POST['otp'])) {
    $email = $_POST['email'];
    
    // Validasi email
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Cek apakah email terdaftar di database
        $query = "SELECT * FROM users WHERE email = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Generate OTP (4 digit)
            $otp = rand(1000, 9999);
            
            // Simpan OTP ke session untuk verifikasi nanti
            $_SESSION['otp'] = $otp;
            $_SESSION['email'] = $email;

            // Setup PHPMailer
            $mail = new PHPMailer(true);
            try {
                // Server settings
                $mail->isSMTP();
                $mail->Host = 'smtp.gmail.com';  // Ganti dengan server SMTP yang sesuai (misalnya Gmail)
                $mail->SMTPAuth = true;
                $mail->Username = 'laundrypos.noreply@gmail.com';  // Email pengirim
                $mail->Password = 'flnp naxj phxh qeea';  // App Password
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = 587;  // Port untuk TLS

                // Recipients
                $mail->setFrom('laundrypos.noreply@gmail.com', 'Laundry PoS Admin');  // Email pengirim
                $mail->addAddress($email);  // Email penerima

                // Content
                $mail->isHTML(true);
                $mail->Subject = 'Kode Verifikasi Lupa Password';
                $mail->Body    = "
                    <div style='font-family: Arial, sans-serif; text-align: center;'>
                        <h2>Kode Verifikasi Anda</h2>
                        <p>Gunakan kode berikut untuk mereset password Anda:</p>
                        <h1 style='background-color: #f0f0f0; padding: 10px; display: inline-block; letter-spacing: 5px;'>$otp</h1>
                        <p>Kode ini hanya berlaku untuk sesi ini.</p>
                    </div>
                ";

                $mail->send();
                echo "OTP telah dikirim ke email Anda.";
            } catch (Exception $e) {
                echo "Gagal mengirim email. Mailer Error: {$mail->ErrorInfo}";
            }
        } else {
            echo "Email tidak terdaftar.";
        }
    } else {
        echo "Email tidak valid.";
    }
}

// Proses Verifikasi OTP
elseif ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['otp'])) {
    $user_otp = $_POST['otp'];
    
    if (isset($_SESSION['otp']) && $user_otp == $_SESSION['otp']) {
        echo "OTP berhasil diverifikasi!";
        // Opsional: Set flag verifikasi jika diperlukan untuk langkah selanjutnya
        $_SESSION['otp_verified'] = true; 
    } else {
        echo "OTP salah atau kadaluarsa.";
    }
}

// Proses Reset Password
elseif ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['newPassword'])) {
    if (isset($_SESSION['otp_verified']) && $_SESSION['otp_verified'] === true && isset($_SESSION['email'])) {
        $new_password = $_POST['newPassword'];
        $email = $_SESSION['email'];
        
        // Hash password baru
        $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
        
        // Update password di database
        $updateQuery = "UPDATE users SET password = ? WHERE email = ?";
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param("ss", $hashed_password, $email);
        
        if ($stmt->execute()) {
            echo "Password berhasil diubah. Silakan login.";
            // Hapus session setelah berhasil
            session_destroy();
        } else {
            echo "Gagal mengubah password: " . $conn->error;
        }
    } else {
        echo "Akses ditolak. Silakan verifikasi OTP terlebih dahulu.";
    }
}
?>
