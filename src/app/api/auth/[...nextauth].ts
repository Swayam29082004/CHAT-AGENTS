import NextAuth, { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "contentstack",
      name: "Contentstack",
      type: "oauth",
      wellKnown: "https://app.contentstack.com/oidc/.well-known/openid-configuration",
      clientId: process.env.CONTENTSTACK_CLIENT_ID!,
      clientSecret: process.env.CONTENTSTACK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid profile email content_types.read entries.read entries.create entries.update entries.delete assets.upload",
        },
      },
      idToken: true,
      checks: ["pkce", "state"],
      
      profile(profile) {
        return {
          id: profile.sub, // "sub" is standard OIDC user id
          name: profile.name || profile.email,
          email: profile.email,
        };
      },
    },
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
};

export default NextAuth(authOptions);
