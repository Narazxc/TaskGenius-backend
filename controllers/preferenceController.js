const Preference = require("../models/preferenceModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

// route handlers
// exports.getAllPreference = catchAsync(async (req, res, next) => {
//   // Get total count of all tasks

//   // EXECUTE QUERY
//   const features = new APIFeatures(Preference.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const preference = await features.query;

//   // SEND RESPONSE
//   res.status(200).json({
//     status: "success",
//     result: preference.length,
//     data: {
//       preference,
//     },
//   });
// });

exports.getMyPreference = catchAsync(async (req, res, next) => {
  const preference = await Preference.find({ user: req.user.id });

  res.status(200).json({
    status: "success",
    result: preference.length,
    data: {
      preference,
    },
  });
});

exports.createPreference = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;

  // console.log(req.user.id);

  const newPreference = await Preference.create(req.body);

  res
    .status(201)
    .json({ status: "success", data: { preference: newPreference } });
});

exports.updatePreference = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const body = req.body;

  const updatedPreference = await Preference.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });

  if (!updatedPreference) {
    return next(new AppError("No preference found with that ID", 404));
  }

  res
    .status(200)
    .json({ status: "success", data: { preference: updatedPreference } });
});
