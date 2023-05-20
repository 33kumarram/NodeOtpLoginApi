const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
     otp: {
        type:String,
     },
     otp_generated_at: {
        type: Date
     },
     wrong_otp_submitted_at: {
        type: Date
     },
     wrong_attempts:{
        type: Number,
        default: 0
     }
})

const users = mongoose.model('users', userSchema)

module.exports = users