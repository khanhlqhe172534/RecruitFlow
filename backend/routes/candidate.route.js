const bodyParser = require("body-parser");
const express = require("express");
const { candidateController } = require("../controllers");
const multer = require("multer");

// Cấu hình multer để upload file
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const candidateRouter = express.Router();
candidateRouter.use(bodyParser.json());

candidateRouter.get("/", candidateController.getAllCandidate);
candidateRouter.get("/:id", candidateController.getOneCandidate);
candidateRouter.post("/create", candidateController.createCandidate);
candidateRouter.put("/update/:id", candidateController.updateCandidate);
candidateRouter.post("/import", upload.single("file"), candidateController.importCandidates); // API import file Excel

module.exports = candidateRouter;
