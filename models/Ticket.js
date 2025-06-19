const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assigned_agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: String,
    title: String,
    description: String,
    status: {
        type: String,
        enum: ["Open", "In Progress", "Resolved"],
        default: "Open",
    },
    github_issue_url: String,
    github_issue_id: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Ticket", ticketSchema);
