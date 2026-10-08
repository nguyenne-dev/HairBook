import { serviceRepository } from "../repositories/service.repository";
import { AppError } from "../utils/appError";
import { CreateServiceData, UpdateServiceData } from "../types/service";

export const hairService = {
    // Tạo mới dịch vụ (Chỉ Admin)
    async createService(data: CreateServiceData, userId: string) {
        try {
            // Kiểm tra tên dịch vụ đã tồn tại chưa
            const existingService = await serviceRepository.findByName(data.name);
            if (existingService) {
                throw new AppError("Tên dịch vụ này đã tồn tại", 400);
            }

            // Validate dữ liệu đầu vào
            if (data.price < 0) {
                throw new AppError("Giá dịch vụ không được nhỏ hơn 0", 400);
            }
            if (data.duration <= 0) {
                throw new AppError("Thời lượng dịch vụ phải lớn hơn 0 phút", 400);
            }

            const newService = await serviceRepository.create({
                name: data.name,
                description: data.description,
                price: data.price,
                duration: data.duration,
                imageUrl: data.imageUrl,
                isActive: data.isActive ?? true,
                createdById: userId,
            });

            return newService;
        } catch (error) {
            throw error;
        }
    },

    // Lấy danh sách dịch vụ cho Khách hàng (Chỉ lấy dịch vụ đang hoạt động)
    async getServicesForCustomer() {
        try {
            return await serviceRepository.findAll(true);
        } catch (error) {
            throw error;
        }
    },

    // Lấy danh sách dịch vụ cho Admin (Xem tất cả, có thể lọc theo isActive)
    async getServicesForAdmin(isActive?: boolean) {
        try {
            return await serviceRepository.findAll(isActive);
        } catch (error) {
            throw error;
        }
    },

    // Lấy chi tiết dịch vụ theo ID
    async getServiceById(id: string, userRole?: string) {
        try {
            const service = await serviceRepository.findById(id);
            if (!service) {
                throw new AppError("Dịch vụ không tồn tại", 404);
            }

            // Nếu không phải Admin mà dịch vụ đang tắt -> Không cho xem
            if (userRole !== "ADMIN" && !service.isActive) {
                throw new AppError("Dịch vụ hiện đang tạm ngưng phục vụ", 404);
            }

            return service;
        } catch (error) {
            throw error;
        }
    },

    // Cập nhật dịch vụ (Chỉ Admin)
    async updateService(id: string, data: UpdateServiceData, userId: string) {
        try {
            const existingService = await serviceRepository.findById(id);
            if (!existingService) {
                throw new AppError("Dịch vụ không tồn tại", 404);
            }

            // Nếu cập nhật tên, kiểm tra tên mới có bị trùng với dịch vụ khác không
            if (data.name && data.name !== existingService.name) {
                const duplicateName = await serviceRepository.findByName(data.name);
                if (duplicateName) {
                    throw new AppError("Tên dịch vụ này đã tồn tại", 400);
                }
            }

            if (data.price !== undefined && data.price < 0) {
                throw new AppError("Giá dịch vụ không được nhỏ hơn 0", 400);
            }

            if (data.duration !== undefined && data.duration <= 0) {
                throw new AppError("Thời lượng dịch vụ phải lớn hơn 0 phút", 400);
            }

            const updatedService = await serviceRepository.update(id, {
                ...data,
                updatedById: userId,
            });

            return updatedService;
        } catch (error) {
            throw error;
        }
    },

    // Bật / Tắt trạng thái hoạt động của dịch vụ (Chỉ Admin)
    async toggleServiceStatus(id: string, userId: string) {
        try {
            const existingService = await serviceRepository.findById(id);
            if (!existingService) {
                throw new AppError("Dịch vụ không tồn tại", 404);
            }

            const updatedService = await serviceRepository.update(id, {
                isActive: !existingService.isActive,
                updatedById: userId,
            });

            return updatedService;
        } catch (error) {
            throw error;
        }
    },

    // Xóa mềm dịch vụ (Chỉ Admin)
    async softDeleteService(id: string, userId: string) {
        try {
            const existingService = await serviceRepository.findById(id);
            if (!existingService) {
                throw new AppError("Dịch vụ không tồn tại", 404);
            }

            const deletedService = await serviceRepository.softDelete(id, userId);
            return deletedService;
        } catch (error) {
            throw error;
        }
    },
};