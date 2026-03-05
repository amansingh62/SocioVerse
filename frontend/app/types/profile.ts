export interface Profile {
    id: string;
    name: string;
    username: string;
    email: string;
    bio?: string;
    image?: string;
    createdAt: string;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
};