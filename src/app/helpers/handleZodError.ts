import { ZodError } from "zod";

export const handleZodError = (err: ZodError) => {
    const errorMessages = err.issues.map((error) => ({
        field: error.path.join(" "),
        message: error.message,
    }));

    return {
        statusCode: 400,
        message: "Validation failed",
        errorMessages
    };
};