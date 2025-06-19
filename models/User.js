const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password_hash: String,
  role: { type: String, enum: ['customer', 'agent', 'admin'], default: 'customer' },
  created_at: { type: Date, default: Date.now },
});

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = mongoose.model('User', userSchema);