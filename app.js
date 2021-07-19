require("dotenv").config();
require("./config/database").connect();
const cors = require("cors");
const express = require("express");
const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
// importing user context
const User = require("./model/user");
const app = express();
// const corsOptions = {
//     origin: 'http://example.com',
//     optionsSuccessStatus: 200 // for some legacy browsers
//   }

app.use(cors());
app.use(express.json());
// app.get("/dashboard", cors(corsOptions), auth, (req, res) => {
app.get("/dashboard", cors(), auth, (req, res) => {    
  res.status(200).send("Welcome to Dashboard");
});

// Home
app.get("/", (req, res) => {
    res.send({
        message: "Home"}
        )
    });

// Register
app.post("/register", async (req, res) => {

    // Our register logic starts here
     try {
      // Get user input
      const { firstName, lastName, email, password } = req.body;
  
      // Validate user input
      if (!(email && password && firstName && lastName)) {
        res.status(400).send("All input is required");
      }
  
      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await User.findOne({ email });
  
      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }
  
      //Encrypt user password
      encryptedUserPassword = await bcrypt.hash(password, 10);
  
      // Create user in our database
      const user = await User.create({
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(), // sanitize
        password: encryptedUserPassword,
      });
  
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "5h",
        }
      );
      // save user token
      user.token = token;
  
      // return new user
      res.status(201).json(user);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });

// Login
app.post("/login", async (req, res) => {

    // Our login logic starts here
     try {
      // Get user input
      const { email, password } = req.body;
  
      // Validate user input
      if (!(email && password)) {
        res.status(400).send("All input is required");
      }
      // Validate if user exist in our database
      const user = await User.findOne({ email });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "5h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        return res.status(200).json(user);
      }
      return res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
      }
    // Our login logic ends here
});

// This should be the last route else any after it won't work
app.use("*", (req, res) => {
    res.status(404).json({
      success: "false",
      message: "Page not found",
      error: {
        statusCode: 404,
        message: "You reached a route that is not defined on this server",
      },
    });
  });

// Logic goes here

module.exports = app;