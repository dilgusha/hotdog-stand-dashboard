"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { log } from "console"

export default function AuthPage() {
  const [loginData, setLoginData] = useState({ name: "", password: "" })
  const [registerData, setRegisterData] = useState({ name: "", password: "" })
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      })

      if (!res.ok) {
        const error = await res.json()
        toast({
          title: "Giriş xətası",
          description: error.message || "İstifadəçi adı və ya şifrə yanlışdır",
          variant: "destructive",
        })
        return
      }

      const data = await res.json()
      console.log(data);
      
      localStorage.setItem("user", JSON.stringify(data))
      // router.push("/employee") // və ya /admin
      console.log(data.role);
      
     if (data.role === "ADMIN") {
      router.push("/admin");  // Admin səhifəsinə yönləndiririk
    } else {
      router.push("/employee");  // Worker səhifəsinə yönləndiririk
    }
    } catch (err) {
      toast({
        title: "Server xətası",
        description: "Backend-ə qoşulmaq mümkün olmadı.",
        variant: "destructive",
      })
    }
  }

  console.log(registerData.name, registerData.password)
  const handleRegister = async (e: React.FormEvent) => {

    e.preventDefault()
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      })

      if (!res.ok) {
        const error = await res.json()
        console.log("Xəta cavabı:", error) 
        toast({
          title: "Xəta",
          description: error.message || "Qeydiyyat zamanı xəta baş verdi",
          variant: "destructive",
        })
        return
      }


      toast({
        title: "Uğurlu qeydiyyat",
        description: "Hesab yaradıldı. Zəhmət olmasa daxil olun.",
      })
    } catch (err) {
      toast({
        title: "Server xətası",
        description: "Backend-ə qoşulmaq mümkün olmadı.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">🌭 Hot-dog Stand</CardTitle>
          <CardDescription>Sadələşdirilmiş Auth sistemi</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Daxil ol</TabsTrigger>
              <TabsTrigger value="register">Qeydiyyat</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="name">İstifadəçi adı</Label>
                  <Input
                    id="name"
                    type="text"
                    value={loginData.name}
                    onChange={(e) => setLoginData({ ...loginData, name: e.target.value })}
                    placeholder="İstifadəçi adı"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Şifrə</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Şifrənizi daxil edin"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Daxil ol</Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="regName">İstifadəçi adı</Label>
                  <Input
                    id="regName"
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="Yeni istifadəçi adı"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="regPassword">Şifrə</Label>
                  <Input
                    id="regPassword"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="Şifrə yaradın"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Qeydiyyat</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
