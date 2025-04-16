var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
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
    from: process.env.NODE_MAILER_EMAIL,
    to: to,
    subject: `Reset your password`,
    text: `Hey ${name}, We have received a request to reset your Buzz Book® account password. If you did not make this request, please ignore this email. Otherwise, you can reset your password using the link below. Reset Password: ${process.env.CLIENT_URL}/reset-password/${token}`,
  };
  try {
    const result = await transporter.sendMail(mailOptions);
    if (result) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error.message);
    return false;
  }
};
const cancelledAppointment = async (to, name, date, time) => {
  var mailOptions = {
    from: process.env.NODE_MAILER_EMAIL,
    to: to,
    subject: `Cancelled Appointment`,
    text: `Dear ${name},

          We hope this message finds you well.

          We regret to inform you that your upcoming appointment scheduled for ${date} ${time} has been canceled due to unforeseen circumstances. We sincerely apologize for any inconvenience this may cause.

          To ensure you receive the service you need, we kindly ask you to reschedule your appointment at your earliest convenience. You can do so by booking online.

          If you have any questions or need assistance with rescheduling, please don’t hesitate to reach out to us directly. We’re here to help.

          Thank you for your understanding and continued support.

          Warm regards,
          Buzz Book® Team
          `,
  };
  try {
    const result = await transporter.sendMail(mailOptions);
    if (result) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

module.exports = { resetPassword, cancelledAppointment };
