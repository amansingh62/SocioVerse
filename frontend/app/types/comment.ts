export interface CommentUser {
    id: string;
    username: string;
    image: string | null;
}

export interface PostComment  {
    id: string;
    content: string;
    user: CommentUser;
    parentId: string | null;
    createdAt:  string;
    optimistic?: boolean;
}