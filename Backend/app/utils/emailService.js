var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_PASSWORD,
  },
  //   secure: false,
  tls: {
    rejectUnauthorized: false,
  },
});

const resetPassword = async (to, name, token) => {
  var mailOptions = {
    from: "salonflow123@gmail.com",
    to: to,
    subject: `Reset your password`,
    text: `Hey ${name}, We have received a request to reset your SalonFlow® account password. If you did not make this request, please ignore this email. Otherwise, you can reset your password using the link below. Reset Password: ${process.env.CLIENT_URL}/reset-password/${token}`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return false;
    } else {
      console.log("Email sent: " + info.response);
      return true;
    }
  });
};

module.exports = { resetPassword };
