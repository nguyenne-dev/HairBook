export type CreateServiceData = {
    name: string;
    description?: string;
    price: number;
    duration: number;
    imageUrl?: string;
    isActive?: boolean;
};

export type UpdateServiceData = {
    name?: string;
    description?: string;
    price?: number;
    duration?: number;
    imageUrl?: string;
    isActive?: boolean;
};
