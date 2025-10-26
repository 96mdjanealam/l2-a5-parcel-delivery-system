import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { AppError } from "../../errors/AppError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import { JwtPayload } from "jsonwebtoken";

const allGetUser = async (token: JwtPayload) => {
  const isExistUser = await User.findById(token.userId);
  if (!isExistUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not found");
  }

  const user = await User.find().select("-password");
  const totalUser = await User.countDocuments();
  return {
    user,
    totalUser,
  };
};

const getMeUser = async (email: string) => {
  const user = await User.findOne({ email }).select("-password");
  return user;
};

const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return user;
};

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;
  const isExist = await User.findOne({ email });
  if (isExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A user with this email already exists."
    );
  }

  const hashPassword = await bcrypt.hash(password as string, 10);

  const auth: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashPassword,
    auths: [auth],
    ...rest,
  });

  const userWithoutPassword = await User.findById(user._id).select("-password");
  return userWithoutPassword;
};

const userUpdate = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  if (decodedToken.role === "Sender" || decodedToken.role === "Receiver") {
    if (decodedToken.userId !== userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not unauthorized");
    }
  }

  const isExistUser = await User.findById(userId);
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // if (decodedToken.role === "ADMIN" && isExistUser.role === "SUPER_ADMIN") {
  //     throw new AppError(httpStatus.FORBIDDEN, "Only SUPER_ADMIN can assign this role");
  // };

  if (payload.role) {
    if (decodedToken.role === "Receiver" || decodedToken.role === "Sender") {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Users with role '${decodedToken.role}' are not permitted to change roles.`
      );
    }
  }

  if (payload.isActive || payload.isDeleted) {
    if (decodedToken.role === "Sender" || decodedToken.role === "Receiver") {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Unauthorized access to modify user status. Your role '${decodedToken.role}' is not allowed. Only admins are permitted to perform this action.`
      );
    }
  }

  const userUpdated = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  }).select("-password");

  return userUpdated;
};

export const userService = {
  allGetUser,
  getMeUser,
  getSingleUser,
  createUser,
  userUpdate,
};
