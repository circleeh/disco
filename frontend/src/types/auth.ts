export interface UserProfile {
    id: string;
    email: string;
    name: string;
    picture?: string;
    googleId: string;
}

export interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    login: () => void;
    logout: () => void;
    fetchUser: () => Promise<void>;
}
