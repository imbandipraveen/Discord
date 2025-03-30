const mongoose = require("mongoose");
const { isEmail } = require("validator");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    tag: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: [isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [7, "Password must be at least 7 characters long"],
    },
    dob: {
      type: String,
      required: [true, "Date of birth is required"],
    },
    profile_pic: {
      type: String,
      default: "",
    },
    authorized: {
      type: Boolean,
      default: false,
    },
    servers: [
      {
        server_name: String,
        server_pic: String,
        server_role: String,
        server_id: String,
      },
    ],
    incoming_reqs: [
      {
        id: String,
        username: String,
        profile_pic: String,
        tag: String,
        status: String,
      },
    ],
    outgoing_reqs: [
      {
        id: String,
        username: String,
        profile_pic: String,
        tag: String,
        status: String,
      },
    ],
    friends: [
      {
        id: String,
        username: String,
        profile_pic: String,
        tag: String,
      },
    ],
    blocked: [
      {
        id: String,
        username: String,
        profile_pic: String,
        tag: String,
      },
    ],
    verification: [
      {
        timestamp: Number,
        code: String,
      },
    ],

    invites: [
      {
        server_id: String,
        invite_code: String,
        timestamp: String,
      },
    ],
  },
  { timestamps: true }
);

userSchema.methods.validatePassword = function (password) {
  return password.length >= 7;
};

module.exports = mongoose.model("User", userSchema);
