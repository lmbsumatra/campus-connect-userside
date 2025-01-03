const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "jione.capstone@gmail.com",
    pass: "exuh vilf tkgp yvyg",
  },
});

module.exports = transporter;
