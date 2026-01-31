const express = require('express');
const router = express.Router();

// Test route to prevent crash
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Rental routes working'
  });
});

module.exports = router;
