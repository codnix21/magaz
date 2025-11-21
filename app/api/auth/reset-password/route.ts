import { NextResponse } from "next/server"
import { validatePasswordResetToken, usePasswordResetToken } from "@/lib/password-reset"
import { findUserById } from "@/lib/db-helpers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Проверяем токен
    const userId = await validatePasswordResetToken(token)

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      )
    }

    // Проверяем, что пользователь существует
    const user = await findUserById(userId)

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(password, 10)

    // Обновляем пароль
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    // Помечаем токен как использованный
    await usePasswordResetToken(token)

    return NextResponse.json({
      message: "Password has been reset successfully",
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}

