document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    if (!orderId) return alert('Order ID tidak ditemukan');

    const form = document.getElementById('editOrderForm');
    const customer = customer_name;
    const phoneEl = phone;
    const service = document.getElementById('service');
    const weight = document.getElementById('weight');
    const price = document.getElementById('price');
    const subtotal = document.getElementById('subtotal');
    const adjustment = document.getElementById('adjustment');
    const total = document.getElementById('total');
    const status = document.getElementById('status');

    // LOAD SERVICES
    fetch('php/get_services.php')
        .then(res => res.json())
        .then(services => {
            service.innerHTML = '';
            services.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.service_id;
                opt.textContent = `${s.name} (Rp ${s.price}/kg)`;
                opt.dataset.price = s.price;
                service.appendChild(opt);
            });
        });

    // LOAD ORDER DATA
    fetch(`php/edit_order.php?order_id=${orderId}`)
        .then(res => res.json())
        .then(data => {
            customer.value = data.customer_name;
            phoneEl.value = data.phone;
            weight.value = data.weight;
            price.value = data.price;
            subtotal.value = data.subtotal;
            total.value = data.total;
            status.value = data.status;

            setTimeout(() => {
                service.value = data.service_id;
            }, 200);
        });

    function hitungSubtotal() {
        const sub = (weight.value || 0) * (price.value || 0);
        subtotal.value = sub;
        total.value = sub + (Number(adjustment.value) || 0);
    }

    weight.addEventListener('input', hitungSubtotal);
    adjustment.addEventListener('input', hitungSubtotal);

    service.addEventListener('change', () => {
        const selected = service.options[service.selectedIndex];
        price.value = selected.dataset.price;
        hitungSubtotal();
    });

    // SUBMIT UPDATE
    form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form);
        fd.append('order_id', orderId);
        fd.append('total', total.value);

        fetch('php/edit_order.php', {
            method: 'POST',
            body: fd
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                alert('Order berhasil diperbarui');
                location.href = 'orders.html';
            } else {
                alert('Gagal update order');
            }
        });
    });
});