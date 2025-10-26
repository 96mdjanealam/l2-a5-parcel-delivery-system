/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createNewAccessTokenWithRefreshToken } from "../../utils/userCreateToken";
import bcrypt from "bcryptjs";
import httpStatus from 'http-status';
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import { AppError } from "../../errors/AppError";
import { IAuthProvider } from "../user/user.interface";

const credentialsLoginRefresh = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken);

    return {
        accessToken: newAccessToken
    };
};

const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
    const user = await User.findById(decodedToken.userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    
    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password as string);

    if (!isOldPasswordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "The current password you entered is incorrect");
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
};

const resetNewPassword = async (id: string, newPassword: string, decodedToken: JwtPayload) => {
    if (id !== decodedToken.userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You can't reset password");
    }
    
    const user = await User.findById(decodedToken.userId);
    if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User does not found");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
};

const setPassword = async (userId: string, plainPassword: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const hashPassword = await bcrypt.hash(plainPassword, 10);
    const credentialProvider: IAuthProvider = {
        provider: "credentials",
        providerId: user.email
    };
    
    // Handle the optional auths array safely
    const auths: IAuthProvider[] = user.auths ? [...user.auths, credentialProvider] : [credentialProvider];
    user.auths = auths;
    user.password = hashPassword;
    await user.save();
};

export const authService = {
    credentialsLoginRefresh,
    changePassword,
    resetNewPassword,
    setPassword,
};