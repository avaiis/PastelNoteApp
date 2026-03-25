const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register endpoint from controllers
router.post('/register', authController.register);

// Login endpoint from controllers
router.post('/login', authController.login);

module.exports = router;