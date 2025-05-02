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
      if (profile && allowedUsernames.includes((profile as any).login)) {
        return true;
      }
      return false; // Explicitly deny if not allowed
    },
    async session({ session, token }) {
      // Add the GitHub full name and username to the session object
      if (session.user && token && token.name) {
        session.user.name = token.name;
      }
      if (session.user && token && token.login) {
        (session.user as any).username = token.login;
      }
      return session;
    },
    async jwt({ token, user, profile }) {
      if (profile && (profile as any).login) {
        token.login = (profile as any).login;
      }
      if (profile && (profile as any).name) {
        token.name = (profile as any).name;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST }; 