import { z } from "zod";

export const createUserZodSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    role: z.enum(["ADMIN", "USER"]),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" }),
        
    phone: z.string().optional(),
    address: z.string().min(5, { message: "Address must be at least 5 characters long" }).optional(),
    auths: z.array(z.object({
        provider: z.enum(["credentials", "google"]),
        providerId: z.string()
    })).optional()
});

export const updatedUserZodSchema = z.object({
    name: z.string().min(1, { message: "Name cannot be empty" }).optional(),
    phone: z.string().optional(),
    role: z.enum(["ADMIN", "USER"]).optional(),
    isActive: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
    isDeleted: z.boolean().optional(),
    address: z.string().min(1, { message: "Address cannot be empty" }).optional(),
    auths: z.array(z.object({
        provider: z.enum(["credentials", "google"]),
        providerId: z.string()
    })).optional()
});