const express = require('express');
const router = express.Router();
const ticketController = require('../controller/ticketController');

router.get('/', ticketController.getTickets);

router.get('/create', (_, res) => res.render('tickets/create'));
router.post('/create', ticketController.createTicket);

module.exports = router;