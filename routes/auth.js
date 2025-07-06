
const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/", async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone is required" });

    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone });

    res.json(user);
});

module.exports = router;
