import type { Response, Request, NextFunction } from "express";
import { ZodType } from "zod";
export declare const validate: (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=validateMiddleware.d.ts.map