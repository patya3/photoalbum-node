const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true },
    username: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true },
    name: {
      firs: String,
      last: String,
    },
    location: {
      country: { type: String, required: true },
      subcountry: { type: String },
      city: { type: String, required: true },
    },
    isSuperuser: { type: Boolean, required: true, default: false },
    isActive: { type: Boolean, required: true, default: true },
    lastLogin: { type: Date, default: Date.now() },
  },
  {
    collection: 'users',
    timestamps: { createdAt: 'dateJoined', updatedAt: 'updatedAt' },
  }
);

userSchema.pre('save', function (next) {
  const user = this;

  if (user.isModified('password')) {
    bcryptjs.genSalt(10, (error, salt) => {
      if (error) return next(error);

      bcryptjs.hash(user.password, salt, (error, hashedPassword) => {
        if (error) return next(error);
        user.password = hashedPassword;
        user.dateJoined = Date.now();
        return next();
      });
    });
  } else {
    return next();
  }
});

userSchema.methods.comparePasswords = function (password, next) {
  bcryptjs.compare(password, this.password, function (error, isMatch) {
    next(error, isMatch);
  });
};

userSchema.statics.login = function login(id, next) {
  return this.findByIdAndUpdate(
    id,
    { $set: { lastLogin: Date.now() } },
    { new: true },
    next
  );
};

mongoose.model('user', userSchema);
