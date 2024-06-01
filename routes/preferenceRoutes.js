const express = require("express");
const router = express.Router();
const preferenceController = require("./../controllers/preferenceController");
const authController = require("./../controllers/authController");

router
  .route("/")
  .get(authController.protect, preferenceController.getMyPreference)
  .post(authController.protect, preferenceController.createPreference);

router
  .route("/:id")
  .patch(authController.protect, preferenceController.updatePreference);

module.exports = router;
