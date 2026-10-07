import { Router } from "express";
import { scheduleController } from "../controllers/schedule.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Thợ tóc xem lịch của chính mình
router.get("/me", authenticate, authorize("HAIRDRESSER"), scheduleController.getMySchedule);

// Khách hàng xem lịch và khung giờ trống
router.get("/hairdresser/:hairdresserId", scheduleController.getByHairdresser);
router.get("/hairdresser/:hairdresserId/slots", scheduleController.getAvailableSlots);

// Quản lý ca làm việc (Thợ tóc hoặc Admin)
router.post("/hairdresser/:hairdresserId/weekly", authenticate, scheduleController.setWeeklySchedule);
router.put("/hairdresser/:hairdresserId/day/:dayOfWeek", authenticate, scheduleController.updateDaySchedule);
router.patch("/hairdresser/:hairdresserId/day/:dayOfWeek/toggle-dayoff", authenticate, scheduleController.toggleDayOff);

export default router;
