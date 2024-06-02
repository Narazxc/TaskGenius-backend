const mongoose = require("mongoose");
const slugify = require("slugify");
// const User = require("./userModel");

// task table schema
const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A task must have a name"], // this is called a validator
      unique: true,
      maxlength: [
        100,
        "A task name must have less or equal then 40 characters",
      ],
      minlength: [5, "A task name must have more or equal then 5 characters"],
    },
    slug: String,
    dueDate: {
      type: Date,
      default: Date.now() + 4 * 24 * 60 * 60 * 1000,
      required: [true, "A task must have a due date"],
    },

    priority: {
      type: String,
      enum: {
        values: ["high", "medium", "low"],
        message: "Priority is either: low, medium, or high",
      },
      default: "medium",
    },

    priorityIndex: {
      type: Number,
    },

    status: {
      type: String,
      enum: {
        values: ["to do", "in progress", "on hold", "completed"],
        message: `Task status is either: "to do", "in progress", "on hold", or "completed"`,
      },
      default: "to do",
    },

    isCollabTask: {
      type: Boolean,
      default: false,
    },

    creator: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    taskMembers: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
taskSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

taskSchema.pre("save", function (next) {
  switch (this.priority) {
    case "high":
      this.priorityIndex = 3;
      break;
    case "medium":
      this.priorityIndex = 2;
      break;
    case "low":
      this.priorityIndex = 1;
      break;
    default:
      return;
  }

  next();
});

taskSchema.pre("updateOne", function (next) {
  next();
});

// taskSchema.pre("save", function (next) {
//   console.log("Will save document...");
//   next();
// });

// taskSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

// Tour guides example: Behind the scene, getting user documents and embbed them to tour document based on array of user id
// taskSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// QUERY MIDDLEWARE
taskSchema.pre(/^find/, function (next) {
  this.start = Date.now();
  next();
});

taskSchema.pre(/^find/, function (next) {
  // in query middleware this keyword points to the current query
  this.populate({
    path: "taskMembers",
    select: "-__v -passwordChangedAt",
  }).populate({
    path: "creator",
    select: "name photo cloudinaryPhoto",
  });

  next();
});

taskSchema.post(/^find/, function (docs, next) {
  console.log(`Query find took: ${Date.now() - this.start} milliseconds!`);
  // console.log(docs);
  next();
});

// create model
const Task = mongoose.model("Task", taskSchema);

// default export
module.exports = Task;
