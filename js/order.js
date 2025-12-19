//  // Optional: Add JavaScript for interactivity (e.g., form validation or dynamic updates)
//         document.addEventListener('DOMContentLoaded', function () {
//             const sidebar = document.querySelector('.sidebar');
//             const toggleBtn = document.createElement('button');
//             toggleBtn.className = 'btn btn-primary d-lg-none position-absolute top-0 end-0 m-2';
//             toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
//             toggleBtn.addEventListener('click', () => {
//                 sidebar.classList.toggle('show');
//             });
//             document.body.appendChild(toggleBtn);

//             // Mobile sidebar close on click outside
//             document.addEventListener('click', (e) => {
//                 if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && window.innerWidth < 992) {
//                     sidebar.classList.remove('show');
//                 }
//             });
//         });

        const orderForm = document.getElementById('orderForm');

orderForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Mencegah form melakukan submit default

    // Ambil data dari form
    const cashier_id = document.getElementById('customerSelect').value;
    const customer_name = document.getElementById('customerName').value;
    const phone_number = document.getElementById('phoneNumber').value;
    const service_id = document.getElementById('serviceSelect').value;
    const weight_quantity = document.getElementById('weightQuantity').value;
    const price = document.getElementById('price').value;
    const estimated_completion = document.getElementById('estimatedCompletion').value;

    // Validasi form
    if (!cashier_id || !customer_name || !phone_number || !service_id || !weight_quantity || !price || !estimated_completion) {
        showAlert('Please fill in all fields.', 'danger');
        return;
    }

    // Add loading state
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Submit form via AJAX
    const formData = new FormData(orderForm);

    fetch('php/order.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(data => {
            // Jika order berhasil, tampilkan pesan tanpa mereload halaman
            if (data.includes('Order successfully created!')) {
                showAlert('Order berhasil dibuat!', 'success');
                orderForm.reset();  // Reset form setelah sukses
            } else {
                showAlert('Terjadi kesalahan: ' + data, 'danger');
            }
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Terjadi kesalahan, coba lagi!', 'danger');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        });
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
    
    orderForm.insertAdjacentElement('afterend', alertDiv);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}
