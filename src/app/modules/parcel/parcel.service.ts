import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { IParcel, status } from "./parcel.interface";
import Parcel from "./parcel.model";
import { AppError } from "../../errors/AppError";
import { User } from "../user/user.model";
import { generateTrackingId } from "../../utils/trakingID";
import { QueryBuilder } from "../../utils/queryBuilder";

const getTrackingParcel = async (user: JwtPayload, trackingId: string) => {
  const isExistUser = await User.findById(user.userId);
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const parcel = await Parcel.findOne({ trackingId }).select(
    "statusLogs currentStatus"
  );

  if (!parcel) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Parcel not found with the provided tracking ID"
    );
  }

  return parcel;
};

// Sender Section
const getMeParcel = async (sender: JwtPayload) => {
  const isExistUser = await User.findById(sender.userId);
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const parcels = await Parcel.find({ sender: sender.userId })
    .populate("sender", "name email")
    .populate("receiver", "name email phone");

  if (!parcels.length) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No parcels found for your account."
    );
  }

  return parcels;
};

const statusLogParcel = async (id: string) => {
  const isExistParcel = await Parcel.findById(id);

  if (!isExistParcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  if (isExistParcel.isBlocked) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This parcel is blocked and cannot be accessed."
    );
  }

  const parcel = await Parcel.findById(id)
    .select("statusLogs")
    .populate("statusLogs.updatedBy", "name email");

  return parcel;
};

const createParcel = async (payload: Partial<IParcel>, senderId: string) => {
  const trackingId = generateTrackingId();

  // Create the parcel with initial status log
  const parcelData = {
    ...payload,
    trackingId,
    sender: senderId,
    statusLogs: [
      {
        status: status.REQUESTED,
        location: payload.receiverInfo?.address?.city || "Unknown",
        note: "Parcel has been requested by sender.",
        updatedBy: senderId,
      },
    ],
  };

  const parcel = await Parcel.create(parcelData);

  // Add parcel to receiver's parcels array
  await User.findByIdAndUpdate(
    parcel.receiver,
    { $push: { parcels: parcel._id } },
    { runValidators: true, new: true }
  );

  // Add parcel to sender's parcels array
  await User.findByIdAndUpdate(
    senderId,
    { $push: { parcels: parcel._id } },
    { runValidators: true, new: true }
  );

  return parcel;
};

const cancelParcel = async (
  payload: Partial<IParcel>,
  sender: JwtPayload,
  id: string
) => {
  const isExistUser = await User.findById(sender.userId);
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isExistParcel = await Parcel.findById(id);
  if (!isExistParcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  if (isExistParcel.isBlocked) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This parcel is blocked and cannot be accessed."
    );
  }

  if (isExistParcel.sender.toString() !== sender.userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to cancel this parcel."
    );
  }

  if (!payload.currentStatus) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Current status is required for status update."
    );
  }

  // Check if parcel can be canceled
  if (
    isExistParcel.currentStatus === status.IN_TRANSIT ||
    isExistParcel.currentStatus === status.DELIVERED
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Parcel cannot be canceled as it is already ${isExistParcel.currentStatus
        .toLowerCase()
        .replace("_", " ")}.`
    );
  }

  const updatedParcel = await Parcel.findByIdAndUpdate(
    id,
    {
      currentStatus: status.REQUESTED, // or whatever status you want for canceled
      $push: {
        statusLogs: {
          status: status.REQUESTED,
          updatedBy: sender.userId,
          location: "Sender App",
          note: "Parcel has been cancelled by sender.",
        },
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );

  return updatedParcel;
};

// Receiver section
const incomingParcels = async (receiverId: string) => {
  const isExistUser = await User.findById(receiverId);
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const parcels = await Parcel.find({
    receiver: receiverId,
    currentStatus: { $nin: [status.DELIVERED, "Returned", "Cancelled"] },
  })
    .populate("sender", "name email phone")
    .populate("receiver", "name email");

  if (!parcels.length) {
    throw new AppError(httpStatus.NOT_FOUND, "No incoming parcel found");
  }

  return parcels;
};

const confirmDeliveryParcel = async (
  payload: Partial<IParcel>,
  receiver: JwtPayload,
  id: string
) => {
  const isExistUser = await User.findById(receiver.userId);
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isExistParcel = await Parcel.findById(id);
  if (!isExistParcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  if (isExistParcel.isBlocked) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This parcel is blocked and cannot be accessed."
    );
  }

  if (isExistParcel.receiver.toString() !== receiver.userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to confirm delivery for this parcel."
    );
  }

  if (!payload.currentStatus) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Current status is required for status update."
    );
  }

  if (isExistParcel.currentStatus !== status.IN_TRANSIT) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Parcel can only be marked as 'Delivered' if it is currently 'In Transit'. Current status is '${isExistParcel.currentStatus}'.`
    );
  }

  const updatedParcel = await Parcel.findByIdAndUpdate(
    id,
    {
      currentStatus: status.DELIVERED,
      deliveredAt: new Date(),
      $push: {
        statusLogs: {
          status: status.DELIVERED,
          updatedBy: receiver.userId,
          location:
            isExistParcel.receiverInfo.address.city || "Delivery Address",
          note:
            payload.statusLogs?.[0]?.note ||
            "Parcel has been delivered successfully.",
        },
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );

  return updatedParcel;
};

const rescheduleParcel = async (
  newDate: Date,
  receiver: JwtPayload,
  id: string
) => {
  const isExistUser = await User.findById(receiver.userId);
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isExistParcel = await Parcel.findById(id);
  if (!isExistParcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  if (isExistParcel.isBlocked) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This parcel is blocked and cannot be accessed."
    );
  }

  if (isExistParcel.receiver.toString() !== receiver.userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to reschedule this parcel."
    );
  }

  if (isExistParcel.currentStatus !== status.IN_TRANSIT) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Parcel can only be rescheduled if it is currently 'In Transit'. Current status is '${isExistParcel.currentStatus}'.`
    );
  }

  const updatedParcel = await Parcel.findByIdAndUpdate(
    id,
    {
      $push: {
        statusLogs: {
          status: "Rescheduled",
          updatedBy: receiver.userId,
          location:
            isExistParcel.receiverInfo.address.city || "Delivery Address",
          note: `Parcel delivery rescheduled to ${newDate.toISOString()}`,
        },
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );

  return updatedParcel;
};

const returnParcel = async (receiver: JwtPayload, id: string) => {
  const isExistUser = await User.findById(receiver.userId);
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isExistParcel = await Parcel.findById(id);
  if (!isExistParcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  if (isExistParcel.isBlocked) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This parcel is blocked and cannot be accessed."
    );
  }

  if (isExistParcel.receiver.toString() !== receiver.userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to return this parcel."
    );
  }

  if (isExistParcel.currentStatus === status.DELIVERED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Delivered parcel can't be returned"
    );
  }

  if (isExistParcel.currentStatus !== status.IN_TRANSIT) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Parcel can only be returned if it is currently 'In Transit'. Current status is '${isExistParcel.currentStatus}'.`
    );
  }

  const updatedParcel = await Parcel.findByIdAndUpdate(
    id,
    {
      currentStatus: "Returned",
      $push: {
        statusLogs: {
          status: "Returned",
          updatedBy: receiver.userId,
          location: "N/A",
          note: "Parcel has been returned by receiver",
        },
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );

  return updatedParcel;
};

const deliveryHistoryParcel = async (receiver: JwtPayload) => {
  const isExistUser = await User.findById(receiver.userId);
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const parcels = await Parcel.find({
    currentStatus: status.DELIVERED,
    receiver: receiver.userId,
  });

  if (!parcels.length) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "You have no delivered parcels yet."
    );
  }

  return parcels;
};

