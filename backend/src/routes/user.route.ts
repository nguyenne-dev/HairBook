import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Đăng ký, Đăng nhập, Đăng xuất
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// Mọi người đều xem được danh sách thợ tóc
router.get("/hairdressers", userController.getHairdressers);

// Cần đăng nhập
router.use(authenticate);

// Xem thông tin cá nhân của người đang đăng nhập
router.get("/me", userController.getMe);

// Xem chi tiết user theo ID
router.get("/:id", userController.getById);

// Cập nhật thông tin
router.put("/:id", userController.update);

// Xóa tài khoản
router.delete("/:id", userController.delete);

// ADMIN ONLY
router.get("/", authorize("ADMIN"), userController.getAll);

export default router;
