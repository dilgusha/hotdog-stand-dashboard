"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus, ShoppingCart, LogOut, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
}

interface OrderItem extends MenuItem {
  quantity: number
  additions: string[]
}

export default function EmployeePage() {
  const [user, setUser] = useState<any>(null)
  const [cart, setCart] = useState<OrderItem[]>([])
  const [total, setTotal] = useState(0)
  const router = useRouter()

  const menuItems: MenuItem[] = [
    // Хот-доги
    {
      id: "1",
      name: "Classic Dog",
      description: "Говяжий хот-дог, булочка, кетчуп и горчица",
      price: 250,
      category: "hotdogs",
    },
    {
      id: "2",
      name: "Cheese Dog",
      description: "Говяжий хот-дог, булочка, расплавленный сыр",
      price: 290,
      category: "hotdogs",
    },
    {
      id: "3",
      name: "Spicy Dog",
      description: "Говяжий хот-дог, булочка, острый соус и халапеньо",
      price: 310,
      category: "hotdogs",
    },
    {
      id: "4",
      name: "Italian Dog",
      description: "Говяжий хот-дог, булочка, песто и пармезан",
      price: 340,
      category: "hotdogs",
    },
    {
      id: "5",
      name: "BBQ Crunch Dog",
      description: "Говяжий хот-дог, булочка, BBQ соус и хрустящий лук",
      price: 320,
      category: "hotdogs",
    },
    {
      id: "6",
      name: "Honey Mustard Dog",
      description: "Говяжий хот-дог, булочка, медовая горчица и соленые огурцы",
      price: 300,
      category: "hotdogs",
    },

    // Гарниры
    {
      id: "7",
      name: "Куриные наггетсы (6 шт)",
      description: "Хрустящие куриные наггетсы",
      price: 180,
      category: "sides",
    },
    { id: "8", name: "Картофель фри", description: "Золотистый картофель фри", price: 120, category: "sides" },
    {
      id: "9",
      name: "Моцарелла стикс (5 шт)",
      description: "Жареные палочки моцареллы",
      price: 200,
      category: "sides",
    },
    {
      id: "10",
      name: "Animal Style Fries",
      description: "Картофель фри с соусом и луком",
      price: 160,
      category: "sides",
    },

    // Напитки
    { id: "11", name: "Кола", description: "Классическая кола", price: 80, category: "drinks" },
    { id: "12", name: "Кола Зеро", description: "Кола без сахара", price: 80, category: "drinks" },
    { id: "13", name: "Спрайт", description: "Лимонно-лаймовый напиток", price: 80, category: "drinks" },
    { id: "14", name: "Fuse Tea Лимон", description: "Чай с лимоном", price: 90, category: "drinks" },
    { id: "15", name: "Fuse Tea Персик", description: "Чай с персиком", price: 90, category: "drinks" },
    { id: "16", name: "Fuse Tea Манго", description: "Чай с манго", price: 90, category: "drinks" },
  ]

  const additions = [
    { name: "Дополнительный сыр", price: 30 },
    { name: "Халапеньо", price: 20 },
    { name: "Хрустящий лук", price: 25 },
    { name: "Соленые огурцы", price: 15 },
    { name: "Дополнительный соус", price: 20 },
    { name: "Двойной хот-дог", price: 100 },
  ]

  const ingredients = [
    { name: "Булочки для хот-догов", quantity: 45, unit: "шт" },
    { name: "Говяжьи сосиски", quantity: 38, unit: "шт" },
    { name: "Сыр чеддер", quantity: 2.5, unit: "кг" },
    { name: "Кетчуп", quantity: 1.2, unit: "л" },
    { name: "Горчица", quantity: 0.8, unit: "л" },
    { name: "Халапеньо", quantity: 0.5, unit: "кг" },
    { name: "Картофель", quantity: 8, unit: "кг" },
    { name: "Куриное филе", quantity: 3, unit: "кг" },
    { name: "Моцарелла", quantity: 1.5, unit: "кг" },
  ]

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => {
      const additionsTotal = item.additions.reduce((addSum, addName) => {
        const addition = additions.find((a) => a.name === addName)
        return addSum + (addition?.price || 0)
      }, 0)
      return sum + (item.price + additionsTotal) * item.quantity
    }, 0)
    setTotal(newTotal)
  }, [cart])

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id)
    if (existingItem) {
      setCart(
        cart.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem)),
      )
    } else {
      setCart([...cart, { ...item, quantity: 1, additions: [] }])
    }
  }

  const updateQuantity = (id: string, change: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + change)
            return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter(Boolean) as OrderItem[],
    )
  }

  const toggleAddition = (itemId: string, additionName: string) => {
    setCart(
      cart.map((item) => {
        if (item.id === itemId) {
          const hasAddition = item.additions.includes(additionName)
          return {
            ...item,
            additions: hasAddition
              ? item.additions.filter((a) => a !== additionName)
              : [...item.additions, additionName],
          }
        }
        return item
      }),
    )
  }

  const submitOrder = () => {
    if (cart.length === 0) {
      toast({
        title: "Корзина пуста",
        description: "Добавьте товары в заказ",
        variant: "destructive",
      })
      return
    }

    // Сохраняем заказ в localStorage для демонстрации
    const orders = JSON.parse(localStorage.getItem("orders") || "[]")
    const newOrder = {
      id: Date.now().toString(),
      items: cart,
      total,
      timestamp: new Date().toISOString(),
      employee: user.firstName + " " + user.lastName,
    }
    orders.push(newOrder)
    localStorage.setItem("orders", JSON.stringify(orders))

    toast({
      title: "Заказ добавлен",
      description: `Заказ на сумму ${total}₼ успешно создан`,
    })
    setCart([])
  }

  const logout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const getCategoryName = (category: string) => {
    const names = {
      hotdogs: "Хот-доги",
      sides: "Гарниры",
      drinks: "Напитки",
    }
    return names[category as keyof typeof names] || category
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">🌭 Хот-дог Стенд</h1>
              <Badge variant="secondary" className="ml-3">
                Сотрудник
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Привет, {user.firstName}!</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu">Меню и заказы</TabsTrigger>
            <TabsTrigger value="inventory">Запасы ингредиентов</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {["hotdogs", "sides", "drinks"].map((category) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle>{getCategoryName(category)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuItems
                          .filter((item) => item.category === category)
                          .map((item) => (
                            <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium">{item.name}</h3>
                                <span className="font-bold text-green-600">{item.price}₼</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                              <Button onClick={() => addToCart(item)} size="sm" className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить
                              </Button>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Текущий заказ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cart.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Корзина пуста</p>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <span className="font-bold text-green-600">
                                {(item.price +
                                  item.additions.reduce((sum, addName) => {
                                    const addition = additions.find((a) => a.name === addName)
                                    return sum + (addition?.price || 0)
                                  }, 0)) *
                                  item.quantity}
                                ₼
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                              <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium">{item.quantity}</span>
                              <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {item.category === "hotdogs" && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-700">Дополнения:</p>
                                <div className="flex flex-wrap gap-1">
                                  {additions.map((addition) => (
                                    <Badge
                                      key={addition.name}
                                      variant={item.additions.includes(addition.name) ? "default" : "outline"}
                                      className="cursor-pointer text-xs"
                                      onClick={() => toggleAddition(item.id, addition.name)}
                                    >
                                      {addition.name} (+{addition.price}₼)
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        <Separator />
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Итого:</span>
                          <span className="text-green-600">{total}₼</span>
                        </div>

                        <Button onClick={submitOrder} className="w-full" size="lg">
                          Добавить заказ
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Запасы ингредиентов
                </CardTitle>
                <CardDescription>Текущие остатки ингредиентов (только просмотр)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">{ingredient.name}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-blue-600">{ingredient.quantity}</span>
                        <span className="text-gray-500">{ingredient.unit}</span>
                      </div>
                      <div className="mt-2">
                        <Badge
                          variant={
                            ingredient.quantity > 10 ? "default" : ingredient.quantity > 5 ? "secondary" : "destructive"
                          }
                        >
                          {ingredient.quantity > 10 ? "В наличии" : ingredient.quantity > 5 ? "Мало" : "Критично мало"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
