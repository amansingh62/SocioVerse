import type { Request, Response } from "express";
export declare const getUserProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProfileUploadURL: (req: Request, res: Response) => Promise<void>;
export declare const getFollowers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getFollowing: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUserPosts: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map