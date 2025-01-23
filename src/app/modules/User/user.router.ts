import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidations } from "./user.validation";
import { UserControllers } from "./user.controller";
import parseBodyData from "../../../helpars/parseBodyData";
import { fileUploader } from "../../../helpars/fileUploaderS3";

const router = express.Router();

router.post("/register", UserControllers.registerUser);

router.post(
  "/verify-otp",
  validateRequest(UserValidations.verifyOtp),
  UserControllers.verifyOtp
);

router.get("/", UserControllers.getAllUsers);

router.get("/me", auth("USER", "ADMIN"), UserControllers.getMyProfile);

router.get("/:id", auth(), UserControllers.getUserDetails);
router.put(
  "/update-profile",
  auth("USER", "ADMIN"),
  fileUploader.uploadProfileImage,
  parseBodyData,
  UserControllers.updateMyProfile
);

router.delete("/:id", auth("ADMIN"), UserControllers.deleteUser);

router.post(
  "/forgot-password",
  validateRequest(UserValidations.forgotPassword),
  UserControllers.forgotPassword
);

router.post(
  "/change-password",
  validateRequest(UserValidations.changePassword),
  auth(),
  UserControllers.changePassword
);

router.post(
  "/reset-otp",
  validateRequest(UserValidations.verifyOtp),
  UserControllers.ResetOtpVerify
);

router.post(
  "/reset-password",
  validateRequest(UserValidations.resetPassword),
  UserControllers.resetPassword
);

export const UserRouters = router;
