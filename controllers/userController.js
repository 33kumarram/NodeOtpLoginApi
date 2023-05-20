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
    throw new Error("Please enter your email id");
  }

  const existing_mail = await users.findOne({ email });
  let wrong_attempts;

  if (existing_mail && existing_mail.wrong_attempts >= 5) {
    // incase if user made subsequently five wrong attemps it will block him for one hour
    if (Date.now() - new Date(existing_mail.wrong_otp_submitted_at).getTime() <=3600000) {
      let try_after_minutes = 60 -Math.floor((Date.now() - new Date(existing_mail.wrong_otp_submitted_at).getTime()) / 60000);
      res.status(400);
      throw new Error(
        `You have entered five wrong otp please try again after ${try_after_minutes} minute`
      );
    } else {
      // if user came after one hour of five consecutive wrong attempts it will reset wrong attempts to 0 and unblock him
      wrong_attempts = 0;
    }
  }
  // it prevent user from regenerating otp within one minute of prvious otp 
  if( existing_mail&&Date.now() - new Date(existing_mail.otp_generated_at).getTime() <60000){
    let seconds = 60-Math.floor((Date.now() - new Date(existing_mail.otp_generated_at).getTime())/1000)
    res.status(400);
      throw new Error(`Wait for ${seconds} second and then try to resend otp`);
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
      subject: "Log In OTP", // Subject line
      text: `Dear user your six digit OTP to login to Ramesh app is ${otp}. Don't share it with anyone`, // plain text body
      // html: "<b>Hello world?</b>", // html body
    });
    
    // if user is not unblocked by us then it will not change wrong attempts value
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
        upsert: true,     //to create new collection if it don't find collection for mentioned mail id
      }
    );
    // console.log("Message sent: %s", info.messageId);
    res.status(201).json(`OTP sent to the mail Id: ${email}`);
  } catch (err) {
    console.log(err);
    res.status(400);
    throw new Error("Error occurred while sending OTP");
  }
});

const logIn = asyncHandler(async function (req, res) {
  const { email, otp } = req.body;
  if (!email || !otp || otp === "") {
    res.status(400);
    throw new Error("Email Id or OTP missing from params");
  }

  const user = await users.findOne({ email });

  if (!user || !user.otp) {
    res.status(400);
    throw new Error("OTP not generated yet");
  }
  
  // incase if user submitted subsequently five wrong otp it will block him for one hour
  if (user.wrong_attempts >= 5 &&Date.now() - new Date(user.wrong_otp_submitted_at).getTime() <=3600000) {
    let try_after_minutes =60 -Math.floor((Date.now() - new Date(user.wrong_otp_submitted_at).getTime()) / 60000);
    res.status(400);
    throw new Error(
      `You have entered five wrong otp please try again after ${try_after_minutes} minute`
    );
  }

  if (`${otp}` === `${user.otp}`) {
    //check whether otp has been expired or not
    if (Date.now() - new Date(user.otp_generated_at).getTime() >= 300000) {
      res.status(400);
      throw new Error("OTP has been expired");
    }
    // if not expird then remove otp, equate wrong attempts to 0 and send jsonwebtoken in response
    await users.findByIdAndUpdate(user._id, { otp: "", wrong_attempts: 0 });
    res.status(201).json({
      token: generateToken(user._id),
    });
  } else {
    // increase wrong attemp and update wrong otp submission time when user submit a invalid otp
    let updated_user = await users.findByIdAndUpdate(user._id, {
      $inc: { wrong_attempts: 1 },
      wrong_otp_submitted_at:new Date()
    });
    res.status(400);
    throw new Error("Invalid OTP");
  }
});

module.exports = {
  sendOtp,
  logIn,
};
