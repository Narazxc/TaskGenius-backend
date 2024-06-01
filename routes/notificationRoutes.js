const express = require("express");
const router = express.Router();
const notificationController = require("./../controllers/notificationController");
const authController = require("./../controllers/authController");

router
  .route("/myNotifications")
  .get(authController.protect, notificationController.getMyNotifications)
  .patch(
    authController.protect,
    notificationController.markAllMyNotificationsAsRead
  );

router
  .route("/")
  .get(authController.protect, notificationController.getAllNotifications)
  .post(authController.protect, notificationController.createNotification);

router.route("/:id").patch(notificationController.updateNotification);

// router
//   .route("/my-tasks")
//   .get(authController.protect, taskController.getMyTasks);

// router
//   .route("/collaboration")
//   .get(authController.protect, taskController.getTaskForCollaborators)
//   .post(authController.protect, taskController.createCollabTask);

// router
//   .route("/:id")
//   .get(taskController.getTask)
//   .patch(taskController.updateTask)
//   .delete(authController.protect, taskController.deleteTask);

// .get(authController.protect, taskController.getTaskForCollaborators)

module.exports = router;
