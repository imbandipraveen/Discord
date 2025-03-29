import User from '../models/User.js';
import { sendMail } from '../utils/helpers.js';

export const isUsernameAvailable = async (username) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      const newUser = new User({ username, count: 1 });
      await newUser.save();
      return { finalTag: generateTag(1) };
    }

    const newCount = user.count + 1;
    await User.updateOne({ username }, { $set: { count: newCount } });
    return { finalTag: generateTag(newCount) };
  } catch (error) {
    console.error('Username availability check error:', error);
    throw error;
  }
};

export const updateUserCredentials = async (accountCreds, otp, email, username) => {
  try {
    await User.updateOne({ email }, accountCreds);
    sendMail(otp, email, username);
    return { message: 'updated', status: 201 };
  } catch (error) {
    console.error('Update credentials error:', error);
    throw error;
  }
};

export const signup = async (email, username, password, dob) => {
  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      if (!username || !email || !password || !dob) {
        return { message: 'wrong input', status: 204 };
      }
      if (password.length < 7) {
        return { message: 'password length', status: 400 };
      }
      return { message: true };
    }

    if (existingUser.authorized) {
      return { message: 'user already exists', status: 202 };
    }

    const currentTimeStamp = existingUser.verification[0].timestamp;
    if (existingUser.username !== username && (Date.now() - currentTimeStamp) < 120000) {
      return { message: 'not_TLE', otp: existingUser.verification[0].code };
    }

    if (existingUser.username === username && (Date.now() - currentTimeStamp) < 120000) {
      return { message: 'not_TLE_2', otp: existingUser.verification[0].code, tag: existingUser.tag };
    }

    if (existingUser.username === username && (Date.now() - currentTimeStamp) > 120000) {
      return { message: 'TLE', tag: existingUser.tag };
    }

    if (existingUser.username !== username && (Date.now() - currentTimeStamp) > 120000) {
      return { message: 'TLE_2' };
    }
  } catch (error) {
    console.error('Signup service error:', error);
    throw error;
  }
}; 