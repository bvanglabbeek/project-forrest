import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

const allowedUsernames = ['bvanglabbeek'];

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ profile }) {
      // Only allow users whose GitHub username is in the list
      return profile && allowedUsernames.includes(profile.login);
    },
    async session({ session, token }) {
      // Add the GitHub full name and username to the session object
      if (token && token.name) {
        session.user.name = token.name;
      }
      if (token && token.login) {
        session.user.username = token.login;
      }
      return session;
    },
    async jwt({ token, user, profile }) {
      if (profile && profile.login) {
        token.login = profile.login;
      }
      if (profile && profile.name) {
        token.name = profile.name;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST }; 