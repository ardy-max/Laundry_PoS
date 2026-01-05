document.addEventListener("DOMContentLoaded", function () {
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const searchNameInput = document.getElementById("searchName");
    const filterBtn = document.getElementById("filterBtn");
    const totalTransactionsEl = document.getElementById("totalTransactions");
    const totalRevenueEl = document.getElementById("totalRevenue");
    const tableBody = document.querySelector("table tbody");

    // Helper function to format currency as Rupiah
    function formatRupiah(num) {
        return `Rp ${Number(num || 0).toLocaleString("id-ID")}`;
    }

    // Load reports with date filters
    async function loadReports(filters = {}) {
    try {
        // Membangun query params dari filter
        const params = new URLSearchParams();
        if (filters.start_date) params.append("start_date", filters.start_date);
        if (filters.end_date) params.append("end_date", filters.end_date);
        if (filters.customer_name) params.append("customer_name", filters.customer_name);

        const response = await fetch(`php/reports.php?${params.toString()}`);
        const raw = await response.text();

        let result;
        try {
            result = JSON.parse(raw);
        } catch (e) {
            console.error("Error parsing JSON:", e);
            throw new Error('Response bukan JSON');
        }

        if (result.success) {
            // Update summary: Total Transactions and Total Revenue
            if (result.summary) {
                if (totalTransactionsEl) {
                    totalTransactionsEl.textContent = result.summary.total_transactions || 0;
                }
                if (totalRevenueEl) {
                    totalRevenueEl.textContent = formatRupiah(result.summary.total_revenue || 0);
                }
            }

            // Display reports with optional customer filter
            displayReports(result.data, filters.customer_name);
        } else {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${result.message || 'Gagal memuat data'}</td></tr>`;
        }
    } catch (error) {
        console.error("Error loading reports:", error);
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${error.message}</td></tr>`;
    }
}

    // Display filtered reports in the table
    function displayReports(reports, customerFilter = "") {
        tableBody.innerHTML = "";

        // Client-side filter by customer name
        let filtered = reports;
        if (customerFilter && customerFilter.trim()) {
            const search = customerFilter.toLowerCase().trim();
            filtered = reports.filter(r =>
                (r.customer_name || "").toLowerCase().includes(search)
            );
        }

        if (!filtered || filtered.length === 0) {
            tableBody.innerHTML =
                '<tr><td colspan="7" class="text-center">Tidak ada data</td></tr>';
            return;
        }

        filtered.forEach((report) => {
            const row = document.createElement("tr");

            // Format tanggal menjadi format yang sesuai (misalnya: YYYY-MM-DD)
            const formattedStartDate = new Date(report.start_date).toISOString().split('T')[0];
            const formattedEndDate = new Date(report.end_date).toISOString().split('T')[0];

            row.innerHTML = `
                <td>${formattedStartDate}</td> <!-- Start Date -->
                <td>${formattedEndDate}</td> <!-- End Date -->
                <td>#ORD${report.order_id}</td>
                <td>${report.customer_name || '-'}</td>
                <td>${report.payment_status || '-'}</td>
                <td>${formatRupiah(report.total || 0)}</td>
                <td>${formatRupiah(report.payment_amount || 0)}</td>
            `;

            tableBody.appendChild(row);
        });
    }

    // Apply filter
    function applyFilter() {
        const filters = {
            start_date: startDateInput ? startDateInput.value : null,
            end_date: endDateInput ? endDateInput.value : null,
            customer_name: searchNameInput ? searchNameInput.value.trim() : null,
        };

        loadReports(filters);
    }

    // Event listeners
    if (filterBtn) filterBtn.addEventListener("click", applyFilter);

    // Initial load (no filter by default)
    loadReports();
});



document.getElementById("exportBtn").addEventListener("click", function() {
    const filename = document.getElementById("exportFilename").value.trim();

    if (filename === "") {
        alert("Nama file harus diisi!");
        return;
    }

    // Ambil data filter yang ada
    const filters = {
        start_date: document.getElementById("startDate").value,
        end_date: document.getElementById("endDate").value,
        customer_name: document.getElementById("searchName").value,
    };

    // Kirim data dan nama file ke backend untuk proses ekspor
    fetch("php/export_report.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ filters: filters, filename: filename })
    })
    .then(response => response.blob())
    .then(blob => {
        // Buat URL untuk file Excel yang diekspor
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename + ".xlsx"; // Nama file dengan ekstensi .xlsx
        a.click();
    })
    .catch(error => {
        console.error("Error exporting file:", error);
    });
});