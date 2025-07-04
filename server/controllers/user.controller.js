import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateJWTToken } from "../utils/jwtToken.js";
import { v2 as cloudinary } from "cloudinary";

export const signup = catchAsyncError(async (req, res, next) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
  }

  const isEmailAlreadyUsed = await User.findOne({ email });
  if (isEmailAlreadyUsed) {
    return res.status(400).json({ success: false, message: "Email is already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullname,
    email,
    password: hashedPassword,
    avatar: {
      public_id: "",
      url: "",
    },
  });

  generateJWTToken(user, "User registered successfully", 201, res);
});

export const signin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid credentials" });
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return res.status(400).json({ success: false, message: "Invalid credentials" });
  }

  generateJWTToken(user, "User login successful", 200, res);
});

export const signout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    })
    .json({ success: true, message: "User logout successful" });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({ success: true, user });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { fullname, email } = req.body;

  if (!fullname?.trim() || !email?.trim()) {
    return res.status(400).json({ success: false, message: "Fullname and email are required" });
  }

  console.log("⬇️ Incoming data:");
  console.log("fullname:", fullname);
  console.log("email:", email);

  const avatar = req?.files?.avatar;
  let cloudinaryResponse = {};

  if (avatar) {
    console.log("⬇️ Avatar file received:", avatar);

    if (!avatar.tempFilePath) {
      console.error("🚨 tempFilePath missing on avatar file");
      return res.status(500).json({ success: false, message: "Failed to process avatar file" });
    }

    try {
      const oldAvatarPublicId = req.user?.avatar?.public_id;
      if (oldAvatarPublicId) {
        console.log("🗑 Removing old avatar:", oldAvatarPublicId);
        await cloudinary.uploader.destroy(oldAvatarPublicId);
      }

      console.log("⬆️ Uploading new avatar to Cloudinary...");
      cloudinaryResponse = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {
          folder: "chatbhaji/avatars",
          transformation: [
            { width: 150, height: 150, crop: "fill" },
            { quality: "auto", fetch_format: "auto" }
          ],
        }
      );

      console.log("✅ Cloudinary upload success:", cloudinaryResponse);

    } catch (error) {
      console.error("🚨 Cloudinary upload error:", error);
      return res.status(500).json({ success: false, message: "Failed to upload avatar", error: error.message });
    }
  } else {
    console.log("⚠️ No avatar file uploaded");
  }

  const data = { fullname, email };

  if (avatar && cloudinaryResponse?.public_id && cloudinaryResponse?.secure_url) {
    data.avatar = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user._id, data, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});
