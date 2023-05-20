const generateOtp = ()=>{
   let  random_num = Math.round(Math.random()*100000)
   let otp = random_num + 100000 // to get six digit fixed length otp 
    return otp
}

module.exports = generateOtp