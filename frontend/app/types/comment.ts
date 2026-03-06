export interface CommentUser {
    id: string;
    username: string;
    image: string | null;
}

export interface Comment {
    id: string;
    content: string;
    user: CommentUser;
    parentId: string | null;
    createdAt:  string;
}