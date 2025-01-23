import { Request, Response, NextFunction } from "express";
import ApiError from "../errors/ApiErrors";

const parseBodyData = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && req.body.bodyData) {
    try {
      req.body.bodyData = JSON.parse(req.body.bodyData);
    } catch (error) {
      return next(new ApiError(400, "Invalid JSON format in bodyData"));
    }
  }
  next();
};

export default parseBodyData;
