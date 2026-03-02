export interface Profile {
    id: string;
    name: string;
    email: string;
    bio?: string;
    image?: string;
    createdAt: string;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
};