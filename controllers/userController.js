const bcrypt = require('bcrypt');
const User = require('../models/user'); 
const Task = require('../models/tasks'); 
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    if (!usernameRegex.test(username)) {
      return res.status(400).json({ message: "Some characters are not allowed!" });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      password: hashedPassword,
      username
    });
    await user.save();

    const categories = ["todo", "under-review", "in-progress", "done"];
    for (const category of categories) {
      await Task.create({
        title: `Sample ${category} task`,
        description: `This is a sample ${category} task.`,
        status: category,
        user: user._id,
        priority: "low",
      });
    }

    return res.status(201).json({
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error signing up!", error: error.message });
  }
};


exports.login = async (req, res) => {
    const { userId, password } = req.body;
    try {
        let existingUser;

        // Check if userId is email or username
        if (userId.includes('@')) {
            existingUser = await User.findOne({ email: userId });
        } else {
            existingUser = await User.findOne({ username: userId });
        }

        // User not found
        if (!existingUser) {
            return res.status(400).send({ message: 'User not found' });
        }

        // Check if password matches
        const passwordMatched = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatched) {
            return res.status(400).send({ message: 'Wrong password' });
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            {
                _id: existingUser._id,
                email: existingUser.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set token in cookie
        res.cookie('token', jwtToken, {
            path: '/',
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day expiration
            httpOnly: true,
            sameSite: 'none',
            secure: process.env.NODE_ENV === 'production',
        });

        return res.status(200).send({
            username: existingUser.username,
            email: existingUser.email,
        });
    } catch (error) {
        // Log the error for debugging
        console.error("Login error:", error);  // This will log to your console
        return res.status(500).send({ message: 'Error logging in!', error: error.message });
    }
};



exports.logout = async (req, res) => {
    try {
      res.clearCookie("token");
      return res.status(200).send({ message: "Logged out successfully!" });
    } catch (error) {
      return res.status(500).send({ message: "Error logging out!", error });
    }
};




exports.userDetails = async (req, res) => {
    const userId = req._id;
    try {
      const user = await User.findById(userId); // Finds user by ID
      if (!user) {
        return res.status(404).send({ message: "Cannot find the user!" });
      }
      return res.status(200).send({
        username: user.username,
        picture: user.picture,
        email: user.email,
      });
    } catch (error) {
      return res.status(500).send({ message: "Cannot fetch user details", error });
    }
};