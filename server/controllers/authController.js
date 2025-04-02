const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/email");
const { generateOTP, generateUserTag } = require("../utils/helpers");
const {
  validateEmail,
  validatePassword,
  validateUsername,
} = require("../utils/validation");

exports.signup = async (req, res) => {
  try {
    const { email, username, password, dob } = req.body;

    // Validate all inputs using our validation utilities
    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({
        message: emailError,
        status: 400,
      });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({
        message: passwordError,
        status: 400,
      });
    }

    const usernameError = validateUsername(username);
    if (usernameError) {
      return res.status(400).json({
        message: usernameError,
        status: 400,
      });
    }

    if (!dob) {
      return res.status(400).json({
        message: "Date of birth is required",
        status: 400,
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.authorized) {
      return res.status(400).json({
        message: "Email already exists",
        status: 400,
      });
    }

    // Check if username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
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
      password, // In production, hash this password
      dob,
      profile_pic: process.env.default_profile_pic,
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

    res.status(201).json({
      message: "User created successfully",
      status: 201,
    });
  } catch (error) {
    console.error("Signup error:", error);
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
      return res.status(400).json({
        error: emailError,
        status: 400,
      });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({
        error: passwordError,
        status: 400,
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(442).json({
        error: "Invalid username or password",
        status: 442,
      });
    }

    // Verify password
    // Note: In production, you should use bcrypt to compare passwords
    if (password !== user.password) {
      return res.status(442).json({
        error: "Invalid username or password",
        status: 442,
      });
    }

    // Check if user is authorized (email verified)
    if (!user.authorized) {
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
      process.env.JWT_SECRET
    );

    res.status(201).json({
      message: "You are verified",
      status: 201,
      token,
    });
  } catch (error) {
    console.error("Signin error:", error);
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

      return res.status(442).json({
        error: "OTP expired, new OTP sent",
        status: 442,
      });
    }

    // Verify OTP
    if (otp_value === user.verification[0].code) {
      // Update user authorization status
      await User.findOneAndUpdate({ email }, { authorized: true });

      res.status(201).json({
        message: "Congrats you are verified now",
        status: 201,
      });
    } else {
      res.status(432).json({
        error: "Incorrect password",
        status: 432,
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
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

    res.status(200).json({
      message: "New OTP sent successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      error: "Internal server error",
      status: 500,
    });
  }
};
