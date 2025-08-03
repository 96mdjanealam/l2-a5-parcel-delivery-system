import { Types } from "mongoose";

export enum status {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
}

export enum parcelType {
  DOCUMENT = "DOCUMENT",
  PACKAGE = "PACKAGE",
  FRAGILE = "FRAGILE",
  ELECTRONICS = "ELECTRONICS",
}

export interface IStatusLog {
  status: status;
  location: string;
  note?: string;
  updatedBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReceiverInfo {
  name: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
}

export interface IParcelInfo {
  type: parcelType;
  weight: number;
  description?: string;
  value: number;
}

export interface IParcel {
  _id?: string;
  trackingId?: string;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  receiverInfo: IReceiverInfo;
  parcelInfo: IParcelInfo;
  deliveryFee: number;
  currentStatus: status;
  statusLogs: IStatusLog[];
  isBlocked?: boolean;
  requestedAt?: Date;
  deliveredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
