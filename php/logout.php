<?php
session_start();  // Memulai session

// Hapus semua data dalam session
session_unset();  // Menghapus semua variabel dalam session

// Hancurkan session
session_destroy();  // Menghancurkan session, jadi pengguna tidak dapat menggunakan session lagi

// Arahkan ke halaman login setelah logout
header('Location: ../login.html');  // Pengguna akan diarahkan ke halaman login
exit();  // Menghentikan eksekusi PHP setelah pengalihan
?>
