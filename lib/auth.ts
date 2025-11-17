import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import type { JWT } from "next-auth/jwt"
import type { User } from "next-auth"
import { findUserByEmail, createUser, findUserById } from "./db-helpers"
import pool from "./db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials?: {
        email?: string
        password?: string
      }): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await findUserByEmail(credentials.email)

        if (!user) {
          return null
        }

        // Если пользователь зарегистрирован через OAuth, не разрешаем вход по паролю
        if (user.oauthProvider && !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          // Проверяем, существует ли пользователь
          let dbUser = await findUserByEmail(user.email || "")
          
          if (!dbUser) {
            // Создаем нового пользователя
            dbUser = await createUser({
              email: user.email || "",
              name: user.name || null,
              password: "", // OAuth пользователи не имеют пароля
              role: "USER",
              oauthProvider: account.provider,
              oauthId: account.providerAccountId || null,
            })
          } else {
            // Обновляем OAuth информацию для существующего пользователя
            if (account.providerAccountId) {
              await pool.execute(
                'UPDATE User SET oauthProvider = ?, oauthId = ?, emailVerified = true WHERE id = ?',
                [account.provider, account.providerAccountId, dbUser.id]
              )
            }
          }
          
          // Обновляем user объект для сессии
          user.id = dbUser.id
          user.role = dbUser.role
        } catch (error) {
          console.error("Error in OAuth signIn:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }: { token: JWT; user?: User; account?: any }) {
      if (user) {
        token.id = user.id
        token.role = (user as User & { role: string }).role
      }
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.provider = token.provider
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
}


