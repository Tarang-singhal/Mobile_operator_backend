const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phone: {
    type: String,
    required: [true, "Please provide phone"],
    unique: true,
    // validate: [validator.isPhone, "Please provide a valid phone"]
  },
  image: {
    type: String,
    default:
      "https://www.pixsy.com/wp-content/uploads/2021/04/ben-sweet-2LowviVHZ-E-unsplash-1.jpeg",
  },
  type: {
    type: String,
    enum: ["user", "agent", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  active: {
    type: Boolean,
    default: false,
  },
  lat: {
    type: Number,
    default: 32,
  },
  lng: {
    type: Number,
    default: 32,
  },
  socketId: {
    type: String,
    default: "",
  },
  walletAmount: {
    type: Number,
    default: 0,
    required: true
  },
  slots: [
    {
      start: String,
      end: String,
      bookedDate: Number,
      bookedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        default: null,
      },
      isBooked: {
        type: Boolean,
        default: false,
      },
    },
  ],
  address: {
    type: String,
  },
  paymentHistory: [
    {
      STATUS: String,
      TXNAMOUNT: String,
      TXNDATE: Date,
      TXNID: String,
    },
  ],
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
