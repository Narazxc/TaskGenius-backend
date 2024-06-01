const Task = require("./../models/taskModel");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");
const Notification = require("../models/notificationModel");
const Activity = require("../models/activityModel");

// // param middleware example
// exports.checkValidID = (req, res, next, val) => {
//   console.log(`Task id is: ${val}`);
//   // if (req.param === !"valid") {
//   //   return res.status(404).json({
//   //     status: "fail",
//   //     message: "Invalid ID",
//   //   });
//   // }

//   next();
// };

// // read json file
// const path = `${__dirname}/../dev-data/data/tasks.json`;
// const tasks = JSON.parse(fs.readFileSync(path, "utf-8"));

// helper function
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// route handlers
exports.getAllTasks = catchAsync(async (req, res, next) => {
  // Get total count of all tasks

  // EXECUTE QUERY
  const features = new APIFeatures(Task.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tasks = await features.query;

  // const tasks = Task.find().where("priority").equals("high");
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    result: tasks.length,
    data: {
      tasks,
    },
  });

  // catch (err) {
  //   res.status(404).json({ status: "fail", message: err });
  // }
});

exports.getMyTasks = catchAsync(async (req, res, next) => {
  // const currentUserId = String(req.user._id);
  const currentUserId = req.user._id;

  const features = new APIFeatures(Task.find(), req.query, currentUserId)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tasks = await features.query;

  res.status(200).json({
    status: "success",
    result: tasks.length,
    data: {
      tasks,
    },
  });
});

exports.createTask = catchAsync(async (req, res, next) => {
  req.body.creator = req.user.id;

  const newTask = await Task.create(req.body);

  res.status(201).json({ status: "success", data: { tasks: newTask } });
});

exports.getTask = factory.getOne(Task, [
  {
    path: "creator",
    select: "name photo",
  },
  { path: "taskMembers", select: "name photo" },
]);
// exports.getTask = catchAsync(async (req, res, next) => {
//   const { id } = req.params;

//   const task = await Task.findById(id);

//   if (!task) {
//     return next(new AppError("No task found with that ID", 404));
//   }

//   res.status(200).json({ status: "success", data: { task } });

//   // catch (err) {
//   //   res.status(404).json({
//   //     status: "fail",
//   //     message: err,
//   //   });
//   // }
// });

async function createActivity({ action, task, user }) {
  console.log("in create activity", { action, task, user });
  const newActivity = await Activity.create({ action, task, user });

  // console.log("new activity", newActivity);
}

exports.updateTask = catchAsync(async (req, res, next) => {
  const { id: taskId } = req.params;
  const body = req.body;

  const originalTask = await Task.findById(taskId);
  console.log("original", originalTask);

  // console.log(body);
  // console.log("updater", req.user.id, originalTask.creator.toString());

  // Log members activity feature
  if (
    originalTask.isCollabTask &&
    req.user.id !== originalTask.creator.toString() &&
    req.body.status
  ) {
    for (const member of originalTask.taskMembers) {
      if (member._id.toString() === req.user.id) {
        console.log("member id", member._id.toString(), req.user.id);
        // Create activity if the current member matches the req.user.id
        await createActivity({
          action: `${member.name} update task ${originalTask.name} status to ${req.body.status}`,
          task: taskId,
          user: req.user.id,
        });

        break;
      }
    }
  }

  if (
    !req.body.isCollabTask &&
    req.body.taskMembers &&
    req.body.taskMembers.length > 0
  ) {
    // Update isCollabTask
    req.body.isCollabTask = true;
  }

  // Collab task notification feature, (for/only to new member)
  if (req.body.taskMembers && req.body.taskMembers.length > 0) {
    // If incoming taskMember obj or array
    let requestBodyMemberIds;
    if (isObject(req.body.taskMembers[0])) {
      requestBodyMemberIds = req.body.taskMembers.map((a) => a._id.toString());
      console.log(requestBodyMemberIds);
    } else if (Array.isArray(req.body.taskMembers)) {
      requestBodyMemberIds = req.body.taskMembers;
    }

    // Get previous task data

    // Extract taskMemberIds from previous task data
    let originalIds;
    if (originalTask.taskMembers && originalTask.taskMembers.length > 0) {
      originalIds = originalTask.taskMembers.map((a) => a._id.toString());
    } else {
      originalIds = [];
    }

    // Filter for new member ids
    newIds = requestBodyMemberIds.filter((id) => !originalIds.includes(id));
    console.log("New IDs:", newIds);

    // If new ids exist, send notify to that new ids
    if (newIds.length > 0) {
      // console.log("logged object");
      await Promise.all(
        newIds.map(async (memberIds) => {
          await createNotification({
            title: "Task member notification",
            description: `${req.user.name} added you to a new collaboration task.`,
            task: taskId,
            fromUser: req.user.id,
            forUser: memberIds,
          });
        })
      );
    }
    // else if (newIds.length === 0) {
    //   // console.log("no new ids");
    //   return;
    // }
  }

  // Update priority index
  if (req.body.priority) {
    switch (req.body.priority) {
      case "high":
        req.body.priorityIndex = 3;
        break;
      case "medium":
        req.body.priorityIndex = 2;
        break;
      case "low":
        req.body.priorityIndex = 1;
        break;
      default:
        return;
    }
  }

  const updatedTask = await Task.findByIdAndUpdate(taskId, body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTask) {
    return next(new AppError("No task found with that ID", 404));
  }

  res.status(200).json({ status: "success", data: { task: updatedTask } });

  // catch (err) {
  //   res.status(404).json({
  //     status: "fail",
  //     message: err,
  //   });
  // }
});

