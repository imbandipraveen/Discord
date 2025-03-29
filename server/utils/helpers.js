import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    user: process.env.user,
    pass: process.env.password
  }
});

export const sendMail = (otp, mailValue, nameValue) => {
  const mailOptions = {
    from: process.env.user,
    to: mailValue,
    subject: 'Email for Verification',
    text: `Hello ${nameValue}
    You registered an account on Discord Clone, Here is your otp for verification - ${otp}
    Kind Regards, Samyak`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) { console.log(error); }
    else { console.log('Email sent: ' + info.response); }
  });
};

export const generateOTP = () => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < 4; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const generateTag = (countValue) => {
  const defaultValue = '0000';
  const countValueStr = countValue.toString();
  const countLength = countValueStr.length;
  const finalStr1 = defaultValue.slice(0, defaultValue.length - countLength);
  return finalStr1 + countValueStr;
}; 