
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// DATA FILES
// ==============================

const dataFolder = path.join(__dirname, "data");
const usersFile = path.join(dataFolder, "users.json");
const donationsFile = path.join(dataFolder, "donations.json");

app.use(cors());
app.use(express.json());

// Create data folder/files if missing
if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
}

if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, "[]", "utf8");
}

if (!fs.existsSync(donationsFile)) {
    fs.writeFileSync(donationsFile, "[]", "utf8");
}

// ==============================
// READ AND SAVE USERS
// ==============================

function readUsers() {
    try {
        const data = fs.readFileSync(usersFile, "utf8");
        return JSON.parse(data || "[]");
    } catch (error) {
        console.error("Error reading users:", error.message);
        throw error;
    }
}

function saveUsers(users) {
    fs.writeFileSync(
        usersFile,
        JSON.stringify(users, null, 2),
        "utf8"
    );
}

// ==============================
// READ AND SAVE DONATIONS
// ==============================

function readDonations() {
    try {
        const data = fs.readFileSync(donationsFile, "utf8");
        return JSON.parse(data || "[]");
    } catch (error) {
        console.error("Error reading donations:", error.message);
        throw error;
    }
}

function saveDonations(donations) {
    fs.writeFileSync(
        donationsFile,
        JSON.stringify(donations, null, 2),
        "utf8"
    );
}

// Remove sensitive fields before returning user information
function publicUser(user) {
    const {
        password,
        passwordSalt,
        passwordHash,
        ...safeUser
    } = user;

    return safeUser;
}

// ==============================
// HOME
// ==============================

app.get("/", function (req, res) {
    res.send("FoodLink Backend is Running 🚀");
});

// ==============================
// TEST API
// ==============================

app.get("/api/test", function (req, res) {
    res.json({
        message: "FoodLink API is working 🚀"
    });
});

// ==============================
// REGISTER USER
// ==============================

app.post("/api/users/register", function (req, res) {
    const {
        name,
        email,
        phone,
        password,
        role,
        ngo
    } = req.body;

    if (!name || !email || !phone || !password || !role) {
        return res.status(400).json({
            message: "Please provide all required fields."
        });
    }

    // Admin accounts must be created separately.
    const allowedRoles = ["donor", "ngo", "volunteer"];

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            message: "Invalid registration role."
        });
    }

    const users = readUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = String(phone).trim();

    const emailExists = users.some(function (user) {
        return (
            user.email &&
            user.email.trim().toLowerCase() === normalizedEmail
        );
    });

    if (emailExists) {
        return res.status(409).json({
            message: "Email already registered."
        });
    }

    const phoneExists = users.some(function (user) {
        return String(user.phone || "").trim() === normalizedPhone;
    });

    if (phoneExists) {
        return res.status(409).json({
            message: "Phone number already registered."
        });
    }

    const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password: password,
        role: role,
        ngo: ngo || ""
    };

    users.push(newUser);
    saveUsers(users);

    return res.status(201).json({
        message: "Registration successful.",
        user: publicUser(newUser)
    });
});

// ==============================
// LOGIN USER
// ==============================

app.post("/api/users/login", function (req, res) {
    const { email, password } = req.body;

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
    ) {
        return res.status(400).json({
            message: "Email and password are required."
        });
    }

    const users = readUsers();
    const normalizedEmail = email.trim().toLowerCase();

    // Temporary diagnostics: never log passwords or hashes.
    console.log("Login email entered:", normalizedEmail);

    const user = users.find(function (item) {
        return (
            item.email &&
            item.email.trim().toLowerCase() === normalizedEmail
        );
    });

    console.log("Account found:", !!user);
    console.log("Account role:", user ? user.role : "not found");
    console.log(
        "Password salt exists:",
        !!(user && user.passwordSalt)
    );
    console.log(
        "Password hash exists:",
        !!(user && user.passwordHash)
    );
    console.log(
        "Password hash length:",
        user && user.passwordHash
            ? user.passwordHash.length
            : 0
    );

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password."
        });
    }

    let passwordMatches = false;

    // Verify accounts that have a stored password hash and salt.
    if (user.passwordSalt && user.passwordHash) {
        try {
            const submittedHash = crypto.scryptSync(
                password,
                user.passwordSalt,
                64
            );

            const savedHash = Buffer.from(
                user.passwordHash,
                "hex"
            );

            passwordMatches =
                savedHash.length === submittedHash.length &&
                crypto.timingSafeEqual(
                    submittedHash,
                    savedHash
                );
        } catch (error) {
            console.error(
                "Password verification error:",
                error.message
            );

            passwordMatches = false;
        }
    } else {
        // Legacy donor, NGO and volunteer accounts
        passwordMatches = user.password === password;
    }

    if (!passwordMatches) {
        return res.status(401).json({
            message: "Invalid email or password."
        });
    }

    return res.json({
        message: "Login successful.",
        user: publicUser(user)
    });
});

// ==============================
// GET ALL USERS
// ==============================

app.get("/api/users", function (req, res) {
    const users = readUsers();

    // Do not expose passwords or password hashes.
    return res.json(users.map(publicUser));
});

// ==============================
// GET ALL DONATIONS
// ==============================

app.get("/api/donations", function (req, res) {
    const donations = readDonations();
    return res.json(donations);
});

// ==============================
// CREATE DONATION
// ==============================

app.post("/api/donations", function (req, res) {
    const donation = req.body;

    if (
        !donation.foodName ||
        !donation.quantity ||
        !donation.location
    ) {
        return res.status(400).json({
            message:
                "Food name, quantity and location are required."
        });
    }

    const donations = readDonations();

    const newDonation = {
        id: Date.now(),

        foodName: donation.foodName,
        quantity: donation.quantity,
        foodType: donation.foodType || "",
        location: donation.location,
        pickupDate: donation.pickupDate || "",
        pickupTime: donation.pickupTime || "",
        expiry: donation.expiry || "",

        status: "Available",

        donorName: donation.donorName || "",
        donorEmail: donation.donorEmail || "",
        donorPhone: donation.donorPhone || "",

        ngoName: "",
        ngoEmail: "",
        ngoPhone: "",

        assignedVolunteer: "",
        assignedVolunteerEmail: "",
        assignedVolunteerPhone: "",

        assignedAt: "",
        acceptedAt: "",
        pickedUpAt: "",
        deliveredAt: ""
    };

    donations.push(newDonation);
    saveDonations(donations);

    return res.status(201).json({
        message: "Donation created successfully.",
        donation: newDonation
    });
});

// ==============================
// UPDATE DONATION
// ==============================

app.put("/api/donations/:id", function (req, res) {
    const donationId = Number(req.params.id);
    const donations = readDonations();

    const index = donations.findIndex(function (donation) {
        return Number(donation.id) === donationId;
    });

    if (index === -1) {
        return res.status(404).json({
            message: "Donation not found."
        });
    }

    // Preserve the original ID while updating donation fields.
    donations[index] = {
        ...donations[index],
        ...req.body,
        id: donations[index].id
    };

    saveDonations(donations);

    return res.json({
        message: "Donation updated successfully.",
        donation: donations[index]
    });
});

// ==============================
// START SERVER
// ==============================

app.listen(PORT, "0.0.0.0", function () {
    console.log("FoodLink Backend Started 🚀");
    console.log("Server running on port " + PORT);
});