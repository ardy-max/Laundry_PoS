document.addEventListener('DOMContentLoaded', () => {
    loadOrderData();

    // Event listener untuk filter user
    document.getElementById('filterUser').addEventListener('change', function () {
        const selectedUser = this.value;
        loadOrderData(selectedUser);
    });
});

async function loadOrderData(filterUser = 'all') {
    const tbody = document.getElementById("ordersTableBody");
    tbody.innerHTML = `<tr><td colspan='9' class='text-center'>Loading...</td></tr>`;

    try {
        // Reuse admin.php endpoint since it returns orders + users
        const res = await fetch(`../php/admin.php?user=${filterUser}`);
        const json = await res.json();

        if (json.success) {
            // Populate Dropdown Only Once (if empty)
            const dropdown = document.getElementById('filterUser');
            if (dropdown.options.length <= 1) {
                populateUserDropdown(json.data.users);
            }

            renderTable(json.data.orders);
        } else {
            console.error("Failed to load data: ", json.message);
            tbody.innerHTML = `<tr><td colspan='9' class='text-center text-danger'>Failed to load data</td></tr>`;
        }

    } catch (err) {
        console.error('Fetch error: ', err);
        tbody.innerHTML = `<tr><td colspan='9' class='text-center text-danger'>Error loading data</td></tr>`;
    }
}

function populateUserDropdown(users) {
    const filterUser = document.getElementById('filterUser');
    // Keep the first option (Semua User)
    // filterUser.innerHTML = '<option value="all">Semua User</option>'; 

    if (users.length > 0) {
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;
            filterUser.appendChild(option);
        });
    }
}

function renderTable(orders) {
    const tbody = document.getElementById("ordersTableBody");
    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = "<tr class='text-center'><td colspan='9'>No orders found</td></tr>";
        return;
    }

    orders.forEach(order => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>#ORDER${order.order_id}</td>
            <td>${order.customer_name || '-'}</td>
            <td>${order.phone || '-'}</td>
            <td>${order.service || '-'}</td>
            <td>${order.weight || 0} kg</td>
            <td><span class="badge bg-${getStatusClass(order.status)}">${order.status}</span></td>
            <td>${order.created_at}</td>
            <td>Rp ${parseInt(order.total).toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editOrder(${order.order_id})" title="Edit">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.order_id})" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusClass(status) {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 'warning text-dark';
    if (s === 'progress') return 'primary';
    return 'success';
}

// ACTION FUNCTIONS
function editOrder(orderId) {
    window.location.href = `admin_edit_order.html?order_id=${orderId}`;
}

async function deleteOrder(orderId) {
    if (!confirm(`Yakin hapus ORDER #${orderId}? Data yang dihapus tidak bisa dikembalikan.`)) return;

    try {
        const res = await fetch("../php/delete_order.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: orderId })
        });
        const json = await res.json();
        if (json.success) {
            alert("Order berhasil dihapus");
            // Refresh table
            loadOrderData(document.getElementById('filterUser').value);
        } else {
            alert(json.message || "Gagal hapus order");
        }
    } catch (err) {
        console.error(err);
        alert("Error server saat menghapus order");
    }
}
