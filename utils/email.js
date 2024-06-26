const nodemailer = require("nodemailer");

// // using Gmail service
// const transporter = nodemailer.createTransport({
//   service: "Gmail",

//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
//   // Activate in gmail "less secure app" option
// });

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2) Define email options
  const mailOptions = {
    from: "Sitha Sovannara <test@google.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

//  Default export
module.exports = sendEmail;
