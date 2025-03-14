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

var mailOptions = {
  from: "salonflow123@gmail.com",
  to: "tanjianfeng01@gmail.com",
  subject: "Sending Email using Node.js",
  text: "That was easy!",
};

const sendMessage = async () => {
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendMessage;
