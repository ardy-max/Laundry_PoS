document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;

    // Step 1: Fungsi untuk pengiriman email OTP
    const emailForm = document.getElementById('emailForm');
    
    emailForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const submitBtn = this.querySelector('button[type="submit"]');
        
        // Menampilkan loading saat menunggu respons
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Kirim email ke server untuk meminta OTP
        fetch('php/forgot_password.php', {
            method: 'POST',
            body: new URLSearchParams({
                email: email
            })
        })
        .then(response => response.text())
        .then(data => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            showNotification(data, 'success'); // Tampilkan pesan sukses
            
            // Tampilkan langkah verifikasi OTP
            goToStep(2); // Pindah ke langkah OTP
        })
        .catch(error => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            showNotification('Gagal mengirim OTP. Coba lagi.', 'danger'); // Tampilkan error
        });
    });

    // Step 2: Fungsi untuk verifikasi OTP
    const otpForm = document.getElementById('otpForm');
    
    otpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const otp1 = document.querySelector('[name="otp1"]').value;
        const otp2 = document.querySelector('[name="otp2"]').value;
        const otp3 = document.querySelector('[name="otp3"]').value;
        const otp4 = document.querySelector('[name="otp4"]').value;
        const otp = otp1 + otp2 + otp3 + otp4;
        const submitBtn = this.querySelector('button[type="submit"]');
        
        // Menampilkan loading saat verifikasi OTP
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Kirim OTP untuk verifikasi
        fetch('php/forgot_password.php', {
            method: 'POST',
            body: new URLSearchParams({
                otp: otp
            })
        })
        .then(response => response.text())
        .then(data => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            showNotification(data, 'success'); // Tampilkan pesan sukses

            // Pindah ke langkah reset password jika OTP benar
            if (data.includes("OTP berhasil")) {
                goToStep(3); // Pindah ke langkah reset password
            }
        })
        .catch(error => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            showNotification('Gagal memverifikasi OTP. Coba lagi.', 'danger'); // Tampilkan error
        });
    });

    // Step 3: Fungsi untuk mengatur password baru
    const passwordForm = document.getElementById('passwordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = newPasswordInput.value;
        const confirm = confirmPasswordInput.value;
        const submitBtn = this.querySelector('button[type="submit"]');
        
        // Validasi password
        if (password !== confirm) {
            showNotification('Password tidak cocok!', 'danger');
            return;
        }

        if (!validatePassword(password)) {
            showNotification('Password tidak memenuhi persyaratan keamanan!', 'danger');
            return;
        }

        // Menampilkan loading saat mengirim password baru
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Kirim password baru untuk diperbarui
        fetch('php/forgot_password.php', {
            method: 'POST',
            body: new URLSearchParams({
                newPassword: password
            })
        })
        .then(response => response.text())
        .then(data => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            showNotification(data, 'success');
            
            // Redirect ke halaman login setelah reset password berhasil
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        })
        .catch(error => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            showNotification('Gagal mereset password. Coba lagi.', 'danger');
        });
    });

    // Validasi kekuatan password
    function validatePassword(password) {
        const requirements = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*]/.test(password)
        };

        // Cek jika semua persyaratan password terpenuhi
        return Object.values(requirements).every(v => v);
    }

    // Fungsi untuk pindah ke langkah tertentu
    function goToStep(step) {
        currentStep = step;  // Menyimpan langkah saat ini

        // Sembunyikan semua langkah
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Tampilkan langkah yang dipilih
        document.getElementById('step' + step).classList.add('active');
    }

    // Fungsi untuk menampilkan notifikasi
    function showNotification(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Menambahkan notifikasi ke halaman
        const currentStepEl = document.getElementById('step' + currentStep);
        currentStepEl.insertBefore(alertDiv, currentStepEl.firstChild);
        
        // Menghapus notifikasi setelah 5 detik
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
});
