
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, default: "text" }
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);
