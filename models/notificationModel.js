const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification must have a title."],
    },

    description: {
      type: String,
      required: [true, "Notification must have a description."],
    },

    image: {
      type: String,
      default: "",
    },

    task: {
      type: mongoose.Schema.ObjectId,
      ref: "Task",
    },

    fromUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Notification must belong to a user."],
    },

    forUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Notification must belong to a user."],
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

notificationSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: "task",
  //   select: "name creator",
  // }).populate({
  //   path: "forUser",
  //   select: "name",
  // });

  this.populate({
    path: "forUser",
    select: "name",
  }).populate({
    path: "fromUser",
    select: "name photo cloudinaryPhoto",
  });

  next();
});

// create model
const Notification = mongoose.model("Notification", notificationSchema);

// default export
module.exports = Notification;
