import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";

export const userController = {
    // 1. Đăng ký tài khoản
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

    // 2. Đăng nhập
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

    // 3. Đăng xuất (xóa cookie)
    async logout(req: Request, res: Response) {
        res.clearCookie("token");
        return res.status(200).json({
            success: true,
            message: "Đăng xuất thành công",
        });
    },

    // 4. Lấy danh sách thợ tóc (Khách hàng xem để chọn thợ đặt lịch)
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

    // 5. Lấy thông tin cá nhân của chính mình (Profile của người đang đăng nhập)
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

    // 6. Lấy tất cả user (Chỉ ADMIN)
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await userService.getAllUser();
            return res.status(200).json({
                success: true,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    },

    // 7. Lấy chi tiết user theo ID (Kiểm tra quyền: Khách xem chính mình hoặc thợ tóc)
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

    // 8. Cập nhật user (Chỉ chính mình hoặc ADMIN)
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

    // 9. Xóa user (Chỉ chính mình hoặc ADMIN)
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
};
