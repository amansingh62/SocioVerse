import { verifyAccessToken } from "../utils/tokens.js";
import { StatusCodes } from "../constants/statusCodes.js";
export const requireAuth = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token)
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unathorized" });
    try {
        const payload = verifyAccessToken(token);
        if (!payload)
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Token not found" });
        req.userId = payload.userId;
        next();
    }
    catch {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid or expired token" });
    }
};
//# sourceMappingURL=authMidleware.js.map