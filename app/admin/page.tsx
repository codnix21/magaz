"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Package, Download, Upload, BarChart3, Truck, FileText, RotateCcw } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
}

interface Order {
  id: string
  total: number
  status: string
  shippingAddress: string
  createdAt: string
  user: {
    email: string
    name: string | null
  }
  orderItems: Array<{
    product: {
      name: string
    }
    quantity: number
    price: number
  }>
}

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "",
  })

  useEffect(() => {
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    fetchData()
  }, [session])

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products"
      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchData()
        resetForm()
        alert(editingProduct ? "Товар обновлён" : "Товар создан")
      } else {
        alert("Ошибка при сохранении товара")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Ошибка при сохранении товара")
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      stock: product.stock.toString(),
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот товар?")) {
      return
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchData()
        alert("Товар удалён")
      } else {
        alert("Ошибка при удалении товара")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Ошибка при удалении товара")
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchData()
        alert("Статус заказа обновлён")
      }
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      stock: "",
    })
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="container py-6 sm:py-8 px-4 sm:px-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Админ-панель
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Управление товарами и заказами</p>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-white border-2 border-blue-100 shadow-lg p-1 grid grid-cols-2 sm:grid-cols-5 gap-1">
          <TabsTrigger value="products" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
            <Package className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Товары</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Заказы</span>
          </TabsTrigger>
          <TabsTrigger value="import-export" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Импорт/Экспорт</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Отчёты</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
            <Truck className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Доставка</span>
          </TabsTrigger>
          <TabsTrigger value="returns" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
            <RotateCcw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Возвраты</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card className="shadow-2xl border-2 border-blue-200/50 bg-white/90 backdrop-blur-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200/50">
              <CardTitle className="text-2xl flex items-center gap-2 font-bold">
                <Plus className="h-6 w-6 text-blue-600" />
                {editingProduct ? "Редактировать товар" : "Добавить новый товар"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Название</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Категория</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Цена</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Количество</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">URL изображения</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={4}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 font-semibold"
                  >
                    {editingProduct ? "Обновить" : "Создать товар"}
                  </Button>
                  {editingProduct && (
                    <Button type="button" variant="outline" onClick={resetForm} className="hover:bg-red-50 hover:text-red-600 hover:border-red-300">
                      Отмена
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Все товары ({products.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-2xl transition-all duration-300 border-2 border-blue-100/50 hover:border-blue-400 overflow-hidden bg-white/80 backdrop-blur-sm hover:-translate-y-1">
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      {product.price.toLocaleString("ru-RU")} ₽
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      В наличии: <span className={product.stock > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{product.stock}</span>
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Все заказы ({orders.length})</h2>
            <div className="space-y-4">
              {orders.map((order) => {
                const statusColors: Record<string, string> = {
                  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
                  PROCESSING: "bg-blue-100 text-blue-800 border-blue-300",
                  SHIPPED: "bg-purple-100 text-purple-800 border-purple-300",
                  DELIVERED: "bg-green-100 text-green-800 border-green-300",
                  CANCELLED: "bg-red-100 text-red-800 border-red-300",
                }
                const statusColor = statusColors[order.status] || "bg-gray-100 text-gray-800 border-gray-300"
                
                return (
                  <Card key={order.id} className="hover:shadow-2xl transition-all duration-300 border-2 border-blue-100/50 hover:border-blue-400 bg-white/80 backdrop-blur-sm hover:-translate-y-1">
                    <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200/50">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <CardTitle className="text-xl mb-2">Заказ #{order.id.slice(-8)}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Клиент:</span> {order.user.name || order.user.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-600 mb-2">
                            {order.total.toLocaleString("ru-RU")} ₽
                          </p>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusColor}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-3 mb-4">
                        <p className="font-semibold text-lg">Товары:</p>
                        {order.orderItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm">
                              {item.product.name} × {item.quantity}
                            </span>
                            <span className="font-semibold text-blue-600">
                              {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2 mb-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm">
                          <span className="font-semibold">Адрес доставки:</span>{" "}
                          <span className="text-muted-foreground">{order.shippingAddress}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 pt-4 border-t">
                        <Label className="font-semibold">Изменить статус:</Label>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className="flex-1 h-10 rounded-md border-2 border-blue-200 bg-background px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                          <option value="PENDING">Ожидает обработки</option>
                          <option value="PROCESSING">В обработке</option>
                          <option value="SHIPPED">Отправлен</option>
                          <option value="DELIVERED">Доставлен</option>
                          <option value="CANCELLED">Отменён</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-2xl border-2 border-blue-200/50 bg-white/90 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200/50">
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-600" />
                  Экспорт товаров
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  Скачайте все товары в формате CSV для редактирования или резервного копирования.
                </p>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/admin/products/export")
                      if (response.ok) {
                        const blob = await response.blob()
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = `products_${new Date().toISOString().split('T')[0]}.csv`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        window.URL.revokeObjectURL(url)
                        alert("Экспорт завершён")
                      }
                    } catch (error) {
                      console.error("Error exporting:", error)
                      alert("Ошибка при экспорте")
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Экспортировать в CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-2 border-blue-200/50 bg-white/90 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200/50">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Импорт товаров
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  Загрузите CSV файл с товарами для массового импорта.
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    try {
                      const formData = new FormData()
                      formData.append("file", file)

                      const response = await fetch("/api/admin/products/import", {
                        method: "POST",
                        body: formData,
                      })

                      const data = await response.json()
                      if (response.ok) {
                        alert(data.message)
                        await fetchData()
                      } else {
                        alert(data.error || "Ошибка при импорте")
                      }
                    } catch (error) {
                      console.error("Error importing:", error)
                      alert("Ошибка при импорте")
                    }
                  }}
                  className="w-full mb-4"
                />
                <p className="text-xs text-muted-foreground">
                  Формат CSV: Название, Описание, Цена, Категория, Остаток, Скидка %, Оригинальная цена, Изображение
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-2xl border-2 border-blue-200/50 bg-white/90 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200/50">
                <CardTitle>Продажи</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/admin/reports/sales")
                      if (response.ok) {
                        const data = await response.json()
                        alert(`Всего заказов: ${data.summary.totalOrders}\nВыручка: ${data.summary.totalRevenue?.toLocaleString('ru-RU')} ₽`)
                      }
                    } catch (error) {
                      console.error("Error fetching sales report:", error)
                    }
                  }}
                  className="w-full"
                  variant="outline"
                >
                  Просмотр отчёта
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-2 border-blue-200/50 bg-white/90 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200/50">
                <CardTitle>Товары</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/admin/reports/products")
                      if (response.ok) {
                        const data = await response.json()
                        alert(`Топ товаров: ${data.topProducts.length}\nТоваров с низким остатком: ${data.lowStock.length}`)
                      }
                    } catch (error) {
                      console.error("Error fetching products report:", error)
                    }
                  }}
                  className="w-full"
                  variant="outline"
                >
                  Просмотр отчёта
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-2 border-blue-200/50 bg-white/90 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200/50">
                <CardTitle>Клиенты</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/admin/reports/customers")
                      if (response.ok) {
                        const data = await response.json()
                        alert(`Всего клиентов: ${data.stats.totalCustomers}\nНовых за 30 дней: ${data.stats.newCustomers30d}`)
                      }
                    } catch (error) {
                      console.error("Error fetching customers report:", error)
                    }
                  }}
                  className="w-full"
                  variant="outline"
                >
                  Просмотр отчёта
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-6">
          <Card className="shadow-2xl border-2 border-blue-200/50 bg-white/90 backdrop-blur-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200/50">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                Способы доставки
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Управление способами доставки и тарифами.
              </p>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/shipping-methods")
                    if (response.ok) {
                      const methods = await response.json()
                      alert(`Доступно способов доставки: ${methods.length}`)
                    }
                  } catch (error) {
                    console.error("Error fetching shipping methods:", error)
                  }
                }}
                className="w-full"
                variant="outline"
              >
                Просмотр способов доставки
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns" className="space-y-6">
          <ReturnsTab />
        </TabsContent>
      </Tabs>
    </div>
    </div>
  )
}

