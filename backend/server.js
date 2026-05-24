const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const admin = require("./firebaseAdmin");

const app = express();

// ======================
// ✅ MIDDLEWARE
// ======================

app.use(cors());
app.use(express.json());

// ======================
// ✅ STORAGE
// ======================

let deadlines = [];
let tokens = [];
let users = [];
let notifiedTasks = [];

// ======================
// ✅ TEST ROUTE
// ======================

app.get("/", (req, res) => {
    res.send("Backend Working ✅");
});

// ======================
// ✅ SIGNUP
// ======================

app.post("/signup", (req, res) => {

    const {
        username,
        email,
        phone,
        password
    } = req.body;

    if (
        !username ||
        !email ||
        !phone ||
        !password
    ) {

        return res.json({
            success: false,
            message: "Please fill all fields"
        });
    }

    const exists = users.find(
        u => u.username === username
    );

    if (exists) {

        return res.json({
            success: false,
            message: "User already exists"
        });
    }

    users.push({
        username,
        email,
        phone,
        password
    });

    console.log("Users:", users);

    res.json({
        success: true,
        message: "Signup successful"
    });

});

// ======================
// ✅ LOGIN
// ======================

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    const user = users.find(
        u =>
            u.username === username &&
            u.password === password
    );

    if (user) {

        res.json({
            success: true,
            message: "Login success"
        });

    } else {

        res.json({
            success: false,
            message: "Invalid credentials"
        });
    }

});

// ======================
// 🔔 SAVE FCM TOKEN
// ======================

app.post("/save-token", (req, res) => {

    const { token } = req.body;

    if (!token) {

        return res.status(400).json({
            message: "Token missing ❌"
        });
    }

    if (!tokens.includes(token)) {

        tokens.push(token);

        console.log("Token Saved ✅");
    }

    console.log(tokens);

    res.json({
        message: "Token saved ✅"
    });

});

// ======================
// 🔔 SEND MANUAL NOTIFICATION
// ======================

app.post("/send-notification", async (req, res) => {

    const { title, body } = req.body;

    try {

        for (let token of tokens) {

            await admin.messaging().send({

                token,

                notification: {
                    title,
                    body
                }

            });

        }

        res.send("Notification Sent ✅");

    } catch (error) {

        console.log(error);

        res.status(500).send("Notification Failed ❌");
    }

});

// ======================
// ➕ ADD DEADLINE
// ======================

app.post("/add", async (req, res) => {

    const { title, date } = req.body;

    if (!title || !date) {

        return res.json({
            message: "Missing fields ❌"
        });
    }

    deadlines.push({
        title,
        date
    });

    console.log(deadlines);

    // 🔔 SEND INSTANT NOTIFICATION

    try {

        for (let token of tokens) {

            await admin.messaging().send({

                token,

                notification: {
                    title: "New Task Added 📌",
                    body: `${title} due on ${date}`
                }

            });

        }

    } catch (err) {

        console.log(err.message);
    }

    res.json({
        message: "Task Added ✅"
    });

});

// ======================
// 📥 GET DEADLINES
// ======================

app.get("/deadlines", (req, res) => {

    res.json(deadlines);

});

// ======================
// ❌ DELETE DEADLINE
// ======================

app.delete("/delete/:id", (req, res) => {

    deadlines.splice(req.params.id, 1);

    res.json({
        message: "Deleted ✅"
    });

});

// ======================
// ✏️ UPDATE DEADLINE
// ======================

app.put("/update/:id", (req, res) => {

    const { title, date } = req.body;

    deadlines[req.params.id] = {
        title,
        date
    };

    res.json({
        message: "Updated ✅"
    });

});

// ======================
// ⏰ AUTOMATIC DEADLINE CHECKER
// ======================

cron.schedule("* * * * *", async () => {

    console.log("Checking deadlines...");

    const today = new Date();

    for (let task of deadlines) {

        const deadlineDate = new Date(task.date);

        const diffTime =
            deadlineDate - today;

        const diffDays =
            Math.ceil(
                diffTime /
                (1000 * 60 * 60 * 24)
            );

        console.log(task.title, diffDays);

        // ======================
        // UNIQUE KEYS
        // ======================

        const reminderKey =
            task.title + "-tomorrow";

        const overdueKey =
            task.title + "-overdue";

        // ======================
        // 🔔 TOMORROW REMINDER
        // ======================

        if (
            diffDays === 1 &&
            !notifiedTasks.includes(reminderKey)
        ) {

            notifiedTasks.push(reminderKey);

            for (let token of tokens) {

                try {

                    await admin.messaging().send({

                        token,

                        notification: {
                            title: "Deadline Reminder ⏰",
                            body: `${task.title} is due tomorrow!`
                        }

                    });

                    console.log("Tomorrow Reminder Sent ✅");

                } catch (err) {

                    console.log(err.message);
                }

            }

        }

        // ======================
        // 🔴 OVERDUE TASK
        // ======================

        if (
            diffDays < 0 &&
            !notifiedTasks.includes(overdueKey)
        ) {

            notifiedTasks.push(overdueKey);

            for (let token of tokens) {

                try {

                    await admin.messaging().send({

                        token,

                        notification: {
                            title: "Task Overdue 🚨",
                            body: `${task.title} deadline is over!`
                        }

                    });

                    console.log("Overdue Notification Sent ✅");

                } catch (err) {

                    console.log(err.message);
                }

            }

        }

    }

});

// ======================
// 🚀 START SERVER
// ======================

const PORT = 5000;

app.listen(PORT, () => {

    console.log(`🚀 Server running on http://localhost:${PORT}`);

});