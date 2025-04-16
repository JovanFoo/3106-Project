const jsonwebtoken = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const expiry = process.env.JWT_EXPIRY;
const expiryRefresh = process.env.JWT_REFRESH_EXPIRY;

let blackList = [];

const jwt = {
  // Generate Token
  generateCustomerToken(userId) {
    return {
      "token":jsonwebtoken.sign( { userId: userId + " Customer" }, secretKey, {
        expiresIn: expiry,
      } ),
      "refreshToken":jsonwebtoken.sign( { userId: userId + " Customer" }, secretKey, {
        expiresIn: expiryRefresh,
      } )
    };
  },

  generateStylistToken(userId) {
    return {
      "token": jsonwebtoken.sign( { userId: userId + " Stylist" }, secretKey, {
        expiresIn: expiry,
      } ),
      "refreshToken": jsonwebtoken.sign( { userId: userId + " Stylist" }, secretKey, {
        expiresIn: expiryRefresh,
      } )
    }
  },

  generateStylistManagerToken(userId) {
    return {
      "token":jsonwebtoken.sign(
        { userId: userId + " StylistManager" },
        secretKey,
        {
          expiresIn: expiry,
        }
      ),
      "refreshToken":jsonwebtoken.sign(
        { userId: userId + " StylistManager" },
        secretKey,
        {
          expiresIn: expiryRefresh,
        }
      )
    };
  },
  
  generateAdminToken(userId) {
    return {
      "token":jsonwebtoken.sign(
        { userId: userId + " Admin" },
        secretKey,
        {
          expiresIn: expiry,
        }
      ),
      "refreshToken": jsonwebtoken.sign(
        { userId: userId + " Admin" },
        secretKey,
        {
          expiresIn: expiryRefresh,
        }
      )
    };
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
    try {
      console.log("Decoding token:", token);
      const decoded = jsonwebtoken.verify(token, secretKey);
      console.log("Decoded token:", decoded);
      const result = {
        status: true,
        values: {
          userId: decoded.userId.split(" ")[0],
          type: decoded.userId.split(" ")[1],
        },
      };
      console.log("Decoded result:", result);
      return result;
    } catch (err) {
      console.error("Error decoding token:", err);
      return { status: false, values: null };
    }
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

  refreshToken ( token ) {
    const decoded = this.decodeToken( token );
    if ( decoded.status )
    {
      return jsonwebtoken.sign(
        { userId: decoded.values.userId + " " + decoded.values.type },
        secretKey,
        { expiresIn: expiryRefresh }
      );
    }
    throw new Error( "Invalid token" );
  }
};

module.exports = jwt;
