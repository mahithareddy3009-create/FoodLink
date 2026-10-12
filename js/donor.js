// =========================================
// FOODLINK DONOR DASHBOARD
// =========================================

const API_URL = "http://localhost:3000";


// =========================================
// CHECK LOGIN
// =========================================

if (
    localStorage.getItem("foodlinkLoggedIn") !== "true"
) {
    window.location.href = "login.html";
}


// =========================================
// GET CURRENT USER
// =========================================

const currentUser =
    JSON.parse(
        localStorage.getItem("foodlinkCurrentUser")
    );


// =========================================
// GET ELEMENTS
// =========================================

const donationForm =
    document.getElementById("donationForm");

const donationList =
    document.getElementById("donationList");

const totalDonations =
    document.getElementById("totalDonations");

const acceptedDonations =
    document.getElementById("acceptedDonations");

const deliveredDonations =
    document.getElementById("deliveredDonations");

const donationCount =
    document.getElementById("donationCount");

const logoutBtn =
    document.getElementById("logoutBtn");


// =========================================
// ALL DONATIONS
// =========================================

let allDonations = [];


// =========================================
// GET DONATIONS FROM BACKEND
// =========================================

async function loadDonations() {

    try {

        const response =
            await fetch(
                API_URL + "/api/donations"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load donations"
            );

        }


        allDonations =
            await response.json();


        displayDonations();


    } catch (error) {

        console.error(
            "Donation loading error:",
            error
        );

        donationList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load donations
                </h3>

                <p>
                    Please make sure the FoodLink
                    backend is running.
                </p>

            </div>

        `;

    }

}


// =========================================
// GET DONOR'S DONATIONS
// =========================================

function getMyDonations() {

    if (!currentUser) {
        return [];
    }

    return allDonations.filter(
        function (donation) {

            return (
                donation.donorEmail ===
                currentUser.email
            );

        }
    );

}


// =========================================
// LOGOUT
// =========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "foodlinkLoggedIn"
            );

            localStorage.removeItem(
                "foodlinkCurrentUser"
            );

            window.location.href =
                "login.html";

        }
    );

}


// =========================================
// FORMAT DATE
// =========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "Not set";
    }

    const date =
        new Date(dateValue);

    if (isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =========================================
// FORMAT TIME
// =========================================

function formatTime(timeValue) {

    if (!timeValue) {
        return "Not set";
    }

    const parts =
        timeValue.split(":");

    if (parts.length < 2) {
        return timeValue;
    }

    let hours =
        parseInt(parts[0]);

    const minutes =
        parts[1];

    const period =
        hours >= 12
            ? "PM"
            : "AM";

    hours =
        hours % 12 || 12;

    return (
        hours +
        ":" +
        minutes +
        " " +
        period
    );

}


// =========================================
// UPDATE STATS
// =========================================

function updateStats() {

    const donations =
        getMyDonations();


    totalDonations.textContent =
        donations.length;


    const accepted =
        donations.filter(
            function (donation) {

                return (
                    donation.status ===
                    "Accepted"
                );

            }
        ).length;


    const delivered =
        donations.filter(
            function (donation) {

                return (
                    donation.status ===
                    "Delivered"
                );

            }
        ).length;


    acceptedDonations.textContent =
        accepted;

    deliveredDonations.textContent =
        delivered;


    donationCount.textContent =
        donations.length +
        (
            donations.length === 1
                ? " donation"
                : " donations"
        );

}


// =========================================
// DISPLAY DONATIONS
// =========================================

function displayDonations() {

    const donations =
        getMyDonations();


    donationList.innerHTML = "";


    // =====================================
    // EMPTY STATE
    // =====================================

    if (donations.length === 0) {

        donationList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🍱
                </div>

                <h3>
                    No donations yet
                </h3>

                <p>
                    Your food donations will appear here.
                </p>

            </div>

        `;


        updateStats();

        return;

    }


    // =====================================
    // DISPLAY EACH DONATION
    // =====================================

    donations.forEach(
        function (donation) {

            let statusClass =
                "status-available";


            if (
                donation.status ===
                "Accepted"
            ) {

                statusClass =
                    "status-accepted";

            }


            if (
                donation.status ===
                "Delivered"
            ) {

                statusClass =
                    "status-delivered";

            }


            // =================================
            // VOLUNTEER INFORMATION
            // =================================

            let volunteerHTML = "";


            if (
                donation.assignedVolunteer
            ) {

                volunteerHTML = `

                    <div class="assigned-volunteer">

                        🚚 Volunteer:
                        <strong>
                            ${donation.assignedVolunteer}
                        </strong>

                    </div>

                `;

            }


            // =================================
            // PICKUP INFORMATION
            // =================================

            let pickupHTML = "";


            if (
                donation.pickupDate ||
                donation.pickupTime
            ) {

                pickupHTML = `

                    <div class="pickup-info">

                        📅 Pickup:
                        <strong>
                            ${formatDate(
                                donation.pickupDate
                            )}
                        </strong>

                        at

                        <strong>
                            ${formatTime(
                                donation.pickupTime
                            )}
                        </strong>

                    </div>

                `;

            }


            // =================================
            // DONATION CARD
            // =================================

            donationList.innerHTML += `

                <div class="donation-item">

                    <div class="donation-details">

                        <div class="donation-food-icon">
                            🍱
                        </div>

                        <div>

                            <h3>
                                ${donation.foodName}
                            </h3>

                            <p>

                                ${donation.quantity}
                                meals

                                •

                                ${donation.foodType}

                                •

                                📍
                                ${donation.location}

                            </p>

                            ${pickupHTML}

                            ${volunteerHTML}

                        </div>

                    </div>

                    <span
                        class="donation-status
                        ${statusClass}">

                        ${donation.status}

                    </span>

                </div>

            `;

        }
    );


    updateStats();

}


