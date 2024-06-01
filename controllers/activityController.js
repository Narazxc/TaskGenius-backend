const Activity = require("../models/activityModel");
const Task = require("../models/taskModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

async function getActivitiesForUser(userId) {
  // First, find tasks where the user is either a creator or a team member
  // console.log("userId", userId);
  const tasks = await Task.find({
    $or: [
      {
        creator: userId,
      },
      {
        taskMembers: userId,
      },
    ],
    isCollabTask: true,
  }).select("_id"); // Only select the task IDs

  const taskIds = tasks.map((task) => task._id);

  // console.log("taskIds", taskIds);

  // Now, find activities for those tasks
  const activities = await Activity.find({
    task: { $in: taskIds },
  }).sort({ createdAt: -1 });

  // console.log("activities", activities);

  return activities;
}

exports.getAllActivities = catchAsync(async (req, res, next) => {
  // Get total count of all tasks

  // EXECUTE QUERY
  const features = new APIFeatures(Activity.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const activities = await features.query;

  res.status(200).json({
    status: "success",
    result: activities.length,
    data: {
      activities,
    },
  });
});

exports.getActivitiesForTaskMembers = catchAsync(async (req, res, next) => {
  const activities = await getActivitiesForUser(req.user.id);

  res.status(200).json({
    status: "success",
    result: activities.length,
    data: {
      activities,
    },
  });
});

exports.createActivity = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;

  console.log("req body", req.body);
  const newActivities = await Activity.create(req.body);

  res
    .status(201)
    .json({ status: "success", data: { activities: newActivities } });
});
