const shortid = require('shortid');
const Username = require('../models/Username');

exports.generateOTP = () => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < 4; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

exports.generateTag = (count) => {
  const defaultValue = '0000';
  const countStr = count.toString();
  const countLength = countStr.length;
  return defaultValue.slice(0, defaultValue.length - countLength) + countStr;
};

exports.generateUserTag = async (username) => {
  try {
    // Find existing username count
    let usernameDoc = await Username.findOne({ name: username });
    let count;

    if (!usernameDoc) {
      // Create new username entry
      usernameDoc = new Username({
        name: username,
        count: 1
      });
      await usernameDoc.save();
      count = 1;
    } else {
      // Increment existing username count
      count = usernameDoc.count + 1;
      await Username.updateOne(
        { name: username },
        { $set: { count } }
      );
    }

    // Generate tag using the count
    return this.generateTag(count);
  } catch (error) {
    console.error('Generate user tag error:', error);
    throw error;
  }
};

exports.generateInviteCode = () => {
  return shortid.generate();
}; 