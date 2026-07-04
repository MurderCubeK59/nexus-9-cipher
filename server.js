const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 server-side password
const PASSWORD = "ZhouIsASillyGF:D";

// active sessions
const sessions = {};

app.post("/login", (req, res) => {
    const { pass } = req.body;

    if (pass !== PASSWORD) {
        return res.json({ ok: false });
    }

    const token = crypto.randomBytes(16).toString("hex");

    sessions[token] = Date.now();

    res.json({ ok: true, token });
});

app.post("/verify", (req, res) => {
    const { token } = req.body;

    if (!sessions[token]) {
        return res.json({ ok: false });
    }

    // expire after 10 minutes
    if (Date.now() - sessions[token] > 600000) {
        delete sessions[token];
        return res.json({ ok: false, expired: true });
    }

    res.json({ ok: true });
});

app.listen(3000, () => {
    console.log("NEXUS server running on port 3000");
});