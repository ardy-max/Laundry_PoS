document.addEventListener('DOMContentLoaded', () => {
    loadServicesData();

    // ADD SERVICE
    document.getElementById('addServiceForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const fd = new FormData(this);
        const data = Object.fromEntries(fd.entries());
        data.action = 'add';

        await sendRequest(data, '#addServiceModal');
        this.reset();
    });

    // EDIT SERVICE
    document.getElementById('editServiceForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const fd = new FormData(this);
        const data = Object.fromEntries(fd.entries());
        data.action = 'edit';

        await sendRequest(data, '#editServiceModal');
    });
});

async function sendRequest(data, modalId = null) {
    try {
        const res = await fetch("../php/admin_services.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const json = await res.json();

        if (json.success) {
            alert(json.message);
            if (modalId) {
                const modalEl = document.querySelector(modalId);
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
            loadServicesData(); // Refresh table
        } else {
            alert("Error: " + json.message);
        }
    } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan sistem");
    }
}

// LOAD DATA
async function loadServicesData() {
    const tbody = document.getElementById("servicesTableBody");
    tbody.innerHTML = "<tr><td colspan='4' class='text-center'>Loading...</td></tr>";

    try {
        const res = await fetch("../php/admin_services.php");
        const json = await res.json();

        tbody.innerHTML = ''; // Clear loading

        if (json.success) {
            renderServicesTable(json.data.services);
        } else {
            tbody.innerHTML = "<tr><td colspan='4' class='text-center text-danger'>Failed to load data</td></tr>";
            console.error("Failed to load services: ", json.message);
        }
    } catch (err) {
        console.error('Fetch error: ', err);
        tbody.innerHTML = "<tr><td colspan='4' class='text-center text-danger'>Error loading data</td></tr>";
    }
}

function renderServicesTable(services) {
    const tbody = document.getElementById("servicesTableBody");

    if (services.length === 0) {
        tbody.innerHTML = "<tr class='text-center'><td colspan='4'>No services available</td></tr>";
        return;
    }

    services.forEach(service => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>#${service.service_id}</td>
            <td class="fw-bold">${service.name}</td>
            <td>Rp ${parseInt(service.price).toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick='openEditModal(${JSON.stringify(service)})'>
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteService(${service.service_id}, '${service.name}')">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// OPEN EDIT MODAL
window.openEditModal = function (service) {
    document.getElementById('editServiceId').value = service.service_id;
    document.getElementById('editServiceName').value = service.name;
    document.getElementById('editServicePrice').value = service.price;

    const modal = new bootstrap.Modal(document.getElementById('editServiceModal'));
    modal.show();
}

// DELETE SERVICE
window.deleteService = async function (id, name) {
    if (!confirm(`Yakin hapus layanan '${name}'?`)) return;

    await sendRequest({
        action: 'delete',
        service_id: id
    });
}
