const mongoose = require("mongoose");

const slotsSchema = new mongoose.Schema({
  agent_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    default: null,
  },
  start: String,
  end: String,
  bookedDate: Number,
  bookedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    default: null,
  },
});

const Slot = mongoose.model("Slot", slotsSchema);

module.exports = Slot;
