import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../utils/prisma";

const addToFavourite = async (userId: string, productId: string) => {
  const result = await prisma.favourite.create({
    data: {
      userId: userId,
      productId: productId,
    },
  });
  return result;
};

const getMyFavourite = async (userId: string) => {
  const result = await prisma.favourite.findMany({
    where: {
      userId: userId,
    },
    include: {
      product: true,
    },
  });

  // Map the results to include only the necessary product details
  const favourites = result.map((item) => ({
    productImage: item?.product?.productImage,
    name: item?.product?.name,
    price: item?.product?.price,
  }));

  return favourites;
};

const removeFromFavourite = async (userId: string, productId: string) => {
  const existingFavourite = await prisma.favourite.findFirst({
    where: {
      id: productId,
    },
  });

  if (!existingFavourite) {
    throw new ApiError(httpStatus.NOT_FOUND, "Favourite not found");
  }

  const result = await prisma.favourite.deleteMany({
    where: {
      userId: userId,
      id: productId,
    },
  });
  return;
};

export const FavouriteServices = {
  addToFavourite,
  getMyFavourite,
  removeFromFavourite,
};
