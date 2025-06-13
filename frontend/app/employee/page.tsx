"use client"


import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus, ShoppingCart, LogOut, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { ProductCategory } from "../../../backend/src/common/enum/product-category.enum"


interface Addon {
  id: number;
  name: string;
  price: number;
  inventory: { id: string; ingredient: string; quantity: number };
  category: ProductCategory;
}


interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
}


interface OrderItem extends MenuItem {
  quantity: number;
  addonIds?: number[];
  sauceQuantities?: Record<string, number>;
  drinkIds?: number[]; // Add drinkIds to track drinks in the cart
}


interface Inventory {
  id: string;
  ingredient: string;
  quantity: number;
}


interface User {
  name: string;
  access_token: string;
}


interface Drink {
  id: number;
  name: string;
  description: string;
  price: number;
}


type CategoryMap = { [key in ProductCategory]?: MenuItem[] };


export default function EmployeePage() {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Inventory[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]); // Store drinks separately
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    const userData = localStorage.getItem("user");
    console.log("User data:", userData); // Debug token
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);


  useEffect(() => {
    const verifyUser = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        toast({ title: "Требуется вход", description: "Пожалуйста, войдите в систему.", variant: "destructive" });
        router.push("/");
        return;
      }


      const parsedUser = JSON.parse(userData);
      const token = parsedUser.access_token;


      try {
        const inventoryRes = await fetch("http://localhost:5000/api/inventory", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!inventoryRes.ok) throw new Error("Не удалось загрузить запасы");
        const inventoryData = await inventoryRes.json();
        setIngredients(inventoryData.data || []);


        const addonsRes = await fetch("http://localhost:5000/api/addons/get-all-addons", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!addonsRes.ok) throw new Error("Не удалось загрузить дополнения");
        const addonsData = await addonsRes.json();
        setAddons(addonsData.data || []);


        const drinksRes = await fetch("http://localhost:5000/api/drinks/get-all-drinks", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!drinksRes.ok) throw new Error("Не удалось загрузить напитки");
        const drinksData = await drinksRes.json();
        setDrinks(drinksData.data || []);
      } catch (err: any) {
        toast({ title: "Ошибка авторизации", description: err.message || "Недействительный токен или ошибка сервера.", variant: "destructive" });
        localStorage.removeItem("user");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };
    verifyUser();
  }, [router]);


  useEffect(() => {
    const fetchProducts = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        router.push("/");
        return;
      }
      const parsedUser = JSON.parse(userData);
      const token = parsedUser.access_token;


      try {
        const productResponse = await fetch("http://localhost:5000/api/products/get-all-products", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!productResponse.ok) throw new Error(`Не удалось загрузить продукты: ${await productResponse.text()}`);
        const productData = await productResponse.json();
        const itemsToMap = productData.data || productData || [];
        const mappedMenuItems = Array.isArray(itemsToMap) ? itemsToMap.map((item: any) => ({
          id: item.id.toString(),
          name: item.name || `Product ${item.id}`,
          description: item.description || "No description",
          price: typeof item.price === "string" ? parseFloat(item.price) : item.price || 0,
          category: mapCategory(item.category),
        })) : [];
        setMenuItems(mappedMenuItems);
      } catch (err: any) {
        toast({ title: "Ошибка загрузки данных", description: err.message || "Не удалось загрузить продукты", variant: "destructive" });
        setMenuItems([]);
      }
    };
    fetchProducts();
  }, [router]);


  const mapCategory = (category: string): ProductCategory => {
    const categoryMap: Record<string, ProductCategory> = {
      "hotdog": ProductCategory.HOTDOG,
      "sides": ProductCategory.SIDES,
      "combos": ProductCategory.COMBOS,
      "HOTDOG": ProductCategory.HOTDOG,
      "SIDES": ProductCategory.SIDES,
      "COMBOS": ProductCategory.COMBOS,
    };
    return categoryMap[category.toUpperCase()] || categoryMap[category.toLowerCase()] || categoryMap[category.replace("-", "")] || ProductCategory.HOTDOG;
  };


  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => {
      const addonTotal = (item.addonIds || []).reduce((addSum, addonId) => {
        const addon = addons.find(a => a.id === addonId);
        return addSum + (addon?.price || 0) * (item.quantity || 1);
      }, 0);
      const sauceTotal = Object.values(item.sauceQuantities || {}).reduce((sum: number, qty: number) => {
        const addonId = Object.keys(item.sauceQuantities || {}).find(key => item.sauceQuantities![key] === qty);
        if (addonId) {
          const addon = addons.find(a => a.id === parseInt(addonId));
          return sum + (addon?.price || 0) * qty;
        }
        return sum;
      }, 0);
      const drinkTotal = (item.drinkIds || []).reduce((drinkSum, drinkId) => {
        const drink = drinks.find(d => d.id === drinkId);
        return drinkSum + (drink?.price || 0) * (item.quantity || 1);
      }, 0);
      return sum + (item.price * (item.quantity || 1)) + addonTotal + sauceTotal + drinkTotal;
    }, 0);
    setTotal(newTotal);
  }, [cart, addons, drinks]);


  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem));
    } else {
      setCart([...cart, { ...item, quantity: 1, addonIds: [], sauceQuantities: {}, drinkIds: [] }]);
    }
  };


  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map((item) => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as OrderItem[]);
  };


  const toggleAddon = (itemId: string, addonId: number) => {
    setCart(cart.map((item) => {
      if (item.id === itemId) {
        const hasAddon = item.addonIds?.includes(addonId);
        return {
          ...item,
          addonIds: hasAddon ? item.addonIds?.filter(id => id !== addonId) : [...(item.addonIds || []), addonId],
        };
      }
      return item;
    }));
  };


  const updateSauceQuantity = (itemId: string, addonId: number, qty: number) => {
    setCart(cart.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          sauceQuantities: { ...item.sauceQuantities, [addonId.toString()]: Math.max(0, qty) },
        };
      }
      return item;
    }));
  };


  const toggleDrink = (itemId: string, drinkId: number) => {
    setCart(cart.map((item) => {
      if (item.id === itemId) {
        const hasDrink = item.drinkIds?.includes(drinkId);
        return {
          ...item,
          drinkIds: hasDrink ? item.drinkIds?.filter(id => id !== drinkId) : [...(item.drinkIds || []), drinkId],
        };
      }
      return item;
    }));
  };


  const submitOrder = async () => {
    if (!user) {
      toast({ title: "Ошибка", description: "Пользователь не найден", variant: "destructive" });
      return;
    }


    if (cart.length === 0) {
      toast({ title: "Корзина пуста", description: "Добавьте товары в заказ", variant: "destructive" });
      return;
    }


    const orderPayload = {
      userId: parseInt(user.name), // Əgər `user.name` əvəzinə `user.id` varsa, onu istifadə et
      items: cart.map((item) => ({
        productId: parseInt(item.id),
        quantity: item.quantity,
        addonIds: item.addonIds || [],
        ingredientIds: Object.keys(item.sauceQuantities || {}).map(id => parseInt(id)),
        drinkIds: item.drinkIds || [], // Include drinkIds in the order payload
      })),
    };


    try {
      const res = await fetch("http://localhost:5000/api/order/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });


      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ошибка сервера: ${errorText}`);
      }


      const result = await res.json();


      toast({
        title: "Успешно",
        description: `Заказ создан на сумму ${result.totalAmount}₼`,
      });


      setCart([]);
    } catch (err: any) {
      toast({
        title: "Ошибка заказа",
        description: err.message || "Не удалось создать заказ",
        variant: "destructive",
      });
    }
  };


  const logout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };


  const getCategoryName = (category: ProductCategory) => {
    const names: Record<ProductCategory, string> = {
      [ProductCategory.HOTDOG]: "Хот-доги",
      [ProductCategory.SIDES]: "Гарниры",
      [ProductCategory.COMBOS]: "Комбо-наборы",
    };
    return names[category] || category;
  };


  if (!user || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">🌭 Хот-дог Стенд</h1>
              <Badge variant="secondary" className="ml-3">Сотрудник</Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Привет, {user.name}!</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" /> Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="menu">Меню и заказы</TabsTrigger>
            <TabsTrigger value="inventory">Запасы ингредиентов</TabsTrigger>
          </TabsList>


          <TabsContent value="menu" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {Object.values(ProductCategory).map((category) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle>{getCategoryName(category)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuItems.length > 0 ? (
                          menuItems
                            .filter((item) => item.category === category)
                            .map((item) => (
                              <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-medium">{item.name}</h3>
                                  <span className="font-bold text-green-600">{item.price}₼</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                                <Button onClick={() => addToCart(item)} size="sm" className="w-full">
                                  <Plus className="h-4 w-4 mr-2" /> Добавить
                                </Button>
                              </div>
                            ))
                        ) : (
                          <p className="text-gray-500 text-center">Нет доступных продуктов</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>


              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-2" /> Текущий заказ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading && cart.length > 0 ? (
                      <p className="text-gray-500 text-center py-4">Обработка заказа...</p>
                    ) : cart.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Корзина пуста</p>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <span className="font-bold text-green-600">
                                {((item.price + (item.addonIds?.reduce((sum, id) => sum + (addons.find(a => a.id === id)?.price || 0), 0) || 0) +
                                  Object.values(item.sauceQuantities || {}).reduce((sum, qty) => {
                                    const addonId = Object.keys(item.sauceQuantities || {}).find(key => item.sauceQuantities![key] === qty);
                                    if (addonId) {
                                      const addon = addons.find(a => a.id === parseInt(addonId));
                                      return sum + (addon?.price || 0) * qty;
                                    }
                                    return sum;
                                  }, 0) +
                                  (item.drinkIds?.reduce((sum, id) => sum + (drinks.find(d => d.id === id)?.price || 0), 0) || 0)) * item.quantity).toFixed(2)}₼
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)} disabled={isLoading}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium">{item.quantity}</span>
                              <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)} disabled={isLoading}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            {item.category === ProductCategory.HOTDOG && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-700">Дополнения:</p>
                                <div className="flex flex-wrap gap-1">
                                  {addons.map((addon) => (
                                    <Badge
                                      key={addon.id}
                                      variant={item.addonIds?.includes(addon.id) ? "default" : "outline"}
                                      className="cursor-pointer text-xs"
                                      onClick={() => toggleAddon(item.id, addon.id)}
                                    >
                                      {addon.name} (+{addon.price}₼)
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="space-y-1 mt-2">
                              <p className="text-xs font-medium text-gray-700">Напитки:</p>
                              <div className="flex flex-wrap gap-1">
                                {drinks.map((drink) => (
                                  <Badge
                                    key={drink.id}
                                    variant={item.drinkIds?.includes(drink.id) ? "default" : "outline"}
                                    className="cursor-pointer text-xs"
                                    onClick={() => toggleDrink(item.id, drink.id)}
                                  >
                                    {drink.name} (+{drink.price}₼)
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Итого:</span>
                          <span className="text-green-600">{total.toFixed(2)}₼</span>
                        </div>
                        <Button onClick={submitOrder} className="w-full" size="lg" disabled={isLoading || cart.length === 0}>
                          {isLoading ? "Обработка..." : "Добавить заказ"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>


          {/* <TabsContent value="drinks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drinks.length > 0 ? (
                drinks.map((drink) => (
                  <div key={drink.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{drink.name}</h3>
                      <span className="font-bold text-green-600">{drink.price}₼</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{drink.description}</p>
                    <Button size="sm" className="w-full" onClick={() => addDrinkToCart(drink)}>
                      <Plus className="h-4 w-4 mr-2" /> Добавить
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">Нет доступных напитков</p>
              )}
            </div>
          </TabsContent> */}


          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" /> Запасы ингредиентов
                </CardTitle>
                <CardDescription>Текущие остатки ингредиентов (только просмотр)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ingredients.length > 0 ? (
                    ingredients.map((ingredient) => (
                      <div key={ingredient.id} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">{ingredient.ingredient}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-blue-600">{ingredient.quantity}</span>
                        </div>
                        <div className="mt-2">
                          <Badge
                            variant={ingredient.quantity > 10 ? "default" : ingredient.quantity > 5 ? "secondary" : "destructive"}
                          >
                            {ingredient.quantity > 10 ? "В наличии" : ingredient.quantity > 5 ? "Мало" : "Критично мало"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">Нет данных об ингредиентах</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );


  // New function to add drinks to cart
  function addDrinkToCart(drink: Drink) {
    const existingItem = cart.find((item) => item.id === drink.id.toString());
    if (existingItem) {
      setCart(cart.map((item) =>
        item.id === drink.id.toString() ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        id: drink.id.toString(),
        name: drink.name,
        description: drink.description,
        price: drink.price,
        category: ProductCategory.HOTDOG, // Assign a default category (can be adjusted)
        quantity: 1,
        addonIds: [],
        sauceQuantities: {},
        drinkIds: [drink.id], // Track the drink ID
      }]);
    }
  }
}

