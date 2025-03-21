const mongodb = require( "./config/database.js" );
// Models
const Customer = require( "../models/Customer.js" );
const Stylist = require( "../models/Stylist.js" );
const Admin = require( "../models/Admin.js" );
// Utils
const PasswordHash = require("../utils/passwordHash.js");
const jwt = require("../utils/jwt.js");
const { resetPassword } = require( "../utils/emailService.js" );

const AuthController = {
  async loginCustomer(req, res) {
    console.log("AuthController > login customer");
    const { username, password } = req.body;
    const customer = await Customer.findOne({ username: username });
    if (customer) {
      const isMatch = await PasswordHash.comparePassword(
        password,
        customer.password
      );
      if (isMatch) {
        customer.password = undefined;
        const token = jwt.generateCustomerToken(customer._id);
        return res.status(200).json({ customer, token });
      }
    }
    return res.status(400).json({ message: "Invalid username or password" });
  },

  async registerCustomer(req, res) {
    console.log("AuthController > register customer");
    const { name, username, email, password } = req.body;
    const hashedPassword = await PasswordHash.hashPassword(password);
    const newCustomer = new Customer({
      name,
      username,
      email,
      password: hashedPassword,
    });

    try {
      let customer = await Customer.findOne({ username: username });
      if (customer) {
        return res.status(400).json({ message: "Username already exists" });
      }
      customer = await Customer.findOne({ email: email });
      if (customer) {
        return res.status(400).json({ message: "Email already exists" });
      }
      await newCustomer.save();
      newCustomer.password = undefined;
      return res.status(201).json(newCustomer);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Error creating user" });
    }
  },

  async resetCustomerPassword(req, res) {
    console.log("AuthController > reset customer password");
    const { email } = req.body;
    const customer = await Customer.findOne({ email: email });
    if (customer) {
      const result = await resetPassword(
        email,
        customer.name,
        jwt.generateCustomerResetToken(customer._id)
      );
      if (!result) {
        return res.status(400).json({ message: "Error sending email" });
      }
      return res.status(200).json({ message: "Reset password email sent" });
    } else {
      return res.status(404).json({ message: "Email not found" });
    }
  },

  async loginStylist ( req, res ) {
    console.log( "AuthController > login stylist" );
    const { username, password } = req.body;
    const stylist = await Stylist.findOne( { username: username } );
    if ( stylist )
    {
      const isMatch = await PasswordHash.comparePassword(
        password,
        stylist.password
      );
      if ( isMatch )
      {
        stylist.password = undefined;
        const token = jwt.generateStylistToken( stylist._id );
        return res.status( 200 ).json( { stylist, token } );
      }
    }
    return res.status(400).json({ message: "Invalid username or password" });
  },

  async registerStylist ( req, res ) {
    console.log( "AuthController > register stylist" );
    const { name, username, email, password } = req.body;
    const hashedPassword = await PasswordHash.hashPassword( password );
    const newStylist = new Stylist( {
      name,
      username,
      email,
      password: hashedPassword,
    } );

    try
    {
      let stylist = await Stylist.findOne( { username: username } );
      if ( stylist )
      {
        return res.status( 400 ).json( { message: "Username already exists" } );
      }
      stylist = await Stylist.findOne( { email: email } );
      if ( stylist )
      {
        return res.status( 400 ).json( { message: "Email already exists" } );
      }
      await newStylist.save();
      newStylist.password = undefined;
      return res.status( 201 ).json( newStylist );
    } catch ( error )
    {
      console.log( error.message );
      return res.status( 400 ).json( { message: "Error creating stylist" } );
    }
  },

  async resetStylistPassword ( req, res ) {
    console.log( "AuthController > reset stylist password" );
    const { email } = req.body;
    const stylist = await Stylist.findOne( { email: email } );
    if ( stylist )
    {
      const result = await resetPassword(
        email,
        stylist.name,
        jwt.generateStylistResetToken( stylist._id )
      );
      if ( !result )
      {
        return res.status( 400 ).json( { message: "Error sending email" } );
      }
      return res.status( 200 ).json( { message: "Reset password email sent" } );
    } else
    {
      return res.status( 404 ).json( { message: "Email not found" } );
    }
  },

  async loginAdmin ( req, res ) {
    console.log( "AuthController > login admin" );
    const { username, password } = req.body;
    const admin = await Admin.findOne( { username: username } );
    if ( admin )
    {
      const isMatch = await PasswordHash.comparePassword(
        password,
        admin.password
      );
      if ( isMatch )
      {
        admin.password = undefined;
        const token = jwt.generateAdminToken( admin._id );
        return res.status( 200 ).json( { admin, token } );
      }
    }
    return res.status(400).json({ message: "Invalid username or password" });
  },

  async registerAdmin ( req, res ) {
    console.log( "AuthController > register admin" );
    const { name, username, email, password } = req.body;
    const hashedPassword = await PasswordHash.hashPassword( password );
    const newAdmin = new Admin( {
      name,
      username,
      email,
      password: hashedPassword,
    } );

    try
    {
      let admin = await Admin.findOne( { username: username } );
      if ( admin )
      {
        return res.status( 400 ).json( { message: "Username already exists" } );
      }
      admin = await Admin.findOne( { email: email } );
      if ( admin )
      {
        return res.status( 400 ).json( { message: "Email already exists" } );
      }
      await newAdmin.save();
      newAdmin.password = undefined;
      return res.status( 201 ).json( newAdmin );
    } catch ( error )
    {
      console.log( error.message );
      return res.status( 400 ).json( { message: "Error creating admin" } );
    }
  },

};

module.exports = AuthController;
