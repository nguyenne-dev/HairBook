import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";

export const userController = {
    // Đăng ký tài khoản
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await userService.registerUser(req.body);
            return res.status(201).json({
                success: true,
                message: "Đăng ký tài khoản thành công",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    // Đăng nhập
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { user, token } = await userService.loginUser(req.body);

            // Gắn token vào httpOnly Cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });

            return res.status(200).json({
                success: true,
                message: "Đăng nhập thành công",
                data: {
                    user,
                    token,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    // Đăng xuất (xóa cookie)
    async logout(req: Request, res: Response) {
        res.clearCookie("token");
        return res.status(200).json({
            success: true,
            message: "Đăng xuất thành công",
        });
    },

    // Lấy danh sách thợ tóc (Khách hàng xem để chọn thợ đặt lịch)
    async getHairdressers(req: Request, res: Response, next: NextFunction) {
        try {
            const hairdressers = await userService.getHairdressers();
            return res.status(200).json({
                success: true,
                data: hairdressers,
            });
        } catch (error) {
            next(error);
        }
    },

    // Lấy thông tin cá nhân của chính mình (Profile của người đang đăng nhập)
    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            const me = await userService.getMe(req.user!.id);
            return res.status(200).json({
                success: true,
                data: me,
            });
        } catch (error) {
            next(error);
        }
    },

    // Lấy tất cả user (Chỉ ADMIN, có thể lọc isActive)
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const isActive =
                req.query.isActive !== undefined
                    ? req.query.isActive === "true"
                    : undefined;
            const users = await userService.getAllUser(isActive);
            return res.status(200).json({
                success: true,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    },

    // Lấy chi tiết user theo ID (Kiểm tra quyền: Khách xem chính mình hoặc thợ tóc)
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const currentUser = req.user!;
            const user = await userService.getUserById(id, currentUser);
            return res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    // Cập nhật user (Chỉ chính mình hoặc ADMIN)
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const currentUser = req.user!;
            const updatedUser = await userService.updateUser(id, req.body, currentUser);
            return res.status(200).json({
                success: true,
                message: "Cập nhật tài khoản thành công",
                data: updatedUser,
            });
        } catch (error) {
            next(error);
        }
    },

    // Xóa user (Chỉ chính mình hoặc ADMIN)
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const currentUser = req.user!;
            const deletedUser = await userService.deleteUser(id, currentUser);
            return res.status(200).json({
                success: true,
                message: "Xóa tài khoản thành công",
                data: deletedUser,
            });
        } catch (error) {
            next(error);
        }
    },

    // Bật / Tắt trạng thái hoạt động tài khoản (Chỉ ADMIN)
    async toggleStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const currentAdminId = req.user!.id;
            const updatedUser = await userService.toggleUserStatus(id, currentAdminId);
            return res.status(200).json({
                success: true,
                message: `Tài khoản đã được ${updatedUser.isActive ? "kích hoạt" : "vô hiệu hóa"}`,
                data: updatedUser,
            });
        } catch (error) {
            next(error);
        }
    },
};
