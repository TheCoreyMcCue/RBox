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
      try {
        console.log("signIn callback triggered for:", user.email);
        const email = user.email?.toLowerCase();
        if (!email) {
          console.warn("No email returned from provider:", user);
          return false;
        }

        let dbUser = await fetchUserByEmail(email);
        if (!dbUser) {
          console.log("Creating new user:", email);
          const [firstName, ...rest] = user.name
            ? user.name.split(" ")
            : ["Unknown"];
          const lastName = rest.join(" ") || "";

          dbUser = await createUser({
            firstName,
            lastName,
            email,
            photo: user.image,
          });

          if (!dbUser) {
            console.error("createUser returned null");
            throw new Error("User creation failed");
          }
          console.log("✅ Created new user:", dbUser.email);
        } else {
          console.log("Existing user:", dbUser.email);
        }

        return true; // must return true explicitly
      } catch (err) {
        console.error("❌ signIn error:", err);
        throw err; // let NextAuth show full stack trace in console
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
