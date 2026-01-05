document.addEventListener("DOMContentLoaded", () => {
    const serviceSelect = document.getElementById('serviceSelect');
    const priceInput = document.getElementById('price');
    const form = document.querySelector('form');

    // 1. Load Services
    fetch('php/edit_order.php?get_services=1')
        .then(res => res.json())
        .then(services => {
            serviceSelect.innerHTML = '<option value="">Select a service</option>';
            services.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.service_id;
                opt.textContent = s.name;
                opt.dataset.price = s.price;
                serviceSelect.appendChild(opt);
            });
        })
        .catch(err => console.error("Error loading services:", err));

    // 2. Auto-fill price when service selected
    serviceSelect.addEventListener('change', () => {
        const selected = serviceSelect.options[serviceSelect.selectedIndex];
        if (selected && selected.dataset.price) {
            priceInput.value = selected.dataset.price;
        } else {
            priceInput.value = "";
        }
    });

    // 3. Handle Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

        const formData = new FormData(form);

        try {
            const res = await fetch('php/order.php', {
                method: 'POST',
                body: formData
            });

            const result = await res.json();

            if (result.success) {
                alert("Order berhasil dibuat!");
                window.location.href = "orders.html";
            } else {
                alert("Gagal membuat order: " + (result.message || "Unknown error"));
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan sistem.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
});
