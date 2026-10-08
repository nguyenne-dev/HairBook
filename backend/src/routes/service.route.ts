import { Router } from "express";
import { serviceController } from "../controllers/service.controller";
import { authenticate, authorize, optionalAuthenticate } from "../middlewares/auth.middleware";

const router = Router();

// Admin
router.get("/admin/all", authenticate, authorize("ADMIN"), serviceController.getForAdmin);
router.post("/", authenticate, authorize("ADMIN"), serviceController.create);
router.put("/:id", authenticate, authorize("ADMIN"), serviceController.update);
router.patch("/:id/toggle-status", authenticate, authorize("ADMIN"), serviceController.toggleStatus);
router.delete("/:id", authenticate, authorize("ADMIN"), serviceController.delete);

// Public
router.get("/", serviceController.getForCustomer);
router.get("/:id", optionalAuthenticate, serviceController.getById);

export default router;
