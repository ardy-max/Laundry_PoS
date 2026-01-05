document.addEventListener('DOMContentLoaded', function () {
    const saveSettingsBtn = document.getElementById('saveSettings');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');

    // Fungsi untuk memuat pengaturan saat halaman dimuat
    async function loadSettings() {
        try {
            const response = await fetch('php/settings.php');
            const raw = await response.text();

            let result;
            try {
                result = JSON.parse(raw);
            } catch (e) {
                console.error('Error parsing JSON:', e);
                alert('Gagal memuat pengaturan');
                return;
            }

            if (result.success && result.user) {
                if (usernameInput) usernameInput.value = result.user.username || '';
                if (emailInput) emailInput.value = result.user.email || '';
            } else {
                alert('Gagal memuat pengaturan: ' + result.message);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            alert('Gagal memuat pengaturan: ' + error.message);
        }
    }

    // Fungsi untuk toggle visibility password
    togglePasswordBtn.addEventListener('click', function () {
        // Cek apakah input password sedang tersembunyi atau tidak
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        // Ganti ikon mata
        eyeIcon.classList.toggle('bi-eye');
        eyeIcon.classList.toggle('bi-eye-slash');
    });

    // Fungsi untuk menyimpan pengaturan ke backend
    saveSettingsBtn.addEventListener('click', async function () {
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validasi username tidak boleh kosong
        if (!username) {
            alert('Username tidak boleh kosong!');
            return;
        }

        // Validasi email dengan format yang benar (nama@gmail.com)
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            alert('Email harus dalam format yang valid (misalnya nama@gmail.com)');
            return;
        }

        let settingsData = {
            username: username,
            email: email
        };

        // Hanya kirim password jika diubah dan valid
        if (password && password.length >= 6) {
            settingsData.password = password;
        } else if (password && password.length < 6) {
            alert('Password minimal 6 karakter!');
            return;
        }

        try {
            saveSettingsBtn.disabled = true;
            saveSettingsBtn.textContent = 'Menyimpan...';

            const response = await fetch('php/settings.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settingsData)
            });

            const result = await response.json();

            if (result.success) {
                alert('✓ Pengaturan berhasil diperbarui!');
                passwordInput.value = '';  // Bersihkan kolom password setelah disimpan
            } else {
                alert('Gagal menyimpan: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Terjadi kesalahan saat menyimpan!');
        } finally {
            saveSettingsBtn.disabled = false;
            saveSettingsBtn.textContent = 'Simpan Perubahan';
        }
    });

    loadSettings();
});