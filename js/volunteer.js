const API_URL = "http://localhost:3000";

/* =========================================================
   LOGIN CHECK
========================================================= */

if (localStorage.getItem("foodlinkLoggedIn") !== "true") {
    window.location.href = "login.html";
}

const currentUser =
    JSON.parse(
        localStorage.getItem("foodlinkCurrentUser")
    );

if (!currentUser || currentUser.role !== "volunteer") {
    window.location.href = "login.html";
}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const assignedCount =
    document.getElementById("assignedCount");

const pickupCount =
    document.getElementById("pickupCount");

const deliveredCount =
    document.getElementById("deliveredCount");

const assignedDonationList =
    document.getElementById("assignedDonationList");

const deliveredDonationList =
    document.getElementById("deliveredDonationList");


/* =========================================================
   DATA
========================================================= */

let donations = [];


/* =========================================================
   LOAD DONATIONS
========================================================= */

async function loadDonations() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/donations`
            );

        if (!response.ok) {

            throw new Error(
                "Could not load donations."
            );

        }

        donations =
            await response.json();

        updateStats();
        displayAssignedDonations();
        displayDeliveredDonations();

    } catch (error) {

        console.error(
            "Load donations error:",
            error
        );

        if (assignedDonationList) {

            assignedDonationList.innerHTML = `
                <div class="empty-state">
                    Could not load donations.
                </div>
            `;

        }

    }
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem(
        "foodlinkLoggedIn"
    );

    localStorage.removeItem(
        "foodlinkCurrentUser"
    );

    localStorage.removeItem(
        "foodlinkUser"
    );

    window.location.href =
        "login.html";
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(timeString) {

    if (!timeString) {
        return "";
    }

    const parts =
        timeString.split(":");

    let hour =
        Number(parts[0]);

    const minute =
        parts[1];

    const ampm =
        hour >= 12
            ? "PM"
            : "AM";

    hour =
        hour % 12 || 12;

    return `${hour}:${minute} ${ampm}`;
}


/* =========================================================
   GET MY ASSIGNED DONATIONS
========================================================= */

function getMyAssignedDonations() {

    return donations.filter(
        function (donation) {

            return (
                donation.assignedVolunteerEmail ===
                currentUser.email
            );

        }
    );
}


/* =========================================================
   UPDATE STATS
========================================================= */

function updateStats() {

    const myDonations =
        getMyAssignedDonations();

    const assigned =
        myDonations.filter(
            donation =>
                donation.status === "Accepted"
        );

    const pickedUp =
        myDonations.filter(
            donation =>
                donation.status === "Picked Up"
        );

    const delivered =
        myDonations.filter(
            donation =>
                donation.status === "Delivered"
        );

    if (assignedCount) {

        assignedCount.textContent =
            assigned.length;

    }

    if (pickupCount) {

        pickupCount.textContent =
            pickedUp.length;

    }

    if (deliveredCount) {

        deliveredCount.textContent =
            delivered.length;

    }
}


/* =========================================================
   DISPLAY ASSIGNED DONATIONS
========================================================= */

function displayAssignedDonations() {

    if (!assignedDonationList) {
        return;
    }

    const assigned =
        getMyAssignedDonations().filter(
            donation =>
                donation.status === "Accepted" ||
                donation.status === "Picked Up"
        );


    if (assigned.length === 0) {

        assignedDonationList.innerHTML = `
            <div class="empty-state">
                No assigned donations right now.
            </div>
        `;

        return;
    }


    assignedDonationList.innerHTML =
        assigned.map(
            donation => {

                let actionButton = "";


                if (
                    donation.status ===
                    "Accepted"
                ) {

                    actionButton = `
                        <button
                            class="status-btn pickup-btn"
                            onclick="updateDonationStatus(
                                ${donation.id},
                                'Picked Up'
                            )"
                        >
                            🚚 Mark Picked Up
                        </button>
                    `;

                } else if (
                    donation.status ===
                    "Picked Up"
                ) {

                    actionButton = `
                        <button
                            class="status-btn delivered-btn"
                            onclick="updateDonationStatus(
                                ${donation.id},
                                'Delivered'
                            )"
                        >
                            ❤️ Mark Delivered
                        </button>
                    `;

                }


                return `
                    <div class="donation-card">

                        <div class="donation-card-header">

                            <h3>
                                🍱
                                ${donation.foodName}
                            </h3>

                            <span class="status">
                                ${donation.status}
                            </span>

                        </div>


                        <div class="donation-details">

                            <p>
                                🍽️
                                <strong>Quantity:</strong>
                                ${donation.quantity}
                                ${donation.foodType}
                            </p>

                            <p>
                                📍
                                <strong>Pickup:</strong>
                                ${donation.location}
                            </p>

                            <p>
                                📅
                                <strong>Date:</strong>
                                ${formatDate(
                                    donation.pickupDate
                                )}
                            </p>

                            <p>
                                🕐
                                <strong>Time:</strong>
                                ${formatTime(
                                    donation.pickupTime
                                )}
                            </p>

                            <p>
                                👤
                                <strong>Donor:</strong>
                                ${donation.donorName}
                            </p>

                            <p>
                                📞
                                <strong>Donor Phone:</strong>
                                ${donation.donorPhone}
                            </p>

                        </div>


                        <div class="donation-actions">

                            ${actionButton}

                        </div>

                    </div>
                `;

            }
        ).join("");
}


/* =========================================================
   DISPLAY DELIVERED DONATIONS
========================================================= */

function displayDeliveredDonations() {

    if (!deliveredDonationList) {
        return;
    }

    const delivered =
        getMyAssignedDonations().filter(
            donation =>
                donation.status === "Delivered"
        );


    if (delivered.length === 0) {

        deliveredDonationList.innerHTML = `
            <div class="empty-state">
                No delivered donations yet.
            </div>
        `;

        return;
    }


    deliveredDonationList.innerHTML =
        delivered.map(
            donation => {

                return `
                    <div class="donation-card">

                        <div class="donation-card-header">

                            <h3>
                                🍱
                                ${donation.foodName}
                            </h3>

                            <span class="status delivered">
                                ❤️ Delivered
                            </span>

                        </div>


                        <div class="donation-details">

                            <p>
                                🍽️
                                <strong>Quantity:</strong>
                                ${donation.quantity}
                                ${donation.foodType}
                            </p>

                            <p>
                                📍
                                ${donation.location}
                            </p>

                            <p>
                                📅
                                <strong>Pickup Date:</strong>
                                ${formatDate(
                                    donation.pickupDate
                                )}
                            </p>

                            <p>
                                ❤️
                                <strong>Delivered:</strong>
                                ${formatDateTime(
                                    donation.deliveredAt
                                )}
                            </p>

                        </div>

                    </div>
                `;

            }
        ).join("");
}


/* =========================================================
   FORMAT DATE + TIME
========================================================= */

function formatDateTime(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(dateString);

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   UPDATE DONATION STATUS
========================================================= */

async function updateDonationStatus(
    id,
    newStatus
) {

    try {

        const updateData = {

            status:
                newStatus,

            assignedVolunteer:
                currentUser.name,

            assignedVolunteerEmail:
                currentUser.email,

            assignedVolunteerPhone:
                currentUser.phone || ""

        };


        if (
            newStatus ===
            "Picked Up"
        ) {

            updateData.pickedUpAt =
                new Date().toISOString();

        }


        if (
            newStatus ===
            "Delivered"
        ) {

            updateData.deliveredAt =
                new Date().toISOString();

        }


        const response =
            await fetch(
                `${API_URL}/api/donations/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            updateData
                        )

                }
            );


        const responseText =
            await response.text();


        if (!response.ok) {

            throw new Error(
                responseText ||
                "Could not update donation."
            );

        }


        const result =
            JSON.parse(
                responseText
            );


        const index =
            donations.findIndex(
                donation =>
                    Number(donation.id) ===
                    Number(id)
            );


        if (index !== -1) {

            donations[index] =
                result.donation;

        }


        updateStats();
        displayAssignedDonations();
        displayDeliveredDonations();


        if (
            newStatus ===
            "Picked Up"
        ) {

            showToast(
                "Food picked up successfully! 🚚"
            );

        }


        if (
            newStatus ===
            "Delivered"
        ) {

            showToast(
                "Food delivered successfully! ❤️"
            );

        }


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );

        alert(
            "Could not update donation.\n\n" +
            error.message
        );

    }
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    let toast =
        document.getElementById(
            "successToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "successToast";

        toast.className =
            "success-toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );
}


/* =========================================================
   INITIAL LOAD
========================================================= */

loadDonations();


/* =========================================================
   EXPORT
========================================================= */

window.logout =
    logout;

window.updateDonationStatus =
    updateDonationStatus;