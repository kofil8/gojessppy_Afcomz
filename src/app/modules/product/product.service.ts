import prisma from "../../utils/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const createProductIntoDB = async (payload: any, file: any) => {
  const productImage = file?.originalname
    ? `${process.env.BACKEND_BASE_URL}/uploads/${file.originalname}`
    : null;

  const product = await prisma.product.create({
    data: {
      ...payload,
      productImage,
    },
    select: {
      id: true,
      name: true,
      description: true,
      productImage: true,
      price: true,
      quantity: true,
      unit: true,
      inStock: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return product;
};

const getAllProductsFromDB = async () => {
  const result = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      productImage: true,
      price: true,
      quantity: true,
      unit: true,
      inStock: true,
      rating: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return result;
};

const getSingleProductFromDB = async (id: string) => {
  const result = await prisma.product.findUnique({
    where: {
      id,
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
  return result;
};

const updateProductIntoDB = async (id: string, payload: any, file: any) => {
  const productImage = file?.originalname
    ? `${process.env.BACKEND_BASE_URL}/uploads/${file.originalname}`
    : null;

  const product = await prisma.product.update({
    where: {
      id,
    },
    data: {
      ...payload,
      productImage,
    },
  });
  return product;
};

const deleteProductIntoDB = async (id: string) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!existingProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
  const product = await prisma.product.delete({
    where: {
      id,
    },
  });
  return;
};

export const ProductServices = {
  createProductIntoDB,
  getAllProductsFromDB,
  getSingleProductFromDB,
  updateProductIntoDB,
  deleteProductIntoDB,
};
