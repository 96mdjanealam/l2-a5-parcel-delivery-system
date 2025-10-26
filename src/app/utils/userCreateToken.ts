import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { AppError } from "../errors/AppError";
import { User } from '../modules/user/user.model';
import { IsActive, IUser } from "../modules/user/user.interface";
import { generateToken, verifyToken } from './jwt';
import { envVars } from '../config/env.config';

export const userCreateToken = (user: Partial<IUser>) => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    };
    const accessToken = generateToken(jwtPayload, envVars.JWT.JWT_SECRET, envVars.JWT.JWT_EXPIRES_IN);
    const refreshToken = generateToken(jwtPayload, envVars.JWT.JWT_REFRESH_SECRET, envVars.JWT.JWT_REFRESH_EXPIRES_IN);

    return {
        accessToken,
        refreshToken
    };
};


export const createNewAccessTokenWithRefreshToken = async (refreshToken: string) => {
    const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT.JWT_REFRESH_SECRET) as JwtPayload;
    const isExist = await User.findOne({ email: verifiedRefreshToken.email });
    if (!isExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
    };
    if (isExist.isActive === IsActive.BLOCKED || isExist.isActive === IsActive.INACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${isExist.isActive}`);
    }
    if (isExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
    };
    const jwtPayload = {
        userId: isExist._id,
        email: isExist.email,
        role: isExist.role
    };
    const accessToken = generateToken(jwtPayload, envVars.JWT.JWT_SECRET, envVars.JWT.JWT_EXPIRES_IN);
    return accessToken;
};