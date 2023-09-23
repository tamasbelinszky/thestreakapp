import { nextAuthConfig } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(nextAuthConfig);
export { handler as GET, handler as POST };
