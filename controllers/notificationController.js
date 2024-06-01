const Notification = require("../models/notificationModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

exports.getAllNotifications = catchAsync(async (req, res, next) => {
  // Get total count of all tasks

  // EXECUTE QUERY
  const features = new APIFeatures(Notification.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const notifications = await features.query;

  res.status(200).json({
    status: "success",
    result: notifications.length,
    data: {
      notifications,
    },
  });
});

exports.getMyNotifications = catchAsync(async (req, res, next) => {
  // console.log(req.user);
  const currentUserId = req.user._id;

  // EXECUTE QUERY
  const notifications = await Notification.find({
    forUser: currentUserId,
    isRead: false,
  })
    .sort("-createdAt")
    .select("-__v");

  res.status(200).json({
    status: "success",
    result: notifications.length,
    data: {
      notifications,
    },
  });
});

exports.createNotification = catchAsync(async (req, res, next) => {
  req.body.forUser = req.user.id;

  console.log(req.body);
  const newNotification = await Notification.create(req.body);

  res
    .status(201)
    .json({ status: "success", data: { notifications: newNotification } });
});

exports.updateNotification = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const body = req.body;

  // // Update isCollabTask
  // if (req.body.taskMembers && req.body.taskMembers.length > 0) {
  //   req.body.isCollabTask = true;
  // }

  const updatedNotification = await Notification.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });

  if (!updatedNotification) {
    return next(new AppError("No notification found with that ID", 404));
  }

  res
    .status(200)
    .json({ status: "success", data: { notifications: updatedNotification } });
});

exports.markAllMyNotificationsAsRead = catchAsync(async (req, res, next) => {
  try {
    await Notification.updateMany(
      { forUser: req.user.id, isRead: false }, // Use req.user.id for clarity
      { isRead: true } // Set isRead to true
    );
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({ status: "success" });
});
