const { json } = require("body-parser");
const jsonwebtoken = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const expiry = process.env.JWT_EXPIRY;

let blackList = [];

const jwt = {
  // Generate Token
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
  
  generateAdminToken(userId) {
    return jsonwebtoken.sign(
      { userId: userId + " Admin" },
      secretKey,
      {
        expiresIn: expiry,
      }
    );
  },

  // Reset Token for password reset
  generateStylistResetToken(userId) {
    return jsonwebtoken.sign(
      { userId: userId + " Stylist-Reset" },
      secretKey,
      {
        expiresIn: expiry,
      }
    );
  },
  generateAdminResetToken(userId) {
    return jsonwebtoken.sign(
      { userId: userId + " Admin-Reset" },
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

  // helper function to decode token
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
    blackList.push( token );
    setTimeout(() => {
      blackList = blackList.shift();
    }, 2 * 60 * 60 * 1000);
  },

  checkBlackList(token) {
    return blackList.includes(token);
  },
};

module.exports = jwt;
