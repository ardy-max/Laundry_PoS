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
                $mail->Username = 'your_email@gmail.com';  // Ganti dengan email pengirim
                $mail->Password = 'your_email_password';  // Ganti dengan password email pengirim (gunakan App Password jika 2FA aktif)
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = 587;  // Port untuk TLS

                // Recipients
                $mail->setFrom('your_email@gmail.com', 'Your Name');  // Ganti dengan email pengirim
                $mail->addAddress($email);  // Email penerima

                // Content
                $mail->isHTML(true);
                $mail->Subject = 'Kode Verifikasi Lupa Password';
                $mail->Body    = "Kode OTP Anda adalah: $otp<br><br>Link untuk reset password: <a href='http://localhost/Laundry_Pos/forgot_password.php?email=$email&otp=$otp'>Reset Password</a>";

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
?>
