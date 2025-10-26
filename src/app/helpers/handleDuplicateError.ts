/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleDuplicateError = (err: any) => {
    const duplicatedEmail = Object.keys(err.keyValue)[0];
    return {
        statusCode: 400,
        message: ` ${err.keyValue[duplicatedEmail]} already exists.`
    };
};