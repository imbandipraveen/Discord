import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { generateOTP, sendMail, generateTag } from '../utils/helpers.js';
import { isUsernameAvailable, updateUserCredentials } from '../services/authService.js';

dotenv.config();

export const signup = async (req, res) => {
  const { email, username, password, dob } = req.body;
  const authorized = false;

  try {
    const response = await signup(email, username, password, dob);

    if (response.status === 204 || response.status === 400 || response.status === 202) {
      return res.status(response.status).json({ message: response.message, status: response.status });
    }

    if (response.message === true) {
      const otp = generateOTP();
      const usernameResponse = await isUsernameAvailable(username);
      const finalTag = usernameResponse.finalTag;

      const newUser = new User({
        username,
        tag: finalTag,
        profile_pic: process.env.default_profile_pic,
        email,
        password,
        dob,
        authorized,
        verification: [{
          timestamp: Date.now(),
          code: otp
        }]
      });

      sendMail(otp, email, username);
      await newUser.save();
      return res.status(201).json({ message: 'data saved', status: 201 });
    }

    if (response.message === 'not_TLE' || response.message === 'TLE_2') {
      const usernameResponse = await isUsernameAvailable(username);
      const tag = usernameResponse.finalTag;
      const accountCreds = { $set: { username, tag, email, password, dob, authorized } };
      const otp = response.message === 'not_TLE' ? response.otp : generateOTP();

      const newResponse = await updateUserCredentials(accountCreds, otp, email, username);
      return res.status(newResponse.status).json({ message: newResponse.message, status: newResponse.status });
    }

    if (response.message === 'not_TLE_2' || response.message === 'TLE') {
      const tag = response.tag;
      let otp, accountCreds;

      if (response.message === 'not_TLE_2') {
        accountCreds = { $set: { username, tag, email, password, dob, authorized } };
        otp = response.otp;
      } else {
        otp = generateOTP();
        accountCreds = {
          $set: {
            username,
            email,
            tag,
            password,
            dob,
            authorized,
            verification: [{
              timestamp: Date.now(),
              code: otp
            }]
          }
        };
      }

      const newResponse = await updateUserCredentials(accountCreds, otp, email, username);
      return res.status(newResponse.status).json({ message: newResponse.message, status: newResponse.status });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(442).json({ error: 'invalid username or password', status: 442 });
    }

    if (password !== user.password) {
      return res.status(442).json({ error: 'invalid username or password', status: 442 });
    }

    if (!user.authorized) {
      return res.status(422).json({ error: 'you are not verified yet', status: 422 });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, tag: user.tag, profile_pic: user.profile_pic },
      process.env.ACCESS_TOKEN
    );

    return res.status(201).json({ message: 'you are verified', status: 201, token });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
};

export const verify = async (req, res) => {
  try {
    const { email, otp_value } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found', status: 404 });
    }

    const currentTimeStamp = user.verification[0].timestamp;
    if ((Date.now() - currentTimeStamp) < 120000) {
      if (otp_value === user.verification[0].code) {
        await User.updateOne({ email }, { $set: { authorized: true } });
        return res.status(201).json({ message: 'Congrats you are verified now', status: 201 });
      }
      return res.status(432).json({ error: 'incorrect password', status: 432 });
    }

    const newOtp = generateOTP();
    await User.updateOne(
      { email },
      {
        $set: {
          verification: [{
            timestamp: Date.now(),
            code: newOtp
          }]
        }
      }
    );

    sendMail(newOtp, email, user.username);
    return res.status(442).json({ error: 'otp changed', status: 442 });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ message: 'Internal server error', status: 500 });
  }
}; 