// Fungsi untuk memuat data users
async function loadUsersData() {
    try {
        const res = await fetch("../php/admin_userManage.php"); // Mengambil data users dari backend
        
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }

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

// Fungsi untuk merender tabel users
function renderUsersTable(users) {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = ''; // Clear existing rows

    if (users.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = "<td colspan='4' class='text-center'>No users available</td>";
        tbody.appendChild(row);
    } else {
        users.forEach(user => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Fungsi untuk mengedit user
function editUser(userId) {
    alert("Edit user ID: " + userId);
}

// Fungsi untuk menghapus user
function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
        alert("Deleted user ID: " + userId);
    }
}

// Fungsi untuk menambah user
document.getElementById("addUserBtn").addEventListener("click", function() {
    alert("Add new user");
});

// Fungsi untuk mereset password
document.getElementById("resetPasswordBtn").addEventListener("click", function() {
    alert("Reset password for selected user");
});

// Muat data users saat halaman dimuat
window.addEventListener('DOMContentLoaded', loadUsersData);
