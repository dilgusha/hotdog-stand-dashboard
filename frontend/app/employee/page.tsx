// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Plus, Minus, ShoppingCart, LogOut, Package } from "lucide-react"
// import { useRouter } from "next/navigation"
// import { toast } from "@/hooks/use-toast"
// import {ProductCategory} from "../../../backend/src/common/enum/product-category.enum"

// interface MenuItem {
//   id: string
//   name: string
//   description: string
//   price: number
//   category: string
// }

// interface OrderItem extends MenuItem {
//   quantity: number
//   additions: string[]
// }

// export default function EmployeePage() {
//   const [user, setUser] = useState<any>(null)
//   const [cart, setCart] = useState<OrderItem[]>([])
//   const [total, setTotal] = useState(0)
//   const router = useRouter()

//   const [menuItems, setMenuItems] = useState<MenuItem[]>([])

//   const additions = [
//     { name: "Дополнительный сыр", price: 30 },
//     { name: "Халапеньо", price: 20 },
//     { name: "Хрустящий лук", price: 25 },
//     { name: "Соленые огурцы", price: 15 },
//     { name: "Дополнительный соус", price: 20 },
//     { name: "Двойной хот-дог", price: 100 },
//   ]

//   // const ingredients = [
//   //   { name: "Булочки для хот-догов", quantity: 45, unit: "шт" },
//   //   { name: "Говяжьи сосиски", quantity: 38, unit: "шт" },
//   //   { name: "Сыр чеддер", quantity: 2.5, unit: "кг" },
//   //   { name: "Кетчуп", quantity: 1.2, unit: "л" },
//   //   { name: "Горчица", quantity: 0.8, unit: "л" },
//   //   { name: "Халапеньо", quantity: 0.5, unit: "кг" },
//   //   { name: "Картофель", quantity: 8, unit: "кг" },
//   //   { name: "Куриное филе", quantity: 3, unit: "кг" },
//   //   { name: "Моцарелла", quantity: 1.5, unit: "кг" },
//   // ]
//   interface Inventory {
//     id: string;
//     ingredient: string;
//     quantity: number;
//   }

//   const [ingredients, setIngredients] = useState<Inventory[]>([]);
//   const [isLoading, setIsLoading] = useState(true)
//   useEffect(() => {
//     const verifyUser = async () => {
//       const userData = localStorage.getItem("user");
//       if (!userData) {
//         toast({
//           title: "Требуется вход",
//           description: "Пожалуйста, войдите в систему.",
//           variant: "destructive",
//         });
//         router.push("/");
//         return;
//       }

//       const parsedUser = JSON.parse(userData);
//       const token = parsedUser.access_token;

//       try {
//         const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
//         const savedMenu = JSON.parse(localStorage.getItem("menuItems") || "[]");

//         const inventoryRes = await fetch("http://localhost:5000/api/inventory", {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         if (!inventoryRes.ok) {
//           throw new Error("Не удалось загрузить запасы");
//         }

//         const inventoryData = await inventoryRes.json();
//         setIngredients(inventoryData.data); 
//       } catch (err: any) { 
//         toast({
//           title: "Ошибка авторизации",
//           description:
//             err instanceof Error ? err.message : "Недействительный токен или ошибка сервера.",
//           variant: "destructive",
//         });
//         localStorage.removeItem("user");
//         router.push("/");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     verifyUser();
//   }, [router]);
//   useEffect(() => {
//     const userData = localStorage.getItem("user")
//     if (!userData) {
//       router.push("/")
//       return
//     }
//     setUser(JSON.parse(userData))
//   }, [router])

//   useEffect(() => {
//     const newTotal = cart.reduce((sum, item) => {
//       const additionsTotal = item.additions.reduce((addSum, addName) => {
//         const addition = additions.find((a) => a.name === addName)
//         return addSum + (addition?.price || 0)
//       }, 0)
//       return sum + (item.price + additionsTotal) * item.quantity
//     }, 0)
//     setTotal(newTotal)
//   }, [cart])

//   const addToCart = (item: MenuItem) => {
//     const existingItem = cart.find((cartItem) => cartItem.id === item.id)
//     if (existingItem) {
//       setCart(
//         cart.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem)),
//       )
//     } else {
//       setCart([...cart, { ...item, quantity: 1, additions: [] }])
//     }
//   }

