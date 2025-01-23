import express from "express";
import auth from "../../middlewares/auth";
import { CartControllers } from "./cart.controller";
import validateRequest from "../../middlewares/validateRequest";
import { CartValidations } from "./cart.validation";
const router = express.Router();

router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(CartValidations.addToCart),
  CartControllers.addToCart
);

router.get("/", auth("USER", "ADMIN"), CartControllers.getMyCartList);

router.delete(
  "/:productId",
  auth("USER", "ADMIN"),
  CartControllers.removeProductFromCart
);

export const CartRouters = router;
