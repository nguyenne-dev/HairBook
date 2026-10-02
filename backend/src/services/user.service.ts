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
                role: data.role,
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

            // Khách hàng thông thường không được tự ý sửa đổi role
            if (data.role && currentUser.role !== "ADMIN") {
                delete data.role;
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

    // Lấy danh sách thợ tóc (dành cho khách hàng xem và đặt lịch)
    async getHairdressers() {
        try {
            const hairdressers = await userRepository.findByRole("HAIRDRESSER");
            return hairdressers.map(({ passwordHash, ...safeUser }) => safeUser);
        } catch (error) {
            throw error;
        }
    },

    // Lấy tất cả user trong hệ thống (dành riêng cho ADMIN)
    async getAllUser() {
        try {
            const users = await userRepository.findAll();
            return users.map(({ passwordHash, ...safeUser }) => safeUser);
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