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
    // Fungsi untuk mengambil dan menampilkan data order
    function loadOrders() {
        fetch('php/dashboard.php')
            .then(response => response.json())
            .then(orders => {
                const ordersTableBody = document.getElementById('ordersTable').getElementsByTagName('tbody')[0];

                // Kosongkan tabel sebelum memasukkan data baru
                ordersTableBody.innerHTML = '';

                // Menambahkan data ke dalam tabel
                orders.forEach(order => {
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

    // Panggil fungsi untuk memuat order ketika halaman dimuat
    loadOrders();

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

