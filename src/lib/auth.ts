import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { fetchUserByEmail } from "../lib/actions/user.action";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // 1. If we've already stored clerkId, return early
      if (token.clerkId) return token;

      // 2. Try user.email (on initial sign-in)
      const email = user?.email || token.email;

      if (email) {
        const dbUser = await fetchUserByEmail(email);
        if (dbUser?.clerkId) {
          token.clerkId = dbUser.clerkId;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.clerkId) {
        session.user.clerkId = token.clerkId as string;
      }
      return session;
    },
  },
};
