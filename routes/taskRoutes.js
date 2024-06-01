const express = require("express");
const router = express.Router();
const taskController = require("./../controllers/taskController");
const authController = require("./../controllers/authController");

// // param middleware
// router.param("id", taskController.checkValidID);

router
  .route("/")
  .get(authController.protect, taskController.getAllTasks)
  .post(authController.protect, taskController.createTask);

router
  .route("/my-tasks")
  .get(authController.protect, taskController.getMyTasks);

router
  .route("/collaboration")
  .get(authController.protect, taskController.getTaskForCollaborators)
  .post(authController.protect, taskController.createCollabTask);

router
  .route("/:id")
  .get(taskController.getTask)
  .patch(authController.protect, taskController.updateTask)
  .delete(authController.protect, taskController.deleteTask);

// .get(authController.protect, taskController.getTaskForCollaborators)

module.exports = router;
