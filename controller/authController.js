const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('register', { errors: errors.array() });
  }

  const { username, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).render('register', { error: 'Email already in use' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    await User.create({ username, email, password_hash });
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).render('register', { error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && await user.validatePassword(password)) {
      req.session.regenerate((err) => {
        if (err) return res.status(500).send('Session error');
        req.session.user = { id: user._id, username: user.username };
        res.redirect('/tickets');
      });
    } else {
      res.status(401).render('login', { error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).render('login', { error: 'Server error' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};