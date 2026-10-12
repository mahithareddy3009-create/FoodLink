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

if (!currentUser || currentUser.role !== "ngo") {
    window.location.href = "login.html";
}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const donationList =
    document.getElementById("donationList");

const acceptedDonationList =
    document.getElementById("acceptedDonationList");

const availableCount =
    document.getElementById("availableCount");

const acceptedCount =
    document.getElementById("acceptedCount");

const mealCount =
    document.getElementById("mealCount");


/* =========================================================
   DATA
========================================================= */

let donations = [];
let volunteers = [];


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
        displayDonations();
        displayAcceptedDonations();

    } catch (error) {

        console.error(
            "Load donations error:",
            error
        );

        donationList.innerHTML = `
            <div class="empty-state">
                Could not load donations.
            </div>
        `;

    }
}


/* =========================================================
   LOAD VOLUNTEERS
========================================================= */

async function loadVolunteers() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/users`
            );

        if (!response.ok) {
            throw new Error(
                "Could not load users."
            );
        }

        const users =
            await response.json();

        volunteers =
            users.filter(
                user =>
                    user.role === "volunteer"
            );

    } catch (error) {

        console.error(
            "Load volunteers error:",
            error
        );

        volunteers = [];

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
   UPDATE STATS
========================================================= */

function updateStats() {

    const availableDonations =
        donations.filter(
            donation =>
                donation.status === "Available"
        );

    const acceptedDonations =
        donations.filter(
            donation =>
                donation.ngoEmail ===
                currentUser.email &&
                donation.status !== "Available"
        );

    const meals =
        availableDonations.reduce(
            function (total, donation) {

                return (
                    total +
                    Number(donation.quantity || 0)
                );

            },
            0
        );

    if (availableCount) {
        availableCount.textContent =
            availableDonations.length;
    }

    if (acceptedCount) {
        acceptedCount.textContent =
            acceptedDonations.length;
    }

    if (mealCount) {
        mealCount.textContent =
            meals;
    }
}


/* =========================================================
   DISPLAY AVAILABLE DONATIONS
========================================================= */

function displayDonations() {

    const available =
        donations.filter(
            donation =>
                donation.status === "Available"
        );

    if (available.length === 0) {

        donationList.innerHTML = `
            <div class="empty-state">
                No donations available right now.
            </div>
        `;

        return;
    }

    donationList.innerHTML =
        available.map(
            donation => {

                return `
                    <div class="donation-item">

                        <div class="donation-info">

                            <h3>
                                🍱 ${donation.foodName}
                            </h3>

                            <p>
                                🍽️
                                ${donation.quantity}
                                ${donation.foodType}
                            </p>

                            <p>
                                📍
                                ${donation.location}
                            </p>

                            <p>
                                📅
                                ${formatDate(
                                    donation.pickupDate
                                )}
                            </p>

                            <p>
                                🕐
                                ${formatTime(
                                    donation.pickupTime
                                )}
                            </p>

                            <p>
                                👤
                                ${donation.donorName}
                            </p>

                        </div>

                        <button
                            class="accept-btn"
                            onclick="acceptDonation(${donation.id})"
                        >
                            Accept Donation
                        </button>

                    </div>
                `;

            }
        ).join("");
}


/* =========================================================
   DISPLAY ACCEPTED DONATIONS
========================================================= */

async function displayAcceptedDonations() {

    const accepted =
        donations.filter(
            donation =>
                donation.ngoEmail ===
                currentUser.email &&
                donation.status !== "Available"
        );

    if (accepted.length === 0) {

        acceptedDonationList.innerHTML = `
            <div class="empty-state">
                No accepted donations yet.
            </div>
        `;

        return;
    }

    await loadVolunteers();

    acceptedDonationList.innerHTML =
        accepted.map(
            donation => {

                let volunteerOptions =
                    `
                    <option value="">
                        Select Volunteer
                    </option>
                    `;

                volunteers.forEach(
                    volunteer => {

                        volunteerOptions += `
                            <option
                                value="${volunteer.email}"
                            >
                                ${volunteer.name}
                            </option>
                        `;

                    }
                );

                let volunteerSection = "";

                if (
                    donation.assignedVolunteer
                ) {

                    volunteerSection = `
                        <div class="assigned-volunteer">

                            🚚 Assigned Volunteer:
                            ${donation.assignedVolunteer}

                        </div>
                    `;

                } else {

                    volunteerSection = `
                        <div class="volunteer-assignment">

                            <select
                                id="volunteer-${donation.id}"
                            >
                                ${volunteerOptions}
                            </select>

                            <button
                                class="assign-volunteer-btn"
                                onclick="assignVolunteer(${donation.id})"
                            >
                                Assign Volunteer
                            </button>

                        </div>
                    `;

                }

                return `
                    <div class="accepted-donation-item">

                        <div class="donation-info">

                            <h3>
                                🍱 ${donation.foodName}
                            </h3>

                            <p>
                                🍽️
                                ${donation.quantity}
                                ${donation.foodType}
                            </p>

                            <p>
                                📍
                                ${donation.location}
                            </p>

                            <p>
                                👤 Donor:
                                ${donation.donorName}
                            </p>

                            <p>
                                📊 Status:
                                <strong>
                                    ${donation.status}
                                </strong>
                            </p>

                            ${volunteerSection}

                        </div>

                    </div>
                `;

            }
        ).join("");
}


/* =========================================================
   ACCEPT DONATION
========================================================= */

async function acceptDonation(id) {

    try {

        console.log(
            "Accepting donation:",
            id
        );

        const donation =
            donations.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );

        if (!donation) {

            alert(
                "Donation not found."
            );

            return;
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
                        JSON.stringify({

                            status:
                                "Accepted",

                            ngoName:
                                currentUser.name,

                            ngoEmail:
                                currentUser.email,

                            ngoPhone:
                                currentUser.phone || ""

                        })

                }
            );


        const responseText =
            await response.text();

        console.log(
            "Backend response:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                responseText ||
                "Backend update failed."
            );

        }


        const result =
            JSON.parse(
                responseText
            );


        const index =
            donations.findIndex(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (index !== -1) {

            donations[index] =
                result.donation;

        }


        updateStats();
        displayDonations();
        displayAcceptedDonations();


        alert(
            "Donation accepted successfully! ✅"
        );


    } catch (error) {

        console.error(
            "Accept donation error:",
            error
        );

        alert(
            "Could not accept donation.\n\n" +
            error.message
        );

    }
}


/* =========================================================
   ASSIGN VOLUNTEER
========================================================= */

async function assignVolunteer(id) {

    const select =
        document.getElementById(
            `volunteer-${id}`
        );

    if (!select) {
        return;
    }

    const volunteerEmail =
        select.value;

    if (!volunteerEmail) {

        alert(
            "Please select a volunteer."
        );

        return;
    }


    const volunteer =
        volunteers.find(
            user =>
                user.email ===
                volunteerEmail
        );

    if (!volunteer) {

        alert(
            "Volunteer not found."
        );

        return;
    }


    try {

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
                        JSON.stringify({

                            assignedVolunteer:
                                volunteer.name,

                            assignedVolunteerEmail:
                                volunteer.email,

                            assignedVolunteerPhone:
                                volunteer.phone || "",

                            assignedAt:
                                new Date().toISOString()

                        })

                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText
            );

        }


        const result =
            await response.json();


        const index =
            donations.findIndex(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (index !== -1) {

            donations[index] =
                result.donation;

        }


        displayAcceptedDonations();


        alert(
            "Volunteer assigned successfully! ✅"
        );


    } catch (error) {

        console.error(
            "Assign volunteer error:",
            error
        );

        alert(
            "Could not assign volunteer.\n\n" +
            error.message
        );

    }
}


/* =========================================================
   INITIAL LOAD
========================================================= */

loadDonations();


/* =========================================================
   EXPORT FUNCTIONS
========================================================= */

window.acceptDonation =
    acceptDonation;

window.assignVolunteer =
    assignVolunteer;

window.logout =
    logout;