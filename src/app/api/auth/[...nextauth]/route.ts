// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google"; // or GitHub, Credentials, etc.
import { authOptions } from "../../../../lib/auth"; // we'll define this next

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
