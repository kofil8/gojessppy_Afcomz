import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import { FavouriteServices } from "./favourite.service";

const addToFavourite = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const productId = req.params.productId;
  const result = await FavouriteServices.addToFavourite(userId, productId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Product added to favourite successfully",
    data: result,
  });
});

const getMyFavourite = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await FavouriteServices.getMyFavourite(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Success",
    data: result,
  });
});

const removeFromFavourite = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const productId = req.params.productId;
  const result = await FavouriteServices.removeFromFavourite(userId, productId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Product removed from favourite successfully",
    data: result,
  });
});

export const FavouriteControllers = {
  addToFavourite,
  getMyFavourite,
  removeFromFavourite,
};
