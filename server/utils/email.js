const nodemailer = require("nodemailer");
const config = require("../config/config");
const { VERIFICATION_EMAIL_TEMPLATE } = require("./emailTemplate");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    user: config.user,
    pass: config.password,
  },
});

exports.sendVerificationEmail = async (otp, email, username) => {
  const htmlContent = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    otp
  ).replace("{username}", username);

  const mailOptions = {
    from: config.user,
    to: email,
    subject: "Email for Verification",
    text: `Hello ${username},
You registered an account on Riscol - Discord Clone. Here is your OTP for verification: ${otp}
Kind Regards,  
Riscol`,
    html: htmlContent,
    category: "Email Verification",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};
