import { Request, Response, NextFunction } from "express";
import { hairService } from "../services/service.service";

export const serviceController = {
    // Tạo mới dịch vụ
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const service = await hairService.createService(req.body, userId);
            return res.status(201).json({
                success: true,
                message: "Tạo dịch vụ thành công",
                data: service,
            });
        } catch (error) {
            next(error);
        }
    },

    // Lấy danh sách dịch vụ cho khách hàng
    async getForCustomer(req: Request, res: Response, next: NextFunction) {
        try {
            const services = await hairService.getServicesForCustomer();
            return res.status(200).json({
                success: true,
                data: services,
            });
        } catch (error) {
            next(error);
        }
    },

    // Lấy danh sách dịch vụ cho admin
    async getForAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const isActive =
                req.query.isActive !== undefined
                    ? req.query.isActive === "true"
                    : undefined;

            const services = await hairService.getServicesForAdmin(isActive);
            return res.status(200).json({
                success: true,
                data: services,
            });
        } catch (error) {
            next(error);
        }
    },

    // Lấy chi tiết dịch vụ theo ID
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const userRole = req.user?.role;
            const service = await hairService.getServiceById(id, userRole);
            return res.status(200).json({
                success: true,
                data: service,
            });
        } catch (error) {
            next(error);
        }
    },

    // Cập nhật dịch vụ
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const userId = req.user!.id;
            const updatedService = await hairService.updateService(id, req.body, userId);
            return res.status(200).json({
                success: true,
                message: "Cập nhật dịch vụ thành công",
                data: updatedService,
            });
        } catch (error) {
            next(error);
        }
    },

    // Bật/tắt trạng thái hoạt động dịch vụ
    async toggleStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const userId = req.user!.id;
            const updatedService = await hairService.toggleServiceStatus(id, userId);
            return res.status(200).json({
                success: true,
                message: `Dịch vụ đã được ${updatedService.isActive ? "kích hoạt" : "tạm dừng"}`,
                data: updatedService,
            });
        } catch (error) {
            next(error);
        }
    },

    // Xóa mềm dịch vụ
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const userId = req.user!.id;
            const deletedService = await hairService.softDeleteService(id, userId);
            return res.status(200).json({
                success: true,
                message: "Xóa dịch vụ thành công",
                data: deletedService,
            });
        } catch (error) {
            next(error);
        }
    },
};
