const { json } = require("body-parser");
const jsonwebtoken = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const expiry = process.env.JWT_EXPIRY;

const jwt = {
  generateToken(userId, type) {
    return jsonwebtoken.sign({ userId: userId + " " + type }, secretKey, {
      expiresIn: expiry,
    });
  },

  decodeToken(token) {
    return jsonwebtoken.verify(token, secretKey, (err, decoded) => {
      if (err) {
        // console.error("VerifyToken Error: ", err);
        return { status: false, values: null };
      }
      return {
        status: true,
        values: {
          userId: decoded.userId.split(" ")[0],
          type: decoded.userId.split(" ")[1],
        },
      };
    });
  },
};

module.exports = jwt;
