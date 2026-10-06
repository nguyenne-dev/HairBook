import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../utils/appError";
import { userRepository } from "../repositories/user.repository";

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        let token: string | undefined;

        // Kiểm tra Token từ Header Authorization (Bearer <token>)
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        } 
        // Hoặc kiểm tra Token từ Cookie (httpOnly)
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            throw new AppError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục", 401);
        }

        // Xác thực tính hợp lệ của token
        const decoded = verifyToken(token);

        // Kiểm tra user trong database xem tài khoản còn tồn tại không
        const currentUser = await userRepository.findById(decoded.id);
        if (!currentUser) {
            throw new AppError("Tài khoản người dùng này không còn tồn tại", 401);
        }

        if (!currentUser.isActive) {
            throw new AppError("Tài khoản của bạn đã bị vô hiệu hóa hoặc tạm khóa", 403);
        }

        // Gắn thông tin người dùng vào request để các controller phía sau sử dụng
        req.user = {
            id: currentUser.id,
            role: currentUser.role,
            username: currentUser.username,
            email: currentUser.email,
        };

        next();
    } catch (error: any) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return next(new AppError("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại", 401));
        }
        next(error);
    }
};

/**
 * Middleware phân quyền (chỉ cho phép các role được chỉ định đi qua)
 */
export const authorize = (...roles: ("ADMIN" | "HAIRDRESSER" | "CUSTOMER")[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError("Bạn không có quyền thực hiện hành động này", 403));
        }
        next();
    };
};

/**
 * Middleware xác thực tùy chọn (Không bắt buộc đăng nhập)
 * Nếu có token hợp lệ -> gắn req.user
 * Nếu không có token -> tiếp tục với tư cách khách vãng lai (req.user = undefined)
 */
export const optionalAuthenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        let token: string | undefined;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return next();
        }

        const decoded = verifyToken(token);
        const currentUser = await userRepository.findById(decoded.id);
        if (currentUser && currentUser.isActive) {
            req.user = {
                id: currentUser.id,
                role: currentUser.role,
                username: currentUser.username,
                email: currentUser.email,
            };
        }

        next();
    } catch {
        // Token lỗi hoặc hết hạn -> vẫn cho tiếp tục như khách vãng lai
        next();
    }
};
