const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log(req.cookies);
    console.log('token');
    console.log(token);

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, please login or signup!');
    }

    // VERIFY TOKEN
    const isVerified = jwt.verify(token, process.env.JWT_SECRET);

    // get user id from token
    const user = await User.findById(isVerified.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('User not found!');
    }
    req.user = user;

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, please login or signup!');
  }
});

module.exports = protect;
