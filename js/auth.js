
/* =========================================
   FOODLINK AUTHENTICATION
========================================= */

const API_URL = "http://localhost:3000";


// =========================================
// GET SIGNUP ELEMENTS
// =========================================

const signupForm = document.getElementById("signupForm");
const signupRole = document.getElementById("signupRole");
const ngoSelection = document.getElementById("ngoSelection");
const volunteerNgo = document.getElementById("volunteerNgo");


// =========================================
// SHOW NGO SELECTION FOR VOLUNTEERS
// =========================================

if (signupRole) {
    signupRole.addEventListener("change", function () {

        if (this.value === "volunteer") {

            if (ngoSelection) {
                ngoSelection.style.display = "block";
            }

            if (volunteerNgo) {
                volunteerNgo.required = true;
            }

        } else {

            if (ngoSelection) {
                ngoSelection.style.display = "none";
            }

            if (volunteerNgo) {
                volunteerNgo.required = false;
                volunteerNgo.value = "";
            }

        }
    });
}


// =========================================
// SIGNUP
// =========================================

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("signupName").value.trim();

        const email =
            document.getElementById("signupEmail").value.trim();

        const phone =
            document.getElementById("signupPhone").value.trim();

        const password =
            document.getElementById("signupPassword").value;

        const role =
            document.getElementById("signupRole").value;

        let ngo = "";

        if (role === "volunteer" && volunteerNgo) {
            ngo = volunteerNgo.value;
        }

        if (!name || !email || !phone || !password || !role) {
            alert("Please fill all fields.");
            return;
        }

        if (role === "volunteer" && !ngo) {
            alert("Please select your NGO.");
            return;
        }

        // Admin accounts must not be created through public signup.
        if (role.toLowerCase() === "admin") {
            alert("Admin accounts must be created by the system administrator.");
            return;
        }

        try {
            const response = await fetch(
                API_URL + "/api/users/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        phone: phone,
                        password: password,
                        role: role,
                        ngo: ngo
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Registration failed.");
                return;
            }

            alert("Account created successfully!");

            window.location.href = "login.html";

        } catch (error) {
            console.error("Signup error:", error);

            alert(
                "Cannot connect to FoodLink server. Make sure the backend is running."
            );
        }
    });
}


// =========================================
// LOGIN
// =========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }

        try {
            const response = await fetch(
                API_URL + "/api/users/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Invalid email or password.");
                return;
            }

            const savedUser = data.user;

            // Save login state
            localStorage.setItem("foodlinkLoggedIn", "true");

            localStorage.setItem(
                "foodlinkCurrentUser",
                JSON.stringify(savedUser)
            );

            // Keep compatibility with existing dashboards
            localStorage.setItem(
                "foodlinkUser",
                JSON.stringify(savedUser)
            );

            // Redirect according to account role
            if (savedUser.role === "donor") {

                window.location.href = "donar-dashboard.html";

            } else if (savedUser.role === "ngo") {

                window.location.href = "ngo-dashboard.html";

            } else if (savedUser.role === "volunteer") {

                window.location.href = "volunteer-dashboard.html";

            } else if (savedUser.role === "admin") {

                window.location.href = "admin-dashboard.html";

            } else {

                localStorage.removeItem("foodlinkLoggedIn");
                localStorage.removeItem("foodlinkCurrentUser");
                localStorage.removeItem("foodlinkUser");

                alert("Invalid user role.");
            }

        } catch (error) {
            console.error("Login error:", error);

            alert(
                "Cannot connect to FoodLink server. Make sure the backend is running."
            );
        }
    });
}

const passwordInput = document.getElementById("loginPassword");
const togglePassword = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

if (passwordInput && togglePassword) {
    togglePassword.addEventListener("click", function () {
        const showPassword = passwordInput.type === "password";

        passwordInput.type = showPassword ? "text" : "password";

        togglePassword.setAttribute(
            "aria-label",
            showPassword ? "Hide password" : "Show password"
        );

        eyeIcon.innerHTML = showPassword
            ? `
                <path d="M3 3l18 18"/>
                <path d="M10.6 10.6a2 2 0 002.8 2.8"/>
                <path d="M9.9 5.2A10.8 10.8 0 0112 5c6.5 0 10 7 10 7a14.5 14.5 0 01-3 3.8"/>
                <path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10.5 10.5 0 004-.8"/>
              `
            : `
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
                <circle cx="12" cy="12" r="3"/>
              `;
    });
}
