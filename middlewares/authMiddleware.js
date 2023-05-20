const jwt = require('jsonwebtoken')
const users = require('../models/userModel')
const asyncHandler = require('express-async-handler')

const authorize = asyncHandler(async function (req, res, next) {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            // append user without password in the req
            req.user = await users.findById(decoded.id).select('-password')
            next()
        } catch (error) {
            res.status(401)
            throw new Error('Authorization failed')
        }
    }

    if (!token) {
        res.status(401)
        throw new Error('Authorization token not found')
    }
})

module.exports = authorize