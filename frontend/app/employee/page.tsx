"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, ShoppingCart, LogOut, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { ProductCategory } from "../../../backend/src/common/enum/product-category.enum";

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
  unitId: string; // Unique identifier for each unit
  quantity: number;
  addonIds?: number[];
  drinkIds?: number[];
  sauceQuantities?: Record<string, number>;
}

interface CartDrink {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unitId: string; // Unique identifier for each drink unit
}

interface Inventory {
  id: string;
  ingredient: string;
  quantity: number;
}

interface Recipe {
  id: string;
  ingredient: { id: string; ingredient: string; quantity: number };
  quantityNeeded: number;
}

interface User {
  id: number;
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
  const [cart, setCart] = useState<(OrderItem | CartDrink)[]>([]);
  const [total, setTotal] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Inventory[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    console.log("USER from localStorage:", JSON.parse(userData));
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

        const recipeRes = await fetch("http://localhost:5000/api/recipe/recipes", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!recipeRes.ok) throw new Error("Не удалось загрузить рецепты");
        const recipeData = await recipeRes.json();
        setRecipes(recipeData.data || recipeData);
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
        const mappedMenuItems = Array.isArray(itemsToMap)
          ? itemsToMap.map((item: any) => ({
            id: item.id.toString(),
            name: item.name || `Product ${item.id}`,
            description: item.description || "No description",
            price: typeof item.price === "string" ? parseFloat(item.price) : item.price || 0,
            category: mapCategory(item.category),
          }))
          : [];
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
      hotdog: ProductCategory.HOTDOG,
      sides: ProductCategory.SIDES,
      combos: ProductCategory.COMBOS,
      HOTDOG: ProductCategory.HOTDOG,
      SIDES: ProductCategory.SIDES,
      COMBOS: ProductCategory.COMBOS,
    };
    return categoryMap[category.toUpperCase()] || categoryMap[category.toLowerCase()] || categoryMap[category.replace("-", "")] || ProductCategory.HOTDOG;
  };

  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => {
      if ("category" in item) {
        const addonTotal = (item.addonIds || []).reduce((addSum, addonId) => {
          const addon = addons.find((a) => a.id === addonId);
          return addSum + (addon?.price || 0) * item.quantity;
        }, 0);
        const sauceTotal = Object.values(item.sauceQuantities || {}).reduce((sum, qty) => {
          const addonId = Object.keys(item.sauceQuantities || {}).find((key) => item.sauceQuantities![key] === qty);
          if (addonId) {
            const addon = addons.find((a) => a.id === parseInt(addonId));
            return sum + (addon?.price || 0) * qty * item.quantity;
          }
          return sum;
        }, 0);
        return sum + (item.price * item.quantity) + addonTotal + sauceTotal;
      } else {
        return sum + (item.price * item.quantity);
      }
    }, 0);
    setTotal(newTotal);
  }, [cart, addons, drinks]);

  const addProductToCart = (item: MenuItem) => {
    if (item.category === ProductCategory.SIDES) {
      const existingItem = cart.find((cartItem) => "category" in cartItem && cartItem.id === item.id);
      if (existingItem) {
        setCart(
          cart.map((cartItem) =>
            "category" in cartItem && cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        );
      } else {
        const unitId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        setCart([...cart, { ...item, unitId, quantity: 1, addonIds: [], drinkIds: undefined }]);
      }
    } else {
      const unitId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      setCart([...cart, { ...item, unitId, quantity: 1, addonIds: [], drinkIds: item.category === ProductCategory.COMBOS ? [] : undefined }]);
    }
  };

  const addDrinkToCart = (drink: Drink) => {
    const unitId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const existingDrink = cart.find((cartItem) => !("category" in cartItem) && cartItem.id === drink.id);
    if (existingDrink) {
      setCart(
        cart.map((cartItem) =>
          !("category" in cartItem) && cartItem.id === drink.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { id: drink.id, name: drink.name, price: drink.price, quantity: 1, unitId }]);
    }
  };

  const updateQuantity = (unitId: string, change: number, isDrink: boolean = false) => {
    setCart((prevCart) => {
      const itemIndex = prevCart.findIndex((item) => (isDrink ? !("category" in item) : "category" in item) && item.unitId === unitId);
      if (itemIndex !== -1) {
        const item = prevCart[itemIndex];
        const newQuantity = Math.max(0, item.quantity + change);
        if (newQuantity === 0) {
          return prevCart.filter((_, i) => i !== itemIndex);
        } else if (!isDrink && "category" in item && change > 0 && item.quantity === 1 && item.category !== ProductCategory.SIDES) {
          // Create a new unit for hotdogs and combos when increasing from 1
          const newUnitId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          return [
            ...prevCart.slice(0, itemIndex),
            { ...item, quantity: 1, unitId: newUnitId },
            { ...item, quantity: 1, unitId, addonIds: item.addonIds || [], drinkIds: item.drinkIds || [] },
          ];
        } else {
          return prevCart.map((item, i) => i === itemIndex ? { ...item, quantity: newQuantity } : item);
        }
      }
      return prevCart;
    });
  };

  const toggleAddon = (unitId: string, addonId: number) => {
    setCart(
      cart.map((item) => {
        if ("category" in item && item.unitId === unitId) {
          const hasAddon = item.addonIds?.includes(addonId);
          const addon = addons.find((a) => a.id === addonId);
          if (addon && isNaN(addon.price)) {
            console.error(`Invalid price for addon ${addonId}: ${addon.price}`);
            return item;
          }
          return {
            ...item,
            addonIds: hasAddon ? item.addonIds?.filter((id) => id !== addonId) : [...(item.addonIds || []), addonId],
          };
        }
        return item;
      })
    );
  };

  const toggleDrink = (unitId: string, drinkId: number) => {
    setCart(
      cart.map((item) => {
        if ("category" in item && item.unitId === unitId && item.category === ProductCategory.COMBOS) {
          const hasDrink = item.drinkIds?.includes(drinkId);
          const maxDrinks = item.name === "Meat Lover’s Double Pack" ? 2 : 1;
          if (hasDrink) {
            return {
              ...item,
              drinkIds: item.drinkIds?.filter((id) => id !== drinkId),
            };
          } else if ((item.drinkIds?.length || 0) < maxDrinks) {
            return {
              ...item,
              drinkIds: [...(item.drinkIds || []), drinkId],
            };
          }
          return item;
        }
        return item;
      })
    );
  };

  const updateSauceQuantity = (unitId: string, addonId: number, qty: number) => {
    setCart(
      cart.map((item) => {
        if ("category" in item && item.unitId === unitId) {
          return {
            ...item,
            sauceQuantities: { ...item.sauceQuantities, [addonId.toString()]: Math.max(0, qty) },
          };
        }
        return item;
      })
    );
  };

  const submitOrder = async () => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Пользователь не найден",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Корзина пуста",
        description: "Добавьте товары в заказ",
        variant: "destructive",
      });
      return;
    }

    for (const item of cart) {
      if ("category" in item && item.category === ProductCategory.COMBOS) {
        const requiredDrinks = item.name === "Meat Lover’s Double Pack" ? 2 : 1;
        if (
          !item.drinkIds ||
          item.drinkIds.length !== requiredDrinks * item.quantity
        ) {
          toast({
            title: "Неполный заказ",
            description: `Для "${item.name}" требуется выбрать ${requiredDrinks} напитка на каждый товар.`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    const orderPayload = {
      userId: user.id,
      items: cart.map((item) => {
        if ("category" in item) {
          return {
            productId: parseInt(item.id),
            units: [
              {
                quantity: item.quantity,
                addonIds: item.addonIds || [],
                drinkIds: item.drinkIds || [],
              },
            ],
          };
        } else {
          return {
            productId: null,
            units: [
              {
                quantity: item.quantity,
                addonIds: [],
                drinkIds: [item.id],
              },
            ],
          };
        }
      }),
    };
    console.log("📦 orderPayload being sent:", orderPayload);

    try {
      const res = await fetch("http://localhost:5000/api/order/make-order", {
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
        description: `Заказ создан на сумму ${(result.price || total).toFixed(
          2
        )}₼`,
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
              <Badge variant="secondary" className="ml-3">
                Сотрудник
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Привет, {user.name}!
              </span>
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
                              <div
                                key={item.id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-medium">{item.name}</h3>
                                  <span className="font-bold text-green-600">
                                    {item.price}₼
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                  {item.description}
                                </p>
                                <Button
                                  onClick={() => addProductToCart(item)}
                                  size="sm"
                                  className="w-full"
                                >
                                  <Plus className="h-4 w-4 mr-2" /> Добавить
                                </Button>
                              </div>
                            ))
                        ) : (
                          <p className="text-gray-500 text-center">
                            Нет доступных продуктов
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Card>
                  <CardHeader>
                    <CardTitle>Напитки</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {drinks.length > 0 ? (
                        drinks.map((drink) => (
                          <div
                            key={drink.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{drink.name}</h3>
                              <span className="font-bold text-green-600">
                                {drink.price}₼
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {drink.description}
                            </p>
                            <Button
                              onClick={() => addDrinkToCart(drink)}
                              size="sm"
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" /> Добавить
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center">
                          Нет доступных напитков
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
                      <p className="text-gray-500 text-center py-4">
                        Обработка заказа...
                      </p>
                    ) : cart.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        Корзина пуста
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div
                            key={item.unitId}
                            className="border-b pb-4 last:border-b-0"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-sm">
                                {(() => {
                                  if ("category" in item && (item.category === ProductCategory.HOTDOG || item.category === ProductCategory.COMBOS)) {
                                    const sameProductItems = cart.filter((i) => "category" in i && i.id === item.id && i.category === item.category);
                                    const index = sameProductItems.findIndex((i) => i.unitId === item.unitId) + 1;
                                    return `${item.name} #${index}`;
                                  }
                                  return item.name; // No numbering for sides and drinks
                                })()}
                              </h4>
                              <span className="font-bold text-green-600">
                                {(() => {
                                  if (!("category" in item)) {
                                    return (Number(item.price) * item.quantity).toFixed(2);
                                  }
                                  const basePrice = Number(item.price) * item.quantity;
                                  const addonTotal = (item.addonIds || []).reduce((sum, id) => sum + (addons.find(a => a.id === id)?.price || 0) * item.quantity, 0);
                                  const sauceTotal = Object.values(item.sauceQuantities || {}).reduce((sum, qty) => {
                                    const addonId = Object.keys(item.sauceQuantities || {}).find(key => item.sauceQuantities![key] === qty);
                                    if (addonId) {
                                      const addon = addons.find(a => a.id === parseInt(addonId));
                                      return sum + (addon?.price || 0) * qty * item.quantity;
                                    }
                                    return sum;
                                  }, 0);
                                  return (basePrice + addonTotal + sauceTotal).toFixed(2);
                                })()}
                                ₼
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.unitId, -1, !("category" in item))}
                                disabled={isLoading}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.unitId, 1, !("category" in item))}
                                disabled={isLoading}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            {"category" in item && item.category === ProductCategory.HOTDOG && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-700">Дополнения:</p>
                                <div className="flex flex-wrap gap-1">
                                  {addons.map((addon) => (
                                    <Badge
                                      key={addon.id}
                                      variant={item.addonIds?.includes(addon.id) ? "default" : "outline"}
                                      className="cursor-pointer text-xs"
                                      onClick={() => toggleAddon(item.unitId, addon.id)}
                                    >
                                      {addon.name} (+{addon.price}₼)
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {"category" in item && item.category === ProductCategory.COMBOS && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-700">
                                  Напитки (требуется {item.name === "Meat Lover’s Double Pack" ? 2 : 1}, включены в стоимость):
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {drinks.map((drink) => (
                                    <Badge
                                      key={drink.id}
                                      variant={item.drinkIds?.includes(drink.id) ? "default" : "outline"}
                                      className="cursor-pointer text-xs"
                                      onClick={() => toggleDrink(item.unitId, drink.id)}
                                    >
                                      {drink.name}
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
                          <span className="text-green-600">
                            {total.toFixed(2)}₼
                          </span>
                        </div>
                        <Button
                          onClick={submitOrder}
                          className="w-full"
                          size="lg"
                          disabled={isLoading || cart.length === 0}
                        >
                          {isLoading ? "Обработка..." : "Добавить заказ"}
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
                  <Package className="h-5 w-5 mr-2" /> Запасы ингредиентов
                </CardTitle>
                <p>
                  Текущие остатки ингредиентов (только просмотр)
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ingredients.length > 0 ? (
                    Object.values(
                      ingredients.reduce((acc, ingredient) => {
                        const recipeMatch = recipes.find(
                          (r) =>
                            r.ingredient.ingredient === ingredient.ingredient
                        );
                        const isGrams = (recipeMatch?.quantityNeeded || 0) > 10;
                        const quantityNeededText = recipeMatch
                          ? `${recipeMatch.quantityNeeded} ${
                              isGrams ? "грам" : "шт"
                            }`
                          : "N/A";
                        const quantityText = `${ingredient.quantity} ${
                          isGrams ? "грам" : "шт"
                        }`;

                        if (!acc[ingredient.ingredient]) {
                          acc[ingredient.ingredient] = {
                            id: ingredient.id,
                            ingredient: ingredient.ingredient,
                            quantity: ingredient.quantity,
                            quantityNeeded: recipeMatch
                              ? recipeMatch.quantityNeeded
                              : 0,
                          };
                        } else {
                          acc[ingredient.ingredient].quantity +=
                            ingredient.quantity;
                          acc[ingredient.ingredient].quantityNeeded +=
                            recipeMatch?.quantityNeeded || 0;
                        }
                        return acc;
                      }, {} as { [key: string]: { id: string; ingredient: string; quantity: number; quantityNeeded: number } })
                    ).map((aggregatedIngredient) => {
                      const isGrams = aggregatedIngredient.quantityNeeded > 10;
                      const quantityNeededText = `${
                        aggregatedIngredient.quantityNeeded
                      } ${isGrams ? "грам" : "шт"}`;
                      const quantityText = `${aggregatedIngredient.quantity} ${
                        isGrams ? "грам" : "шт"
                      }`;

                      return (
                        <div
                          key={aggregatedIngredient.id}
                          className="border rounded-lg p-4"
                        >
                          <h3 className="font-medium mb-3">
                            {aggregatedIngredient.ingredient}
                          </h3>
                          <div className="mb-3">
                            <span className="text-lg font-medium">
                              {quantityText}
                            </span>
                          </div>
                          <Badge
                            variant={
                              aggregatedIngredient.quantity > 10
                                ? "default"
                                : aggregatedIngredient.quantity > 5
                                ? "secondary"
                                : "destructive"
                            }
                            className="w-full justify-center"
                          >
                            {aggregatedIngredient.quantity > 10
                              ? "В наличии"
                              : aggregatedIngredient.quantity > 5
                              ? "Мало"
                              : "Критично мало"}
                          </Badge>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-center">
                      Нет данных об ингредиентах
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}