exports.deleteTask = factory.deleteOne(Task);

// exports.deleteTask = catchAsync(async (req, res, next) => {
//   const { id } = req.params;

//   const task = await Task.findByIdAndDelete(id);

//   if (!task) {
//     return next(new AppError("No task found with that ID", 404));
//   }

//   res.status(204).json({ status: "success", data: null });

//   // catch (err) {
//   //   res.status(404).json({
//   //     status: "fail",
//   //     message: err,
//   //   });
//   // }
// });

// Get all collab task

// Get Collab task for collaborators
exports.getTaskForCollaborators = catchAsync(async (req, res, next) => {
  const currentUserId = String(req.user._id);
  const collabTask = true;

  // const tasks = await Task.find({
  //   $or: [
  //     {
  //       creator: currentUserId,
  //     },
  //     {
  //       taskMembers: currentUserId,
  //     },
  //   ],
  //   isCollabTask: true,
  // }).sort("-createdAt");

  const features = new APIFeatures(
    Task.find(),
    req.query,
    currentUserId,
    collabTask
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tasks = await features.query;

  if (!tasks) {
    return next(new AppError("No task found", 404));
  }

  res.status(200).json({
    status: "success",
    result: tasks.length,
    data: {
      tasks,
    },
  });
});

// exports.createCollabTask = catchAsync(async (req, res, next) => {
//   console.log(req.body);
//   req.body.creator = req.user.id;
//   req.body.isCollabTask = true; // Set isCollabTask to true here

//   const newTask = await Task.create(req.body);

//   res.status(201).json({ status: "success", data: { tasks: newTask } });
// });

async function createNotification({
  title,
  description,
  task,
  fromUser,
  forUser,
}) {
  const newNotification = await Notification.create({
    title,
    description,
    task,
    fromUser,
    forUser,
  });

  // console.log("new Notification", newNotification);
}

exports.createCollabTask = catchAsync(async (req, res, next) => {
  console.log("req body", req.body);
  req.body.creator = req.user.id;
  req.body.isCollabTask = true; // Set isCollabTask to true here

  const newTask = await Task.create(req.body);

  // Create notifications for each member (after task creation)
  await Promise.all(
    newTask.taskMembers.map(async (member) => {
      await createNotification({
        title: "Task member notification",
        description: `${req.user.name} added you to a new collaboration task.`,
        task: newTask._id,
        fromUser: req.user.id,
        forUser: member,
      });
    })
  );

  res.status(201).json({ status: "success", data: { tasks: newTask } });
});

// // Find existing members (excluding potential duplicates)
// const existingMemberIds = new Set(
//   updatedTask.taskMembers.map((member) => member.toString())
// );

// // Filter new members from request body
// const newMembers = req.body.taskMembers?.filter(
//   (memberId) => !existingMemberIds.has(memberId.toString())
// );
