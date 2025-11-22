// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { fetchUserByEmail, createUser } from "../lib/actions/user.action";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // Create a DB user on first sign-in
    // in lib/auth.ts -> inside signIn callback
    async signIn({ user }) {
      console.log("OAuth signIn attempt from:", {
        email: user.email,
        name: user.name,
        image: user.image,
      });
      try {
        const email = user.email?.toLowerCase().trim();
        if (!email) return false;

        let dbUser = await fetchUserByEmail(email);

        if (!dbUser) {
          // Extract name safely
          const parts = (user.name || "").trim().split(" ");
          const firstName = parts[0] || "";
          const lastName = parts.slice(1).join(" ");

          // Try to create user — NEVER throw on failure
          dbUser = await createUser({
            firstName,
            lastName,
            email,
            photo: user.image ?? undefined,
          }).catch((err) => {
            console.error("❌ createUser failed:", err);
            return null; // prevents OAuth crash
          });
        }

        // Even if createUser fails, allow sign-in so session works
        return true;
      } catch (err) {
        console.error("❌ signIn error:", err);
        return false; // gracefully fail instead of throwing
      }
    },

    // Put Mongo _id (and legacy clerkId if present) on the JWT
    async jwt({ token, user }) {
      try {
        const email = user?.email || token.email;
        if (!email) return token;

        const dbUser = await fetchUserByEmail(email);
        if (dbUser?._id) {
          (token as any).id = dbUser._id; // cast to avoid TS issues without module augmentation
        }
        if (dbUser?.clerkId) {
          (token as any).clerkId = dbUser.clerkId;
        }
      } catch (error) {
        console.error("❌ JWT callback error:", error);
      }
      return token;
    },

    // Expose those fields on the session.user object
    async session({ session, token }) {
      if (session.user) {
        (session.user as any)._id = (token as any).id || "";
        if ((token as any).clerkId) {
          (session.user as any).clerkId = (token as any).clerkId;
        }
      }
      return session;
    },
  },
};
