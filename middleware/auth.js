const mongoose = require('mongoose');

exports.ensureAuthenticated = (req, res, next) => {
  const user = req.session?.user;

  if (user && mongoose.isValidObjectId(user.id)) {
    return next();
  }

  req.flash('error_msg', 'Login required');
  res.redirect('/auth/login');
};

exports.ensureAgent = (req, res, next) => {
  const user = req.session?.user;

  if (
    user &&
    mongoose.isValidObjectId(user.id) &&
    typeof user.role === 'string' &&
    user.role.toLowerCase() === 'agent'
  ) {
    return next();
  }

  req.flash('error_msg', 'Agent access only');
  res.redirect('/');
};

exports.ensureAdmin = (req, res, next) => {
  const user = req.session?.user;

  if (
    user &&
    mongoose.isValidObjectId(user.id) &&
    typeof user.role === 'string' &&
    user.role.toLowerCase() === 'admin'
  ) {
    return next();
  }

  req.flash('error_msg', 'Admin access only');
  res.redirect('/');
};