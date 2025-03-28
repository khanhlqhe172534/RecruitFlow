const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/user.model");
const Candidate = require("../models/candidate.model");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: "success",
    token,
    user: user,
  });
};
const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password!" });
  }
  let user = await User.findOne({ email: email }).select("+password");
  if (!user) {
    user = await Candidate.findOne({ email: email }).select("+password");
  }
  if (!user || !(await user.correctPassword(password))) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }
  const populatedUser = await user.populate([
    { path: "role", select: "name" },
    { path: "status", select: "name" },
  ]);
  createSendToken(populatedUser, 200, res);
};
const logout = (req, res) => {
  res.status(200).json({ status: "success" });
};
const isLoggedIn = async (req, res, next) => {
  if (req.body.jwt) {
    // 1) verify token
    const decoded = await promisify(jwt.verify)(
      req.body.jwt,
      process.env.JWT_SECRET
    );
    // 2) Check if user still exists
    let currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      currentUser = await Candidate.findById(decoded.id);
    }
    if (!currentUser) {
      return res.status(400).json({
        status: "fail",
        loggedIn: false,
        message: "User haven't logged in!",
      });
    }

    // 3) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(400).json({
        status: "fail",
        loggedIn: false,
        message: "User had changed password recently!",
      });
    }

    // THERE IS A LOGGED IN USER
    return res.status(200).json({
      status: "success",
      loggedIn: true,
      user: currentUser,
      token: req.body.jwt,
      message: "User is already logged in!",
    });
  }
  return res.status(400).json({
    status: "fail",
    loggedIn: false,
    message: "User haven't logged in!",
  });
};
const forgotPassword = async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    user = await Candidate.findOne({ email: req.body.email });
  }
  if (!user) {
    return res
      .status(404)
      .json({ message: "There is no user with this email address." });
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  try {
    const frontendURL = "http://localhost:3000";
    const resetURL = `${frontendURL}/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your password reset token valid for 10 min",
      html: `<p>Hello ${user.fullname},</p>
         <p>Your password reset link is <a href="${resetURL}">here</a>.</p>
         <p>Please keep it secure.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
      user: user,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      message: "There was an error in sending the email.Try again later!",
    });
  }
};
const generateRandomPassword = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
};
const resetPassword = async (req, res, next) => {
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  let user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    user = await Candidate.findOne({
      passwordResetToken: hashToken,
      passwordResetExpires: { $gt: Date.now() },
    });
  }
  if (!user) {
    return res
      .status(400)
      .json({ message: "Token is invalid or has expired!" });
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
};
const updatePassword = async (req, res, next) => {
  let user = await User.findById(req.body.userId).select("+password");
  if (!user) {
    user = await Candidate.findById(req.body.userId).select("+password");
  }
  if (user && !(await user.correctPassword(req.body.oldPassword))) {
    return res.status(401).json({ message: "Your current password is wrong!" });
  }
  user.password = req.body.newPassword;
  await user.save();
  createSendToken(user, 200, res);
};

const authController = {
  login,
  logout,
  isLoggedIn,
  resetPassword,
  updatePassword,
  forgotPassword,
};

module.exports = authController;
