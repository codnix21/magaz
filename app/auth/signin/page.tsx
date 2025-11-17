"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn as nextAuthSignIn } from "next-auth/react"
import { Separator } from "@/components/ui/separator"

// Компонент для OAuth кнопок (проверяет доступность на клиенте)
function OAuthButtons() {
  const [hasGoogle, setHasGoogle] = useState(false)
  const [hasFacebook, setHasFacebook] = useState(false)

  useEffect(() => {
    // Проверяем наличие провайдеров через API
    fetch('/api/auth/providers')
      .then(res => res.json())
      .then(providers => {
        setHasGoogle(!!providers.google)
        setHasFacebook(!!providers.facebook)
      })
      .catch(() => {
        // Если ошибка, просто не показываем кнопки
      })
  }, [])

  if (!hasGoogle && !hasFacebook) {
    return null
  }

  return (
    <div className="px-6 pb-6">
      <Separator className="my-4" />
      <div className="space-y-3">
        {hasGoogle && (
          <Button
            type="button"
            variant="outline"
            className="w-full border-2 hover:bg-gray-50"
            onClick={() => nextAuthSignIn("google", { callbackUrl: "/" })}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Войти через Google
          </Button>
        )}
        {hasFacebook && (
          <Button
            type="button"
            variant="outline"
            className="w-full border-2 hover:bg-blue-50"
            onClick={() => nextAuthSignIn("facebook", { callbackUrl: "/" })}
          >
            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Войти через Facebook
          </Button>
        )}
      </div>
    </div>
  )
}

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Неверный email или пароль")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setError("Произошла ошибка при входе")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-2xl border-2 border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl text-white">Вход</CardTitle>
          <CardDescription className="text-blue-100">
            Войдите в свой аккаунт для продолжения
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg" 
              disabled={loading}
              size="lg"
            >
              {loading ? "Вход..." : "Войти"}
            </Button>
            <div className="text-sm text-center space-y-2">
              <div>
                <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                  Забыли пароль?
                </Link>
              </div>
              <div className="text-muted-foreground">
                Нет аккаунта?{" "}
                <Link href="/auth/signup" className="text-primary hover:underline">
                  Зарегистрироваться
                </Link>
              </div>
            </div>
          </CardFooter>
          {/* OAuth кнопки показываются только если провайдеры настроены */}
          <OAuthButtons />
        </form>
      </Card>
    </div>
  )
}


