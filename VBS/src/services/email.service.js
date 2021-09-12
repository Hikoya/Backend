const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASSWORD } = require("../config");

const transporter = nodemailer.createTransport({
  port: 465,
  host: "smtp.gmail.com",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
  secure: true,
});

const sendEmailHelper = async (message, transport) => {
  const mailSent = await transport.sendMail(message);

  return mailSent.messageId;
};

const sendEmail = async (to, subject, text, html) => {
  const mailData = {
    from: "KEVII VBS <keviiweb2@gmail.com>", // sender address
    to: to, // list of receivers
    subject: subject,
    text: text,
    html: html,
  };
  const messagesent = await sendEmailHelper(mailData, transporter);

  return messagesent;
};

module.exports = { sendEmail };
