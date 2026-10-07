import { scheduleRepository } from "../repositories/schedule.repository";
import { userRepository } from "../repositories/user.repository";
import { AppError } from "../utils/appError";
import {
    DayScheduleInput,
    UpdateDayScheduleData,
    AvailableSlotsResponse,
    TimeSlot,
} from "../types/schedule";

const DAY_NAMES = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
];

// Helper kiểm tra định dạng giờ "HH:mm" (ví dụ: "08:00", "20:30")
function isValidTimeFormat(time: string): boolean {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
}

// Helper chuyển "HH:mm" sang số phút trong ngày để so sánh
function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

// Helper chuyển số phút sang chuỗi "HH:mm"
function minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export const scheduleService = {
    // Lấy toàn bộ lịch làm việc của một thợ tóc
    async getScheduleByHairdresser(hairdresserId: string) {
        try {
            const hairdresser = await userRepository.findById(hairdresserId);
            if (!hairdresser || hairdresser.role !== "HAIRDRESSER") {
                throw new AppError("Không tìm thấy thợ cắt tóc này", 404);
            }
            if (!hairdresser.isActive) {
                throw new AppError("Thợ cắt tóc này hiện đã tạm ngưng làm việc", 400);
            }

            return await scheduleRepository.findByHairdresser(hairdresserId);
        } catch (error) {
            throw error;
        }
    },

    // Cài đặt toàn bộ lịch tuần (Chỉ chính chủ thợ tóc hoặc Admin)
    async setWeeklySchedule(
        hairdresserId: string,
        schedules: DayScheduleInput[],
        currentUser: { id: string; role: string }
    ) {
        try {
            // Kiểm tra quyền
            if (currentUser.id !== hairdresserId && currentUser.role !== "ADMIN") {
                throw new AppError("Bạn không có quyền chỉnh sửa lịch của thợ tóc này", 403);
            }

            if (!Array.isArray(schedules) || schedules.length === 0) {
                throw new AppError("Danh sách lịch làm việc (schedules) phải là một mảng không rỗng", 400);
            }

            const hairdresser = await userRepository.findById(hairdresserId);
            if (!hairdresser || hairdresser.role !== "HAIRDRESSER") {
                throw new AppError("Không tìm thấy thợ cắt tóc này", 404);
            }

            // Kiểm tra trùng lặp thứ trong tuần
            const seenDays = new Set<number>();
            for (const item of schedules) {
                if (typeof item.dayOfWeek !== "number" || isNaN(item.dayOfWeek) || !Number.isInteger(item.dayOfWeek) || item.dayOfWeek < 0 || item.dayOfWeek > 6) {
                    throw new AppError("dayOfWeek phải là số nguyên từ 0 (Chủ nhật) đến 6 (Thứ 7)", 400);
                }

                if (seenDays.has(item.dayOfWeek)) {
                    throw new AppError(`Trùng lặp cấu hình cho thứ ${item.dayOfWeek} trong danh sách gửi lên`, 400);
                }
                seenDays.add(item.dayOfWeek);

                if (!isValidTimeFormat(item.startTime) || !isValidTimeFormat(item.endTime)) {
                    throw new AppError("Giờ làm việc phải theo định dạng HH:mm (ví dụ 08:00)", 400);
                }

                if (timeToMinutes(item.startTime) >= timeToMinutes(item.endTime)) {
                    throw new AppError("Giờ bắt đầu phải nhỏ hơn giờ kết thúc", 400);
                }

                // Kiểm tra giờ nghỉ trưa (nếu có cấu hình)
                if (item.breakStartTime && item.breakEndTime) {
                    if (!isValidTimeFormat(item.breakStartTime) || !isValidTimeFormat(item.breakEndTime)) {
                        throw new AppError("Giờ nghỉ trưa phải theo định dạng HH:mm (ví dụ 12:00)", 400);
                    }
                    if (timeToMinutes(item.breakStartTime) >= timeToMinutes(item.breakEndTime)) {
                        throw new AppError("Giờ bắt đầu nghỉ trưa phải nhỏ hơn giờ kết thúc nghỉ trưa", 400);
                    }
                    if (
                        timeToMinutes(item.breakStartTime) < timeToMinutes(item.startTime) ||
                        timeToMinutes(item.breakEndTime) > timeToMinutes(item.endTime)
                    ) {
                        throw new AppError("Giờ nghỉ trưa phải nằm trong khoảng giờ làm việc", 400);
                    }
                }
            }

            return await scheduleRepository.setWeeklySchedule(hairdresserId, schedules);
        } catch (error) {
            throw error;
        }
    },

    // Cập nhật ca làm của 1 ngày cụ thể (Chỉ chính chủ thợ hoặc Admin)
    async updateDaySchedule(
        hairdresserId: string,
        dayOfWeek: number,
        data: UpdateDayScheduleData,
        currentUser: { id: string; role: string }
    ) {
        try {
            if (currentUser.id !== hairdresserId && currentUser.role !== "ADMIN") {
                throw new AppError("Bạn không có quyền chỉnh sửa lịch của thợ tóc này", 403);
            }

            if (typeof dayOfWeek !== "number" || isNaN(dayOfWeek) || !Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
                throw new AppError("dayOfWeek phải là số nguyên từ 0 (Chủ nhật) đến 6 (Thứ 7)", 400);
            }

            const hairdresser = await userRepository.findById(hairdresserId);
            if (!hairdresser || hairdresser.role !== "HAIRDRESSER") {
                throw new AppError("Không tìm thấy thợ cắt tóc này", 404);
            }

            const existingSchedule = await scheduleRepository.findByHairdresserAndDay(
                hairdresserId,
                dayOfWeek
            );

            const startTime = data.startTime ?? existingSchedule?.startTime ?? "08:00";
            const endTime = data.endTime ?? existingSchedule?.endTime ?? "20:00";
            const breakStartTime =
                data.breakStartTime !== undefined
                    ? data.breakStartTime
                    : existingSchedule?.breakStartTime ?? "12:00";
            const breakEndTime =
                data.breakEndTime !== undefined
                    ? data.breakEndTime
                    : existingSchedule?.breakEndTime ?? "14:00";
            const isDayOff = data.isDayOff ?? existingSchedule?.isDayOff ?? false;

            if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
                throw new AppError("Giờ làm việc phải theo định dạng HH:mm (ví dụ 08:00)", 400);
            }

            if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
                throw new AppError("Giờ bắt đầu phải nhỏ hơn giờ kết thúc", 400);
            }

            if (breakStartTime && breakEndTime) {
                if (!isValidTimeFormat(breakStartTime) || !isValidTimeFormat(breakEndTime)) {
                    throw new AppError("Giờ nghỉ trưa phải theo định dạng HH:mm (ví dụ 12:00)", 400);
                }
                if (timeToMinutes(breakStartTime) >= timeToMinutes(breakEndTime)) {
                    throw new AppError("Giờ bắt đầu nghỉ trưa phải nhỏ hơn giờ kết thúc nghỉ trưa", 400);
                }
                if (
                    timeToMinutes(breakStartTime) < timeToMinutes(startTime) ||
                    timeToMinutes(breakEndTime) > timeToMinutes(endTime)
                ) {
                    throw new AppError("Giờ nghỉ trưa phải nằm trong khoảng giờ làm việc", 400);
                }
            }

            return await scheduleRepository.upsertDaySchedule(hairdresserId, dayOfWeek, {
                startTime,
                endTime,
                breakStartTime,
                breakEndTime,
                isDayOff,
            });
        } catch (error) {
            throw error;
        }
    },

    // Bật / Tắt ngày nghỉ trong tuần (Toggle Day Off)
    async toggleDayOff(
        hairdresserId: string,
        dayOfWeek: number,
        currentUser: { id: string; role: string }
    ) {
        try {
            if (currentUser.id !== hairdresserId && currentUser.role !== "ADMIN") {
                throw new AppError("Bạn không có quyền chỉnh sửa lịch của thợ tóc này", 403);
            }

            if (typeof dayOfWeek !== "number" || isNaN(dayOfWeek) || !Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
                throw new AppError("dayOfWeek phải là số nguyên từ 0 (Chủ nhật) đến 6 (Thứ 7)", 400);
            }

            const hairdresser = await userRepository.findById(hairdresserId);
            if (!hairdresser || hairdresser.role !== "HAIRDRESSER") {
                throw new AppError("Không tìm thấy thợ cắt tóc này", 404);
            }

            const existingSchedule = await scheduleRepository.findByHairdresserAndDay(
                hairdresserId,
                dayOfWeek
            );

            const isDayOff = existingSchedule ? !existingSchedule.isDayOff : true;
            const startTime = existingSchedule?.startTime ?? "08:00";
            const endTime = existingSchedule?.endTime ?? "20:00";

            return await scheduleRepository.upsertDaySchedule(hairdresserId, dayOfWeek, {
                startTime,
                endTime,
                isDayOff,
            });
        } catch (error) {
            throw error;
        }
    },

    // Khách hàng / Hệ thống: Lấy các khung giờ còn trống (Available Time Slots) theo ngày
    async getAvailableTimeSlots(
        hairdresserId: string,
        dateStr: string,
        durationMinutes: number = 30
    ): Promise<AvailableSlotsResponse> {
        try {
            // Chống DoS: Validate durationMinutes phải hợp lệ
            if (typeof durationMinutes !== "number" || isNaN(durationMinutes) || durationMinutes < 15 || durationMinutes > 480) {
                throw new AppError("Thời lượng dịch vụ (duration) không hợp lệ (từ 15 đến 480 phút)", 400);
            }

            // Kiểm tra định dạng ngày YYYY-MM-DD
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                throw new AppError("Ngày không hợp lệ. Vui lòng truyền định dạng YYYY-MM-DD", 400);
            }

            const [year, month, day] = dateStr.split("-").map(Number);
            const date = new Date(year, month - 1, day);
            if (isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                throw new AppError("Ngày không tồn tại trong lịch", 400);
            }

            const hairdresser = await userRepository.findById(hairdresserId);
            if (!hairdresser || hairdresser.role !== "HAIRDRESSER") {
                throw new AppError("Không tìm thấy thợ cắt tóc này", 404);
            }
            if (!hairdresser.isActive) {
                return {
                    date: dateStr,
                    dayOfWeek: date.getDay(),
                    dayName: DAY_NAMES[date.getDay()],
                    isDayOff: true,
                    slots: [],
                };
            }

            // Lấy thứ trong tuần (0 = Chủ nhật, 1 = Thứ 2, ...)
            const dayOfWeek = date.getDay();
            const dayName = DAY_NAMES[dayOfWeek];

            const schedule = await scheduleRepository.findByHairdresserAndDay(
                hairdresserId,
                dayOfWeek
            );

            // Nếu thợ không có lịch ngày này hoặc đã đăng ký nghỉ (Day Off)
            if (!schedule || schedule.isDayOff) {
                return {
                    date: dateStr,
                    dayOfWeek,
                    dayName,
                    isDayOff: true,
                    slots: [],
                };
            }

            // Tạo các mốc giờ nhận lịch (Booking Acceptance Slots)
            const startMinutes = timeToMinutes(schedule.startTime);
            const endMinutes = timeToMinutes(schedule.endTime);
            const hasBreak = Boolean(schedule.breakStartTime && schedule.breakEndTime);
            const breakStartMinutes = hasBreak ? timeToMinutes(schedule.breakStartTime!) : -1;
            const breakEndMinutes = hasBreak ? timeToMinutes(schedule.breakEndTime!) : -1;
            const slots: TimeSlot[] = [];

            // Kiểm tra nếu là ngày hôm nay thì so sánh với giờ hiện tại
            const now = new Date();
            const isToday =
                now.getFullYear() === year &&
                now.getMonth() === month - 1 &&
                now.getDate() === day;
            const currentNowMinutes = now.getHours() * 60 + now.getMinutes();

            // Bước nhảy giữa các mốc nhận khách (30 phút/mốc)
            const SLOT_STEP = 30;
            let currentMinutes = startMinutes;

            while (currentMinutes < endMinutes) {
                // Nếu mốc giờ rơi vào khung nghỉ trưa (12:00 - 14:00): đóng cổng nhận khách mới
                if (hasBreak && currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes) {
                    currentMinutes = breakEndMinutes;
                    continue;
                }

                const slotStart = minutesToTime(currentMinutes);
                const slotEnd = minutesToTime(currentMinutes + durationMinutes);

                // Slot chỉ available nếu không nằm trong quá khứ của ngày hôm nay
                const isPast = isToday && currentMinutes <= currentNowMinutes;

                slots.push({
                    startTime: slotStart,
                    endTime: slotEnd,
                    isAvailable: !isPast,
                });

                currentMinutes += SLOT_STEP;
            }

            return {
                date: dateStr,
                dayOfWeek,
                dayName,
                isDayOff: false,
                breakStartTime: schedule.breakStartTime,
                breakEndTime: schedule.breakEndTime,
                slots,
            };
        } catch (error) {
            throw error;
        }
    },
};
