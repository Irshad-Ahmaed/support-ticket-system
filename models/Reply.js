const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Reply', replySchema);