/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodError } from "zod";
import { envVars } from "../config/env.config";
import { AppError } from "../errors/AppError";
import { Request, Response, NextFunction } from "express";
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleZodError } from "../helpers/handleZodError";
import { handleCastError } from "../helpers/handleCastError";
import { handleMongooseValidationError } from "../helpers/handleMongooseValidationError";

const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong";

    // console.log({ file: req.files });
    // if (req.file) {
    //     await deleteImageFromCLoudinary(req.file.path)
    // };

    // if (req.files && Array.isArray(req.files) && req.files.length) {
    //     const imageUrls = (req.files as Express.Multer.File[]).map(file => file.path)

    //     await Promise.all(imageUrls.map(url => deleteImageFromCLoudinary(url)));
    // };

    //  // Duplicate Key Error
    if (err.code === 11000) {
        const simplified = handleDuplicateError(err);
        statusCode = simplified.statusCode;
        message = simplified.message;
    }

    // CastError
    else if (err.name === "CastError") {
        const simplified = handleCastError(err);
        statusCode = simplified.statusCode;
        message = simplified.message;
    }

    // Mongoose ValidationError
    else if (err.name === "ValidationError") {
        const simplified = handleMongooseValidationError(err);
        res.status(simplified.statusCode).json({
            success: false,
            message: simplified.message,
            errorMessages: simplified.errorMessages,
            error: {
                name: err.name || "Error",
                stack: envVars.NODE_ENV === "development" ? err.stack : undefined,
            },
        });
    }

    // Handle Zod Validation Error
    else if (err instanceof ZodError) {
        const simplified = handleZodError(err);
        res.status(simplified.statusCode).json({
            success: false,
            message: simplified.message,
            errorMessages: simplified.errorMessages,
            error: {
                name: err.name || "Error",
                stack: envVars.NODE_ENV === "development" ? err.stack : undefined,
            },
        });
    }

    //   // AppError
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Error) {
        message = err.message;
    }

    // Default error response
    res.status(statusCode).json({
        success: false,
        message,
        error: {
            name: err.name || "Error",
            stack: envVars.NODE_ENV === "development" ? err.stack : undefined,
        },
    });
};

export default globalErrorHandler;