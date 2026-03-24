export interface Profile {
  id: string;
  username: string;

  name?: string;
  email?: string;
  bio?: string;
  image?: string | null;
  createdAt?: string;

  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}