const bodyParser = require("body-parser");
const express = require("express");
const { userController } = require("../controllers");

const userRouter = express.Router();
userRouter.use(bodyParser.json());

userRouter.post("/create", userController.createUser);
userRouter.get("/:role", userController.getUserByRole);
userRouter.get("/", userController.getAllUser); 
userRouter.put("/:id", userController.updateUser);
userRouter.delete("/:id", userController.deleteUser);
userRouter.put("/status/:id", userController.updateUserStatus);

module.exports = userRouter;
