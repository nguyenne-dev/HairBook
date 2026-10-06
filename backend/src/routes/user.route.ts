import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Public
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/hairdressers", userController.getHairdressers);

// Cần đăng nhập
router.use(authenticate);

router.get("/me", userController.getMe);
router.get("/:id", userController.getById);
router.put("/:id", userController.update);
router.delete("/:id", userController.delete);

// ADMIN ONLY
router.get("/", authorize("ADMIN"), userController.getAll);
router.patch("/:id/toggle-status", authorize("ADMIN"), userController.toggleStatus);

export default router;
