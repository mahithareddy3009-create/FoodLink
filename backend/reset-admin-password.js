const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline");

const usersFile = path.join(__dirname, "data", "users.json");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function resetAdminPassword() {
    try {
        const email = (await ask("Enter your admin email: "))
            .trim()
            .toLowerCase();

        const password = await ask(
            "Enter a new password (minimum 12 characters): "
        );

        if (!email || password.length < 12) {
            console.log("Email is required and password must have at least 12 characters.");
            return;
        }

        const users = JSON.parse(
            fs.readFileSync(usersFile, "utf8")
        );

        const admin = users.find(user =>
            user.email &&
            user.email.toLowerCase() === email &&
            user.role === "admin"
        );

        if (!admin) {
            console.log("Admin account not found. No changes made.");
            return;
        }

        const salt = crypto.randomBytes(16).toString("hex");
        const hash = crypto.scryptSync(password, salt, 64).toString("hex");

        admin.password = "";
        admin.passwordSalt = salt;
        admin.passwordHash = hash;

        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

        console.log("Admin password reset successfully!");
    } catch (error) {
        console.log("Reset failed:", error.message);
    } finally {
        rl.close();
    }
}

resetAdminPassword();