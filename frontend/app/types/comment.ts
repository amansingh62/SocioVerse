export interface CommentUser {
    id: string;
    username: string;
    image: string | null;
}

export interface PostComment  {
    id: string;
    content: string;
    user: CommentUser;
    createdAt:  string;
    optimistic?: boolean;
}