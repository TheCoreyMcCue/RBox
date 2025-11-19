// lib/models/user.model.ts

import { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  clerkId?: string; // legacy support
  email: string;
  photo?: string;
  firstName?: string;
  lastName?: string;

  followers: string[]; // user IDs following this user
  following: string[]; // user IDs this user follows

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: false,
      unique: false, // cannot require unique because new users may not have this
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    photo: { type: String },
    firstName: { type: String },
    lastName: { type: String },

    followers: {
      type: [String],
      default: [],
    },

    following: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const User = models?.User || model<IUser>("User", UserSchema);

export default User;
