const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get("/info", auth, userController.userDetails);

module.exports = router;