//   const updateQuantity = (id: string, change: number) => {
//     setCart(
//       cart
//         .map((item) => {
//           if (item.id === id) {
//             const newQuantity = Math.max(0, item.quantity + change)
//             return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
//           }
//           return item
//         })
//         .filter(Boolean) as OrderItem[],
//     )
//   }

//   const toggleAddition = (itemId: string, additionName: string) => {
//     setCart(
//       cart.map((item) => {
//         if (item.id === itemId) {
//           const hasAddition = item.additions.includes(additionName)
//           return {
//             ...item,
//             additions: hasAddition
//               ? item.additions.filter((a) => a !== additionName)
//               : [...item.additions, additionName],
//           }
//         }
//         return item
//       }),
//     )
//   }

//   const submitOrder = () => {
//     if (cart.length === 0) {
//       toast({
//         title: "Корзина пуста",
//         description: "Добавьте товары в заказ",
//         variant: "destructive",
//       })
//       return
//     }

//     const orders = JSON.parse(localStorage.getItem("orders") || "[]")
//     const newOrder = {
//       id: Date.now().toString(),
//       items: cart,
//       total,
//       timestamp: new Date().toISOString(),
//       employee: user.name
//     }
//     orders.push(newOrder)
//     localStorage.setItem("orders", JSON.stringify(orders))

//     toast({
//       title: "Заказ добавлен",
//       description: `Заказ на сумму ${total}₼ успешно создан`,
//     })
//     setCart([])
//   }

//   const logout = () => {
//     localStorage.removeItem("user")
//     router.push("/")
//   }

//  menuItems
//   .filter((item) => item.category === ProductCategory.HOTDOG)
//   .map((item) => (...))

//   if (!user) return null

//   useEffect(() => {
//   const fetchProducts = async () => {
//     const userData = localStorage.getItem("user");
//     if (!userData) {
//       router.push("/");
//       return;
//     }

//     const parsedUser = JSON.parse(userData);
//     const token = parsedUser.access_token;

//     try {
//       const response = await fetch("http://localhost:5000/api/products/get-all-products", {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Не удалось загрузить продукты");
//       }

//       const productData = await response.json();
//       // Assuming the response is { data: MenuItem[] }
//       setMenuItems(productData.data); // Update state with fetched products
//     } catch (err: any) {
//       toast({
//         title: "Ошибка",
//         description: err.message || "Не удалось загрузить продукты",
//         variant: "destructive",
//       });
//     }
//   };

//   fetchProducts();
// }, [router]);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center">
//               <h1 className="text-xl font-semibold">🌭 Хот-дог Стенд</h1>
//               <Badge variant="secondary" className="ml-3">
//                 Сотрудник
//               </Badge>
//             </div>
//             <div className="flex items-center gap-4">
//               <span className="text-sm text-gray-600">Привет, {user.name}!</span>
//               <Button variant="outline" size="sm" onClick={logout}>
//                 <LogOut className="h-4 w-4 mr-2" />
//                 Выйти
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <Tabs defaultValue="menu" className="w-full">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="menu">Меню и заказы</TabsTrigger>
//             <TabsTrigger value="inventory">Запасы ингредиентов</TabsTrigger>
//           </TabsList>

//           <TabsContent value="menu" className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="lg:col-span-2 space-y-6">
//                 {ProductCategory.map((category) => (
//                   <Card key={category}>
//                     <CardHeader>
//                       <CardTitle>{getCategoryName(category)}</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {menuItems
//                           .filter((item) => item.category === category)
//                           .map((item) => (
//                             <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
//                               <div className="flex justify-between items-start mb-2">
//                                 <h3 className="font-medium">{item.name}</h3>
//                                 <span className="font-bold text-green-600">{item.price}₼</span>
//                               </div>
//                               <p className="text-sm text-gray-600 mb-3">{item.description}</p>
//                               <Button onClick={() => addToCart(item)} size="sm" className="w-full">
//                                 <Plus className="h-4 w-4 mr-2" />
//                                 Добавить
//                               </Button>
//                             </div>
//                           ))}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>

