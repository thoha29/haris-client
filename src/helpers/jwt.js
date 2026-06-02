const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "secret_payroll";

// bikin token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    SECRET_KEY,
    { expiresIn: "1d" } // token berlaku 1 hari
  );
};

// verifikasi token (nanti dipakai middleware)
const verifyAccessToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
};
