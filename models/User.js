
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: String,
    surname: String,
    avatar: String
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
