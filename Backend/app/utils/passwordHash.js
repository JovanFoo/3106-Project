const bcrypt = require("bcrypt");

const PasswordHash = {
  async hashPassword(plainPassword) {
    const saltRounds = 10; // Defines computational cost
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  },
  async comparePassword(inputPassword, storedHash) {
    const match = await bcrypt.compare(inputPassword, storedHash);
    return match; // true if passwords match, false otherwise
  },
};
module.exports = PasswordHash;
