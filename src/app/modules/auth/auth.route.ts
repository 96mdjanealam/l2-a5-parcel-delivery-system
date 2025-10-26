import { NextFunction, Request, Response, Router } from "express";
import { authController } from "./auth.controller";
import { envVars } from "../../config/env.config";
import passport from "passport";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

router.post("/login", authController.credentialsLogin);
router.post("/refresh-token", authController.refreshTokenLogin);
router.post("/logout", authController.logout);
router.post("/change-password", checkAuth("ADMIN","USER"), authController.changePassword);
router.post("/reset-password", checkAuth("ADMIN","USER"), authController.resetPassword);
router.post("/set-password", checkAuth("ADMIN","USER"), authController.setPassword);


export const authRoutes = router;