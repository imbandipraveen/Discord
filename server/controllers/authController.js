const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/email");
const { generateOTP, generateUserTag } = require("../utils/helpers");
const {
  validateEmail,
  validatePassword,
  validateUsername,
} = require("../utils/validation");
const bcrypt = require("bcrypt");
const config = require("../config/config");
const infoLogger = require("../utils/logger");

exports.signup = async (req, res) => {
  try {
    const { email, username, password, dob } = req.body;

    // Validate all inputs using our validation utilities
    const emailError = validateEmail(email);
    if (emailError) {
      infoLogger.error("Signup failed due to invalid email", { reqMethod: req.method, reqUrl: req.originalUrl, email });
      return res.status(400).json({
        message: emailError,
        status: 400,
      });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      infoLogger.error("Signup failed due to invalid password", { reqMethod: req.method, reqUrl: req.originalUrl, email });
      return res.status(400).json({
        message: passwordError,
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usernameError = validateUsername(username);
    if (usernameError) {
      infoLogger.error("Signup failed due to invalid username", { reqMethod: req.method, reqUrl: req.originalUrl, email });
      return res.status(400).json({
        message: usernameError,
        status: 400,
      });
    }

    if (!dob) {
      infoLogger.error("Signup failed due to missing date of birth", { reqMethod: req.method, reqUrl: req.originalUrl, email });
      return res.status(400).json({
        message: "Date of birth is required",
        status: 400,
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.authorized) {
      infoLogger.error("Signup failed - email already exists", { reqMethod: req.method, reqUrl: req.originalUrl, email });
      return res.status(400).json({
        message: "Email already exists",
        status: 400,
      });
    }

    // Check if username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      infoLogger.error("Signup failed - username already exists", { reqMethod: req.method, reqUrl: req.originalUrl, email });
      return res.status(400).json({
        message: "Username already exists",
        status: 400,
      });
    }

    const otp = generateOTP();
    const tag = await generateUserTag(username);

    // Create new user
    const user = new User({
      username,
      tag,
      email,
      password: hashedPassword,
      dob,
      profile_pic: config.defaultProfile,
      authorized: false,
      verification: [
        {
          timestamp: Date.now(),
          code: otp,
        },
      ],
    });

    await user.save();
    await sendVerificationEmail(otp, email, username);

    infoLogger.info("User created successfully", { reqMethod: req.method, reqUrl: req.originalUrl, email });

    res.status(201).json({
      message: "User created successfully",
      status: 201,
    });
  } catch (error) {
    console.error("Signup error:", error);
    infoLogger.error("Signup error", { reqMethod: req.method, reqUrl: req.originalUrl, message: error.message, stack: error.stack });

    if (error.code === 11000) {
      // MongoDB duplicate key error
      if (error.keyPattern.username) {
        return res.status(400).json({
          message: "Username already exists",
          status: 400,
        });
      }
      if (error.keyPattern.email) {
        return res.status(400).json({
          message: "Email already exists",
          status: 400,
        });
      }
    }
    res.status(500).json({
      message: "Internal server error",
      status: 500,
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    const emailError = validateEmail(email);
    if (emailError) {
      infoLogger.error("Signin failed due to invalid email", { reqMethod: req.method, reqUrl: req.originalUrl, email });
      return res.status(400).json({
        error: emailError,
        status: 400,
      });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      infoLogger.error("Signin failed due to invalid password", { reqMethod: req.method, reqUrl: req.originalUrl, email });
      return res.status(400).json({
        error: passwordError,
        status: 400,
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      infoLogger.error("Signin failed - user not found", { reqMethod: req.method, reqUrl: req.originalUrl, email });
      return res.status(442).json({
        error: "Invalid username or password",
        status: 442,
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      infoLogger.error("Signin failed - invalid credentials", { reqMethod: req.method, reqUrl: req.originalUrl, email });
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Check if user is authorized (email verified)
    if (!user.authorized) {
      infoLogger.error("Signin failed - user not authorized", { reqMethod: req.method, reqUrl: req.originalUrl, email });
      return res.status(422).json({
        error: "You are not verified yet",
        status: 422,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        tag: user.tag,
        profile_pic: user.profile_pic,
      },
      config.jwtSecret
    );

    infoLogger.info("User signed in successfully", { reqMethod: req.method, reqUrl: req.originalUrl, email });

    res.status(201).json({
      message: "You are verified",
      status: 201,
      token,
    });
  } catch (error) {
    console.error("Signin error:", error);
    infoLogger.error("Signin error", { reqMethod: req.method, reqUrl: req.originalUrl, message: error.message, stack: error.stack});

    res.status(500).json({
      error: "Internal server error",
      status: 500,
    });
  }
};

exports.verify = async (req, res) => {
  try {
    const { email, otp_value } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      infoLogger.error("Verification failed - user not found", { reqMethod: req.method, reqUrl: req.originalUrl, email });
      return res.status(404).json({
        error: "User not found",
        status: 404,
      });
    }

    const currentTime = Date.now();
    const otpTimestamp = user.verification[0].timestamp;
    const OTP_EXPIRY_TIME = 120000; // 2 minutes in milliseconds

    // Check if OTP is expired
    if (currentTime - otpTimestamp > OTP_EXPIRY_TIME) {
      // Generate new OTP and update timestamp
      const newOTP = generateOTP();
      await User.findOneAndUpdate(
        { email },
        {
          verification: [
            {
              timestamp: currentTime,
              code: newOTP,
            },
          ],
        }
      );

      await sendVerificationEmail(newOTP, email, user.username);

      infoLogger.info("OTP expired, new OTP sent", { reqMethod: req.method, reqUrl: req.originalUrl, email });

      return res.status(442).json({
        error: "OTP expired, new OTP sent",
        status: 442,
      });
    }

    // Verify OTP
    if (otp_value === user.verification[0].code) {
      // Update user authorization status
      await User.findOneAndUpdate({ email }, { authorized: true });

      infoLogger.info("User successfully verified", { reqMethod: req.method, reqUrl: req.originalUrl, email });

      res.status(201).json({
        message: "Congrats you are verified now",
        status: 201,
      });
    } else {
      infoLogger.error("Verification failed - incorrect OTP", { reqMethod: req.method, reqUrl: req.originalUrl, email });
      res.status(432).json({
        error: "Incorrect password",
        status: 432,
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    infoLogger.error("Verification error", { reqMethod: req.method, reqUrl: req.originalUrl, message: error.message, stack: error.stack });

    res.status(500).json({
      error: "Internal server error",
      status: 500,
    });
  }
};

// Helper method to resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      infoLogger.error("Resend OTP failed - user not found", { reqMethod: req.method, reqUrl: req.originalUrl, email });
      return res.status(404).json({
        error: "User not found",
        status: 404,
      });
    }

    const newOTP = generateOTP();

    await User.findOneAndUpdate(
      { email },
      {
        verification: [
          {
            timestamp: Date.now(),
            code: newOTP,
          },
        ],
      }
    );

    await sendVerificationEmail(newOTP, email, user.username);

    infoLogger.info("New OTP sent successfully", { reqMethod: req.method, reqUrl: req.originalUrl, email });

    res.status(200).json({
      message: "New OTP sent successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    infoLogger.error("Resend OTP error", { reqMethod: req.method, reqUrl: req.originalUrl, message: error.message, stack: error.stack });

    res.status(500).json({
      error: "Internal server error",
      status: 500,
    });
  }
};
