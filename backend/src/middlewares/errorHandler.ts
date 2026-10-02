import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Nếu là lỗi AppError do chúng ta chủ động ném ra
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message,
        });
    }

    // Nếu là lỗi không lường trước (Lỗi hệ thống / Database)
    console.error("❌ Unhandled Error:", err);
    return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Lỗi máy chủ nội bộ (Internal Server Error)",
    });
};
