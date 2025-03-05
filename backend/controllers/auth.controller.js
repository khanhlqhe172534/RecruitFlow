const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user.model");
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
  const user = await User.findOne({ email: email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
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
    const currentUser = await User.findById(decoded.id);
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
// forgotPassword = catchAsync(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(new AppError("There is no user with this email address.", 404));
//   }
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });
//   try {
//     const resetURL = `${req.protocol}://${req.get(
//       "host"
//     )}/api/v1/users/reset-password/${resetToken}`;
//     await new Email(user, resetURL).sendResetPassword();
//     // await sendEmail({
//     //   email: user.email,
//     //   subject: 'Your password reset token valid for 10 min',
//     //   message,
//     // });
//     res.status(200).json({
//       status: "success",
//       message: "Token sent to email!",
//     });
//   } catch (error) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });
//     return next(
//       new AppError(
//         "There was an error in sending the email.Try again later!",
//         500
//       )
//     );
//   }
// });
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
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(404)
      .json({ message: "There is no user with this email address." });
  }
  const password = generateRandomPassword();
  user.password = password;
  await user.save();
  // Send password via email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: req.body.email,
    subject: "Your Account Password",
    text: `Hello ${user.fullname},\n\nYour account has been reseted. Here is your new password: ${password}\n\nPlease keep it secure.`,
  };

  await transporter.sendMail(mailOptions);
  createSendToken(user, 200, res);
};
// updatePassword = catchAsync(async (req, res, next) => {
//   const user = await User.findById(req.user.id).select("+password");
//   if (!(await user.correctPassword(req.body.oldPassword))) {
//     return next(new AppError("Your current password is wrong!", 401));
//   }
//   user.password = req.body.newPassword;
//   user.passwordConfirm = req.body.passwordConfirm;
//   await user.save();
//   createSendToken(user, 200, res);
// });

const authController = {
  login,
  logout,
  isLoggedIn,
  resetPassword,
};

module.exports = authController;
