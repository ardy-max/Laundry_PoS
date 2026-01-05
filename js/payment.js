document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("order_id");

    if (!orderId) {
        alert("Order ID tidak ditemukan.");
        window.location.href = "orders.html"; // Redirect ke halaman Orders
        return;
    }

    loadOrderData(orderId);
});

// Fungsi untuk memuat data pesanan berdasarkan order_id
async function loadOrderData(orderId) {
    try {
        const res = await fetch(`php/payment.php?order_id=${orderId}`);
        const result = await res.json();

        if (result.success && result.data) {
            const order = result.data;

            // Tampilkan informasi order di tabel
            const orderDetailsTableBody = document.getElementById("orderDetailsTableBody");
            orderDetailsTableBody.innerHTML = `
                <tr>
                    <td>#ORDER${order.order_id}</td>
                    <td>${order.customer || "N/A"}</td>
                    <td>${order.phone || "N/A"}</td>
                    <td>${order.services || "N/A"}</td>
                    <td>Rp ${order.total ? order.total.toLocaleString() : "0"}</td>
                </tr>`;

            // Menampilkan jumlah yang harus dibayar
            document.getElementById("orderIdDisplay").textContent = orderId;
            document.getElementById("amount").value = order.total || 0;
            document.getElementById("change").textContent = `RP ${order.total ? order.total : 0}`;
        } else {
            alert("Order tidak ditemukan.");
            window.location.href = "orders.html"; // Redirect ke halaman Orders jika gagal
        }
    } catch (err) {
        console.error(err);
        alert("Gagal memuat data pesanan.");
        window.location.href = "orders.html"; // Redirect ke halaman Orders jika gagal
    }
}
