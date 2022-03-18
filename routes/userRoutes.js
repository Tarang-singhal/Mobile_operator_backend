const express = require("express");
// const userController = require("./../controllers/userController");
const userController = require("./../controllers/userController.js");

const router = express.Router();

router.get("/", userController.getUsers);
router.get("/:userId", userController.getUser);
router.get("/slotsAsUser/:userId", userController.getSlotsAsUser);
router.get("/slotsAsConsultant/:userId", userController.getSlotsAsConsultant);
router.patch("/saveAvailablity/:userId", userController.updateAvailability);
router.get("/agent/active", userController.getActiveAgent);
// router.get("/logout", authController.logout);

// router.post("/forgotPassword", authController.forgotPassword);
// router.patch("/resetPassword/:token", authController.resetPassword);

// // Protect all routes after this middleware
// router.use(authController.protect);

// router.patch("/updateMyPassword", authController.updatePassword);
// router.get("/me", userController.getMe, userController.getUser);
// router.patch(
//   "/updateMe",
//   userController.uploadUserPhoto,
//   userController.resizeUserPhoto,
//   userController.updateMe
// );
// router.delete("/deleteMe", userController.deleteMe);

// router.use(authController.restrictTo("admin"));

// router
//   .route("/")
//   .get(userController.getAllUsers)
//   .post(userController.createUser);

// router
//   .route("/:id")
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
