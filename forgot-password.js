// Global Variables
let currentStep = 1;
let dummyOTP = '';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeForms();
});

// Initialize all forms
function initializeForms() {
    setupEmailForm();
    setupOTPForm();
    setupPasswordForm();
}

// ==================== STEP 1: EMAIL FORM ====================
function setupEmailForm() {
    const emailForm = document.getElementById('emailForm');
    
    emailForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const submitBtn = this.querySelector('button[type="submit"]');
        
        // Show loading
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Generate random 4 digit OTP
        dummyOTP = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Display email
        document.getElementById('displayEmail').textContent = email;
        document.getElementById('dummyCode').textContent = dummyOTP;
        
        // Auto-fill OTP
        const otpInputs = document.querySelectorAll('.otp-input');
        dummyOTP.split('').forEach((digit, index) => {
            otpInputs[index].value = digit;
        });
        
        // Move to step 2 immediately
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            goToStep(2);
            showNotification('Kode OTP telah dikirim ke email Anda!', 'success');
        }, 800);
    });
}

// ==================== STEP 2: OTP FORM ====================
function setupOTPForm() {
    const otpForm = document.getElementById('otpForm');
    
    otpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        
        // Show loading
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            // Move to step 3
            goToStep(3);
            showNotification('Kode berhasil diverifikasi!', 'success');
        }, 1000);
    });
}

// ==================== STEP 3: PASSWORD FORM ====================
function setupPasswordForm() {
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordForm = document.getElementById('passwordForm');
    
    // Password validation on input
    newPasswordInput.addEventListener('input', function() {
        validatePassword(this.value);
    });
    
    // Confirm password validation on input
    confirmPasswordInput.addEventListener('input', function() {
        checkPasswordMatch();
    });
    
    // Toggle password visibility
    document.getElementById('togglePassword1').addEventListener('click', function() {
        togglePasswordVisibility('newPassword', this);
    });
    
    document.getElementById('togglePassword2').addEventListener('click', function() {
        togglePasswordVisibility('confirmPassword', this);
    });
    
    // Form submit
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = newPasswordInput.value;
        const confirm = confirmPasswordInput.value;
        
        // Validate password
        if (!validatePassword(password)) {
            showNotification('Password tidak memenuhi persyaratan keamanan!', 'danger');
            return;
        }
        
        // Check password match
        if (!checkPasswordMatch()) {
            showNotification('Password tidak cocok!', 'danger');
            return;
        }
        
        const submitBtn = this.querySelector('button[type="submit"]');
        
        // Show loading
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            // Move to success step
            goToStep(4);
            startCountdown();
        }, 1500);
    });
}

// ==================== PASSWORD VALIDATION ====================
function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*]/.test(password)
    };
    
    // Update requirement indicators
    updateRequirement('req-length', requirements.length);
    updateRequirement('req-upper', requirements.upper);
    updateRequirement('req-lower', requirements.lower);
    updateRequirement('req-number', requirements.number);
    updateRequirement('req-special', requirements.special);
    
    // Calculate strength
    const metCount = Object.values(requirements).filter(v => v).length;
    let strengthClass = 'strength-weak';
    let strengthText = 'Lemah';
    
    if (metCount >= 5) {
        strengthClass = 'strength-strong';
        strengthText = 'Kuat';
    } else if (metCount >= 3) {
        strengthClass = 'strength-medium';
        strengthText = 'Sedang';
    }
    
    // Update strength bar
    const strengthFill = document.getElementById('strengthFill');
    strengthFill.className = 'strength-fill ' + strengthClass;
    
    // Update strength text
    document.getElementById('strengthText').textContent = `Kekuatan: ${strengthText}`;
    
    // Return true if all requirements met
    return Object.values(requirements).every(v => v);
}

function updateRequirement(id, met) {
    const element = document.getElementById(id);
    const icon = element.querySelector('i');
    
    if (met) {
        element.classList.remove('unmet');
        element.classList.add('met');
        icon.className = 'fas fa-check-circle';
    } else {
        element.classList.remove('met');
        element.classList.add('unmet');
        icon.className = 'fas fa-circle';
    }
}

function checkPasswordMatch() {
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (confirmPassword.value && password !== confirmPassword.value) {
        confirmPassword.classList.add('is-invalid');
        return false;
    } else {
        confirmPassword.classList.remove('is-invalid');
        return true;
    }
}

function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ==================== NAVIGATION ====================
function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show current step
    document.getElementById('step' + step).classList.add('active');
    
    // Update current step
    currentStep = step;
}

// ==================== SUCCESS COUNTDOWN ====================
function startCountdown() {
    let count = 5;
    const countdownEl = document.getElementById('countdown');
    
    const interval = setInterval(() => {
        count--;
        countdownEl.textContent = count;
        
        if (count <= 0) {
            clearInterval(interval);
            // Redirect to login page
            window.location.href = 'index.html';
        }
    }, 1000);
}

// ==================== NOTIFICATION ====================
function showNotification(message, type) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert-dismissible');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insert alert at the top of current step
    const currentStepEl = document.getElementById('step' + currentStep);
    currentStepEl.insertBefore(alertDiv, currentStepEl.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}