
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const crypto = require("crypto");

const usersFile = path.join(
    __dirname,
    "data",
    "users.json"
);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(function (resolve) {
        rl.question(question, resolve);
    });
}

async function createAdmin() {
    try {
        const email = (
            await ask("Enter admin email: ")
        ).trim().toLowerCase();

        const password = await ask(
            "Create admin password (minimum 12 characters): "
        );

        if (!email || password.length < 12) {
            console.log(
                "Email is required and password must have at least 12 characters."
            );
            return;
        }

        if (!fs.existsSync(usersFile)) {
            console.log("users.json was not found.");
            return;
        }

        const users = JSON.parse(
            fs.readFileSync(usersFile, "utf8")
        );

        const exists = users.some(function (user) {
            return user.email.toLowerCase() === email;
        });

        if (exists) {
            console.log(
                "This email already exists. Use a different admin email."
            );
            return;
        }

        const salt = crypto.randomBytes(16).toString("hex");

        const passwordHash = crypto.scryptSync(
            password,
            salt,
            64
        ).toString("hex");

        users.push({
            id: Date.now(),
            name: "FoodLink Admin",
            email: email,
            phone: "",
            password: "",
            role: "admin",
            ngo: "",
            passwordSalt: salt,
            passwordHash: passwordHash
        });

        fs.writeFileSync(
            usersFile,
            JSON.stringify(users, null, 2)
        );

        console.log("\nAdmin account created.");
        console.log("Email:", email);
        console.log("Keep your password private.");

    } catch (error) {
        console.error("Could not create admin:", error.message);
    } finally {
        rl.close();
    }
}

createAdmin();
