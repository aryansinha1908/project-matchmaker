import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import connectToDB from "./db";
import { User } from "@/models/user";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Only runs on first sign-in when account & profile are present
      if (account && profile) {
        const gh = profile as any;
        token.githubUsername = gh.login;
        token.avatar = gh.avatar_url;

        // Upsert user in DB
        await connectToDB();
        await User.findOneAndUpdate(
          { email: token.email },
          {
            githubUsername: token.githubUsername,
            name: token.name,
            email: token.email,
            avatar: token.avatar,
          },
          { upsert: true, new: true },
        );
      }
      return token;
    },
    async session({ session, token }) {
      // Expose the extra fields to the client session
      session.user.githubUsername = token.githubUsername as string;
      session.user.image = token.avatar as string;
      return session;
    },
  },
};
