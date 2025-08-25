const express = require('express');
const router = express.Router();
const { createClaim } = require('../controllers/claimController');

// POST: Create a new damage/claim
router.post('/', createClaim);

module.exports = router;