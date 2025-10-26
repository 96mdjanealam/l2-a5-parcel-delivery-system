/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleMongooseValidationError = (err: any) => {
    const errorMessages = Object.values(err.errors).map((error: any) => ({
        field: error.path,
        value: error.value,
        message: error.message,
    }));

    return {
        statusCode: 400,
        message: "Validation failed",
        errorMessages
    };
};