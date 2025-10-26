import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { parcelRoutes } from "../modules/parcel/parcel.route";

export const router = Router();

const moduleRouter = [
    {
        path: "/user",
        route: userRoutes
    },
    {
        path: "/auth",
        route: authRoutes
    },
    {
        path: "/parcels",
        route: parcelRoutes
    },
];

moduleRouter.forEach((route) => {
    router.use(route.path, route.route)
});