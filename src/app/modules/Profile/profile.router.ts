import express from "express";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { fileUploader } from "../../../helpars/fileUploaderS3";
import { ProfileControllers } from "./profile.controller";

const router = express.Router();

// // update user first name and last name
// router.put(
//   "/update",
//   auth(),
//   // validateRequest(userValidation.createUserSchema),
//   ProfileControllers.updateUser
// );

router.patch(
  "/profile-img-update/:id",
  auth(),
  fileUploader.uploadProfileImage,
  ProfileControllers.updateUserProfileImage
);

export const UserRoute = router;
