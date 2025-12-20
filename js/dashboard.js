 // Optional: Add JavaScript for interactivity (e.g., form validation or dynamic updates)
        document.addEventListener('DOMContentLoaded', function () {
            const sidebar = document.querySelector('.sidebar');
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn btn-primary d-lg-none position-fixed top-0 end-0 m-2';
            toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });
            document.body.appendChild(toggleBtn);

            // Mobile sidebar close on click outside
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && window.innerWidth < 992) {
                    sidebar.classList.remove('show');
                }
            });
        });



document.addEventListener('DOMContentLoaded', function () {
    // Fungsi untuk memuat dan menampilkan statistik dan data pesanan
    function loadStats() {
        fetch('/Laundry_Pos/php/dashboard.php')  // Mengambil data dari PHP
            .then(response => response.json())
            .then(data => {
                const stats = data.statistics;
                // Menampilkan data statistik pada dashboard
                document.querySelector('.stat-card .total-sales').textContent = 'RP ' + stats.total_sales.toLocaleString();
                document.querySelector('.stat-card .monthly-sales').textContent = 'RP ' + stats.monthly_sales.toLocaleString();
                document.querySelector('.stat-card .orders-in-progress').textContent = stats.orders_in_progress;
                document.querySelector('.stat-card .total-orders').textContent = stats.total_orders;
                
                // Menampilkan data order pada tabel
                const ordersTableBody = document.getElementById('ordersTable').getElementsByTagName('tbody')[0];
                data.orders.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><strong>#ORD${order.order_id}</strong></td>
                        <td>${order.customer_name}</td>
                        <td><span class="badge badge-${order.status === 'completed' ? 'completed' : 'in-progress'} px-3 py-2">${order.status}</span></td>
                        <td>${order.order_date}</td>
                        <td><strong>RP ${parseFloat(order.price).toLocaleString()}</strong></td>
                    `;
                    ordersTableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    // Panggil fungsi untuk memuat statistik dan data pesanan saat halaman dimuat
    loadStats();

    // Fitur filter berdasarkan status
    const statusFilter = document.getElementById('statusFilter');
    statusFilter.addEventListener('change', function () {
        const filterValue = statusFilter.value.toLowerCase();
        const rows = document.querySelectorAll('#ordersTable tbody tr');

        rows.forEach(row => {
            const statusCell = row.cells[2].textContent.toLowerCase(); // Kolom Status
            if (filterValue === '' || statusCell.includes(filterValue)) {
                row.style.display = ''; // Tampilkan baris
            } else {
                row.style.display = 'none'; // Sembunyikan baris
            }
        });
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logoutButton');

    // Fungsi logout jika tombol logout diklik
    logoutButton.addEventListener('click', function() {
        // Arahkan pengguna ke logout.php untuk menghapus session
        window.location.href = 'php/logout.php';  // Mengarahkan ke logout.php untuk menghancurkan session
    });
});