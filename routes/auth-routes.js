const express = require('express');
const router = express.Router();

const {registerUser, loginUser, changePassword} = require('../controller/auth-controller');
const authMiddleware = require('../middleware/auth-middleware')

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/change-Password', authMiddleware,changePassword);


module.exports = router