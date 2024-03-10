const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name!'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email!'],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email!',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a secure password!'],
      minLength: [6, 'Password must be at least 6 characters long!'],
    },
  },
  { timestamps: true }
);

// PRE-SAVE PASS ENCRYPTION
userSchema.pre('save', async function (next) {
  // not modified ? next
  if (!this.isModified('password')) {
    return next();
  }

  // else hash pass
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