// =========================================
// POST DONATION
// =========================================

if (donationForm) {

    donationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // =================================
            // GET FORM VALUES
            // =================================

            const foodName =
                document
                    .getElementById("foodName")
                    .value
                    .trim();


            const quantity =
                document
                    .getElementById("quantity")
                    .value;


            const foodType =
                document
                    .getElementById("foodType")
                    .value;


            const location =
                document
                    .getElementById("location")
                    .value
                    .trim();


            const pickupDate =
                document
                    .getElementById("pickupDate")
                    .value;


            const pickupTime =
                document
                    .getElementById("pickupTime")
                    .value;


            const expiry =
                document
                    .getElementById("expiry")
                    .value;


            // =================================
            // CREATE DONATION DATA
            // =================================

            const donationData = {

                foodName:
                    foodName,

                quantity:
                    quantity,

                foodType:
                    foodType,

                location:
                    location,

                pickupDate:
                    pickupDate,

                pickupTime:
                    pickupTime,

                expiry:
                    expiry,


                // =============================
                // DONOR INFORMATION
                // =============================

                donorName:
                    currentUser
                        ? currentUser.name
                        : "",

                donorEmail:
                    currentUser
                        ? currentUser.email
                        : "",

                donorPhone:
                    currentUser
                        ? currentUser.phone
                        : ""

            };


            // =================================
            // SEND TO BACKEND
            // =================================

            try {

                const response =
                    await fetch(
                        API_URL +
                        "/api/donations",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    donationData
                                )

                        }
                    );


                const data =
                    await response.json();


                // =================================
                // BACKEND ERROR
                // =================================

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to post donation."
                    );

                    return;

                }


                // =================================
                // SUCCESS
                // =================================

                donationForm.reset();


                // Reload donations
                await loadDonations();


                // Show success message
                showSuccessMessage();


            } catch (error) {

                console.error(
                    "Donation error:",
                    error
                );

                alert(
                    "Cannot connect to FoodLink server. Make sure the backend is running."
                );

            }

        }
    );

}


// =========================================
// SUCCESS TOAST
// =========================================

function showSuccessMessage() {

    const toast =
        document.createElement("div");


    toast.className =
        "success-toast";


    toast.innerHTML = `

        <div class="toast-icon">
            🎉
        </div>

        <div class="toast-content">

            <strong>
                Donation Posted!
            </strong>

            <p>
                Your surplus food is now ready
                to make a difference. ❤️
            </p>

        </div>

        <button class="toast-close">
            ×
        </button>

    `;


    document.body.appendChild(
        toast
    );


    toast
        .querySelector(".toast-close")
        .addEventListener(
            "click",
            function () {

                toast.classList.add(
                    "hide"
                );


                setTimeout(
                    function () {

                        toast.remove();

                    },
                    300
                );

            }
        );


    setTimeout(
        function () {

            if (!toast.isConnected) {
                return;
            }


            toast.classList.add(
                "hide"
            );


            setTimeout(
                function () {

                    if (toast.isConnected) {
                        toast.remove();
                    }

                },
                300
            );

        },
        4000
    );

}


// =========================================
// INITIAL DISPLAY
// =========================================

loadDonations();