import { Request, Response, NextFunction } from "express";
import { scheduleService } from "../services/schedule.service";

export const scheduleController = {
    // Thợ tóc xem lịch làm việc của chính mình
    async getMySchedule(req: Request, res: Response, next: NextFunction) {
        try {
            const hairdresserId = req.user!.id;
            const schedules = await scheduleService.getScheduleByHairdresser(hairdresserId);
            return res.status(200).json({
                success: true,
                data: schedules,
            });
        } catch (error) {
            next(error);
        }
    },

    // Khách hàng hoặc Admin xem lịch làm việc của 1 thợ tóc
    async getByHairdresser(req: Request, res: Response, next: NextFunction) {
        try {
            const hairdresserId = req.params.hairdresserId as string;
            const schedules = await scheduleService.getScheduleByHairdresser(hairdresserId);
            return res.status(200).json({
                success: true,
                data: schedules,
            });
        } catch (error) {
            next(error);
        }
    },

    // Cài đặt toàn bộ lịch tuần cho thợ tóc (Thợ chính chủ hoặc Admin)
    async setWeeklySchedule(req: Request, res: Response, next: NextFunction) {
        try {
            const hairdresserId = req.params.hairdresserId as string;
            const currentUser = req.user!;
            const schedules = await scheduleService.setWeeklySchedule(
                hairdresserId,
                req.body.schedules,
                currentUser
            );
            return res.status(200).json({
                success: true,
                message: "Cài đặt lịch làm việc tuần thành công",
                data: schedules,
            });
        } catch (error) {
            next(error);
        }
    },

    // Cập nhật ca làm của 1 ngày (Thợ chính chủ hoặc Admin)
    async updateDaySchedule(req: Request, res: Response, next: NextFunction) {
        try {
            const hairdresserId = req.params.hairdresserId as string;
            const dayOfWeek = Number(req.params.dayOfWeek);
            const currentUser = req.user!;
            const updated = await scheduleService.updateDaySchedule(
                hairdresserId,
                dayOfWeek,
                req.body,
                currentUser
            );
            return res.status(200).json({
                success: true,
                message: "Cập nhật ca làm việc thành công",
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    },

    // Bật / Tắt ngày nghỉ trong tuần (Toggle Day Off)
    async toggleDayOff(req: Request, res: Response, next: NextFunction) {
        try {
            const hairdresserId = req.params.hairdresserId as string;
            const dayOfWeek = Number(req.params.dayOfWeek);
            const currentUser = req.user!;
            const updated = await scheduleService.toggleDayOff(
                hairdresserId,
                dayOfWeek,
                currentUser
            );
            return res.status(200).json({
                success: true,
                message: `Đã đổi trạng thái sang: ${updated.isDayOff ? "Ngày nghỉ" : "Ngày làm việc"}`,
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    },

    // Khách hàng xem danh sách các khung giờ còn trống (Slots) theo ngày
    async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
        try {
            const hairdresserId = req.params.hairdresserId as string;
            const dateStr =
                (req.query.date as string) ||
                new Date().toISOString().split("T")[0];
            const duration = req.query.duration
                ? Number(req.query.duration)
                : 30;

            const slotsData = await scheduleService.getAvailableTimeSlots(
                hairdresserId,
                dateStr,
                duration
            );
            return res.status(200).json({
                success: true,
                data: slotsData,
            });
        } catch (error) {
            next(error);
        }
    },
};
