import { Schema, model } from "mongoose";
import { IParcel, parcelType, status } from "./parcel.interface";

const statusLogSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(status),
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const parcelSchema = new Schema(
  {
    trackingId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        street: {
          type: String,
          required: true,
          trim: true,
        },
        city: {
          type: String,
          required: true,
          trim: true,
        },
        state: String,
        zipCode: String,
        country: {
          type: String,
          required: true,
          trim: true,
          default: "Bangladesh",
        },
      },
    },
    parcelInfo: {
      type: {
        type: String,
        enum: Object.values(parcelType),
        required: true,
      },
      weight: {
        type: Number,
        required: true,
        min: 0.1,
      },
      description: {
        type: String,
        trim: true,
      },
      value: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    currentStatus: {
      type: String,
      enum: Object.values(status),
      default: status.REQUESTED,
    },
    statusLogs: [statusLogSchema],
    isBlocked: {
      type: Boolean,
      default: false,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default model<IParcel>("Parcel", parcelSchema);
