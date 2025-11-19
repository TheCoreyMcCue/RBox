import { NextResponse } from "next/server";
import { followUser, unfollowUser } from "@/lib/actions/user.action";

export async function GET() {
  try {
    const followerId = "668d90c562df48ffd131ed3c";
    const targetId = "668d90f462df48ffd131ed40";

    // Test following
    await unfollowUser(followerId, targetId);

    return NextResponse.json({
      success: true,
      message: `User ${followerId} now unfollows ${targetId}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
