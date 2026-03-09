import type { Request, Response } from "express";
export declare const createPost: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deletePost: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleLike: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleSave: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteComment: (req: Request, res: Response) => Promise<void>;
export declare const getFeed: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getExploreFeed: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCloudinarySignature: (req: Request, res: Response) => Promise<void>;
export declare const getSavedPosts: (req: Request, res: Response) => Promise<void>;
export declare const getPostComments: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getNotifications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=postController.d.ts.map