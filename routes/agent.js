const express = require('express');

const {
  getAssignedTickets,
  viewTicket,
  postReply,
  updateStatus,
} = require('../controller/agentController.js');
const { ensureAuthenticated, ensureAgent } = require('../middleware/auth.js');

const router = express.Router();

router.use(ensureAuthenticated, ensureAgent);

router.get('/tickets', getAssignedTickets);
router.get('/tickets/:id', viewTicket);
router.post('/tickets/:id/reply', postReply);
router.post('/tickets/:id/status', updateStatus);

module.exports = router;