import { Schema, model, models, Document } from "mongoose";

interface IUser extends Document {
  clerkId: string;
  email: string;
  photo?: string;
  firstName?: string;
  lastName?: string;
  friends: Schema.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  photo: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const User = models?.User || model<IUser>("User", UserSchema);

export default User;
