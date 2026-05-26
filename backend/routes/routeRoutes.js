const express = require('express');
const { calculateRoute } = require('../controllers/routeController');

const router = express.Router();

// Wrapper for async route handlers to properly catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/', asyncHandler(calculateRoute));

module.exports = router;
