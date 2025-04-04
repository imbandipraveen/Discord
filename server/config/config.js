module.exports = {
  port: process.env.PORT,
  mangoUrl: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpiration: 24,
  user: process.env.user,
  password: process.env.password,
  defaultProfile: process.env.default_profile_pic,
};
