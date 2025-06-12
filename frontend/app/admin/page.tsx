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

interface Inventory {
  id: string;
  ingredient: string;
  quantity: number;
}
export default function AdminPage() {
  const [ingredients, setIngredients] = useState<Inventory[]>([]);  // Envanter state'i
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  // const [ingredients, setIngredients] = useState([
  //   { id: "1", name: "Булочки для хот-догов", quantity: 45, unit: "шт" },
  //   { id: "2", name: "Говяжьи сосиски", quantity: 38, unit: "шт" },
  //   { id: "3", name: "Сыр чеддер", quantity: 2.5, unit: "кг" },
  //   { id: "4", name: "Кетчуп", quantity: 1.2, unit: "л" },
  //   { id: "5", name: "Горчица", quantity: 0.8, unit: "л" },
  //   { id: "6", name: "Халапеньо", quantity: 0.5, unit: "кг" },
  //   { id: "7", name: "Картофель", quantity: 8, unit: "кг" },
  //   { id: "8", name: "Куриное филе", quantity: 3, unit: "кг" },
  //   { id: "9", name: "Моцарелла", quantity: 1.5, unit: "кг" },
  // ])
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({})
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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
    const verifyUser = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        toast({
          title: "Требуется вход",
          description: "Пожалуйста, войдите в систему.",
          variant: "destructive",
        });
        router.push("/");
        return;
      }

      const parsedUser = JSON.parse(userData);
      const token = parsedUser.access_token;

      try {
        const res = await fetch("http://localhost:5000/api/auth/verify", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Недействительный токен");
        }

        const data = await res.json();
        if (data.role !== "ADMIN") {
          toast({
            title: "Доступ запрещен",
            description: "Эта страница только для администраторов.",
            variant: "destructive",
          });
          router.push(data.role === "USER" ? "/employee" : "/");
          return;
        }

        setUser(data);

        // Load orders and menu from backend or localStorage
        const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
        const savedMenu = JSON.parse(localStorage.getItem("menuItems") || "[]");
        setOrders(savedOrders);
        // setMenuItems(savedMenu.length > 0 ? savedMenu : initialMenuItems);

        // Fetch inventory items
        const inventoryRes = await fetch("http://localhost:5000/api/inventory", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!inventoryRes.ok) {
          throw new Error("Не удалось загрузить запасы");
        }

        const inventoryData = await inventoryRes.json();
        setIngredients(inventoryData.data); // Assuming the response is { data: [...] }
      } catch (err: any) { // Explicitly type err as 'any' or use type guard
        toast({
          title: "Ошибка авторизации",
          description:
            err instanceof Error ? err.message : "Недействительный токен или ошибка сервера.",
          variant: "destructive",
        });
        localStorage.removeItem("user");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [router]);
  useEffect(() => {
    if (menuItems.length > 0) {
      localStorage.setItem("menuItems", JSON.stringify(menuItems))
    }
  }, [menuItems])

  const logout = () => {
    localStorage.removeItem("user")
    toast({
      title: "Выход",
      description: "Вы успешно вышли из системы.",
    })
    router.push("/")
  }

  //  const [ingredients, setIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  console.log("Ingredients data:", ingredients);
  const updateIngredient = async (ingredientId: string, newQuantity: number) => {
  // Köhnə state-i saxla
  const previousIngredients = [...ingredients];

  // Optimist yeniləmə
  const updated = ingredients.map((ingredient) =>
    ingredient.id === ingredientId
      ? { ...ingredient, quantity: newQuantity }
      : ingredient
  );
  setIngredients(updated);

  const userData = localStorage.getItem("user");
  if (!userData) {
    toast({
      title: "Ошибка авторизации",
      description: "Пользователь не авторизован",
      variant: "destructive",
    });
    setIngredients(previousIngredients); // Geri qaytar
    return;
  }

  const parsedUser = JSON.parse(userData);
  const token = parsedUser.access_token;

  try {
    const res = await fetch(`http://localhost:5000/api/inventory/${ingredientId}/quantity`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity: newQuantity }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error:", res.status, errorText);
      throw new Error(`Failed to update ingredient quantity: ${res.status}`);
    }

    const updatedIngredient = updated.find((ing) => ing.id === ingredientId);
    toast({
      title: "Запасы обновлены",
      description: `${updatedIngredient?.ingredient}: ${newQuantity}`,
    });
  } catch (error) {
    console.error("Update ingredient error:", error);
    setIngredients(previousIngredients); // Səhv olduqda köhnə state-i bərpa et
    toast({
      title: "Ошибка обновления",
      description: "Не удалось обновить запасы",
      variant: "destructive",
    });
  }
};

  // Alternative: Check your backend routes
  // You can also add this function to test what endpoints are available:
  const testInventoryEndpoints = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) return;

    const parsedUser = JSON.parse(userData);
    const token = parsedUser.access_token;

    // Test different endpoints to see which one works
    const endpoints = [
      `http://localhost:5000/api/inventory/1/quantity`,
      `http://localhost:5000/api/inventory/1`,
      `http://localhost:5000/api/inventory/update/1`,
      `http://localhost:5000/api/inventory/update`,
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        const res = await fetch(endpoint, {
          method: "PUT",  // or try "PATCH"
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: 10 }),
        });
        console.log(`${endpoint}: ${res.status} ${res.statusText}`);
      } catch (error) {
        console.log(`${endpoint}: Error - ${error}`);
      }
    }
  };
  // const updateIngredient = async (index: number, newQuantity: number) => {
  //   const updated = [...ingredients];
  //   updated[index] = { ...updated[index], quantity: newQuantity };
  //   setIngredients(updated);  // frontend-i dərhal yenilə

  //   const ingredientId = updated[index].id;
  //   const token = localStorage.getItem("access_token");

  //   try {
  //     const res = await fetch(`http://localhost:5000/api/inventory/${ingredientId}/quantity`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ quantity: newQuantity }),
  //     });

  //     if (!res.ok) {
  //       throw new Error("Failed to update ingredient quantity");
  //     }

  //     toast({
  //       title: "Запасы обновлены",
  //       description: `${updated[index].ingredient}: ${newQuantity}`,
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "Ошибка обновления",
  //       description: "Не удалось обновить запасы",
  //       variant: "destructive",
  //     });
  //   }
  // };


  // const updateIngredient = (index: number, newQuantity: number) => {
  //   const updated = [...ingredients]
  //   updated[index].quantity = Math.max(0, newQuantity)
  //   setIngredients(updated)
  //   toast({
  //     title: "Запасы обновлены",
  //     description: `${updated[index].name}: ${newQuantity} ${updated[index].unit}`,
  //   })
  // }

  const saveMenuItem = async () => {
    if (editingItem) {
      // Update existing item in the backend if editing
      const res = await fetch(`http://localhost:5000/api/products/update/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        setMenuItems(menuItems.map(item => item.id === editingItem.id ? editingItem : item));
        toast({ title: "Товар обновлен", description: "Изменения сохранены" });
      } else {
        toast({ title: "Ошибка", description: "Не удалось обновить товар" });
      }
    } else if (newItem.name && newItem.description && newItem.price && newItem.category) {
      // Send new item to backend
      const token = localStorage.getItem("access_token"); // or get token from your app's state
      console.log(token);
      const res = await fetch("http://localhost:5000/api/products/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,  // Ensure the token is prefixed with 'Bearer'
        },
        body: JSON.stringify(newItem),
      });


      // const res = await fetch("http://localhost:5000/api/products/create", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(newItem),
      // });

      if (res.ok) {
        const item = await res.json();
        setMenuItems([...menuItems, item]);
        toast({ title: "Товар добавлен", description: "Новый товар добавлен в меню" });
        setNewItem({});  // Reset the form
        setIsAddingItem(false);  // Close the dialog
      } else {
        toast({ title: "Ошибка", description: "Не удалось добавить товар" });
      }
    }
    setEditingItem(null);
  };

  // const saveMenuItem = () => {
  //   if (editingItem) {
  //     setMenuItems(menuItems.map(item => 
  //       item.id === editingItem.id ? editingItem : item
  //     ))
  //     toast({ title: "Товар обновлен", description: "Изменения сохранены" })
  //   } else if (newItem.name && newItem.description && newItem.price && newItem.category) {
  //     const item: MenuItem = {
  //       id: Date.now().toString(),
  //       name: newItem.name,
  //       description: newItem.description,
  //       price: newItem.price,
  //       category: newItem.category
  //     }
  //     setMenuItems([...menuItems, item])
  //     toast({ title: "Товар добавлен", description: "Новый товар добавлен в меню" })
  //     setNewItem({})
  //   }
  //   setEditingItem(null)
  //   setIsAddingItem(false)
  // }

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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
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
              {/* <span className="text-sm text-gray-600">
                Привет, {user.name}!
              </span> */}
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
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Описание</Label>
                          <Input
                            id="description"
                            value={newItem.description || ""}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Цена (₼)</Label>
                          <Input
                            id="price"
                            type="number"
                            value={newItem.price || ""}
                            onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Категория</Label>
                          <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
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
                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="editDescription">Описание</Label>
                                      <Input
                                        id="editDescription"
                                        value={editingItem.description}
                                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="editPrice">Цена (₼)</Label>
                                      <Input
                                        id="editPrice"
                                        type="number"
                                        value={editingItem.price}
                                        onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="editCategory">Категория</Label>
                                      <Select
                                        value={editingItem.category}
                                        onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
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
                  {ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">{ingredient.ingredient}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateIngredient(ingredient.id, Math.max(0, ingredient.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        {/* <Input
                          type="number"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(ingredient.id, Math.max(0, Number(e.target.value)))}
                          className="text-center"
                          min="0"
                        /> */}
                        <input
                          type="number"
                          value={ingredient.quantity} // State-dən dəyəri alın
                          onChange={(e) => updateIngredient(ingredient.id, Math.max(0, Number(e.target.value)))}
                          className="text-center"
                          min="0"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateIngredient(ingredient.id, ingredient.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Badge
                        variant={
                          ingredient.quantity > 10
                            ? "default"
                            : ingredient.quantity > 5
                              ? "secondary"
                              : "destructive"
                        }
                        className="w-full justify-center"
                      >
                        {ingredient.quantity > 10
                          ? "В наличии"
                          : ingredient.quantity > 5
                            ? "Мало"
                            : "Критично мало"}
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