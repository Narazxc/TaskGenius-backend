const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

// Factory function is just a function that returns a function
// works of a feature in javascript called closure
// closure is just a fancy way of saying the inner function will get access to it's parent parameter/variables
// even when it's parent has already returned

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const doc = await Model.findByIdAndDelete(id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({ status: "success", data: null });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const body = req.body;

    const doc = await Model.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({ status: "success", data: { data: doc } });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({ status: "success", data: { data: doc } });
  });

exports.getOne = (Model, popOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) {
      if (Array.isArray(popOptions)) {
        popOptions.forEach((option) => {
          query = query.populate(option);
        });
      } else {
        query = query.populate(popOptions);
      }
    }

    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({ status: "success", data: { data: doc } });
  });
};

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    // const task = Task.find().where("priority").equals("high");
    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      result: doc.length,
      data: {
        data: doc,
      },
    });
  });
