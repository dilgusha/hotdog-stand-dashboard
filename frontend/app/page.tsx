"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuthPage() {
  const [loginData, setLoginData] = useState({ name: "", password: "" })
  const [registerData, setRegisterData] = useState({ name: "", password: "" })
  const router = useRouter()

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    });

    const data = await res.json();

    if (!res.ok) {
      toast({
        title: "Ошибка входа",
        description: data.message || "Неверное имя пользователя или пароль",
        variant: "destructive",
      });
      return;
    }

    if (!data.access_token || !data.role) {
      toast({
        title: "Ошибка входа",
        description: "Сервер вернул неполные данные. Обратитесь к администратору.",
        variant: "destructive",
      });
      return;
    }

    const userData = {
      name: data.name || loginData.name,
      role: data.role,
      access_token: data.access_token,
    };
    localStorage.setItem("user", JSON.stringify(userData));

    toast({
      title: "Успешный вход",
      description: `Добро пожаловать, ${userData.name}!`,
    });

    if (data.role === "ADMIN") {
      router.push("/admin");
    } else if (data.role === "USER") {
      router.push("/employee");
    } else {
      toast({
        title: "Ошибка",
        description: `Неизвестная роль пользователя: ${data.role}`,
        variant: "destructive",
      });
    }
  } catch (err) {
    toast({
      title: "Ошибка сервера",
      description: "Не удалось подключиться к серверу. Проверьте соединение.",
      variant: "destructive",
    });
  }
};


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...registerData, role: "EMPLOYEE" }),
      })

      const data = await res.json()
      console.log("Ответ от /api/auth/register:", data)

      if (!res.ok) {
        toast({
          title: "Ошибка",
          description: data.message || "Ошибка при регистрации",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Успешная регистрация",
        description: "Аккаунт создан. Пожалуйста, войдите.",
      })
      setRegisterData({ name: "", password: "" })
    } catch (err) {
      console.error("Ошибка регистрации:", err)
      toast({
        title: "Ошибка сервера",
        description: "Не удалось подключиться к серверу.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">🌭 Хот-дог Стенд</CardTitle>
          <CardDescription>Упрощенная система авторизации</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Войти</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="name">Имя пользователя</Label>
                  <Input
                    id="name"
                    type="text"
                    value={loginData.name}
                    onChange={(e) => setLoginData({ ...loginData, name: e.target.value })}
                    placeholder="Имя пользователя"
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
                <Button type="submit" className="w-full">Войти</Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="regName">Имя пользователя</Label>
                  <Input
                    id="regName"
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="Новое имя пользователя"
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
                    placeholder="Создать пароль"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Зарегистрироваться</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}