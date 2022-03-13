const express = require("express");
// const userController = require("./../controllers/userController");
const paytmController = require("./../controllers/paytmController");

const router = express.Router();

router.post("/initiatePayment", paytmController.initiatePayment);
router.post("/callbackURL", paytmController.callbackUrlHandler);

// router.post("/login", authController.login);
// router.post("/login", (req, res) => {
//   res.send("login");
// });

module.exports = router;
