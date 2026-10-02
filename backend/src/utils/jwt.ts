import jwt from "jsonwebtoken";

// Định nghĩa kiểu dữ liệu lưu trong Token
export interface TokenPayload {
    id: string;
    role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "booking_hair_secret_key_2026";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as string;

/**
 * Tạo token JWT mới
 */
export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);
};

/**
 * Giải mã và kiểm tra tính hợp lệ của token JWT
 */
export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
