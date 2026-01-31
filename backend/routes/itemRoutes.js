// DEPRECATED: itemRoutes.js
// This file is kept for historical reasons but is not used anywhere in the application.
// It is safe to remove this file in a future cleanup once confirmed.



//REMOVEFILE


const express = require('express');
const router = express.Router();

// Return 410 Gone to indicate this route is intentionally removed/unavailable
router.get('/', (req, res) => {
  res.status(410).json({ success: false, message: 'This route is deprecated and no longer available' });
});

module.exports = router;
