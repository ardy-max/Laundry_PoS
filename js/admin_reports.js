document.addEventListener("DOMContentLoaded", function () {
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const searchNameInput = document.getElementById("searchName");
    const filterBtn = document.getElementById("filterBtn");
    const totalTransactionsEl = document.getElementById("totalTransactions");
    const totalRevenueEl = document.getElementById("totalRevenue");
    const tableBody = document.getElementById("reportsTableBody");

    function formatRupiah(num) {
        return `Rp ${Number(num || 0).toLocaleString("id-ID")}`;
    }

    // Load Reports
    async function loadReports(filters = {}) {
        tableBody.innerHTML = "<tr><td colspan='6' class='text-center'>Loading...</td></tr>";

        try {
            const params = new URLSearchParams();
            if (filters.start_date) params.append("start_date", filters.start_date);
            if (filters.end_date) params.append("end_date", filters.end_date);
            if (filters.customer_name) params.append("customer_name", filters.customer_name);

            const res = await fetch(`../php/admin_reports.php?${params.toString()}`);
            const json = await res.json();

            if (json.success) {
                // Summary
                if (totalTransactionsEl) totalTransactionsEl.textContent = json.summary.total_transactions || 0;
                if (totalRevenueEl) totalRevenueEl.textContent = formatRupiah(json.summary.total_revenue || 0);

                displayReports(json.data);
            } else {
                tableBody.innerHTML = `<tr><td colspan='6' class='text-center text-danger'>${json.message}</td></tr>`;
            }

        } catch (error) {
            console.error(error);
            tableBody.innerHTML = `<tr><td colspan='6' class='text-center text-danger'>Error loading data</td></tr>`;
        }
    }

    function displayReports(reports) {
        tableBody.innerHTML = "";

        if (reports.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='6' class='text-center'>Tidak ada data</td></tr>";
            return;
        }

        reports.forEach(r => {
            const row = document.createElement("tr");
            const date = new Date(r.start_date).toISOString().split('T')[0];

            row.innerHTML = `
                <td>${date}</td>
                <td>#ORD${r.order_id}</td>
                <td>${r.customer_name || '-'}</td>
                <td>${r.cashier_name || 'System/Admin'}</td>
                <td>${r.payment_status || '-'}</td>
                <td>${formatRupiah(r.total)}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Filter Click
    filterBtn.addEventListener("click", () => {
        loadReports({
            start_date: startDateInput.value,
            end_date: endDateInput.value,
            customer_name: searchNameInput.value.trim()
        });
    });

    // Initial Load
    loadReports();

    // EXPORT
    document.getElementById("exportBtn").addEventListener("click", function () {
        const filenameInput = document.getElementById("exportFilename");
        const filename = filenameInput.value.trim() || "Laporan_Admin";
        const btn = this;

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';

        const filters = {
            start_date: startDateInput.value,
            end_date: endDateInput.value,
            customer_name: searchNameInput.value.trim()
        };

        fetch("../php/admin_export_report.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filters, filename })
        })
            .then(res => {
                if (!res.ok) throw new Error("Export failed");
                return res.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename + ".xlsx";
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            })
            .catch(err => {
                alert("Gagal export: " + err.message);
            })
            .finally(() => {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-file-excel"></i> Export Excel';
            });
    });
});
