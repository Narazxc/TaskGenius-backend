const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, "Activity must have a description."],
    },

    task: {
      type: mongoose.Schema.ObjectId,
      ref: "Task",
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Activity must belong to a user."],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

activitySchema.pre(/^find/, function (next) {
  this.populate({
    path: "task",
    select: "name status",
  }).populate({
    path: "user",
    select: "name",
  });

  next();
});

// create model
const Activity = mongoose.model("Activity", activitySchema);

// default export
module.exports = Activity;
