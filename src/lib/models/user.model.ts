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
  savedRecipes: string[]; // recipe IDs saved by this user

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: false,
      unique: false,
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

    savedRecipes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const User = models?.User || model<IUser>("User", UserSchema);

export default User;
