const jwt = require("jsonwebtoken");
const config = require("../config/config");

exports.authToken = async (req, res, next) => {
  try {
    const token = req.headers["x-auth-token"];
    console.log(token);
    if (!token) {
      return res.status(401).json({
        message: "No token provided",
        status: 401,
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    console.log(decoded);
    next();
  } catch (err) {
    res.status(400).json({
      message: "Invalid token",
      status: 400,
    });
  }
};
