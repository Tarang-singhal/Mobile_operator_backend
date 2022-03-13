const express = require("express");
// const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
// router.post("/login", (req, res) => {
//   res.send("login");
// });

module.exports = router;
