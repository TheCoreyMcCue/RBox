"use server";

import User from "@/lib/models/user.model";
import { connect } from "@/lib/db";

export async function createUser(user: any) {
  try {
    await connect();
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function fetchUserByClerkId(clerkId: string) {
  try {
    await connect();
    // Find user by clerkId
    const user = await User.findOne({ clerkId }).lean().exec();
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error(`Error fetching user with Clerk ID ${clerkId}:`, error);
    return null;
  }
}

export const getAllUsers = async () => {
  try {
    await connect(); // Ensure database connection
    const allUsers = await User.find().lean().exec(); // Fetch all recipes as plain objects
    return JSON.parse(JSON.stringify(allUsers)); // Return recipes in JSON format
  } catch (error) {
    console.error("Error fetching all recipes:", error);
    throw error;
  }
};

export async function fetchUserByEmail(email: string) {
  try {
    await connect();
    const user = await User.findOne({ email }).lean().exec();
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error(`Error fetching user by email ${email}:`, error);
    return null;
  }
}
