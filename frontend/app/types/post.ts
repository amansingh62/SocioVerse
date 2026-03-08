import { PostComment } from "./comment";

export interface PostAuthor {
    id: string;
    username: string;
    image: string | null;
};

export interface Post {
  id: string;
  content: string;
  mediaUrl: string | null;
  mediaType: "IMAGE" | "VIDEO" | null;
  author: PostAuthor;
  createdAt: string;
  isSaved: boolean;
  isLiked: boolean;
  comments?: PostComment[];
  hasMoreComments?: boolean;
  optimistic?: boolean;       

  _count: {
    likes: number;
    comments: number;
  };
}