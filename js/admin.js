
/* =====================================
   FOODLINK ADMIN DASHBOARD
===================================== */

const API_URL = "http://localhost:3000/api";

// Load dashboard data
async function loadAdminDashboard() {
    try {
        const [usersResponse, donationsResponse] = await Promise.all([
            fetch(`${API_URL}/users`),
            fetch(`${API_URL}/donations`)
        ]);

        if (!usersResponse.ok || !donationsResponse.ok) {
            throw new Error("Unable to load FoodLink data.");
        }

        const users = await usersResponse.json();
        const donations = await donationsResponse.json();

        // Separate users by role
        const donors = users.filter(
            user => (user.role || "").toLowerCase() === "donor"
        );

        const ngos = users.filter(
            user => (user.role || "").toLowerCase() === "ngo"
        );

        const volunteers = users.filter(
            user => (user.role || "").toLowerCase() === "volunteer"
        );

        // Update statistics
        document.getElementById("totalUsers").textContent = users.length;
        document.getElementById("totalDonors").textContent = donors.length;
        document.getElementById("totalNgos").textContent = ngos.length;
        document.getElementById("totalVolunteers").textContent =
            volunteers.length;
        document.getElementById("totalDonations").textContent =
            donations.length;

        // Display each category separately
        displayUsers("donorsTable", donors, "No donors registered yet.");
        displayUsers("ngosTable", ngos, "No NGOs registered yet.");
        displayUsers(
            "volunteersTable",
            volunteers,
            "No volunteers registered yet."
        );

        displayDonations(donations);

    } catch (error) {
        console.error("Admin dashboard error:", error);

        [
            "donorsTable",
            "ngosTable",
            "volunteersTable"
        ].forEach(id => {
            const table = document.getElementById(id);

            if (table) {
                table.innerHTML =
                    '<tr><td colspan="4">Could not load users.</td></tr>';
            }
        });

        const donationsTable = document.getElementById("donationsTable");

        if (donationsTable) {
            donationsTable.innerHTML =
                '<tr><td colspan="6">Could not load donations.</td></tr>';
        }
    }
}

// Display a specific category of users
function displayUsers(tableId, users, emptyMessage) {
    const table = document.getElementById(tableId);

    // Avoid errors if an HTML table is missing
    if (!table) {
        console.warn(`Table with ID "${tableId}" was not found.`);
        return;
    }

    table.replaceChildren();

    if (users.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = emptyMessage;

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    users.forEach(user => {
        const row = document.createElement("tr");

        [
            user.name,
            user.email,
            user.phone,
            user.role
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value || "—";
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}

// Display all donations
function displayDonations(donations) {
    const table = document.getElementById("donationsTable");

    if (!table) {
        console.warn("Donations table was not found.");
        return;
    }

    table.replaceChildren();

    if (donations.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "No donations yet.";

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    donations.forEach(donation => {
        const row = document.createElement("tr");

        [
            donation.foodName,
            donation.quantity,
            donation.donorName,
            donation.ngoName,
            donation.assignedVolunteer,
            donation.status
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value || "—";
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}

// Logout button
const logoutButton = document.getElementById("logoutBtn");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("foodlinkLoggedIn");
        localStorage.removeItem("foodlinkCurrentUser");
        localStorage.removeItem("foodlinkUser");

        window.location.href = "login.html";
    });
}

// Start dashboard
loadAdminDashboard();
