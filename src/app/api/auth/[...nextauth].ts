import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials) {
        await connectDB();
        if (!credentials?.email || !credentials.password) return null;
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user) return null;
        const isMatch = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!isMatch) return null;
        if (user.twoFactorEnabled) {
          if (!credentials.token) return null;
          const valid = speakeasy.totp.verify({
            secret: user.twoFactorSecret!,
            encoding: "base32",
            token: credentials.token,
            window: 1
          });
          if (!valid) return null;
        }
        return { id: user._id.toString(), email: user.email, name: user.username };
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }) {
      if (token.user) session.user = token.user as typeof session.user;
      return session;
    }
  }
};

export default NextAuth(authOptions);
