
/* =========================================
   FOODLINK - MAIN WEBSITE
========================================= */

function scrollToDonation() {
    document.getElementById("donate").scrollIntoView({
        behavior: "smooth"
    });
}

/* =========================================
   CLAIM / ACCEPT FOOD
========================================= */

function claimFood(button) {
    button.innerText = "Donation Accepted ✓";
    button.style.background = "#45a049";
    button.style.color = "white";
    button.disabled = true;

    showFoodLinkToast(
        "🤝",
        "Donation Accepted!",
        "The donor can now be contacted to arrange pickup."
    );
}

/* =========================================
   DONATION FORM
========================================= */

const donationForm = document.getElementById("donationForm");

if (donationForm) {
    donationForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const loggedIn =
            localStorage.getItem("foodlinkLoggedIn") === "true";

        let currentUser = null;

        try {
            currentUser = JSON.parse(
                localStorage.getItem("foodlinkCurrentUser")
            );
        } catch (error) {
            currentUser = null;
        }

        // Require donor login before posting food
        if (
            !loggedIn ||
            !currentUser ||
            String(currentUser.role || "").toLowerCase() !== "donor"
        ) {
            window.location.href = "login.html";
            return;
        }

        // Get form values
        const foodName =
            document.getElementById("foodName").value.trim();

        const quantity =
            document.getElementById("quantity").value;

        const location =
            document.getElementById("location").value.trim();

        const expiry =
            document.getElementById("expiry").value;

        // Create donation
        const newDonation = {
            id: Date.now(),
            foodName: foodName,
            quantity: quantity,
            foodType: "Meals",
            location: location,
            expiry: expiry,
            status: "Available"
        };

        // Get existing donations
        let donations = [];

        try {
            donations = JSON.parse(
                localStorage.getItem("foodlinkDonations")
            ) || [];
        } catch (error) {
            donations = [];
        }

        // Save donation
        donations.push(newDonation);

        localStorage.setItem(
            "foodlinkDonations",
            JSON.stringify(donations)
        );

        // Success message
        showFoodLinkToast(
            "🎉",
            "Donation Posted!",
            "Your surplus food is now available for NGOs."
        );

        addNotification(
            "🎉",
            "Donation Posted!",
            "Your surplus food is now available for NGOs."
        );

        // Reset form
        donationForm.reset();

        // Show donations section
        const donationsSection = document.getElementById("donations");

        if (donationsSection) {
            donationsSection.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
}

/* =========================================
   FOODLINK TOAST NOTIFICATION
========================================= */

function showFoodLinkToast(icon, title, message) {
    const toast = document.createElement("div");

    toast.className = "foodlink-toast";

    toast.innerHTML = `
        <div class="foodlink-toast-icon">${icon}</div>
        <div class="foodlink-toast-content">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
        <button class="foodlink-toast-close" type="button">×</button>
    `;

    document.body.appendChild(toast);

    toast.querySelector(".foodlink-toast-close").addEventListener(
        "click",
        function() {
            removeFoodLinkToast(toast);
        }
    );

    setTimeout(function() {
        removeFoodLinkToast(toast);
    }, 4000);
}

/* =========================================
   REMOVE TOAST
========================================= */

function removeFoodLinkToast(toast) {
    if (!toast || !toast.parentElement) {
        return;
    }

    toast.classList.add("hide");

    setTimeout(function() {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 300);
}

/* =========================================
   SAVE NOTIFICATION
========================================= */

function addNotification(icon, title, message) {
    let notifications = [];

    try {
        notifications = JSON.parse(
            localStorage.getItem("foodlinkNotifications")
        ) || [];
    } catch (error) {
        notifications = [];
    }

    const notification = {
        id: Date.now(),
        icon: icon,
        title: title,
        message: message,
        time: new Date().toLocaleString()
    };

    notifications.unshift(notification);

    localStorage.setItem(
        "foodlinkNotifications",
        JSON.stringify(notifications)
    );
}
