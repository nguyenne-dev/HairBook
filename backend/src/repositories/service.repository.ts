import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const serviceRepository = {
    // Tạo mới dịch vụ
    async create(data: Prisma.ServiceUncheckedCreateInput) {
        return await prisma.service.create({
            data,
        });
    },

    // Lấy danh sách tất cả dịch vụ
    async findAll(isActive?: boolean) {
        return await prisma.service.findMany({
            where: {
                deletedAt: null,
                ...(isActive !== undefined && { isActive }),
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    // Tìm dịch vụ theo ID
    async findById(id: string) {
        return await prisma.service.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
    },

    // Tìm dịch vụ theo Tên
    async findByName(name: string) {
        return await prisma.service.findFirst({
            where: {
                name,
                deletedAt: null,
            },
        });
    },

    // Cập nhật dịch vụ
    async update(id: string, data: Prisma.ServiceUncheckedUpdateInput) {
        return await prisma.service.update({
            where: { id },
            data,
        });
    },

    // Xóa mềm
    async softDelete(id: string, deletedById: string) {
        return await prisma.service.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedById,
                isActive: false,
            },
        });
    },

    // Xóa
    async delete(id: string) {
        return await prisma.service.delete({
            where: { id }
        })
    }
};
