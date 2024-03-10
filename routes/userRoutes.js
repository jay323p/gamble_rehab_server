const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  loginStatus,
  logoutUser,
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/loginStatus', loginStatus);
router.get('/logout', logoutUser);

module.exports = router;
