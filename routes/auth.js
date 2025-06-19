const express = require('express');
const router = express.Router();
const authController = require('../controller/authController.js');

router.get('/register', (_, res) => res.render('auth/register'));
router.post('/register', authController.register);

router.get('/login', (_, res) => res.render('auth/login'));
router.post('/login', authController.login);

router.get('/logout', authController.logout);

module.exports = router;