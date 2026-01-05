// Tombol untuk toggle password
const togglePassword = document.getElementById('togglePassword');
const passwordField = document.getElementById('password');

// Event listener untuk toggle password visibility
togglePassword.addEventListener('click', function (e) {
    const type = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = type;

    // Ganti ikon mata sesuai dengan jenis input
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
});

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Mencegah form untuk submit default
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validasi form
    if (!username || !password) {
        showAlert('Username dan Password tidak boleh kosong!', 'danger');
        return;
    }

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'php/login.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    const data = `username=${username}&password=${password}&rememberMe=${rememberMe}`;

    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);

                if (response.success) {
                    showAlert('Login berhasil! Mengalihkan ke halaman...', 'success');
                    if (rememberMe) {
                        localStorage.setItem('rememberedUser', username);
                    }

                    // Redirect berdasarkan role yang diterima dari server
                    if (response.role === 'admin') {
                        setTimeout(() => {
                            window.location.href = 'admin/admin.html'; // Arahkan ke halaman admin
                        }, 1500);
                    } else {
                        setTimeout(() => {
                            window.location.href = 'dashboard.html'; // Arahkan ke halaman user
                        }, 1500);
                    }
                } else {
                    showAlert(response.message, 'danger');
                }
            } catch (e) {
                console.error('Error parsing JSON:', e);
                showAlert('Terjadi kesalahan, coba lagi!', 'danger');
            }
        } else {
            showAlert('Terjadi kesalahan, coba lagi!', 'danger');
        }
    };

    xhr.send(data);
});

// Fungsi untuk menampilkan alert
function showAlert(message, type) {
    const existingAlert = document.querySelector('.alert-dismissible');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    loginForm.insertAdjacentElement('afterend', alertDiv);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Cek apakah ada user yang diingat
window.addEventListener('DOMContentLoaded', function() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }
});