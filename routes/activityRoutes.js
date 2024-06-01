const express = require("express");
const router = express.Router();
const activityController = require("./../controllers/activityController");
const authController = require("./../controllers/authController");

router
  .route("/")
  .get(authController.protect, activityController.getAllActivities)
  .post(authController.protect, activityController.createActivity);

router
  .route("/forMembers")
  .get(authController.protect, activityController.getActivitiesForTaskMembers);

module.exports = router;
