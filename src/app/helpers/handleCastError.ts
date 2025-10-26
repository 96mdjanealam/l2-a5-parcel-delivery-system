export const handleCastError = (err: any) => {
    return {
        statusCode: 400,
        message: "Invalid MongoDB ObjectId. Please provide a valid ID.",
    };
};