const express = require("express");
const slotsController = require("../controllers/slotsController");

const router = express.Router();

router.post("/bookSlot", slotsController.bookSlot);
router.get("/slots/:userId", slotsController.getSlots);
router.delete("/cancelSlot/:slotId", slotsController.cancelSlot);

// router.post("/login", (req, res) => {
//   res.send("login");
// });

module.exports = router;
