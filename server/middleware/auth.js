import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['x-auth-token'];
    const verified = jwt.verify(authHeader, process.env.ACCESS_TOKEN);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'not right', status: 400 });
  }
}; 