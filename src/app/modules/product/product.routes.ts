import express from "express";
import auth from "../../middlewares/auth";
import parseBodyData from "../../../helpars/parseBodyData";
import { fileUploader } from "../../helpers/fileUploader";
import { ProductControllers } from "./product.controller";
const router = express.Router();

router.post(
  "/",
  auth("ADMIN", "SUPERADMIN"),
  fileUploader.uploadProductImage,
  parseBodyData,
  ProductControllers.createProduct
);

router.get("/", ProductControllers.getAllProducts);

router.get("/:id", ProductControllers.getSingleProduct);

router.put(
  "/:id",
  auth("ADMIN", "SUPERADMIN"),
  fileUploader.uploadProductImage,
  parseBodyData,
  ProductControllers.updateProduct
);



router.delete(
  "/:id",
  auth("ADMIN", "SUPERADMIN"),
  ProductControllers.deleteProduct
); 

export const ProductRouters = router;
