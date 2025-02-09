const bodyParser = require("body-parser");
const express = require("express");
const { candidateController } = require("../controllers");

const candidateRouter = express.Router();
candidateRouter.use(bodyParser.json());

candidateRouter.get("/", candidateController.getAllCandidate);
candidateRouter.get("/:id", candidateController.getOneCandidate);
candidateRouter.post("/create", candidateController.createCandidate);
candidateRouter.put("/update/:id", candidateController.updateCandidate);

module.exports = candidateRouter;
