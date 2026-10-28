import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, writeAuditLog } from "@/lib/account-admission";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login-signup",
    error: "/login-signup",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          await writeAuditLog({
            action: "USER_LOGIN_FAILED",
            actorEmail: credentials?.email || "unknown",
            details: { reason: "missing_credentials" },
          });
          return null;
        }

        const email = normalizeEmail(credentials.email);
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          await writeAuditLog({
            action: "USER_LOGIN_FAILED",
            actorEmail: email,
            details: { reason: "user_not_found" },
          });
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          await writeAuditLog({
            action: "USER_LOGIN_FAILED",
            actorId: user.id,
            actorEmail: user.email,
            targetType: "User",
            targetId: user.id,
            details: { reason: "invalid_password" },
          });
          return null;
        }

        await writeAuditLog({
          action: "USER_LOGIN_SUCCESS",
          actorId: user.id,
          actorEmail: user.email,
          targetType: "User",
          targetId: user.id,
          details: { role: user.role },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split("@")[0],
          role: user.role,
          username: user.username || user.email.split("@")[0],
          aiCredits: user.aiCredits,
          plan: user.plan,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.aiCredits = user.aiCredits;
        token.plan = user.plan;
      } else if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            username: true,
            aiCredits: true,
            plan: true,
          },
        });
        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.role = dbUser.role;
          token.username = dbUser.username || dbUser.email.split("@")[0];
          token.aiCredits = dbUser.aiCredits;
          token.plan = dbUser.plan;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "USER";
        session.user.username = (token.username as string) || "creator";
        session.user.aiCredits = (token.aiCredits as number) ?? 100;
        session.user.plan = (token.plan as string) || "CREATOR_PRO";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "storytribe-local-secret-9f8e7d6c5b4a39281726354455667788",
};

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}
