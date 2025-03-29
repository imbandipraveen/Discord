import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
  port: process.env.PORT || 3090,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/discord-clone',
  jwtSecret: process.env.ACCESS_TOKEN || 'discord_clone_secret_key_2024',
  email: {
    user: process.env.user,
    password: process.env.password
  },
  defaultProfilePic: process.env.default_profile_pic || 'https://cdn.discordapp.com/embed/avatars/0.png',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },
  jwt: {
    expiresIn: '24h'
  },
  otp: {
    expiryTime: 120000 // 2 minutes in milliseconds
  }
};

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'ACCESS_TOKEN', 'user', 'password'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

export default config; 