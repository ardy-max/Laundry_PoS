document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    if (!orderId) {
        alert('Order ID tidak ditemukan');
        window.location.href = 'admin.html';
        return;
    }

    const form = document.getElementById('editOrderForm');
    const customer = document.getElementById('customer_name');
    const phoneEl = document.getElementById('phone');
    const service = document.getElementById('service');
    const weight = document.getElementById('weight');
    const price = document.getElementById('price');
    const subtotal = document.getElementById('subtotal');
    const adjustment = document.getElementById('adjustment');
    const total = document.getElementById('total');
    const status = document.getElementById('status');

    // LOAD SERVICES (Adjusted path for admin)
    fetch('../php/edit_order.php?get_services=1')
        .then(res => res.json())
        .then(services => {
            service.innerHTML = '';
            services.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.service_id;
                opt.textContent = `${s.name} (Rp ${parseInt(s.price).toLocaleString()}/kg)`;
                opt.dataset.price = s.price;
                service.appendChild(opt);
            });
        })
        .then(() => {
            // LOAD ORDER DATA
            return fetch(`../php/edit_order.php?order_id=${orderId}`);
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                window.location.href = 'admin.html';
                return;
            }

            customer.value = data.customer_name || '';
            phoneEl.value = data.phone || '';
            weight.value = data.weight || 0;

            if (data.service_id) {
                service.value = data.service_id;
                const selected = service.options[service.selectedIndex];
                if (selected) price.value = selected.dataset.price;
            }

            const loadedWeight = parseFloat(data.weight) || 0;
            const loadedPrice = parseFloat(data.price) || 0;
            adjustment.value = 0;

            hitungSubtotal();

            // Handle Status
            const currentStatus = (data.status || '').toLowerCase();
            if (currentStatus === 'pending') {
                const opt = document.createElement('option');
                opt.value = 'pending';
                opt.textContent = 'Pending (Menunggu Pembayaran)';
                status.insertBefore(opt, status.firstChild);
                status.value = 'pending';
                status.disabled = true;
            } else {
                status.value = currentStatus;
            }
        })
        .catch(err => console.error(err));

    function hitungSubtotal() {
        const w = parseFloat(weight.value) || 0;
        const p = parseFloat(price.value) || 0;
        const sub = w * p;
        const adj = parseFloat(adjustment.value) || 0;

        subtotal.value = sub;
        total.value = sub + adj;
    }

    weight.addEventListener('input', hitungSubtotal);
    adjustment.addEventListener('input', hitungSubtotal);

    service.addEventListener('change', () => {
        const selected = service.options[service.selectedIndex];
        if (selected) {
            price.value = selected.dataset.price;
            hitungSubtotal();
        }
    });

    // SUBMIT UPDATE
    form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form);
        fd.append('order_id', orderId);
        fd.append('adjustment', adjustment.value);

        fetch('../php/edit_order.php', {
            method: 'POST',
            body: fd
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    alert('Order berhasil diperbarui');
                    location.href = 'admin.html';
                } else {
                    alert('Gagal update order: ' + (res.message || 'Unknown error'));
                }
            })
            .catch(err => {
                console.error(err);
                alert('Terjadi kesalahan saat menyimpan.');
            });
    });
});
