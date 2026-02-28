import type { Response, Request, NextFunction } from "express";
import { ZodType } from "zod";

export const validate =
  (schema: ZodType) => (res: Response, req: Request, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch {
      return res.status(400).json({
        message: "Validation failed",
      });
    }
  };
