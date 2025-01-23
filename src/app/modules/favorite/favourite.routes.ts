import express from "express";
import auth from "../../middlewares/auth";
import { FavouriteControllers } from "./favourite.controller";
const router = express.Router();

router.post(
  "/:productId",
  auth("USER", "ADMIN"),
  FavouriteControllers.addToFavourite
);

router.get("/", auth("USER", "ADMIN"), FavouriteControllers.getMyFavourite);

router.delete(
  "/:productId",
  auth("USER", "ADMIN"),
  FavouriteControllers.removeFromFavourite
);

export const FavouriteRouters = router;
