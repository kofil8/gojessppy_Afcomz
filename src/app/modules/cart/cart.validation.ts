import z from "zod";

const addToCart = z.object({
  body: z.object({
    productId: z.string({
      required_error: "Product id is required!",
    }),
    quantity: z.number({
      required_error: "Quantity is required!",
    }),
    unit: z.string({
      required_error: "Price is required!",
    }),
  }),
});

export const CartValidations = {
  addToCart,
};
