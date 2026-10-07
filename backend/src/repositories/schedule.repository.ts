import prisma from "../lib/prisma";
import { DayScheduleInput } from "../types/schedule";

export const scheduleRepository = {
    // Lấy toàn bộ lịch làm việc của một thợ (Thứ 2 đến Chủ nhật)
    async findByHairdresser(hairdresserId: string) {
        return await prisma.workingSchedule.findMany({
            where: { hairdresserId },
            orderBy: { dayOfWeek: "asc" },
        });
    },

    // Tìm lịch làm việc của thợ theo ngày trong tuần (dayOfWeek: 0..6)
    async findByHairdresserAndDay(hairdresserId: string, dayOfWeek: number) {
        return await prisma.workingSchedule.findUnique({
            where: {
                hairdresserId_dayOfWeek: {
                    hairdresserId,
                    dayOfWeek,
                },
            },
        });
    },

    // Cập nhật hoặc tạo mới lịch cho 1 ngày cụ thể (Upsert)
    async upsertDaySchedule(
        hairdresserId: string,
        dayOfWeek: number,
        data: {
            startTime: string;
            endTime: string;
            breakStartTime?: string | null;
            breakEndTime?: string | null;
            isDayOff?: boolean;
        }
    ) {
        return await prisma.workingSchedule.upsert({
            where: {
                hairdresserId_dayOfWeek: {
                    hairdresserId,
                    dayOfWeek,
                },
            },
            update: {
                startTime: data.startTime,
                endTime: data.endTime,
                breakStartTime: data.breakStartTime,
                breakEndTime: data.breakEndTime,
                isDayOff: data.isDayOff ?? false,
            },
            create: {
                hairdresserId,
                dayOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
                breakStartTime: data.breakStartTime ?? "12:00",
                breakEndTime: data.breakEndTime ?? "14:00",
                isDayOff: data.isDayOff ?? false,
            },
        });
    },

    // Cài đặt toàn bộ lịch tuần cho thợ tóc (dùng Prisma Transaction)
    async setWeeklySchedule(hairdresserId: string, schedules: DayScheduleInput[]) {
        return await prisma.$transaction(
            schedules.map((schedule) =>
                prisma.workingSchedule.upsert({
                    where: {
                        hairdresserId_dayOfWeek: {
                            hairdresserId,
                            dayOfWeek: schedule.dayOfWeek,
                        },
                    },
                    update: {
                        startTime: schedule.startTime,
                        endTime: schedule.endTime,
                        breakStartTime: schedule.breakStartTime,
                        breakEndTime: schedule.breakEndTime,
                        isDayOff: schedule.isDayOff ?? false,
                    },
                    create: {
                        hairdresserId,
                        dayOfWeek: schedule.dayOfWeek,
                        startTime: schedule.startTime,
                        endTime: schedule.endTime,
                        breakStartTime: schedule.breakStartTime ?? "12:00",
                        breakEndTime: schedule.breakEndTime ?? "14:00",
                        isDayOff: schedule.isDayOff ?? false,
                    },
                })
            )
        );
    },

    // Xóa lịch của 1 ngày
    async deleteSchedule(hairdresserId: string, dayOfWeek: number) {
        return await prisma.workingSchedule.delete({
            where: {
                hairdresserId_dayOfWeek: {
                    hairdresserId,
                    dayOfWeek,
                },
            },
        });
    },
};
