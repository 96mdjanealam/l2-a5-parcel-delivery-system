import { Types } from "mongoose";

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  isDeleted?: boolean;
  isActive?: IsActive;
  parcels?: Types.ObjectId[];
  role: Role;
  createdAt?: Date;
  updatedAt?: Date; 
}
