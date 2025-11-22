// lib/actions/user.action.ts

"use server";

import User, { IUser } from "@/lib/models/user.model";
import { connect } from "@/lib/db";

export type UserProfileResponse = {
  _id: string;
  clerkId?: string;
  email: string;
  photo?: string;
  firstName?: string;
  lastName?: string;
  followers: string[];
  following: string[];
  savedRecipes: string[];
  followerCount: number;
  followingCount: number;
  savedCount: number;
};

// ---------------- Helper ----------------
async function ensureConnected() {
  try {
    await connect();
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
}

// ---------------- CREATE USER ----------------
export async function createUser(user: Partial<IUser>) {
  try {
    await ensureConnected();

    const newUser = await User.create({
      ...user,
      followers: [],
      following: [],
      savedRecipes: [],
    });

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.error("❌ Error creating user:", error);
    throw error; // ← DO NOT SWALLOW THIS
  }
}

// ---------------- FETCH BY CLERK ID ----------------
export async function fetchUserByClerkId(clerkId: string) {
  try {
    await ensureConnected();
    const user = await User.findOne({ clerkId }).lean<IUser>().exec();
    return user ?? null;
  } catch (error) {
    console.error(`❌ Error fetching user by clerkId ${clerkId}:`, error);
    return null;
  }
}

// ---------------- FETCH BY EMAIL ----------------
export async function fetchUserByEmail(email: string) {
  try {
    await ensureConnected();
    const user = await User.findOne({ email }).lean<IUser>().exec();
    return user ?? null;
  } catch (error) {
    console.error(`❌ Error fetching user by email ${email}:`, error);
    return null;
  }
}

// ---------------- GET ALL USERS ----------------
export async function getAllUsers(): Promise<IUser[]> {
  try {
    await ensureConnected();
    const users = await User.find().lean<IUser[]>().exec();
    return users;
  } catch (error) {
    console.error("❌ Error fetching all users:", error);
    throw error;
  }
}

// ---------------- FOLLOW USER ----------------
export async function followUser(followerId: string, targetId: string) {
  await ensureConnected();

  if (followerId === targetId) {
    throw new Error("You cannot follow yourself.");
  }

  const follower = await User.findById<IUser>(followerId).exec();
  const target = await User.findById<IUser>(targetId).exec();

  if (!follower || !target) {
    throw new Error("User not found.");
  }

  if (!follower.following?.includes(targetId)) {
    follower.following?.push(targetId);
    await follower.save();
  }

  if (!target.followers.includes(followerId)) {
    target.followers.push(followerId);
    await target.save();
  }

  return { success: true };
}

// ---------------- UNFOLLOW USER ----------------
export async function unfollowUser(followerId: string, targetId: string) {
  await ensureConnected();

  const follower = await User.findById<IUser>(followerId).exec();
  const target = await User.findById<IUser>(targetId).exec();

  if (!follower || !target) {
    throw new Error("User not found.");
  }

  follower.following = follower.following?.filter((id) => id !== targetId);
  target.followers = target.followers?.filter((id) => id !== followerId);

  await follower.save();
  await target.save();

  return { success: true };
}

// ---------------- SAVE RECIPE ----------------
export async function saveRecipe(userId: string, recipeId: string) {
  await ensureConnected();

  const user = await User.findById<IUser>(userId).exec();
  if (!user) throw new Error("User not found.");

  if (!user.savedRecipes?.includes(recipeId)) {
    user.savedRecipes?.push(recipeId);
    await user.save();
  }

  return { success: true };
}

// ---------------- UNSAVE RECIPE ----------------
export async function unsaveRecipe(userId: string, recipeId: string) {
  await ensureConnected();

  const user = await User.findById<IUser>(userId).exec();
  if (!user) throw new Error("User not found.");

  user.savedRecipes = user.savedRecipes?.filter((id) => id !== recipeId);
  await user.save();

  return { success: true };
}

// ---------------- GET SAVED RECIPES ----------------
export async function getSavedRecipes(userId: string) {
  await ensureConnected();

  const user = await User.findById<IUser>(userId)
    .select("savedRecipes")
    .lean()
    .exec();

  return user?.savedRecipes ?? [];
}

// ---------------- GET USER PROFILE ----------------
export async function getUserProfile(
  userId: string
): Promise<UserProfileResponse | null> {
  await ensureConnected();

  const user = await User.findById(userId)
    .select(
      "firstName lastName photo followers following email savedRecipes clerkId"
    )
    .lean()
    .exec();

  if (!user) return null;

  const typedUser = user as unknown as {
    _id: string;
    clerkId?: string;
    email: string;
    photo?: string;
    firstName?: string;
    lastName?: string;
    followers: string[];
    following: string[];
    savedRecipes: string[];
  };

  return {
    ...typedUser,
    followerCount: typedUser.followers.length,
    followingCount: typedUser.following.length,
    savedCount: typedUser.savedRecipes.length,
  };
}
