const express = require('express');
const {
  adminDashboard,
  assignAgent,
  updateStatus,
  closeTicket
} = require('../controller/adminController');
const {
  ensureAuthenticated,
  ensureAdmin,
} = require('../middleware/auth');

const router = express.Router();

router.use(ensureAuthenticated, ensureAdmin);

router.get('/', adminDashboard);
router.post('/assign/:id', assignAgent);
router.post('/status/:id', updateStatus);
router.post('/close/:id', closeTicket);


module.exports = router;