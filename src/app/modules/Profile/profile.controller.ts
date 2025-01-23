import { Request, Response } from "express";
import ApiError from "../../../errors/ApiErrors";
import catchAsync from "../../../shared/catchAsync";
import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import { ProfileServices } from "./profile.service";

const updateUserProfileImage = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }

    const profileImage = req.file;
    let imageUrl: string | undefined;

    if (profileImage) {
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/profile/${profileImage.filename}`;
    }

    if (!imageUrl) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No profile image uploaded");
    }

    const updatedUser = await ProfileServices.updateUserProfileImage(
      userId,
      imageUrl
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User profile image updated successfully",
      data: updatedUser,
    });
  }
);

export const ProfileControllers = {
  // updateUser,
  updateUserProfileImage,
};
