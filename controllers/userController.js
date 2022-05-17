const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("./../utils/apiFeatures");

exports.getUsers = catchAsync(async (req, res, next) => {
  //http://localhost:5000/user?limit=3&page=1

  let filter = {};

  const features = new APIFeatures(User.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      data: users,
    },
  });
});

exports.addMoney = async (userId, amount, transaction) => {
  const doc = await User.findOneAndUpdate(
    { _id: userId },
    {
      $inc: { walletAmount: amount },
      $push: { paymentHistory: transaction },
    },
    { new: true }
  );

  console.log(doc)

  // return doc;
};
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.getSlotsAsUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).populate({
    path: "slot_booked_as_user",
    populate: {
      path: "consultant_id",
      select:
        "-availablity -password -passwordConfirm -__v -createdAt -updatedAt -walletAmount -slot_booked_as_user -slot_booked_as_consultant",
    },
  });

  res.status(200).json({
    status: "success",
    length: user.slot_booked_as_user.length,
    data: user.slot_booked_as_user,
  });
});

exports.getSlotsAsConsultant = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).populate({
    path: "slot_booked_as_consultant",
    populate: {
      path: "user_id",
      select:
        "-availablity -password -passwordConfirm -__v -createdAt -updatedAt -walletAmount -slot_booked_as_user -slot_booked_as_consultant",
    },
  });

  res.status(200).json({
    status: "success",
    length: user.slot_booked_as_consultant.length,
    data: user.slot_booked_as_consultant,
  });
});

exports.updateAvailability = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    {
      availablity: req.body.availablity,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.getActiveAgent = catchAsync(async (req, res, next) => {
  const user = await User.find({
    active: true,
    type: "agent",
  });
  console.log(
    "🚀 ~ file: userController.js ~ line 104 ~ exports.getActiveAgent=catchAsync ~ user",
    user
  );
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.userConnected = async (userInfo) => {
  try {
    userInfo.id = userInfo._id;

    const user = await User.findByIdAndUpdate(
      userInfo.id,
      {
        active: true,
        lat: userInfo.lat,
        lng: userInfo.lng,
        socketId: userInfo.socketId,
      },
      { new: true }
    );
    console.log(
      "🚀 ~ file: userController.js ~ line 128 ~ exports.userConnected= ~ user",
      user
    );
  } catch (err) {
    console.log(
      "🚀 ~ file: userController.js ~ line 144 ~ exports.userConnected= ~ err",
      err
    );
  }
};

exports.userDisconnected = async (socketId) => {
  console.log(
    "🚀 ~ file: userController.js ~ line 124 ~ exports.userDisconnected=catchAsync ~ socketId",
    socketId
  );
  const user = await User.findOneAndUpdate(
    { socketId },
    {
      active: false,
      socketId: "",
    },
    { new: true, runValidators: true }
  );
  console.log(
    "🚀 ~ file: userController.js ~ line 132 ~ exports.userDisconnected=catchAsync ~ user",
    user
  );
};

exports.updateUser = catchAsync(async (req, res, next) => {
  let updatedUser = req.body
  if (req.body.updateType === "location") {
    updatedUser = {
      lat: req.body.lat,
      lng: req.body.lng
    }
  } else {
    delete req.body.updateType
  }

  const user = await User.findByIdAndUpdate(req.params.userId, updatedUser, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});
