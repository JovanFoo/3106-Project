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
    html: `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Hello ${name},</h2>
    <p>We received a request to reset the password for your <strong>Buzz Book®</strong> account.</p>
    <p>If you did not request this, you can safely ignore this email.</p>
    <p>Otherwise, click the button below to reset your password:</p>

    <a href="${process.env.CLIENT_URL}/reset-password/${token}" 
       style="
         display: inline-block;
         padding: 12px 24px;
         margin: 10px 0;
         background-color: #007bff;
         color: white;
         text-decoration: none;
         border-radius: 5px;
         font-weight: bold;
       ">
      Reset Password
    </a>

    <p>This link will expire in 60 minutes. If it does, you’ll need to request a new one.</p>

    <p>Thanks,<br>The Buzz Book® Team</p>
  </div>
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
const cancelledAppointment = async (to, name, date) => {
  console.log("emailService > cancelledAppointment");
  console.log("to", to);
  console.log("name", name);
  console.log("date", date);
  var mailOptions = {
    from: process.env.NODE_MAILER_EMAIL,
    to: to,
    subject: `Cancelled Appointment`,
    html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <p>Dear ${name},</p>

    <p>We hope this message finds you well.</p>

    <p>
      We regret to inform you that your upcoming appointment scheduled for 
      <strong>${date}</strong> has been canceled due to unforeseen circumstances.
      We sincerely apologize for any inconvenience this may cause.
    </p>

    <p>
      To ensure you receive the service you need, we kindly ask you to reschedule your appointment at your earliest convenience.
    </p>

    <p>
      If you have any questions or need assistance with rescheduling, please don’t hesitate to reach out to us directly.
      We’re here to help.
    </p>

    <p>Thank you for your understanding and continued support.</p>

    <p>Warm regards,<br>
    <strong>Buzz Book® Team</strong></p>
  </div>
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
