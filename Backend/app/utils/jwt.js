const { json } = require("body-parser");
const jsonwebtoken = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const expiry = process.env.JWT_EXPIRY;

let blackList = [];

const jwt = {
  generateCustomerToken(userId) {
    return jsonwebtoken.sign({ userId: userId + " Customer" }, secretKey, {
      expiresIn: expiry,
    });
  },
  generateStylistToken(userId) {
    return jsonwebtoken.sign({ userId: userId + " Stylist" }, secretKey, {
      expiresIn: expiry,
    });
  },
  generateStylistManagerToken(userId) {
    return jsonwebtoken.sign(
      { userId: userId + " StylistManager" },
      secretKey,
      {
        expiresIn: expiry,
      }
    );
  },

  generateCustomerResetToken(userId) {
    return jsonwebtoken.sign(
      { userId: userId + " Customer-Reset" },
      secretKey,
      {
        expiresIn: expiry,
      }
    );
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

  addToBlackList(token) {
    blackList.push(token);
  },

  checkBlackList(token) {
    return blackList.includes(token);
  },
};

module.exports = jwt;
