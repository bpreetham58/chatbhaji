import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

import{
    getUser,
    signup,
    signin,
    signout,
    updateProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/sign-up",signup);
router.post("/sign-in",signin);
router.get("/sign-out", isAuthenticated, signout);
router.get("/me", isAuthenticated, getUser);
router.put("/update-profile", isAuthenticated, updateProfile);

export default router;