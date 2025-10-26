import { model, Schema } from "mongoose";
import { IUser, Role, IsActive } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    phone: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    parcels: [
      {
        type: Schema.Types.ObjectId,
        ref: "Parcel",
      },
    ],
    auths: [
      {
        provider: {
          type: String,
          enum: ["credentials", "google"],
          required: true,
        },
        providerId: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", userSchema);
