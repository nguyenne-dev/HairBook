export type DayScheduleInput = {
    dayOfWeek: number; // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    startTime: string; // "08:00"
    endTime: string;   // "20:00"
    breakStartTime?: string | null; // "12:00" (null nếu không nghỉ trưa)
    breakEndTime?: string | null;   // "14:00" (null nếu không nghỉ trưa)
    isDayOff?: boolean;
};

export type SetWeeklyScheduleData = {
    schedules: DayScheduleInput[];
};

export type UpdateDayScheduleData = {
    startTime?: string;
    endTime?: string;
    breakStartTime?: string | null;
    breakEndTime?: string | null;
    isDayOff?: boolean;
};

export type TimeSlot = {
    startTime: string; // "08:00"
    endTime: string;   // "08:30"
    isAvailable: boolean;
};

export type AvailableSlotsResponse = {
    date: string;
    dayOfWeek: number;
    dayName: string;
    isDayOff: boolean;
    breakStartTime?: string | null;
    breakEndTime?: string | null;
    slots: TimeSlot[];
};

