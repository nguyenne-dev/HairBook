export type CreateUserData = {
    username: string;
    email: string;
    password: string;
    phoneNumber?: string;
    gender?: string;
    address?: string;
    avatar?: string;
    role?: "ADMIN" | "HAIRDRESSER" | "CUSTOMER";
    isActive?: boolean;
};

export type LoginUserData = {
    username: string;
    password: string;
};

export type UpdateUserData = {
    password?: string;
    phoneNumber?: string;
    gender?: string;
    address?: string;
    avatar?: string;
    role?: "ADMIN" | "HAIRDRESSER" | "CUSTOMER";
    isActive?: boolean;
};