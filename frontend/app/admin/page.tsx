"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, CalendarDays, TrendingUp, Package, Settings, LogOut, Plus, Edit, Trash2, Minus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
}

interface Order {
  id: string
  items: any[]
  total: number
  timestamp: string
  employee: string
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [ingredients, setIngredients] = useState([
    { name: "Булочки для хот-догов", quantity: 45, unit: "шт" },
    { name: "Говяжьи сосиски", quantity: 38, unit: "шт" },
    { name: "Сыр чеддер", quantity: 2.5, unit: "кг" },
    { name: "Кетчуп", quantity: 1.2, unit: "л" },
    { name: "Горчица", quantity: 0.8, unit: "л" },
    { name: "Халапеньо", quantity: 0.5, unit: "кг" },
    { name: "Картофель", quantity: 8, unit: "кг" },
    { name: "Куриное филе", quantity: 3, unit: "кг" },
    { name: "Моцарелла", quantity: 1.5, unit: "кг" },
  ])
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({})
  const [isAddingItem, setIsAddingItem] = useState(false)
  const router = useRouter()

  const initialMenuItems: MenuItem[] = [
    { id: "1", name: "Classic Dog", description: "Говяжий хот-дог, булочка, кетчуп и горчица", price: 250, category: "hotdogs" },
    { id: "2", name: "Cheese Dog", description: "Говяжий хот-дог, булочка, расплавленный сыр", price: 290, category: "hotdogs" },
    { id: "3", name: "Spicy Dog", description: "Говяжий хот-дог, булочка, острый соус и халапеньо", price: 310, category: "hotdogs" },
    { id: "4", name: "Italian Dog", description: "Говяжий хот-дог, булочка, песто и пармезан", price: 340, category: "hotdogs" },
    { id: "5", name: "BBQ Crunch Dog", description: "Говяжий хот-дог, булочка, BBQ соус и хрустящий лук", price: 320, category: "hotdogs" },
    { id: "6", name: "Honey Mustard Dog", description: "Говяжий хот-дог, булочка, медовая горчица и соленые огурцы", price: 300, category: "hotdogs" },
    { id: "7", name: "Куриные наггетсы (6 шт)", description: "Хрустящие куриные наггетсы", price: 180, category: "sides" },
    { id: "8", name: "Картофель фри", description: "Золотистый картофель фри", price: 120, category: "sides" },
    { id: "9", name: "Моцарелла стикс (5 шт)", description: "Жареные палочки моцареллы", price: 200, category: "sides" },
    { id: "10", name: "Animal Style Fries", description: "Картофель фри с соусом и луком", price: 160, category: "sides" },
    { id: "11", name: "Кола", description: "Классическая кола", price: 80, category: "drinks" },
    { id: "12", name: "Кола Зеро", description: "Кола без сахара", price: 80, category: "drinks" },
    { id: "13", name: "Спрайт", description: "Лимонно-лаймовый напиток", price: 80, category: "drinks" },
    { id: "14", name: "Fuse Tea Лимон", description: "Чай с лимоном", price: 90, category: "drinks" },
    { id: "15", name: "Fuse Tea Персик", description: "Чай с персиком", price: 90, category: "drinks" },
    { id: "16", name: "Fuse Tea Манго", description: "Чай с манго", price: 90, category: "drinks" },
  ]

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      router.push("/employee")
      return
    }
    setUser(parsedUser)

    // Загружаем заказы и меню
    const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    const savedMenu = JSON.parse(localStorage.getItem("menuItems") || "[]")
    
    setOrders(savedOrders)
    setMenuItems(savedMenu.length > 0 ? savedMenu : initialMenuItems)
  }, [router])

  useEffect(() => {
    if (menuItems.length > 0) {
      localStorage.setItem("menuItems", JSON.stringify(menuItems))
    }
  }, [menuItems])

  const logout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const updateIngredient = (index: number, newQuantity: number) => {
    const updated = [...ingredients]
    updated[index].quantity = Math.max(0, newQuantity)
    setIngredients(updated)
    toast({
      title: "Запасы обновлены",
      description: `${updated[index].name}: ${newQuantity} ${updated[index].unit}`
    })
  }

  const saveMenuItem = () => {
    if (editingItem) {
      setMenuItems(menuItems.map(item => 
        item.id === editingItem.id ? editingItem : item
      ))
      toast({ title: "Товар обновлен", description: "Изменения сохранены" })
    } else if (newItem.name && newItem.description && newItem.price && newItem.category) {
      const item: MenuItem = {
        id: Date.now().toString(),
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        category: newItem.category
      }
      setMenuItems([...menuItems, item])
      toast({ title: "Товар добавлен", description: "Новый товар добавлен в меню" })
      setNewItem({})
    }
    setEditingItem(null)
    setIsAddingItem(false)
  }

  const deleteMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id))
    toast({ title: "Товар удален", description: "Товар удален из меню" })
  }

  const getCategoryName = (category: string) => {
    const names = {
      hotdogs: "Хот-доги",
      sides: "Гарниры", 
      drinks: "Напитки"
    }
    return names[category as keyof typeof names] || category
  }

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + order.total, 0)
  }

  const getDailyRevenue = () => {
    const today = new Date().toDateString()
    return orders
      .filter(order => new Date(order.timestamp).toDateString() === today)
      .reduce((sum, order) => sum + order.total, 0)
  }

  const getMonthlyRevenue = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    return orders
      .filter(order => {
        const orderDate = new Date(order.timestamp)
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
      })
      .reduce((sum, order) => sum + order.total, 0)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">🌭 Хот-дог Стенд</h1>
              <Badge variant="default" className="ml-3">Администратор</Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Привет, {user.name}!
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stats">Статистика</TabsTrigger>
            <TabsTrigger value="orders">История заказов</TabsTrigger>
            <TabsTrigger value="menu">Управление меню</TabsTrigger>
            <TabsTrigger value="inventory">Запасы</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Доход за сегодня</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{getDailyRevenue()}₼</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Доход за месяц</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{getMonthlyRevenue()}₼</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{getTotalRevenue()}₼</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Последние заказы</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Заказов пока нет</p>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(-5).reverse().map(order => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Заказ #{order.id}</p>
                            <p className="text-sm text-gray-600">Сотрудник: {order.employee}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{order.total}₼</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.timestamp).toLocaleString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>История заказов</CardTitle>
                <CardDescription>Все заказы с подробной информацией</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Заказов пока нет</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>№ Заказа</TableHead>
                        <TableHead>Дата и время</TableHead>
                        <TableHead>Сотрудник</TableHead>
                        <TableHead>Товары</TableHead>
                        <TableHead>Сумма</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.reverse().map(order => (
                        <TableRow key={order.id}>
                          <TableCell>#{order.id}</TableCell>
                          <TableCell>{new Date(order.timestamp).toLocaleString('ru-RU')}</TableCell>
                          <TableCell>{order.employee}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="text-sm">
                                  {item.name} x{item.quantity}
                                  {item.additions && item.additions.length > 0 && (
                                    <span className="text-gray-500"> (+{item.additions.join(', ')})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-green-600">{order.total}₼</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Управление меню
                  </span>
                </CardTitle>
                <CardContent>
                  <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить товар
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Добавить новый товар</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Название</Label>
                          <Input
                            id="name"
                            value={newItem.name || ""}
                            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Описание</Label>
                          <Input
                            id="description"
                            value={newItem.description || ""}
                            onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Цена (₼)</Label>
                          <Input
                            id="price"
                            type="number"
                            value={newItem.price || ""}
                            onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Категория</Label>
                          <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hotdogs">Хот-доги</SelectItem>
                              <SelectItem value="sides">Гарниры</SelectItem>
                              <SelectItem value="drinks">Напитки</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={saveMenuItem} className="w-full">
                          Добавить товар
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Описание</TableHead>
                        <TableHead>Категория</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menuItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{getCategoryName(item.category)}</Badge>
                          </TableCell>
                          <TableCell className="font-bold">{item.price}₼</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setEditingItem(item)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Редактировать товар</DialogTitle>
                                  </DialogHeader>
                                  {editingItem && (
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="editName">Название</Label>
                                        <Input
                                          id="editName"
                                          value={editingItem.name}
                                          onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="editDescription">Описание</Label>
                                        <Input
                                          id="editDescription"
                                          value={editingItem.description}
                                          onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="editPrice">Цена (₼)</Label>
                                        <Input
                                          id="editPrice"
                                          type="number"
                                          value={editingItem.price}
                                          onChange={(e) => setEditingItem({...editingItem, price: Number(e.target.value)})}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="editCategory">Категория</Label>
                                        <Select 
                                          value={editingItem.category} 
                                          onValueChange={(value) => setEditingItem({...editingItem, category: value})}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="hotdogs">Хот-доги</SelectItem>
                                            <SelectItem value="sides">Гарниры</SelectItem>
                                            <SelectItem value="drinks">Напитки</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button onClick={saveMenuItem} className="w-full">
                                        Сохранить изменения
                                      </Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deleteMenuItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Управление запасами
                  </CardTitle>
                  <CardDescription>
                    Обновляйте количество ингредиентов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3">{ingredient.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateIngredient(index, ingredient.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={ingredient.quantity}
                            onChange={(e) => updateIngredient(index, Number(e.target.value))}
                            className="text-center"
                          />
                          <span className="text-sm text-gray-500 min-w-[30px]">{ingredient.unit}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateIngredient(index, ingredient.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Badge 
                          variant={ingredient.quantity > 10 ? "default" : ingredient.quantity > 5 ? "secondary" : "destructive"}
                          className="w-full justify-center"
                        >
                          {ingredient.quantity > 10 ? "В наличии" : ingredient.quantity > 5 ? "Мало" : "Критично мало"}
                        </Badge>
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
