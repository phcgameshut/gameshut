import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { readDb } from "@/lib/serverDb";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }
        
        const db = await readDb();
        if (!db || !db.players) return null;
        
        const player = db.players.find((p: any) => 
          (p.email === credentials.identifier || p.username === credentials.identifier) &&
          p.password === credentials.password
        );
        
        if (player) {
          return { id: player.id, name: player.name, email: player.email };
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev"
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
