import httpStatus from "http-status";
import { Request, Response } from "express";
import { CartServices } from "./cart.service";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const payload = req.body;
  const result = await CartServices.addToCart(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Product added to cart successfully",
    data: result,
  });
});

const getMyCartList = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await CartServices.getMyCartList(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Cart List Retrieve successfully",
    data: result,
  });
});

const removeProductFromCart = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const productId = req.params.productId;
    const result = await CartServices.removeProductFromCart(userId, productId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Product removed from cart successfully",
      data: result,
    });
  }
);

export const CartControllers = {
  addToCart,
  getMyCartList,
  removeProductFromCart,
};
