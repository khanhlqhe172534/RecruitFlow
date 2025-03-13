const bodyParser = require("body-parser");
const express = require("express");
const { userController, authController } = require("../controllers");

const userRouter = express.Router();
userRouter.use(bodyParser.json());

userRouter.post("/login", authController.login);
userRouter.post("/reset-password", authController.resetPassword);
userRouter.put("/change-password", authController.updatePassword);
userRouter.get("/logout", authController.logout);
userRouter.post("/create", userController.createUser);
userRouter.get("/:role", userController.getUserByRole);
userRouter.get("/by-id/:id", userController.findUserById);
userRouter.get("/", userController.getAllUser);
userRouter.put("/:id", userController.updateUser);
userRouter.delete("/:id", userController.deleteUser);
userRouter.put("/status/:id", userController.updateUserStatus);

module.exports = userRouter;
