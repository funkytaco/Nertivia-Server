const User = require('../../models/users');
const BannedIPs = require("../../models/BannedIPs");
import config from '../../config'
import nodemailer from 'nodemailer';
import validate from 'deep-email-validator'
import blacklistArr from '../../emailBlacklist.json'
const transporter = nodemailer.createTransport({
  service: config.nodemailer.service,
  auth: {
    user: config.nodemailer.user,
    pass: config.nodemailer.pass
  }
})

module.exports = async (req, res, next) => {

  req.session.destroy()
  let { username, email, password } = req.body;

  username = username.replace(
    /[\xA0\x00-\x09\x0B\x0C\x0E-\x1F\x7F\u{2000}-\u{200F}\u{202F}\u{2800}\u{17B5}\u{17B5}\u{17B5}\u{17B5}\u{17B5}\u{17B5}]/gu,
    ""
  );
    // check if result is empty
    if (!username.trim()) {
    return res
    .status(403)
    .json({ errors: [{ param: "username", msg: "Username is required." }] });
  }


  // check if ip is banned
  const ipBanned = await BannedIPs.exists({ip: req.userIP});
  if (ipBanned) {
    return res
    .status(401)
    .json({
      errors: [{ msg: "IP is banned.", param: "email" }]
    });
  }


  // check if the email really exists
  const emailExists = await validate({email, validateTypo: false, validateSMTP: false});

  if (!emailExists.valid) {
    return res.status(403).json({
      errors: [{param: "email", msg: `Email is Invalid (${emailExists.reason}).`}]})
  }
  // check if email is blacklisted
  const emailBlacklisted = blacklistArr.find(d => d === email.split("@")[1].trim().toLowerCase())
  if (emailBlacklisted) {
    return res.status(403).json({
      errors: [{param: "email", msg: "Email is blacklisted."}]
    });
  }  
  // Check if there is a user with the same email in the db
  const foundUser = await User.findOne({ email: email.toLowerCase() });
  if (foundUser) { 
    return res.status(403).json({ 
        status: false,
        errors: [{param: "email", msg: "Email is already used."}]
    });
  }

  const newUser = new User({ username, email: email.toLowerCase(), password, ip: req.userIP });
  const created = await newUser.save();

  // send email
  const mailOptions = {
    from: config.nodemailer.from,
    to: email.toLowerCase().trim(), 
    subject: 'Nertivia - Confirmation Code',
    html: `<p>Your confirmation code is: <strong>${created.email_confirm_code}</strong></p>`
  };

  transporter.sendMail(mailOptions, async (err, info) => {
    if (err) {
      await User.deleteOne({_id: created._id})
      return res.status(403).json({
        errors: [{param: "other", msg: "Something went wrong while sending email. Try again later."}]
      });
    }
    // Respond with user
    res.send({
      message: "confirm email"
    })
  })
}