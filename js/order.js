let allOrders = [];

document.addEventListener("DOMContentLoaded", () => {
    loadOrders();

    document.getElementById("statusFilter").addEventListener("change", applyFilters);
    document.getElementById("searchType").addEventListener("change", resetSearch);
    document.getElementById("searchInput").addEventListener("input", applyFilters);
    document.getElementById("refreshOrdersBtn").addEventListener("click", refreshOrders);
});

async function loadOrders() {
    const tbody = document.getElementById("ordersTableBody");

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-muted">
                Loading orders...
            </td>
        </tr>`;

    try {
        const res = await fetch("php/orders.php");
        const json = await res.json();

        if (!json.success) {
            tbody.innerHTML = `
                <tr><td colspan="6">Unauthorized</td></tr>`;
            return;
        }

        allOrders = json.data || [];
        renderTable(allOrders);

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `
            <tr><td colspan="6">Error load data</td></tr>`;
    }
}

function renderTable(data) {
    const tbody = document.getElementById("ordersTableBody");

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    No orders found
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = "";

    data.forEach(o => {
        tbody.innerHTML += `
            <tr>
                <td>#ORDER${o.order_id}</td>
                <td>${o.customer ?? '-'}</td>
                <td>${o.phone ?? '-'}</td>
                <td>${o.services ?? '-'}</td>
                <td>${o.total_weight} kg</td>
                <td>
                    <span class="badge ${
                        o.status === 'pending' ? 'bg-warning text-dark' :
                        o.status === 'progress' ? 'bg-info text-dark' :
                        'bg-success'
                    }">
                        ${o.status}
                    </span>
                </td>
                <td>${o.created_at}</td>
                <td>Rp ${Number(o.total).toLocaleString()}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-primary me-1"
                            onclick="editOrder(${o.order_id})"
                            title="Edit Order">
                        ✏️
                    </button>
                    <button class="btn btn-sm btn-danger"
                            onclick="deleteOrder(${o.order_id})"
                            title="Hapus Order">
                        🗑️
                    </button>
                    ${o.status === 'pending' ? 
                        `<button class="btn btn-sm btn-success"
                                onclick="payOrder(${o.order_id})"
                                title="Bayar Order">
                            Bayar
                        </button>` 
                        : ''}
                </td>
            </tr>`;
    });
}

function applyFilters() {
    const status = document.getElementById("statusFilter").value;
    const searchType = document.getElementById("searchType").value;
    const keyword = document.getElementById("searchInput").value.toLowerCase();

    let filtered = [...allOrders];

    // FILTER STATUS
    if (status) {
        filtered = filtered.filter(o => o.status === status);
    }

    // SEARCH
    if (keyword) {
        filtered = filtered.filter(o => {
            if (searchType === "customer") {
                return (o.customer ?? '').toLowerCase().includes(keyword);
            }
            if (searchType === "phone") {
                return (o.phone ?? '').toLowerCase().includes(keyword);
            }
            if (searchType === "date") {
                return (o.created_at ?? '').includes(keyword);
            }
            return true;
        });
    }

    renderTable(filtered);
}

function resetSearch() {
    document.getElementById("searchInput").value = "";
    applyFilters();
}

function refreshOrders() {
    document.getElementById("statusFilter").value = "";
    document.getElementById("searchType").value = "customer";
    document.getElementById("searchInput").value = "";
    loadOrders();
}

function editOrder(orderId) {
    window.location.href = `edit_order.html?order_id=${orderId}`;
}

function payOrder(orderId) {
    // Arahkan ke halaman payment dengan menyertakan order_id
    window.location.href = `payment.html?order_id=${orderId}`;
}


async function deleteOrder(orderId) {
    if (!confirm(`Yakin hapus ORDER #ORDER${orderId} ?`)) return;

    try {
        const res = await fetch("php/delete_order.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ order_id: orderId })
        });

        const json = await res.json();

        if (!json.success) {
            alert(json.message || "Gagal hapus order");
            return;
        }

        alert("Order berhasil dihapus");
        loadOrders(); // refresh table

    } catch (err) {
        console.error(err);
        alert("Error delete order");
    }
}