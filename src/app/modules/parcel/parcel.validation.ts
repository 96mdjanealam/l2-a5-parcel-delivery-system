import { z } from "zod";

export const createParcelZodSchema = z.object({
    body: z.object({
        receiverInfo: z.object({
            name: z.string(),
            phone: z.string(),
            address: z.object({
                street: z.string(),
                city: z.string(),
                state: z.string().optional(),
                zipCode: z.string().optional(),
                country: z.string().default("Bangladesh")
            })
        }),
        parcelInfo: z.object({
            type: z.enum(["DOCUMENT", "PACKAGE", "FRAGILE", "ELECTRONICS"]),
            weight: z.number().min(0.1, "Weight must be at least 0.1 kg"),
            description: z.string().optional(),
            value: z.number().min(0, "Value must be 0 or greater")
        }),
        deliveryFee: z.number().min(0, "Delivery fee must be 0 or greater"),
        statusLogs: z.array(z.object({
            status: z.enum(["REQUESTED", "APPROVED", "IN_TRANSIT", "DELIVERED"]).optional(),
            location: z.string().optional(),
            note: z.string().optional()
        })).optional()
    })
});

export const updateParcelZodSchema = z.object({
    body: z.object({
        currentStatus: z.enum(["REQUESTED", "APPROVED", "IN_TRANSIT", "DELIVERED"]).optional(),
        statusLogs: z.array(z.object({
            status: z.enum(["REQUESTED", "APPROVED", "IN_TRANSIT", "DELIVERED"]).optional(),
            location: z.string().optional(),
            note: z.string().optional()
        })).optional(),
        isBlocked: z.boolean().optional(),
        newDate: z.string().optional()
    })
});

export const deliveryConfirmationZodSchema = z.object({
    body: z.object({
        currentStatus: z.enum(["DELIVERED"]),
        statusLogs: z.array(z.object({
            status: z.enum(["DELIVERED"]),
            location: z.string().optional(),
            note: z.string().optional()
        })).optional()
    })
});

export const adminStatusUpdateZodSchema = z.object({
    body: z.object({
        currentStatus: z.enum(["REQUESTED", "APPROVED", "IN_TRANSIT", "DELIVERED"]),
        statusLogs: z.array(z.object({
            status: z.enum(["REQUESTED", "APPROVED", "IN_TRANSIT", "DELIVERED"]),
            location: z.string().optional(),
            note: z.string().optional()
        })).optional(),
        isBlocked: z.boolean().optional()
    })
});