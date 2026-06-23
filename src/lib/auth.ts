import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import connectToDB from "./db";
import { User } from "@/models/user";
import { getProfileReadme } from "./github";

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
      if (account && profile) {
        const gh = profile as any;

        token.githubUsername = gh.login;
        token.avatar = gh.avatar_url;

        const profileReadme = await getProfileReadme(gh.login);

        await connectToDB();

        await User.findOneAndUpdate(
          { githubId: gh.id.toString() },
          {
            githubId: gh.id.toString(),
            githubUsername: gh.login,
            name: gh.name,
            email: gh.email,
            avatar: gh.avatar_url,
            profileReadme,
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
