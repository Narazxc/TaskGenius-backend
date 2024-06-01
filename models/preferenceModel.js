const mongoose = require("mongoose");

const preferenceSchema = new mongoose.Schema(
  {
    theme: {
      type: String,
      enum: {
        values: ["dark", "light"],
        message: "Theme is either: dark or light",
      },
      default: "light",
    },

    viewMode: {
      type: String,
      enum: {
        values: ["card", "table"],
        message: "View mode is either: card or table",
      },
      default: "card",
    },

    row: {
      type: Number,
      min: 1,
      max: 20,
      default: 5,
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      unique: true, // Enforcing uniqueness for user field
      required: [true, "Preference must belong to a user."],
    },
  },
  {
    timestamps: true,
  }
);

// preferenceSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "task",
//     select: "name",
//   }).populate({
//     path: "user",
//     select: "name",
//   });

//   next();
// });

// create model
const Preference = mongoose.model("Preference", preferenceSchema);

// default export
module.exports = Preference;
