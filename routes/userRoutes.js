const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword); // only receives email
router.patch("/resetPassword/:token", authController.resetPassword); // receives password reset token and the new password

router
  .route("/toAddToTask")
  .get(authController.protect, userController.getAllUsersToAddToTask);

// router is like a  mini application, just like regular app we can use middleware on it aswell
router.use(authController.protect);
router.patch("/updateMyPassword", authController.updatePassword);

router.get(
  "/me",
  authController.protect,
  userController.getMe,
  userController.getUser
);
router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete("/deleteMe", userController.deleteMe);

router.use(authController.restrictTo("admin"));
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
