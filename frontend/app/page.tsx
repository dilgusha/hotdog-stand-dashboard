"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export default function AuthPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })
  const [adminPassword, setAdminPassword] = useState("")
  const [showAdminPrompt, setShowAdminPrompt] = useState(false)
  const [pendingUser, setPendingUser] = useState<any>(null)
  const router = useRouter()

  // Демо данные пользователей
  const users = [
    { email: "admin@hotdog.ru", password: "admin123", role: "admin", firstName: "Админ", lastName: "Системы" },
    { email: "employee@hotdog.ru", password: "emp123", role: "employee", firstName: "Иван", lastName: "Петров" },
  ]

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const user = users.find((u) => u.email === loginData.email && u.password === loginData.password)

    if (!user) {
      toast({
        title: "Ошибка входа",
        description: "Неверный email или пароль",
        variant: "destructive",
      })
      return
    }

    if (user.role === "admin") {
      setPendingUser(user)
      setShowAdminPrompt(true)
    } else {
      localStorage.setItem("user", JSON.stringify(user))
      router.push("/employee")
    }
  }

  const handleAdminLogin = () => {
    if (adminPassword === "admin456") {
      localStorage.setItem("user", JSON.stringify(pendingUser))
      router.push("/admin")
    } else {
      toast({
        title: "Ошибка",
        description: "Неверный пароль администратора",
        variant: "destructive",
      })
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Регистрация успешна",
      description: "Аккаунт создан. Теперь вы можете войти в систему.",
    })
    // В реальном приложении здесь была бы логика сохранения пользователя
  }

  if (showAdminPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🌭 Хот-дог Стенд</CardTitle>
            <CardDescription>Введите пароль администратора</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="adminPassword">Пароль администратора</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Введите пароль администратора"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdminLogin} className="flex-1">
                Войти
              </Button>
              <Button variant="outline" onClick={() => setShowAdminPrompt(false)} className="flex-1">
                Отмена
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">Демо пароль: admin456</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">🌭 Хот-дог Стенд</CardTitle>
          <CardDescription>Система управления точкой продаж</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Введите пароль"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Войти
                </Button>
              </form>
              <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-2">Демо аккаунты:</p>
                <p>Сотрудник: employee@hotdog.ru / emp123</p>
                <p>Админ: admin@hotdog.ru / admin123</p>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="firstName">Имя</Label>
                    <Input
                      id="firstName"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      placeholder="Иван"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input
                      id="lastName"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      placeholder="Петров"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="regEmail">Email</Label>
                  <Input
                    id="regEmail"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="regPassword">Пароль</Label>
                  <Input
                    id="regPassword"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="Создайте пароль"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Зарегистрироваться
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
