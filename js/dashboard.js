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

  function formatRupiah(num) {
    return 'RP ' + Number(num || 0).toLocaleString('id-ID');
  }

  function statusLabel(status) {
    if (status === 'complete') return 'completed';
    if (status === 'progress') return 'in progress';
    return 'pending';
  }

  function badgeClass(status) {
  if (status === 'complete') return 'badge-completed';
  if (status === 'progress') return 'badge-in-progress';
  return 'badge-pending';
}


  function loadStats() {
    fetch('/Laundry_Pos/php/dashboard.php')
      .then(res => res.json())
      .then(data => {
        const stats = data.statistics || {};

        document.querySelector('.total-sales').textContent = formatRupiah(stats.total_sales);
        document.querySelector('.monthly-sales').textContent = formatRupiah(stats.monthly_sales);
        document.querySelector('.orders-in-progress').textContent = stats.orders_in_progress ?? 0;
        document.querySelector('.total-orders').textContent = stats.total_orders ?? 0;

        const tbody = document.querySelector('#ordersTable tbody');
        tbody.innerHTML = ''; // penting: biar tidak dobel append

        (data.orders || []).forEach(order => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td><strong>#ORD${order.order_id}</strong></td>
            <td>${order.customer_name ?? '-'}</td>
            <td>
  <span class="badge ${badgeClass(order.status)} px-3 py-2">
    ${order.status}
  </span>
</td>

            <td>${order.order_date ?? '-'}</td>
            <td><strong>${formatRupiah(order.total)}</strong></td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch(err => console.error('Error fetching data:', err));
  }

  loadStats();

  // Filter status
  const statusFilter = document.getElementById('statusFilter');
  statusFilter.addEventListener('change', function () {
    const filterValue = statusFilter.value.toLowerCase();
    const rows = document.querySelectorAll('#ordersTable tbody tr');

    rows.forEach(row => {
      const statusCell = row.cells[2].textContent.toLowerCase();
      row.style.display = (filterValue === '' || statusCell.includes(filterValue)) ? '' : 'none';
    });
  });

});