function ReturnsTab() {
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReturns()
  }, [])

  const fetchReturns = async () => {
    try {
      const response = await fetch("/api/returns")
      if (response.ok) {
        const data = await response.json()
        setReturns(data)
      }
    } catch (error) {
      console.error("Error fetching returns:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateReturnStatus = async (returnId: string, status: string) => {
    try {
      const response = await fetch(`/api/returns/${returnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchReturns()
        alert("Статус возврата обновлён")
      }
    } catch (error) {
      console.error("Error updating return:", error)
      alert("Ошибка при обновлении статуса")
    }
  }

  if (loading) {
    return <div className="text-center">Загрузка...</div>
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
        Возвраты ({returns.length})
      </h2>
      {returns.length === 0 ? (
        <Card className="p-12 text-center">
          <RotateCcw className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xl font-semibold mb-2">Нет возвратов</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {returns.map((return_) => {
            const statusColors: Record<string, string> = {
              PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
              APPROVED: "bg-blue-100 text-blue-800 border-blue-300",
              PROCESSING: "bg-purple-100 text-purple-800 border-purple-300",
              COMPLETED: "bg-green-100 text-green-800 border-green-300",
              REJECTED: "bg-red-100 text-red-800 border-red-300",
            }
            const statusColor = statusColors[return_.status] || "bg-gray-100 text-gray-800 border-gray-300"

            return (
              <Card key={return_.id} className="shadow-xl border-2 border-blue-100/50">
                <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Возврат #{return_.id.slice(-8)}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Заказ #{return_.order?.id?.slice(-8) || 'N/A'} | Клиент: {return_.user?.name || return_.user?.email || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600 mb-2">
                        {return_.refundAmount?.toLocaleString("ru-RU") || 0} ₽
                      </p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusColor}`}>
                        {return_.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {return_.reason && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-1">Причина:</p>
                      <p className="text-muted-foreground">{return_.reason}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Label className="font-semibold">Изменить статус:</Label>
                    <select
                      value={return_.status}
                      onChange={(e) => updateReturnStatus(return_.id, e.target.value)}
                      className="flex-1 h-10 rounded-md border-2 border-blue-200 bg-background px-3 py-2 text-sm"
                    >
                      <option value="PENDING">Ожидает рассмотрения</option>
                      <option value="APPROVED">Одобрен</option>
                      <option value="PROCESSING">Обрабатывается</option>
                      <option value="COMPLETED">Завершён</option>
                      <option value="REJECTED">Отклонён</option>
                    </select>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Статус возврата средств: <span className="font-semibold">{return_.refundStatus}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Создан: {new Date(return_.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}


