const Slot = require("../models/slotsModel.js");
const User = require("../models/userModel.js");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
// const Meeting = require("./meet").meet;
// const dayjs = require("dayjs");

// exports.bookSlot = catchAsync(async (req, res, next) => {
//   const consultantId = req.body.consultantId;
//   const userId = req.body.userId;
//   const startTime = req.body.startTime || dayjs("2022-10-10").toISOString();
//   const endTime = req.body.endTime || dayjs().toISOString();
//   const callRate = req.body.callRate || 0;

//   // CHECKING WALLET BALANCE
//   const userWalletBalance = await User.findById(userId).select("+walletAmount");

//   if (userWalletBalance.walletAmount < callRate) {
//     return next(new AppError("Not enough credits!", 400));
//   }
//   const meetingLink = await Meeting({
//     clientId:
//       "535716446508-ic2c51h29ch06f8rbqdacnhrrr14ins5.apps.googleusercontent.com",
//     clientSecret: "TbI_NuwocMqgppTWRGoHwhyC",
//     refreshToken:
//       "1//04pJEd77IfIjxCgYIARAAGAQSNwF-L9Iri09aDnPbEKKIBUONnYBhkfg8jsvPT2f_dFFddQqjcSxPKQ_wfHVg0EgGGb4RuqYOLmY",
//     date: dayjs(startTime).format("YYYY-MM-DD"),
//     time: dayjs(startTime).format("HH:mm"),
//     summary: "summary",
//     location: "location",
//     description: "description",
//   });

//   if (!meetingLink)
//     return next(
//       new AppError(
//         "Could not create meeting link .Maybe you are busy for this time slot",
//         400
//       )
//     );

//   const slots = await Slot.create({
//     user_id: userId,
//     start_time: startTime,
//     end_time: endTime,
//     amount_paid: callRate,
//     consultant_id: consultantId,
//     meeting_link: meetingLink,
//   });

//   await User.findByIdAndUpdate(userId, {
//     $inc: { walletAmount: -callRate },
//     $push: { slot_booked_as_user: slots._id },
//   });
//   await User.findByIdAndUpdate(consultantId, {
//     $inc: { walletAmount: callRate },
//     $push: { slot_booked_as_consultant: slots._id },
//   });

//   // SEND RESPONSE
//   res.status(200).json({
//     status: "success",
//     data: {
//       slots,
//     },
//   });
// });

exports.cancelSlot = catchAsync(async (req, res, next) => {
  const slotId = req.params.slotId;

  const slot = await Slot.findById(slotId);

  if (!slot) {
    return next(new AppError("Slot not found", 404));
  }

  await User.findByIdAndUpdate(slot.user_id, {
    $pull: { slot_booked_as_user: slotId },
    $inc: { walletAmount: slot.amount_paid },
  });
  await User.findByIdAndUpdate(slot.consultant_id, {
    $pull: { slot_booked_as_consultant: slotId },
    $inc: { walletAmount: -slot.amount_paid },
  });

  await slot.remove();

  res.status(202).json({
    status: "success",
    data: {
      slot,
    },
  });
});

const pushSlotToHistory = async (slot) => {
  await Slot.create(slot);
};

exports.bookSlot = catchAsync(async (req, res, next) => {
  const userId = req.body.userId;
  const agentId = req.body.agentId;
  const slotNumber = req.body.slotNumber;
  // console.log(req.body)
  const agent = await User.findById(agentId);
  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (!agent) {
    return next(new AppError("Agent not found", 404));
  }

  // console.log(agent)

  agent.slots[slotNumber].isBooked = true;
  agent.slots[slotNumber].bookedDate = Date.now();
  agent.slots[slotNumber].bookedBy = userId;

  const obj = Object.assign({}, agent.slots[slotNumber]);
  obj.agent_id = agentId;
  obj.bookedBy = userId
  obj.start = agent.slots[slotNumber].start
  obj.end = agent.slots[slotNumber].end
  pushSlotToHistory(obj);

  await agent.save();

  user.walletAmount = user.walletAmount - 50;
  user.paymentHistory.push({
    STATUS: 'DEB_SUCCESS',
    TXNID: '',
    TXNDATE: Date.now(),
    TXNAMOUNT: 50,
  })

  user.save()

  console.log(doc)

  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      slot: agent.slots[slotNumber],
    },
  });
});

exports.getSlots = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  const user = await User.findById(userId);

  if (!user) return next(new AppError("User not found", 404));

  let slots = [];
  if (user.type === "agent") {
    slots = await Slot.find({ agent_id: userId }).populate('bookedBy').exec();
  } else {
    slots = await Slot.find({ bookedBy: userId }).populate('agent_id').exec();
  }

  res.status(200).json({
    status: "success",
    data: {
      slots,
    },
  });
});
