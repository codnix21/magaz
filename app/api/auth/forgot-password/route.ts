import { NextResponse } from "next/server"
import { findUserByEmail } from "@/lib/db-helpers"
import { createPasswordResetToken, sendPasswordResetEmail } from "@/lib/password-reset"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const user = await findUserByEmail(email)

    // Не раскрываем, существует ли пользователь
    if (!user) {
      return NextResponse.json({
        message: "If an account with that email exists, we've sent a password reset link.",
      })
    }

    // Не разрешаем восстановление пароля для OAuth пользователей
    if (user.oauthProvider) {
      return NextResponse.json({
        message: "If an account with that email exists, we've sent a password reset link.",
      })
    }

    // Создаем токен восстановления
    const token = await createPasswordResetToken(user.id)

    // Отправляем email
    try {
      await sendPasswordResetEmail(user.email, user.name || user.email, token)
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError)
      // Не раскрываем ошибку отправки email
    }

    return NextResponse.json({
      message: "If an account with that email exists, we've sent a password reset link.",
    })
  } catch (error) {
    console.error("Error in forgot password:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

