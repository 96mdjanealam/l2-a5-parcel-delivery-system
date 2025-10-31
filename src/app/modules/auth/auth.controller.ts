/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AppError } from '../../errors/AppError';
import passport from 'passport';
import { userCreateToken } from '../../utils/userCreateToken';
import { setCookies } from '../../utils/setCookies';
import { authService } from './auth.service';
import { JwtPayload } from 'jsonwebtoken';

const credentialsLogin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) {
      return next(new AppError(401, err.message || err));
    }

    if (!user) {
      return next(new AppError(401, info?.message || "Authentication failed"));
    }

    // If userCreateToken is synchronous
    try {
      const userTokens = userCreateToken(user);
      setCookies(res, userTokens);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user.toObject();
      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user: rest
        }
      });
    } catch (tokenErr) {
      next(new AppError(500, "Token creation failed"));
    }
  })(req, res, next);
};

const refreshTokenLogin = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const tokenInfo = await authService.credentialsLoginRefresh(refreshToken as string);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: tokenInfo
    })
});

const logout = catchAsync(async (req: Request, res: Response) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logout in successfully",
        data: null
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const decodedToken = req.user;
    const user = await authService.changePassword(oldPassword, newPassword, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password changed successfully",
        data: user
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { id, newPassword } = req.body;
    const decodedToken = req.user;
    const response = await authService.resetNewPassword(id, newPassword, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password changed successfully",
        // data: null
        data: response
    });
});

const setPassword = catchAsync(async (req: Request, res: Response) => {
    const { password } = req.body;
    const decodedToken = req.user as JwtPayload;
    const result = await authService.setPassword(decodedToken.userId, password);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password set password successfully",
        data: result
    });
});


export const authController = {
    credentialsLogin,
    refreshTokenLogin,
    logout,
    changePassword,
    resetPassword,
    setPassword,
};