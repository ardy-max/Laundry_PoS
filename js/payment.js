document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("order_id");
    const amountInput = document.getElementById("amount");
    const changeDisplay = document.getElementById("change");
    const completePaymentBtn = document.getElementById("completePayment");

    let orderTotal = 0;

    if (!orderId) {
        alert("Order ID tidak ditemukan.");
        window.location.href = "orders.html"; // Redirect ke halaman Orders
        return;
    }

    loadOrderData(orderId);

    // Payment method selection logic
    const methodButtons = document.querySelectorAll(".btn-group button");
    let selectedMethod = "Cash";

    methodButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            methodButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            selectedMethod = this.textContent;
        });
    });

    // Calculate change on input
    amountInput.addEventListener("input", function () {
        const paidAmount = parseFloat(this.value) || 0;
        const change = paidAmount - orderTotal;
        changeDisplay.textContent = change >= 0
            ? `Rp ${change.toLocaleString("id-ID")}`
            : `Rp 0 (Kurang Rp ${(Math.abs(change)).toLocaleString("id-ID")})`;

        if (change >= 0) {
            changeDisplay.classList.remove("text-danger");
            changeDisplay.classList.add("text-success");
        } else {
            changeDisplay.classList.remove("text-success");
            changeDisplay.classList.add("text-danger");
        }
    });

    // Complete Payment processing
    completePaymentBtn.addEventListener("click", async () => {
        const paidAmount = parseFloat(amountInput.value) || 0;

        if (paidAmount < orderTotal) {
            alert("Jumlah pembayaran kurang!");
            return;
        }

        if (!confirm(`Konfirmasi pembayaran sebesar Rp ${paidAmount.toLocaleString("id-ID")} dengan metode ${selectedMethod}?`)) {
            return;
        }

        // Disable button to prevent double submit
        completePaymentBtn.disabled = true;
        completePaymentBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

        try {
            const response = await fetch("php/payment.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    order_id: orderId,
                    amount: paidAmount,
                    payment_method: selectedMethod
                })
            });

            const result = await response.json();

            if (result.success) {
                alert("Pembayaran berhasil!");
                window.location.href = "orders.html"; // Redirect back to orders
            } else {
                alert("Gagal memproses pembayaran: " + (result.message || "Unknown error"));
                completePaymentBtn.disabled = false;
                completePaymentBtn.textContent = "Complete Payment";
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan sistem.");
            completePaymentBtn.disabled = false;
            completePaymentBtn.textContent = "Complete Payment";
        }
    });

    // Fungsi untuk memuat data pesanan berdasarkan order_id
    async function loadOrderData(orderId) {
        try {
            const res = await fetch(`php/payment.php?order_id=${orderId}`);
            // Check content type json
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Response backend bukan JSON");
            }

            const result = await res.json();

            if (result.success && result.data) {
                const order = result.data;
                orderTotal = parseFloat(order.total);

                // Tampilkan informasi order di tabel
                const orderDetailsTableBody = document.getElementById("orderDetailsTableBody");
                orderDetailsTableBody.innerHTML = `
                    <tr>
                        <td>#ORDER${order.order_id}</td>
                        <td>${order.customer || "N/A"}</td>
                        <td>${order.phone || "N/A"}</td>
                        <td>${order.services || "N/A"}</td>
                        <td>Rp ${orderTotal.toLocaleString("id-ID")}</td>
                    </tr>`;

                // Menampilkan jumlah yang harus dibayar
                document.getElementById("orderIdDisplay").textContent = orderId;
                amountInput.value = orderTotal; // Suggest exact amount by default

                // Trigger input event to set change to 0 manually
                amountInput.dispatchEvent(new Event('input'));

            } else {
                alert("Order tidak ditemukan.");
                window.location.href = "orders.html";
            }
        } catch (err) {
            console.error(err);
            alert("Gagal memuat data pesanan: " + err.message);
            window.location.href = "orders.html";
        }
    }
});
