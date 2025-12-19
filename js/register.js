// Handle password visibility toggle for register form
const toggleRegisterPassword = document.getElementById('togglePassword');
const registerPasswordField = document.getElementById('password');

// Toggle password visibility
toggleRegisterPassword.addEventListener('click', function () {
    const type = registerPasswordField.type === 'password' ? 'text' : 'password';
    registerPasswordField.type = type;

    // Toggle eye icon
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
});

// Handle form submission
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission

    // Get form values
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Simple form validation
    if (username === '' || email === '' || password === '') {
        alert('Please fill in all fields.');
        return;
    }

    // Show loading state (optional)
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Submit form via AJAX
    const formData = new FormData(registerForm);

    fetch('php/register.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(data => {
            // If registration is successful, redirect to login page
            if (data.includes('Registration successful')) {
                window.location.href = 'login.html'; // Arahkan ke halaman login
            } else {
                alert('Registration failed: ' + data); // Tampilkan error jika gagal
            }
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error submitting the form.');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        });
});