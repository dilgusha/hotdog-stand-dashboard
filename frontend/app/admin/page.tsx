
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarDays, TrendingUp, Package, Settings, LogOut, Plus, Edit, Trash2, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: { name: string } | null; // Allow product to be null
  addons?: { name: string }[];
  drinks?: { name: string }[];
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  price: number;
  createdBy: { name: string };
  created_at: string;
}

interface Inventory {
  id: string;
  ingredient: string;
  quantity: number;
}

interface Statistics {
  todayRevenue: number;
  monthRevenue: number;
  totalRevenue: number;
  todayOrders: number;
  monthOrders: number;
  totalOrders: number;
}

export default function AdminPage() {
  const [ingredients, setIngredients] = useState<Inventory[]>([]);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({});
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      console.log("=== Starting verification at", new Date().toLocaleString(), "===");
      const userData = localStorage.getItem("user");
      console.log("LocalStorage user data:", userData);
      if (!userData) {
        console.log("No user data found, triggering login redirect");
        toast({
          title: "Требуется вход",
          description: "Пожалуйста, войдите в систему.",
          variant: "destructive",
        });
        router.push("/");
        setIsLoading(false);
        return;
      }

      let parsedUser;
      try {
        parsedUser = JSON.parse(userData);
      } catch (parseError) {
        console.error("Failed to parse user data:", parseError);
        toast({
          title: "Ошибка",
          description: "Недействительные данные пользователя",
          variant: "destructive",
        });
        localStorage.removeItem("user");
        router.push("/");
        setIsLoading(false);
        return;
      }
      const token = parsedUser.access_token;
      console.log("Extracted token:", token);

      try {
        console.log("Sending auth verify request...");
        const verifyRes = await fetch("http://localhost:5000/api/auth/verify", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Auth verify response status:", verifyRes.status);
        if (!verifyRes.ok) throw new Error("Недействительный токен");

        const userDataJson = await verifyRes.json();
        console.log("Auth verify response data:", userDataJson);
        if (userDataJson.role !== "ADMIN") {
          console.log("User role is not ADMIN, redirecting:", userDataJson.role);
          toast({
            title: "Доступ запрещен",
            description: "Эта страница только для администраторов.",
            variant: "destructive",
          });
          router.push(userDataJson.role === "USER" ? "/employee" : "/");
          setIsLoading(false);
          return;
        }

        setUser(userDataJson);
        console.log("User state updated:", userDataJson);

        console.log("Fetching statistics...");
        const statsRes = await fetch("http://localhost:5000/api/statistics/get-all-statistics", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Statistics response status:", statsRes.status);
        if (!statsRes.ok) throw new Error("Не удалось загрузить статистику");
        const statsData = await statsRes.json();
        console.log("Statistics data:", statsData);
        setStatistics(statsData);

        console.log("Fetching orders...");
        const ordersRes = await fetch("http://localhost:5000/api/order/get-all-orders", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Orders response status:", ordersRes.status);
        if (!ordersRes.ok) throw new Error("Не удалось загрузить заказы");
        const ordersData = await ordersRes.json();
        console.log("Orders data:", ordersData);
        setOrders(ordersData);

        console.log("Fetching inventory...");
        const inventoryRes = await fetch("http://localhost:5000/api/inventory", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Inventory response status:", inventoryRes.status);
        if (!inventoryRes.ok) throw new Error("Не удалось загрузить запасы");
        const inventoryData = await inventoryRes.json();
        console.log("Inventory data:", inventoryData);
        setIngredients(inventoryData.data || inventoryData);

        console.log("Fetching menu...");
        const menuRes = await fetch("http://localhost:5000/api/products/get-all-products", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Menu response status:", menuRes.status);
        if (!menuRes.ok) throw new Error("Не удалось загрузить меню");
        const menuData = await menuRes.json();
        console.log("Menu data:", menuData);
        setMenuItems(menuData.data || menuData);
      } catch (err: any) {
        console.error("Error occurred at", new Date().toLocaleString(), ":", err.message);
        toast({
          title: "Ошибка",
          description: err.message || "Произошла ошибка при загрузке данных",
          variant: "destructive",
        });
        localStorage.removeItem("user");
        router.push("/");
      } finally {
        console.log("=== Loading complete at", new Date().toLocaleString(), "===");
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Выход",
      description: "Вы успешно вышли из системы.",
    });
    router.push("/");
  };

  const updateIngredient = async (ingredientId: string, newQuantity: number) => {
    const previousIngredients = [...ingredients];
    const updated = ingredients.map((ingredient) =>
      ingredient.id === ingredientId ? { ...ingredient, quantity: newQuantity } : ingredient
    );
    setIngredients(updated);

    const userData = localStorage.getItem("user");
    if (!userData) {
      toast({
        title: "Ошибка авторизации",
        description: "Пользователь не авторизован",
        variant: "destructive",
      });
      setIngredients(previousIngredients);
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
        throw new Error(`Failed to update ingredient quantity: ${errorText}`);
      }

      const updatedIngredient = updated.find((ing) => ing.id === ingredientId);
      toast({
        title: "Запасы обновлены",
        description: `${updatedIngredient?.ingredient}: ${newQuantity}`,
      });
    } catch (error: any) {
      setIngredients(previousIngredients);
      toast({
        title: "Ошибка обновления",
        description: error.message || "Не удалось обновить запасы",
        variant: "destructive",
      });
    }
  };

  const saveMenuItem = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      toast({
        title: "Ошибка авторизации",
        description: "Пользователь не авторизован",
        variant: "destructive",
      });
      return;
    }

    const parsedUser = JSON.parse(userData);
    const token = parsedUser.access_token;

    if (editingItem) {
      try {
        const res = await fetch(`http://localhost:5000/api/products/update/${editingItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingItem),
        });

        if (res.ok) {
          setMenuItems(menuItems.map((item) => (item.id === editingItem.id ? editingItem : item)));
          toast({ title: "Товар обновлен", description: "Изменения сохранены" });
        } else {
          throw new Error("Не удалось обновить товар");
        }
      } catch (error: any) {
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось обновить товар",
          variant: "destructive",
        });
      }
    } else if (newItem.name && newItem.description && newItem.price && newItem.category) {
      try {
        const res = await fetch("http://localhost:5000/api/products/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newItem),
        });

        if (res.ok) {
          const item = await res.json();
          setMenuItems([...menuItems, item]);
          toast({ title: "Товар добавлен", description: "Новый товар добавлен в меню" });
          setNewItem({});
          setIsAddingItem(false);
        } else {
          throw new Error("Не удалось добавить товар");
        }
      } catch (error: any) {
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось добавить товар",
          variant: "destructive",
        });
      }
    }
    setEditingItem(null);
  };

  const deleteMenuItem = async (id: string) => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      toast({
        title: "Ошибка авторизации",
        description: "Пользователь не авторизован",
        variant: "destructive",
      });
      return;
    }

    const parsedUser = JSON.parse(userData);
    const token = parsedUser.access_token;

    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMenuItems(menuItems.filter((item) => item.id !== id));
        toast({ title: "Товар удален", description: "Товар удален из меню" });
      } else {
        throw new Error("Не удалось удалить товар");
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить товар",
        variant: "destructive",
      });
    }
  };

  const getCategoryName = (category: string) => {
    const names = {
      hotdogs: "Хот-доги",
      sides: "Гарниры",
      drinks: "Напитки",
    };
    return names[category as keyof typeof names] || category;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  if (!user) return null;

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
              <span className="text-sm text-gray-600">Привет, {user.name}!</span>
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
            {/* <TabsTrigger value="menu">Управление меню</TabsTrigger> */}
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
                  <div className="text-2xl font-bold text-green-600">
                    {statistics ? `${statistics.todayRevenue}₼` : "0₼"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Заказов: {statistics ? statistics.todayOrders : 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Доход за месяц</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {statistics ? `${statistics.monthRevenue}₼` : "0₼"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Заказов: {statistics ? statistics.monthOrders : 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {statistics ? `${statistics.totalRevenue}₼` : "0₼"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Заказов: {statistics ? statistics.totalOrders : 0}
                  </p>
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
                    {orders.slice(-5).reverse().map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Заказ #{order.id}</p>
                            <p className="text-sm text-gray-600">Сотрудник: {order.createdBy.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{order.price}₼</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleString("ru-RU")}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.items.map((item) => (
                            <div key={item.id}>
                              {item.product ? `${item.product.name} x${item.quantity}` : "Unknown Product"}
                              {item.addons && item.addons.length > 0 && (
                                <span className="text-gray-500"> (+{item.addons.map((a) => a.name).join(", ")})</span>
                              )}
                              {item.drinks && item.drinks.length > 0 && (
                                <span className="text-gray-500"> (+{item.drinks.map((d) => d.name).join(", ")})</span>
                              )}
                            </div>
                          ))}
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
                      {orders.reverse().map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>#{order.id}</TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleString("ru-RU")}</TableCell>
                          <TableCell>{order.createdBy.name}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {order.items.map((item) => (
                                <div key={item.id} className="text-sm">
                                  {item.product ? `${item.product.name} x${item.quantity}` : "Unknown Product"}
                                  {item.addons && item.addons.length > 0 && (
                                    <span className="text-gray-500"> (+{item.addons.map((a) => a.name).join(", ")})</span>
                                  )}
                                  {item.drinks && item.drinks.length > 0 && (
                                    <span className="text-gray-500"> (+{item.drinks.map((d) => d.name).join(", ")})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-green-600">{order.price}₼</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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
                <CardDescription>Обновляйте количество ингредиентов</CardDescription>
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
                        <input
                          type="number"
                          value={ingredient.quantity}
                          onChange={(e) =>
                            updateIngredient(ingredient.id, Math.max(0, Number(e.target.value)))
                          }
                          className="text-center w-16 border rounded"
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
  );
}

