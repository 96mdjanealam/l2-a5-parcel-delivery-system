import httpStatus from 'http-status';
import sendResponse from "../../utils/sendResponse";
import { catchAsync } from '../../utils/catchAsync';
import { Request, Response } from 'express';
import { userService } from './user.service';
import { JwtPayload } from 'jsonwebtoken';

const allGetUser = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user as JwtPayload;
    const user = await userService.allGetUser(decodedToken);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Users retrieved successfully",
        data: user.user,
        meta: {
            total: user.totalUser
        }
    });
});

const getMeUser = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user as JwtPayload;
    const user = await userService.getMeUser(decodedToken.email);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Your profile retrieved successfully",
        data: user
    });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = await userService.getSingleUser(id)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User retrieved successfully",
        data: user
    });
});

const createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User created successfully",
        data: user
    });
});

const userUpdate = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user;
    const id = req.params.id;
    const user = await userService.userUpdate(id, req.body, decodedToken as JwtPayload);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User updated successfully",
        data: user
    });
});

export const userController = {
    allGetUser,
    getMeUser,
    getSingleUser,
    createUser,
    userUpdate
};