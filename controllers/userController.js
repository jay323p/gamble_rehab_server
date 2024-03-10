const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// GEN TOKEN -----------------------------------------------------------------------------------------------
const genToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// REGISTER USER -------------------------------------------------------------------------------------------
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill out all the fields!');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be atleast 6 characters long!');
  }

  // check if email already registered
  const emailCheck = await User.findOne({ email });

  if (emailCheck) {
    res.status(400);
    throw new Error(
      'Email has already been registered, please provide a different one!'
    );
  }

  // validation pass -> create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // genToken for auth
  const token = genToken(user._id);

  // send http-only cookie
  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: 'none',
    secure: true,
  });

  if (user) {
    const { _id, name, email } = user;
    res.status(200).json({
      _id,
      name,
      email,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Unable to register user, please try again!');
  }
});

// LOGIN USER -------------------------------------------------------------------------------------------
const loginUser = asyncHandler(async (req, res) => {
  // req.body validation
  const { email, password } = req.body;
  console.log(email);
  console.log(password);
  if ((!email, !password)) {
    res.status(400);
    throw new Error('Please provide an email and password!');
  }

  // check if user exists in db
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error('User not found, please register!');
  }

  // user exists, check password
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  // gen token for auth
  const token = genToken(user._id);

  // SEND HTTP-ONLY COOKIE
  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1-DAY EXPIRATION
    sameSite: 'none',
    secure: true,
  });

  // user found and passwords match
  if (user && passwordIsCorrect) {
    const { _id, name, email } = user;
    res.status(200).json({
      _id,
      name,
      email,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid email or password!');
  }
});

// LOGOUT USER ---------------------------------------------------------------------------------------------
const logoutUser = asyncHandler(async (req, res) => {
  // clear auth token
  res.cookie('token', '', {
    path: '/',
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'none',
    secure: true,
  });

  return res.status(200).json({ message: 'Successfully Logged Out!' });
});

// GET LOGIN STATUS ------------------------------------------------------------------------------------------
const loginStatus = asyncHandler(async (req, res) => {
  // retreive token from cookies
  const token = req.cookies.token;

  if (!token) {
    return res.json(false);
  }

  // VERIFY TOKEN
  const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);

  if (verifiedToken) {
    return res.json(true);
  }

  return res.json(false);
});

module.exports = {
  registerUser,
  loginUser,
  loginStatus,
  logoutUser,
};
