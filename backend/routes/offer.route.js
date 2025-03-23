const bodyParser = require("body-parser");
const express = require("express");
const { offerController } = require("../controllers");

const offerRouter = express.Router();
offerRouter.use(bodyParser.json());

offerRouter.get("/", offerController.getAllOffer);
offerRouter.post("/", offerController.createOffer);
offerRouter.get("/:id", offerController.getOfferById);
offerRouter.put("/:id", offerController.updateOfferById);
offerRouter.delete("/:id", offerController.deleteOfferById);
offerRouter.put("/:id/cancel", offerController.cancelOffer);
offerRouter.put("/:id/accept", offerController.acceptOffer);
offerRouter.put("/:id/reject", offerController.rejectOffer);
offerRouter.get("/candidate/:id", offerController.getOfferByCandidateId);
module.exports = offerRouter;
