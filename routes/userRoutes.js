const express = require('express')
const { sendOtp, logIn } = require('../controllers/userController')
const router = express.Router()

router.route('/sendotp').post(sendOtp)
router.route('/login').post(logIn)

module.exports = router
