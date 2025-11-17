"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Lock } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("Неверная ссылка для восстановления пароля")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!token) {
      setError("Неверная ссылка для восстановления пароля")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/auth/signin")
        }, 3000)
      } else {
        setError(data.error || "Ошибка при сбросе пароля")
      }
    } catch (error) {
      setError("Произошла ошибка при сбросе пароля")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-2xl border-2 border-blue-200/50 bg-white/90 backdrop-blur-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200/50">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              Ошибка
            </CardTitle>
            <CardDescription className="text-center">
              Неверная ссылка для восстановления пароля
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/auth/signin">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                Вернуться к входу
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-2xl border-2 border-green-200/50 bg-white/90 backdrop-blur-md">
          <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b-2 border-green-200/50">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Пароль успешно изменен
            </CardTitle>
            <CardDescription className="text-center">
              Вы будете перенаправлены на страницу входа через несколько секунд
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/auth/signin">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                Перейти к входу
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-blue-200/50 bg-white/90 backdrop-blur-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200/50">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Lock className="h-6 w-6 text-blue-600" />
            Восстановление пароля
          </CardTitle>
          <CardDescription className="text-center">
            Введите новый пароль для вашего аккаунта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Новый пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Минимум 6 символов"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Повторите пароль"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              disabled={loading}
            >
              {loading ? "Сброс пароля..." : "Сбросить пароль"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/auth/signin" className="text-sm text-blue-600 hover:underline">
            Вернуться к входу
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

