document.addEventListener('DOMContentLoaded', () => {
    loadUsersData();

    // ADD USER
    document.getElementById('addUserForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const fd = new FormData(this);
        const data = Object.fromEntries(fd.entries());
        data.action = 'add';

        await sendRequest(data, '#addUserModal');
        this.reset();
    });

    // EDIT USER
    document.getElementById('editUserForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const fd = new FormData(this);
        const data = Object.fromEntries(fd.entries());
        data.action = 'edit';

        await sendRequest(data, '#editUserModal');
    });
});

async function sendRequest(data, modalId = null) {
    try {
        const res = await fetch("../php/admin_userManage.php", {
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
            loadUsersData(); // Refresh table
        } else {
            alert("Error: " + json.message);
        }
    } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan sistem");
    }
}

// LOAD DATA
async function loadUsersData() {
    try {
        const res = await fetch("../php/admin_userManage.php");
        const json = await res.json();
        if (json.success) {
            renderUsersTable(json.data.users);
        } else {
            console.error("Failed to load users: ", json.message);
        }
    } catch (err) {
        console.error('Fetch error: ', err);
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = "<tr class='text-center'><td colspan='4'>No users available</td></tr>";
        return;
    }

    users.forEach(user => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td><span class="badge bg-${user.role === 'admin' ? 'danger' : 'success'}">${user.role}</span></td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick='openEditModal(${JSON.stringify(user)})'>
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-info me-1 text-white" onclick="resetPassword(${user.id}, '${user.username}')">
                    <i class="fas fa-key"></i> Reset Pass
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id}, '${user.username}')">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// OPEN EDIT MODAL
window.openEditModal = function (user) {
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editRole').value = user.role;

    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
}

// RESET PASSWORD
window.resetPassword = async function (id, username) {
    if (!confirm(`Reset password untuk user '${username}' menjadi '123456'?`)) return;

    await sendRequest({
        action: 'reset_password',
        id: id,
        new_password: '123456'
    });
}

// DELETE USER
window.deleteUser = async function (id, username) {
    if (!confirm(`Yakin hapus user '${username}'?`)) return;

    await sendRequest({
        action: 'delete',
        id: id
    });
}
