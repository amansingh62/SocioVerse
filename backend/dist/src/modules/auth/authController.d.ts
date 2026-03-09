import type { Response, Request } from "express";
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const checkUsername: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const refresh: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMe: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authController.d.ts.map