//               <div className="space-y-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center">
//                       <ShoppingCart className="h-5 w-5 mr-2" />
//                       Текущий заказ
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     {cart.length === 0 ? (
//                       <p className="text-gray-500 text-center py-4">Корзина пуста</p>
//                     ) : (
//                       <div className="space-y-4">
//                         {cart.map((item) => (
//                           <div key={item.id} className="border-b pb-4 last:border-b-0">
//                             <div className="flex justify-between items-start mb-2">
//                               <h4 className="font-medium text-sm">{item.name}</h4>
//                               <span className="font-bold text-green-600">
//                                 {(item.price +
//                                   item.additions.reduce((sum, addName) => {
//                                     const addition = additions.find((a) => a.name === addName)
//                                     return sum + (addition?.price || 0)
//                                   }, 0)) *
//                                   item.quantity}
//                                 ₼
//                               </span>
//                             </div>

//                             <div className="flex items-center gap-2 mb-2">
//                               <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)}>
//                                 <Minus className="h-3 w-3" />
//                               </Button>
//                               <span className="font-medium">{item.quantity}</span>
//                               <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
//                                 <Plus className="h-3 w-3" />
//                               </Button>
//                             </div>

//                             {item.category === "hotdogs" && (
//                               <div className="space-y-1">
//                                 <p className="text-xs font-medium text-gray-700">Дополнения:</p>
//                                 <div className="flex flex-wrap gap-1">
//                                   {additions.map((addition) => (
//                                     <Badge
//                                       key={addition.name}
//                                       variant={item.additions.includes(addition.name) ? "default" : "outline"}
//                                       className="cursor-pointer text-xs"
//                                       onClick={() => toggleAddition(item.id, addition.name)}
//                                     >
//                                       {addition.name} (+{addition.price}₼)
//                                     </Badge>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         ))}

//                         <Separator />
//                         <div className="flex justify-between items-center font-bold text-lg">
//                           <span>Итого:</span>
//                           <span className="text-green-600">{total}₼</span>
//                         </div>

//                         <Button onClick={submitOrder} className="w-full" size="lg">
//                           Добавить заказ
//                         </Button>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>
//           </TabsContent>

//           <TabsContent value="inventory">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center">
//                   <Package className="h-5 w-5 mr-2" />
//                   Запасы ингредиентов
//                 </CardTitle>
//                 <CardDescription>Текущие остатки ингредиентов (только просмотр)</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {ingredients.map((ingredient, index) => (
//                     <div key={ingredient.id} className="border rounded-lg p-4">
//                       <h3 className="font-medium mb-2">{ingredient.ingredient}</h3>
//                       <div className="flex justify-between items-center">
//                         <span className="text-2xl font-bold text-blue-600">{ingredient.quantity}</span>
//                         {/* <span className="text-gray-500">{ingredient.unit}</span> */}
//                       </div>
//                       <div className="mt-2">
//                         <Badge
//                           variant={
//                             ingredient.quantity > 10 ? "default" : ingredient.quantity > 5 ? "secondary" : "destructive"
//                           }
//                         >
//                           {ingredient.quantity > 10 ? "В наличии" : ingredient.quantity > 5 ? "Мало" : "Критично мало"}
//                         </Badge>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   )
// }

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
import { ProductCategory } from "../../../backend/src/common/enum/product-category.enum"

interface Addon {
  id: number;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  addons?: Addon[];
}

interface OrderItem extends MenuItem {
  quantity: number;
  additions: string[];
  addonIds?: number[];
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

export default function EmployeePage() {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const additions = [
    { name: "Дополнительный сыр", price: 30 },
    { name: "Халапеньо", price: 20 },
    { name: "Хрустящий лук", price: 25 },
    { name: "Соленые огурцы", price: 15 },
    { name: "Дополнительный соус", price: 20 },
    { name: "Двойной хот-дог", price: 100 },
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
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
        setIngredients(inventoryData.data || []);
      } catch (err: any) {
        toast({
          title: "Ошибка авторизации",
          description: err instanceof Error ? err.message : "Недействительный токен или ошибка сервера.",
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
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!productResponse.ok) {
          const errorText = await productResponse.text();
          throw new Error(`Не удалось загрузить продукты: ${productResponse.statusText} - ${errorText}`);
        }

        const productData = await productResponse.json();
        console.log("API Product Response:", productData);

        const mappedMenuItems = productData.map((item: any) => ({
          id: item.id.toString(),
          name: item.name || `Product ${item.id}`,
          description: item.description || "No description",
          price: typeof item.price === "string" ? parseFloat(item.price) : item.price || 0,
          category: mapCategory(item.category),
          addons: [], // Boş bırak, çünkü eklentiler sepette seçilecek
        }));
        console.log("Mapped Menu Items:", mappedMenuItems);
        setMenuItems(mappedMenuItems);
      } catch (err: any) {
        console.error("Fetch Error Details:", err);
        toast({
          title: "Ошибка загрузки данных",
          description: err.message || "Не удалось загрузить продукты",
          variant: "destructive",
        });
        setMenuItems([]);
      }
    };

    fetchProducts();
  }, [router]);

  // Kategori eşleme fonksiyonu
  const mapCategory = (category: string): ProductCategory => {
    const categoryMap: Record<string, ProductCategory> = {
      "hotdog": ProductCategory.HOTDOG,
      "sides": ProductCategory.SIDES,
      "drink": ProductCategory.DRINK,
      "addon": ProductCategory.ADDON,
      "combos": ProductCategory.COMBOS,
    };
    return categoryMap[category.toLowerCase()] || ProductCategory.HOTDOG;
  };

useEffect(() => {
  const newTotal = cart.reduce((sum, item) => {
    const additionsTotal = item.additions.reduce((addSum, addName) => {
      const addition = additions.find((a) => a.name === addName);
      return addSum + (addition?.price || 0);
    }, 0);
    return sum + (item.price + additionsTotal) * item.quantity;
  }, 0);
  setTotal(newTotal);
}, [cart]);

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1, additions: [], addonIds: [] }]); // Başlangıçta boş
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + change);
            return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const toggleAddition = (itemId: string, additionName: string) => {
    setCart(
      cart.map((item) => {
        if (item.id === itemId) {
          const hasAddition = item.additions.includes(additionName);
          return {
            ...item,
            additions: hasAddition
              ? item.additions.filter((a) => a !== additionName)
              : [...item.additions, additionName],

          };
        }
        return item;
      })
    );
  };

  const submitOrder = () => {
    if (cart.length === 0) {
      toast({
        title: "Корзина пуста",
        description: "Добавьте товары в заказ",
        variant: "destructive",
      });
      return;
    }

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const newOrder = {
      id: Date.now().toString(),
      items: cart.map((item) => ({
        productId: parseInt(item.id),
        quantity: item.quantity,
        addonIds: item.addonIds || [], // Kullanıcı seçimi
      })),
      total,
      timestamp: new Date().toISOString(),
      employee: user?.name || "Unknown",
    };
    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    toast({
      title: "Заказ добавлен",
      description: `Заказ на сумму ${total}₼ успешно создан`,
    });
    setCart([]);
  };

  const logout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const getCategoryName = (category: ProductCategory) => {
    const names: Record<ProductCategory, string> = {
      [ProductCategory.HOTDOG]: "Хот-доги",
      [ProductCategory.SIDES]: "Гарниры",
      [ProductCategory.DRINK]: "Напитки",
      [ProductCategory.ADDON]: "Дополнения",
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
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
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
                            .map((item) => {
                              console.log(`Rendering item: ${item.name}, category: ${item.category}, current category: ${category}`); // Render edilen öğeleri logla
                              return (
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
                              );
                            })
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
                                  (item.addons?.reduce((sum, addon) => sum + (addon.price || 0), 0) || 0) *
                                  item.quantity)}
                                ₼
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-medium">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {cart.length > 0 && item.category === ProductCategory.HOTDOG && (
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
                  {ingredients.length > 0 ? (
                    ingredients.map((ingredient) => (
                      <div key={ingredient.id} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">{ingredient.ingredient}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-blue-600">{ingredient.quantity}</span>
                        </div>
                        <div className="mt-2">
                          <Badge
                            variant={
                              ingredient.quantity > 10
                                ? "default"
                                : ingredient.quantity > 5
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {ingredient.quantity > 10
                              ? "В наличии"
                              : ingredient.quantity > 5
                                ? "Мало"
                                : "Критично мало"}
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
}