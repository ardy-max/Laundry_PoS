// Fungsi untuk memuat data statistik
async function loadDashboardData() {
    // Tampilkan loading state
    document.getElementById('totalOrder').innerText = 'Loading...';
    document.getElementById('todayOrder').innerText = 'Loading...';
    document.getElementById('totalIncome').innerText = 'Loading...';
    document.getElementById('unfinishedOrder').innerText = 'Loading...';

    try {
        // Ambil data dari server (fetch all)
        const res = await fetch("../php/admin.php?user=all");

        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

        const json = await res.json();

        if (json.success) {
            // Update statistik
            document.getElementById('totalOrder').innerText = json.data.totalOrders || 0;
            document.getElementById('todayOrder').innerText = json.data.ordersToday || 0;
            // Format currency
            const income = parseInt(json.data.totalIncome || 0).toLocaleString();
            document.getElementById('totalIncome').innerText = 'Rp ' + income;
            document.getElementById('unfinishedOrder').innerText = json.data.unfinishedOrders || 0;

            // Render Chart
            if (json.data.chartData) {
                renderChart(json.data.chartData);
            }

        } else {
            console.error("Failed to load data: ", json.message);
            setErrorStats();
        }
    } catch (err) {
        console.error('Fetch error: ', err);
        setErrorStats();
    }
}

let salesChartInstance = null;

function renderChart(data) {
    const ctx = document.getElementById('salesChart').getContext('2d');

    // Map data to arrays
    const labels = data.map(item => {
        // Format date dd/mm
        const d = new Date(item.date);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    });
    const incomes = data.map(item => item.income);
    const counts = data.map(item => item.count);

    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pendapatan (Rp)',
                    data: incomes,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Jumlah Order',
                    data: counts,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Pendapatan (Rp)' },
                    ticks: {
                        callback: function (value) {
                            return 'Rp ' + value.toLocaleString();
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Jumlah Order' },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                if (context.datasetIndex === 0) {
                                    label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                                } else {
                                    label += context.parsed.y;
                                }
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function setErrorStats() {
    document.getElementById('totalOrder').innerText = 'Error';
    document.getElementById('todayOrder').innerText = 'Error';
    document.getElementById('totalIncome').innerText = 'Error';
    document.getElementById('unfinishedOrder').innerText = 'Error';
}

// Muat data dashboard saat halaman dimuat
window.addEventListener('DOMContentLoaded', loadDashboardData);
