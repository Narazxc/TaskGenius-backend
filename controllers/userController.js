const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },

//   filename: (req, file, cb) => {
//     // user-id-timestamp.jpeg
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multerStorage = multer.memoryStorage();

// The goal of this func is to check whether uploaded file is an img
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image!, Please upload only images.", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Resize the image
  const resizedImageBuffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 100 })
    .toBuffer();
  // .toFile(`public/img/users/${req.file.filename}`);

  const base64Image = resizedImageBuffer.toString("base64");
  req.file.dataURI = dataURI = `data:image/jpeg;base64,${base64Image}`;

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  // Object.keys returns an array with all the field names
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// for non administrator
exports.getAllUsersToAddToTask = catchAsync(async (req, res, next) => {
  // _id: { $ne: req.user.id }
  const users = await User.find({ _id: { $ne: req.user.id } }).select(
    "-__v -role -passwordChangedAt -active"
  );

  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users,
    },
  });
});

exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find().select("-__v");

//   res.status(200).json({
//     status: "success",
//     result: users.length,
//     data: {
//       users,
//     },
//   });
// });

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  }

  // // 2) Filtered out unwanted fields name that are not allowed to be updated
  // const filteredBody = filterObj(req.body, "name", "email");
  // if (req.file) filteredBody.photo = req.file.filename;

  // 2) Filtered out unwanted fields name that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");

  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.dataURI, {
        folder: "user_photos", // Optional: specify a folder in Cloudinary
      });

      // filteredBody.photo = req.file.filename; // Keeping the local filename if necessary
      filteredBody.cloudinaryPhoto = result.secure_url; // Store the Cloudinary URL
    } catch (err) {
      console.log(err.message);

      return next(
        new AppError("Failed to upload image. Please try again later.", 500)
      );
    }
  }

  // 3) Update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

exports.getUser = factory.getOne(User);

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: "success", data: null });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined! Please use /signup instead",
  });
};

// Do NOT update password with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
