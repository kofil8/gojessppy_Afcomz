import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../utils/prisma";

const addToCart = async (userId: string, payload: any) => {
  const result = await prisma.addToCart.create({
    data: {
      userId: userId,
      ...payload,
    },
  });
  return result;
};

const getMyCartList = async (userId: string) => {
  const result = await prisma.addToCart.findMany({
    where: {
      userId: userId,
    },
    include: {
      product: true,
    },
  });

  // // Map the results to include only the necessary product details
  // const favourites = result.map((item) => ({
  //   productImage: item?.product?.productImage,
  //   name: item?.product?.name,
  //   price: item?.product?.price,
  // }));

  return result;
};

const removeProductFromCart = async (userId: string, productId: string) => {
  const existingFavourite = await prisma.addToCart.findFirst({
    where: {
      id: productId,
    },
  });

  if (!existingFavourite) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  const result = await prisma.addToCart.delete({
    where: {
      userId: userId,
      id: productId,
    },
  });
  return;
};

export const CartServices = {
  addToCart,
  getMyCartList,
  removeProductFromCart,
};
