const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const Users = require("../models/userModel");
const generateToken = require("../config/generateToken");
const generateOtp = require("../config/generateOtp");
const users = require("../models/userModel");

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Missing Email ID parameter. Please provide your Email ID to proceed");
  }

  const existing_mail = await users.findOne({ email });
  let wrong_attempts;

  if (existing_mail && existing_mail.wrong_attempts >= 5) {
    // incase if user made subsequently five wrong attemps, his/her account will be blocked for one hour.
    if (Date.now() - new Date(existing_mail.wrong_otp_submitted_at).getTime() <=3600000) {
      let try_after_minutes = 60 -Math.floor((Date.now() - new Date(existing_mail.wrong_otp_submitted_at).getTime()) / 60000);
      res.status(400);
      throw new Error(`Your account has been blocked due to five consecutive incorrect OTP entries. Please try again after ${try_after_minutes} minute`);
    } else {
      // If a user attempts five consecutive wrong OTPs and returns after one hour, the wrong attempt count will be reset to 0, and the user will be unblocked.
      wrong_attempts = 0;
    }
  }
  // it restrict user from regenerating otp within one minute of prvious otp 
  if( existing_mail&&Date.now() - new Date(existing_mail.otp_generated_at).getTime() <60000){
    let seconds = 60-Math.floor((Date.now() - new Date(existing_mail.otp_generated_at).getTime())/1000)
    res.status(400);
      throw new Error(`You are regenerating the OTP too quickly. Please try again after ${seconds} second`);
  }

  try {
    const otp = generateOtp();
    // create reusable transporter object
    let transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD, // generated app password
      },
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.EMAIL, // sender address
      to: email, // list of receivers
      subject: `Login OTP for Ramesh's App - Confidential Information`, // Subject line
      text: `Dear user, We have generated a six-digit OTP for you to log in to Ramesh's app. Your OTP is ${otp}. Please keep it confidential and do not share it with anyone`, // plain text body
      // html: "<b>Hello world?</b>", // html body
    });
    
    // If the wrong attempt count is not reset to 0, the system will save the current wrong attempt count for future reference.
    if (wrong_attempts!==0) {
      wrong_attempts = existing_mail?.wrong_attempts;
    }
    // save updated user values
    const save_details = await users.updateOne(
      {
        email: email,
      },
      {
        email: email,
        otp: otp,
        otp_generated_at: new Date(),
        wrong_attempts: wrong_attempts,
      },
      {
        upsert: true,     //If user details for the mentioned email ID is not found, a new user will be created.
      }
    );
    // console.log("Message sent: %s", info.messageId);
    res.status(201).json(`Login OTP sent to the mail Id: ${email}`);
  } catch (err) {
    console.log(err);
    res.status(400);
    throw new Error("Some error occurred while generating OTP. Please try again after some time");
  }
});

const logIn = asyncHandler(async function (req, res) {
  const { email, otp } = req.body;
  if (!email || !otp || otp === "") {
    res.status(400);
    throw new Error("Missing Email ID or OTP parameter. Please provide both your Email ID and OTP to proceed.");
  }

  const user = await users.findOne({ email });

  if (!user || !user.otp) {
    res.status(400);
    throw new Error("OTP details not found on the server. Please try regenerating the OTP again");
  }
  
  // If a user submits five consecutive wrong OTPs, he/she will be blocked for one hour.
  if (user.wrong_attempts >= 5 &&Date.now() - new Date(user.wrong_otp_submitted_at).getTime() <=3600000) {
    let try_after_minutes =60 -Math.floor((Date.now() - new Date(user.wrong_otp_submitted_at).getTime()) / 60000);
    res.status(400);
    throw new Error(`Your account has been blocked due to five consecutive incorrect OTP entries. Please try again after ${try_after_minutes} minute`);
  }

  if (`${otp}` === `${user.otp}`) {
    //It checks whether otp has been expired or not. OTP get expired after 5 minutes
    if (Date.now() - new Date(user.otp_generated_at).getTime() >= 300000) {
      res.status(400);
      throw new Error("The OTP has expired. Please request a new OTP.");
    }
    // If OTP is not expird then remove otp from saved data, equate wrong attempts to 0 and send jsonwebtoken in response
    await users.findByIdAndUpdate(user._id, { otp: "", wrong_attempts: 0 });
    res.status(201).json({
      token: generateToken(user._id),  
    });
  } else {
    // When a user submits an invalid OTP, the system increases the wrong attempt count and updates the timestamp of the last wrong OTP submission.
    let updated_user = await users.findByIdAndUpdate(user._id, {
      $inc: { wrong_attempts: 1 },
      wrong_otp_submitted_at:new Date()
    });
    let chances_left = 5-updated_user.wrong_attempts
    res.status(400);
    throw new Error(`Invalid OTP entered. You have ${chances_left} chances left. After that, your account will be blocked for one hour. Please make sure to enter the correct OTP.`);
  }
});

module.exports = {
  sendOtp,
  logIn,
};
