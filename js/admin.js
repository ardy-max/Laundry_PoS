// Fungsi untuk memuat data statistik dan pesanan
async function loadDashboardData(filterUser = 'all') {
    // Tampilkan loading state
    document.getElementById('totalOrder').innerText = 'Loading...';
    document.getElementById('todayOrder').innerText = 'Loading...';
    document.getElementById('totalIncome').innerText = 'Loading...';
    document.getElementById('unfinishedOrder').innerText = 'Loading...';

    try {
        // Ambil data dari server dengan parameter filter user
        const res = await fetch("../php/admin.php?user=" + filterUser);
        
        // Jika ada masalah dengan response, tampilkan error
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        const json = await res.json();

        if (json.success) {
            // Update statistik berdasarkan response
            document.getElementById('totalOrder').innerText = json.data.totalOrders;
            document.getElementById('todayOrder').innerText = json.data.ordersToday;
            document.getElementById('totalIncome').innerText = json.data.totalIncome;
            document.getElementById('unfinishedOrder').innerText = json.data.unfinishedOrders;

            // Render tabel pesanan
            renderTable(json.data.orders);

            // Mengisi dropdown filter user
            populateUserDropdown(json.data.users);

            // Set dropdown ke nilai yang dipilih
            setSelectedUser(filterUser);
        } else {
            console.error("Failed to load data: ", json.message);
            document.getElementById('totalOrder').innerText = 'Failed to load data';
            document.getElementById('todayOrder').innerText = 'Failed to load data';
            document.getElementById('totalIncome').innerText = 'Failed to load data';
            document.getElementById('unfinishedOrder').innerText = 'Failed to load data';
        }
    } catch (err) {
        console.error('Fetch error: ', err);
        document.getElementById('totalOrder').innerText = 'Error loading data';
        document.getElementById('todayOrder').innerText = 'Error loading data';
        document.getElementById('totalIncome').innerText = 'Error loading data';
        document.getElementById('unfinishedOrder').innerText = 'Error loading data';
    }
}

// Fungsi untuk mengisi dropdown filter user
function populateUserDropdown(users) {
    const filterUser = document.getElementById('filterUser');
    
    // Clear existing options
    filterUser.innerHTML = '<option value="all">Semua User</option>';
    
    // Pastikan data users tidak kosong
    if (users.length > 0) {
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;
            filterUser.appendChild(option);
        });
    } else {
        // Jika tidak ada user, tampilkan pilihan kosong atau info
        filterUser.innerHTML = '<option value="all">No Users Available</option>';
    }
}

// Fungsi untuk memastikan nilai dropdown terpilih sesuai dengan filter user
function setSelectedUser(filterUser) {
    const filterUserElement = document.getElementById('filterUser');
    filterUserElement.value = filterUser;  // Set the selected value to the chosen filter
}

// Fungsi untuk merender tabel pesanan
function renderTable(orders) {
    const tbody = document.getElementById("ordersTableBody");
    tbody.innerHTML = ''; // Clear existing rows

    if (orders.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = "<td colspan='9' class='text-center'>No orders available</td>";
        tbody.appendChild(row);
    } else {
        orders.forEach(order => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${order.order_id}</td>
                <td>${order.customer_name}</td>
                <td>${order.phone}</td>
                <td>${order.service}</td>
                <td>${order.weight}</td>
                <td><span class="badge bg-${getStatusClass(order.status)}">${order.status}</span></td>
                <td>${order.created_at}</td>
                <td>${order.total}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editOrder(${order.order_id})">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.order_id})">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Fungsi untuk mendapatkan kelas badge berdasarkan status
function getStatusClass(status) {
    if (status === 'pending') return 'warning';
    if (status === 'progress') return 'primary';
    return 'success'; // complete
}

// Event listener untuk filter user
document.getElementById('filterUser').addEventListener('change', function() {
    const selectedUser = this.value;
    loadDashboardData(selectedUser); // Load data berdasarkan user yang dipilih
});

// Muat data dashboard saat halaman dimuat
window.addEventListener('DOMContentLoaded', loadDashboardData);
