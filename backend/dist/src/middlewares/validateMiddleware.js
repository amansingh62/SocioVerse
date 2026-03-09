import { ZodType } from "zod";
export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch {
        return res.status(400).json({
            message: "Validation failed",
        });
    }
};
//# sourceMappingURL=validateMiddleware.js.map