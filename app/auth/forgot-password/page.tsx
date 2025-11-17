"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "Ошибка при отправке запроса")
      }
    } catch (error) {
      setError("Произошла ошибка при отправке запроса")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-2xl border-2 border-green-200/50 bg-white/90 backdrop-blur-md">
          <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b-2 border-green-200/50">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Письмо отправлено
            </CardTitle>
            <CardDescription className="text-center">
              Если аккаунт с таким email существует, мы отправили ссылку для восстановления пароля
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Проверьте вашу почту и следуйте инструкциям в письме. Ссылка действительна в течение 1 часа.
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Не получили письмо? Проверьте папку "Спам" или попробуйте еще раз через несколько минут.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              onClick={() => router.push("/auth/signin")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              Вернуться к входу
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false)
                setEmail("")
              }}
              className="w-full"
            >
              Отправить еще раз
            </Button>
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
            <Mail className="h-6 w-6 text-blue-600" />
            Восстановление пароля
          </CardTitle>
          <CardDescription className="text-center">
            Введите email, и мы отправим вам ссылку для восстановления пароля
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              disabled={loading}
            >
              {loading ? "Отправка..." : "Отправить ссылку"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/auth/signin" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Вернуться к входу
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

