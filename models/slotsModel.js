const mongoose = require("mongoose");

const slotsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    default: null,
  },
  start_time: Date,
  end_time: Date,
  amount_paid: {
    type: Number,
    default: 0,
  },
  meeting_link: String,
  consultant_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    default: null,
  },
});

const Slot = mongoose.model("Slot", slotsSchema);

module.exports = Slot;
