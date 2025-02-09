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

module.exports = offerRouter;
