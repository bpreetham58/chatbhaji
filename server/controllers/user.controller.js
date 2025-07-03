import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";
import { User } from "../models/user.model.js";

// 📝 Signup
export const signup = catchAsyncError(async (req, res, next) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  const isEmailAlreadyUsed = await User.findOne({ email });
  if (isEmailAlreadyUsed) {
    return res.status(400).json({
      success: false,
      message: "Email is already registered",
    });
  }

  const user = await User.create({ fullname, email, password });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
});

// 📝 Signin
export const signin = catchAsyncError(async (req, res, next) => {
  // TODO: Implement signin logic
});

// 📝 Signout
export const signout = catchAsyncError(async (req, res, next) => {
  // TODO: Implement signout logic
});

// 📝 Get User
export const getUser = catchAsyncError(async (req, res, next) => {
  // TODO: Implement get user logic
});

// 📝 Update Profile
export const updateProfile = catchAsyncError(async (req, res, next) => {
  // TODO: Implement update profile logic
});
