const Role = require("../models/role.model");
const Status = require("../models/status.model");
const User = require("../models/user.model");

const nodemailer = require("nodemailer");

async function createUser(req, res, next) {
 
}

async function getUserByRole(req, res, next) {
  
}

async function getAllUser(req, res, next) {
 
}

async function updateUser(req, res, next) {
 
}

async function updateUserStatus(req, res, next) {
 
}

async function deleteUser(req, res, next) {

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