// Admin Section
const getAllParcel = async (
  token: JwtPayload,
  query: Record<string, string>
) => {
  const isExistUser = await User.findById(token.userId);
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const searchFields = ["currentStatus", "trackingId"];
  const queryBuilder = new QueryBuilder(Parcel.find(), query);

  const parcels = await queryBuilder
    .search(searchFields)
    .modelQuery.populate("sender", "name email")
    .populate("receiver", "name email");

  const totalParcel = await Parcel.countDocuments(
    queryBuilder.modelQuery.getFilter()
  );

  return {
    parcels,
    totalParcel,
  };
};

const updateParcelStatus = async (
  newStatus: status,
  admin: JwtPayload,
  id: string,
  note?: string
) => {
  const isExistUser = await User.findById(admin.userId);
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isExistParcel = await Parcel.findById(id);
  if (!isExistParcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  // Validate status transition
  if (
    isExistParcel.currentStatus === status.DELIVERED &&
    newStatus !== status.DELIVERED
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Cannot change status. Parcel is already delivered."
    );
  }

  const updatedParcel = await Parcel.findByIdAndUpdate(
    id,
    {
      currentStatus: newStatus,
      ...(newStatus === status.DELIVERED && { deliveredAt: new Date() }),
      $push: {
        statusLogs: {
          status: newStatus,
          updatedBy: admin.userId,
          location: "Admin Office",
          note: note || `Status updated to ${newStatus}`,
        },
      },
    },
    {
      runValidators: true,
      new: true,
    }
  );

  return updatedParcel;
};

const toggleParcelBlock = async (admin: JwtPayload, id: string) => {
  const isExistUser = await User.findById(admin.userId);
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isExistParcel = await Parcel.findById(id);
  if (!isExistParcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  const newBlockStatus = !isExistParcel.isBlocked;

  const updatedParcel = await Parcel.findByIdAndUpdate(
    id,
    { isBlocked: newBlockStatus },
    {
      runValidators: true,
      new: true,
    }
  );

  return {
    parcel: updatedParcel,
    message: `Parcel has been ${newBlockStatus ? "blocked" : "unblocked"}`,
  };
};

export const parcelService = {
  getTrackingParcel,
  getMeParcel,
  statusLogParcel,
  createParcel,
  cancelParcel,
  incomingParcels,
  confirmDeliveryParcel,
  rescheduleParcel,
  returnParcel,
  deliveryHistoryParcel,
  getAllParcel,
  updateParcelStatus,
  toggleParcelBlock,
};
