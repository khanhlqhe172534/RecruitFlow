const Status = require("../models/status.model");
const User = require("../models/user.model");

const nodemailer = require("nodemailer");

async function createUser(req, res, next) {
  try {
    const { fullname, email, phoneNumber, gender, dob, status, role } =
      req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find role by name and get its ID
    let roleDoc;
    try {
      roleDoc = await Role.findOne({ name: role });
      if (!roleDoc) {
        return res.status(400).json({ message: "Invalid role specified" });
      }
    } catch (error) {
      return res.status(400).json({ message: "Error finding role" });
    }

    // Find status by name or ID
    let statusDoc;
    try {
      statusDoc = await Status.findOne({
        $or: [{ name: status }, { _id: status }],
      });
      if (!statusDoc) {
        return res.status(400).json({ message: "Invalid status specified" });
      }
    } catch (error) {
      return res.status(400).json({ message: "Error finding status" });
    }

    // Generate a random password
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

    const password = generateRandomPassword();

    // Create a new user document
    const user = new User({
      fullname,
      email,
      password, // Use the generated password here
      phoneNumber,
      isMale: gender === "Male",
      dob: dob ? new Date(dob) : null,
      status: statusDoc._id,
      role: roleDoc._id,
    });

    await user.save();

    // Populate role and status before sending response
    const populatedUser = await User.findById(user._id)
      .populate("role", "name")
      .populate("status", "name");

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
      to: email,
      subject: "Your Account Password",
      text: `Hello ${fullname},\n\nYour account has been created. Here is your password: ${password}\n\nPlease keep it secure.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json(populatedUser);
  } catch (err) {
    next(err);
  }
}
async function getUserByRole(req, res, next) {
  try {
    const { role } = req.params;

    // Find the role by name (or ID)
    const roleDoc = await Role.findOne({ name: role });
    if (!roleDoc) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Find users with the corresponding rolesdfs
    const users = await User.find({ role: roleDoc._id })
      .populate("role", "name")
      .populate("status", "name");

    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}
async function getAllUser(req, res, next) {
  try {
    const users = await User.find()
      .populate("role", "name")
      .populate("status", "name");
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { fullname, email, phoneNumber, gender, dob, status, role } =
      req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find role by name and get its ID
    let roleDoc;
    try {
      roleDoc = await Role.findOne({ name: role });
      if (!roleDoc) {
        return res.status(400).json({ message: "Invalid role specified" });
      }
    } catch (error) {
      return res.status(400).json({ message: "Error finding role" });
    }

    // Find status by name or ID
    let statusDoc;
    try {
      statusDoc = await Status.findOne({
        $or: [{ name: status }, { _id: status }],
      });
      if (!statusDoc) {
        return res.status(400).json({ message: "Invalid status specified" });
      }
    } catch (error) {
      return res.status(400).json({ message: "Error finding status" });
    }

    // Update user fields
    const updateData = {
      fullname,
      email,
      phoneNumber,
      isMale: gender === "Male",
      dob: dob ? new Date(dob) : user.dob,
      status: statusDoc._id,
      role: roleDoc._id,
    };

    // Update and populate in one go
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("role", "name")
      .populate("status", "name");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { statusId } = req.body; // Get statusId from request body

    console.log("Updating status for user ID:", id, "to status ID:", statusId); // Log request

    // Verify the user exists
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the new status document
    const statusDoc = await Status.findById(statusId);
    if (!statusDoc)
      return res.status(400).json({ message: "Invalid status ID" });

    // Update the user's status with the status document's ID
    user.status = statusDoc._id;
    await user.save();

    const updatedUser = await User.findById(id)
      .populate("role", "name")
      .populate("status", "name");

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user status:", err);
    next(err);
  }
}

const userController = {
  createUser,
  getUserByRole,
  getAllUser,
  updateUser,
  deleteUser,
  updateUserStatus,
};

module.exports = userController;