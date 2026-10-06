import { userRepository } from "../repositories/user.repository";
import { AppError } from "../utils/appError";
import bcrypt from "bcrypt";
import { CreateUserData, LoginUserData, UpdateUserData } from "../types/user";
import { generateToken } from "../utils/jwt";

export const userService = {
    async registerUser(data: CreateUserData) {
        try {
            const existingUser = await userRepository.findByEmail(data.email);
            if (existingUser) throw new AppError("Email đã đăng ký", 400);

            if (data.username) {
                const existingUsername = await userRepository.findByUsername(data.username);
                if (existingUsername) throw new AppError("Tên tài khoản đã tồn tại", 400);
            }
            const passwordHash = await bcrypt.hash(data.password, 10);
            const user = {
                username: data.username,
                email: data.email,
                passwordHash: passwordHash,
                phoneNumber: data.phoneNumber,
                gender: data.gender,
                address: data.address,
                avatar: data.avatar,
                role: "CUSTOMER" as const,
            }
            const dbResult = await userRepository.create(user);
            const { passwordHash: pwh, ...result } = dbResult;
            return result;
        } catch (error) {
            throw error;
        }
    },

    async loginUser(data: LoginUserData) {
        try {
            const user = await userRepository.findByUsername(data.username);
            if (!user) throw new AppError("Tên tài khoản hoặc mật khẩu không chính xác", 400);

            const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
            if (!isPasswordValid) throw new AppError("Tên tài khoản hoặc mật khẩu không chính xác", 400);

            if (!user.isActive) {
                throw new AppError("Tài khoản của bạn đã bị vô hiệu hóa hoặc tạm khóa", 403);
            }

            const { passwordHash, ...result } = user;

            const token = generateToken({ id: user.id, role: user.role });

            return {
                user: result,
                token,
            };
        } catch (error) {
            throw error;
        }
    },

    async updateUser(id: string, data: UpdateUserData, currentUser: { id: string; role: string }) {
        try {
            // Chỉ chính chủ hoặc ADMIN mới được sửa
            if (currentUser.id !== id && currentUser.role !== "ADMIN") {
                throw new AppError("Bạn chỉ có quyền chỉnh sửa thông tin của chính mình", 403);
            }

            const user = await userRepository.findById(id);
            if (!user) throw new AppError("Tài khoản không tồn tại", 404);

            // Khách hàng thông thường không được tự ý sửa đổi role hoặc tự mở khóa tài khoản
            if (data.role && currentUser.role !== "ADMIN") {
                delete data.role;
            }
            if (data.isActive !== undefined && currentUser.role !== "ADMIN") {
                delete data.isActive;
            }

            if (data.password) {
                const { password, ...updateData } = data;
                const passwordHash = await bcrypt.hash(password, 10);
                const updatedUser = await userRepository.update(id, { ...updateData, passwordHash });
                const { passwordHash: pwh, ...result } = updatedUser;
                return result;
            } else {
                const updatedUser = await userRepository.update(id, data);
                const { passwordHash, ...result } = updatedUser;
                return result;
            }
        } catch (error) {
            throw error;
        }
    },

    async deleteUser(id: string, currentUser: { id: string; role: string }) {
        try {
            // Chỉ chính chủ hoặc ADMIN mới được xóa tài khoản
            if (currentUser.id !== id && currentUser.role !== "ADMIN") {
                throw new AppError("Bạn chỉ có quyền xóa tài khoản của chính mình", 403);
            }

            const user = await userRepository.findById(id);
            if (!user) throw new AppError("Tài khoản không tồn tại", 404);
            const deletedUser = await userRepository.delete(id);
            const { passwordHash, ...result } = deletedUser;
            return result;
        } catch (error) {
            throw error;
        }
    },

    // Lấy thông tin tài khoản của chính mình (Profile cá nhân)
    async getMe(id: string) {
        try {
            const user = await userRepository.findById(id);
            if (!user) throw new AppError("Tài khoản không tồn tại", 404);
            const { passwordHash, ...result } = user;
            return result;
        } catch (error) {
            throw error;
        }
    },

    // Lấy danh sách thợ tóc (chỉ lấy thợ đang hoạt động để khách đặt lịch)
    async getHairdressers() {
        try {
            const hairdressers = await userRepository.findByRole("HAIRDRESSER", true);
            return hairdressers.map(({ passwordHash, ...safeUser }) => safeUser);
        } catch (error) {
            throw error;
        }
    },

    // Lấy tất cả user trong hệ thống (dành riêng cho ADMIN, có thể lọc isActive)
    async getAllUser(isActive?: boolean) {
        try {
            const users = await userRepository.findAll(isActive);
            return users.map(({ passwordHash, ...safeUser }) => safeUser);
        } catch (error) {
            throw error;
        }
    },

    // Bật / Tắt trạng thái hoạt động tài khoản (Chỉ ADMIN)
    async toggleUserStatus(id: string, currentAdminId: string) {
        try {
            if (id === currentAdminId) {
                throw new AppError("Bạn không thể tự vô hiệu hóa tài khoản của chính mình", 400);
            }

            const user = await userRepository.findById(id);
            if (!user) throw new AppError("Tài khoản không tồn tại", 404);

            const updated = await userRepository.update(id, { isActive: !user.isActive });
            const { passwordHash, ...result } = updated;
            return result;
        } catch (error) {
            throw error;
        }
    },

    async getUserById(id: string, currentUser: { id: string; role: string }) {
        try {
            const user = await userRepository.findById(id);
            if (!user) throw new AppError("Tài khoản không tồn tại", 404);
            
            // Nếu là thợ tóc (HAIRDRESSER): Ai cũng xem được profile
            // Nếu là khách hàng (CUSTOMER) / ADMIN: Chỉ chính chủ HOẶC ADMIN mới được xem
            if (user.role !== "HAIRDRESSER" && currentUser.id !== id && currentUser.role !== "ADMIN") {
                throw new AppError("Bạn không có quyền xem thông tin của khách hàng khác", 403);
            }

            const { passwordHash, ...result } = user;
            return result;
        } catch (error) {
            throw error;
        }
    },

    async getUserByEmail(email: string) {
        try {
            const user = await userRepository.findByEmail(email);
            if (!user) throw new AppError("Tài khoản không tồn tại", 404);
            const { passwordHash, ...result } = user;
            return result;
        } catch (error) {
            throw error;
        }
    },

    async getUserByUsername(username: string) {
        try {
            const user = await userRepository.findByUsername(username);
            if (!user) throw new AppError("Tài khoản không tồn tại", 404);
            const { passwordHash, ...result } = user;
            return result;
        } catch (error) {
            throw error;
        }
    }
}