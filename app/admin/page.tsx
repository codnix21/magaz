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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [reportType, setReportType] = useState<string>("")
  const [shippingMethods, setShippingMethods] = useState<any[]>([])
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
    fetchShippingMethods()
  }, [session])

  const fetchShippingMethods = async () => {
    try {
      const response = await fetch("/api/shipping-methods")
      if (response.ok) {
        const methods = await response.json()
        setShippingMethods(methods)
      }
    } catch (error) {
      console.error("Error fetching shipping methods:", error)
    }
  }

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
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchData()
        resetForm()
        alert("Товар успешно создан!")
      } else {
        alert("Ошибка при создании товара")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      alert("Ошибка при создании товара")
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
    setIsEditDialogOpen(true)
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
    setIsEditDialogOpen(false)
    setIsAddDialogOpen(false)
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      stock: "",
    })
  }

  const handleAddClick = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchData()
        resetForm()
        alert("Товар обновлён")
      } else {
        alert("Ошибка при обновлении товара")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Ошибка при обновлении товара")
    }
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
    <div className="min-h-screen bg-gradient-modern bg-mesh">
      <div className="container py-8 sm:py-12 px-4 sm:px-6">
        <div className="mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
            Админ-панель
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">Управление товарами и заказами</p>
        </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="glass-effect border-2 border-blue-200/60 shadow-xl p-1.5 grid grid-cols-2 sm:grid-cols-5 gap-2 rounded-2xl">
          <TabsTrigger value="products" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold">
            <Package className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Товары</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold">
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Заказы</span>
          </TabsTrigger>
          <TabsTrigger value="import-export" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold">
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Импорт/Экспорт</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Отчёты</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold">
            <Truck className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Доставка</span>
          </TabsTrigger>
          <TabsTrigger value="returns" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold">
            <RotateCcw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Возвраты</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-black gradient-text animate-gradient">
              Все товары ({products.length})
            </h2>
            <Button
              onClick={handleAddClick}
              className="btn-gradient rounded-2xl font-bold px-8 py-7 h-auto text-base shadow-2xl glow-shadow"
            >
              <Plus className="h-6 w-6 mr-2" />
              Добавить товар
            </Button>
          </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group card-modern hover:border-blue-300/80 overflow-hidden animate-fade-in">
                  <div className="relative w-full h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <Image
                      src={product.image || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-lg font-bold line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {product.price.toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">В наличии:</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.stock > 0 
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300" 
                          : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-300"
                      }`}>
                        {product.stock > 0 ? `${product.stock} шт.` : "Нет в наличии"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="flex-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200 font-medium"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:border-red-400 hover:text-red-700 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          {/* Модальное окно для добавления товара */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-200/50 shadow-2xl">
              <DialogHeader className="pb-4 border-b border-blue-100">
                <DialogTitle className="text-3xl flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  Добавить новый товар
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 mt-2">
                  Заполните все поля для создания нового товара в каталоге
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="add-name" className="text-sm font-semibold text-gray-700">
                      Название товара
                    </Label>
                    <Input
                      id="add-name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-lg"
                      placeholder="Введите название товара"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-category" className="text-sm font-semibold text-gray-700">
                      Категория
                    </Label>
                    <Input
                      id="add-category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                      className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-lg"
                      placeholder="Например: Электроника"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-price" className="text-sm font-semibold text-gray-700">
                      Цена (₽)
                    </Label>
                    <Input
                      id="add-price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-stock" className="text-sm font-semibold text-gray-700">
                      Количество на складе
                    </Label>
                    <Input
                      id="add-stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      required
                      className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-lg"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-image" className="text-sm font-semibold text-gray-700">
                    URL изображения
                  </Label>
                  <Input
                    id="add-image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    required
                    className="h-11 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-lg"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-description" className="text-sm font-semibold text-gray-700">
                    Описание товара
                  </Label>
                  <Textarea
                    id="add-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={5}
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-lg resize-none"
                    placeholder="Подробное описание товара..."
                  />
                </div>
                <DialogFooter className="pt-4 border-t border-blue-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="px-6 h-11 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="px-8 h-11 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Создать товар
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Модальное окно для редактирования товара */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-indigo-50/30 border-2 border-indigo-200/50 shadow-2xl">
              <DialogHeader className="pb-4 border-b border-indigo-100">
                <DialogTitle className="text-3xl flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-lg">
                    <Edit className="h-6 w-6 text-white" />
                  </div>
                  Редактировать товар
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 mt-2">
                  Измените информацию о товаре и нажмите "Сохранить изменения"
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-5 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-700">
                      Название товара
                    </Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="h-11 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category" className="text-sm font-semibold text-gray-700">
                      Категория
                    </Label>
                    <Input
                      id="edit-category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                      className="h-11 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-price" className="text-sm font-semibold text-gray-700">
                      Цена (₽)
                    </Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      className="h-11 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-stock" className="text-sm font-semibold text-gray-700">
                      Количество на складе
                    </Label>
                    <Input
                      id="edit-stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      required
                      className="h-11 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-image" className="text-sm font-semibold text-gray-700">
                    URL изображения
                  </Label>
                  <Input
                    id="edit-image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    required
                    className="h-11 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-700">
                    Описание товара
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={5}
                    className="border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 rounded-lg resize-none"
                  />
                </div>
                <DialogFooter className="pt-4 border-t border-indigo-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="px-6 h-11 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    className="px-8 h-11 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 font-semibold"
                  >
                    Сохранить изменения
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Все заказы ({orders.length})</h2>
            <div className="space-y-4">
              {orders.map((order) => {
                const statusLabels: Record<string, string> = {
                  PENDING: "Ожидает обработки",
                  PROCESSING: "В обработке",
                  SHIPPED: "Отправлен",
                  DELIVERED: "Доставлен",
                  CANCELLED: "Отменён",
                }
                const statusColors: Record<string, string> = {
                  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
                  PROCESSING: "bg-blue-100 text-blue-800 border-blue-300",
                  SHIPPED: "bg-purple-100 text-purple-800 border-purple-300",
                  DELIVERED: "bg-green-100 text-green-800 border-green-300",
                  CANCELLED: "bg-red-100 text-red-800 border-red-300",
                }
                const statusColor = statusColors[order.status] || "bg-gray-100 text-gray-800 border-gray-300"
                
                return (
                  <Card key={order.id} className="card-modern hover:border-blue-300/80 animate-fade-in">
                    <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <CardTitle className="text-xl mb-2 font-black text-white">Заказ #{order.id.slice(-8)}</CardTitle>
                          <p className="text-sm text-white/90">
                            <span className="font-semibold">Клиент:</span> {order.user.name || order.user.email}
                          </p>
                          <p className="text-sm text-white/90">
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
                          <p className="text-3xl font-black text-white mb-2">
                            {order.total.toLocaleString("ru-RU")} ₽
                          </p>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusColor}`}>
                            {statusLabels[order.status] || order.status}
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
            <Card className="card-glass border-blue-200/60 animate-fade-in">
              <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
                <CardTitle className="text-white font-black flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                    <Download className="h-5 w-5 text-white" />
                  </div>
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
                  className="w-full btn-gradient rounded-xl font-semibold"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Экспортировать в CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="card-glass border-blue-200/60 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
                <CardTitle className="text-white font-black flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
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
            <Card className="card-glass border-blue-200/60 animate-fade-in">
              <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
                <CardTitle className="text-white font-black flex items-center gap-3">
                  <BarChart3 className="h-6 w-6" />
                  Продажи
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4 text-sm">
                  Статистика продаж и выручки
                </p>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/admin/reports/sales")
                      if (response.ok) {
                        const data = await response.json()
                        setReportData(data)
                        setReportType("sales")
                        setReportDialogOpen(true)
                      }
                    } catch (error) {
                      console.error("Error fetching sales report:", error)
                      alert("Ошибка при загрузке отчёта")
                    }
                  }}
                  className="w-full btn-gradient rounded-xl font-semibold"
                >
                  Просмотр отчёта
                </Button>
              </CardContent>
            </Card>

            <Card className="card-glass border-blue-200/60 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
                <CardTitle className="text-white font-black flex items-center gap-3">
                  <Package className="h-6 w-6" />
                  Товары
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4 text-sm">
                  Аналитика по товарам
                </p>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/admin/reports/products")
                      if (response.ok) {
                        const data = await response.json()
                        setReportData(data)
                        setReportType("products")
                        setReportDialogOpen(true)
                      }
                    } catch (error) {
                      console.error("Error fetching products report:", error)
                      alert("Ошибка при загрузке отчёта")
                    }
                  }}
                  className="w-full btn-gradient rounded-xl font-semibold"
                >
                  Просмотр отчёта
                </Button>
              </CardContent>
            </Card>

            <Card className="card-glass border-blue-200/60 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
                <CardTitle className="text-white font-black flex items-center gap-3">
                  <FileText className="h-6 w-6" />
                  Клиенты
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4 text-sm">
                  Статистика клиентов
                </p>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/admin/reports/customers")
                      if (response.ok) {
                        const data = await response.json()
                        setReportData(data)
                        setReportType("customers")
                        setReportDialogOpen(true)
                      }
                    } catch (error) {
                      console.error("Error fetching customers report:", error)
                      alert("Ошибка при загрузке отчёта")
                    }
                  }}
                  className="w-full btn-gradient rounded-xl font-semibold"
                >
                  Просмотр отчёта
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Модальное окно для отчётов */}
          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogContent 
              className="max-w-6xl h-[90vh] glass-effect rounded-2xl shadow-xl border-blue-200/60 flex flex-col p-0 !fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2"
              style={{ willChange: 'auto', transform: 'translate(-50%, -50%)' }}
            >
              <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
                <DialogTitle className="text-2xl font-black gradient-text">
                  {reportType === "sales" && "Отчёт по продажам"}
                  {reportType === "products" && "Отчёт по товарам"}
                  {reportType === "customers" && "Отчёт по клиентам"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 px-6 overflow-y-auto flex-1 min-h-0">
                {reportType === "sales" && reportData && (
                  <div className="space-y-6">
                    {/* Сводка */}
                    <div className="grid grid-cols-4 gap-4">
                      <Card className="p-4 bg-blue-50 border-2 border-blue-200">
                        <p className="text-xs text-muted-foreground mb-1">Всего заказов</p>
                        <p className="text-2xl font-black text-blue-600">{reportData.summary?.totalOrders || 0}</p>
                      </Card>
                      <Card className="p-4 bg-green-50 border-2 border-green-200">
                        <p className="text-xs text-muted-foreground mb-1">Выручка</p>
                        <p className="text-xl font-black text-green-600">
                          {(reportData.summary?.totalRevenue || 0).toLocaleString('ru-RU')} ₽
                        </p>
                      </Card>
                      <Card className="p-4 bg-purple-50 border-2 border-purple-200">
                        <p className="text-xs text-muted-foreground mb-1">Средний чек</p>
                        <p className="text-xl font-black text-purple-600">
                          {Math.round((reportData.summary?.avgOrderValue || 0)).toLocaleString('ru-RU')} ₽
                        </p>
                      </Card>
                      <Card className="p-4 bg-orange-50 border-2 border-orange-200">
                        <p className="text-xs text-muted-foreground mb-1">Скидки</p>
                        <p className="text-xl font-black text-orange-600">
                          {(reportData.summary?.totalDiscount || 0).toLocaleString('ru-RU')} ₽
                        </p>
                      </Card>
                    </div>
                    
                    {/* Таблица по дням */}
                    {reportData.daily && reportData.daily.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3">Продажи по дням</h3>
                        <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
                          <table className="w-full">
                            <thead className="gradient-bg-primary text-white">
                              <tr>
                                <th className="px-4 py-3 text-left font-bold text-sm">Дата</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Заказов</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Выручка</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Скидки</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Средний чек</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {reportData.daily.map((day: any, idx: number) => (
                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                  <td className="px-4 py-3 text-sm font-medium">
                                    {new Date(day.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right">{day.orderCount || 0}</td>
                                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                                    {Math.round(day.totalRevenue || 0).toLocaleString('ru-RU')} ₽
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right text-orange-600">
                                    {Math.round(day.totalDiscount || 0).toLocaleString('ru-RU')} ₽
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right text-blue-600">
                                    {Math.round(day.avgOrderValue || 0).toLocaleString('ru-RU')} ₽
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {reportType === "products" && reportData && (
                  <div className="space-y-6">
                    {/* Сводка */}
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="p-4 bg-blue-50 border-2 border-blue-200">
                        <p className="text-xs text-muted-foreground mb-1">Топ товаров</p>
                        <p className="text-2xl font-black text-blue-600">{reportData.topProducts?.length || 0}</p>
                      </Card>
                      <Card className="p-4 bg-orange-50 border-2 border-orange-200">
                        <p className="text-xs text-muted-foreground mb-1">Низкий остаток</p>
                        <p className="text-2xl font-black text-orange-600">{reportData.lowStock?.length || 0}</p>
                      </Card>
                      <Card className="p-4 bg-purple-50 border-2 border-purple-200">
                        <p className="text-xs text-muted-foreground mb-1">Категорий</p>
                        <p className="text-2xl font-black text-purple-600">{reportData.categoryStats?.length || 0}</p>
                      </Card>
                    </div>
                    
                    {/* Таблица топ товаров */}
                    {reportData.topProducts && reportData.topProducts.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3">Топ продаваемых товаров</h3>
                        <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
                          <table className="w-full">
                            <thead className="gradient-bg-primary text-white">
                              <tr>
                                <th className="px-4 py-3 text-left font-bold text-sm">Товар</th>
                                <th className="px-4 py-3 text-left font-bold text-sm">Категория</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Цена</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Остаток</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Продано</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Выручка</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {reportData.topProducts.map((product: any, idx: number) => (
                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                  <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                                  <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                                  <td className="px-4 py-3 text-sm text-right">{product.price?.toLocaleString('ru-RU')} ₽</td>
                                  <td className={`px-4 py-3 text-sm text-right font-semibold ${(product.stock || 0) < 10 ? 'text-orange-600' : 'text-gray-600'}`}>
                                    {product.stock || 0} шт.
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">
                                    {product.totalSold || 0} шт.
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                                    {Math.round(product.totalRevenue || 0).toLocaleString('ru-RU')} ₽
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {/* Таблица товаров с низким остатком */}
                    {reportData.lowStock && reportData.lowStock.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3">Товары с низким остатком</h3>
                        <div className="border-2 border-orange-200 rounded-xl overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-orange-500 text-white">
                              <tr>
                                <th className="px-4 py-3 text-left font-bold text-sm">Товар</th>
                                <th className="px-4 py-3 text-left font-bold text-sm">Категория</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Цена</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Остаток</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {reportData.lowStock.map((product: any, idx: number) => (
                                <tr key={idx} className="hover:bg-orange-50/50 transition-colors">
                                  <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                                  <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                                  <td className="px-4 py-3 text-sm text-right">{product.price?.toLocaleString('ru-RU')} ₽</td>
                                  <td className="px-4 py-3 text-sm text-right font-bold text-orange-600">
                                    {product.stock || 0} шт.
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {/* Таблица по категориям */}
                    {reportData.categoryStats && reportData.categoryStats.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3">Статистика по категориям</h3>
                        <div className="border-2 border-purple-200 rounded-xl overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-purple-500 text-white">
                              <tr>
                                <th className="px-4 py-3 text-left font-bold text-sm">Категория</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Товаров</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Остаток</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Продано</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {reportData.categoryStats.map((cat: any, idx: number) => (
                                <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                                  <td className="px-4 py-3 text-sm font-medium">{cat.category || 'Без категории'}</td>
                                  <td className="px-4 py-3 text-sm text-right">{cat.productCount || 0}</td>
                                  <td className="px-4 py-3 text-sm text-right">{cat.totalStock || 0} шт.</td>
                                  <td className="px-4 py-3 text-sm text-right font-semibold text-purple-600">
                                    {cat.totalSold || 0} шт.
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {reportType === "customers" && reportData && (
                  <div className="space-y-6">
                    {/* Сводка */}
                    <div className="grid grid-cols-4 gap-4">
                      <Card className="p-4 bg-blue-50 border-2 border-blue-200">
                        <p className="text-xs text-muted-foreground mb-1">Всего клиентов</p>
                        <p className="text-2xl font-black text-blue-600">{reportData.stats?.totalCustomers || 0}</p>
                      </Card>
                      <Card className="p-4 bg-green-50 border-2 border-green-200">
                        <p className="text-xs text-muted-foreground mb-1">Новых за 30 дней</p>
                        <p className="text-2xl font-black text-green-600">{reportData.stats?.newCustomers30d || 0}</p>
                      </Card>
                      <Card className="p-4 bg-purple-50 border-2 border-purple-200">
                        <p className="text-xs text-muted-foreground mb-1">С заказами</p>
                        <p className="text-2xl font-black text-purple-600">{reportData.stats?.customersWithOrders || 0}</p>
                      </Card>
                      <Card className="p-4 bg-orange-50 border-2 border-orange-200">
                        <p className="text-xs text-muted-foreground mb-1">Средний чек</p>
                        <p className="text-xl font-black text-orange-600">
                          {Math.round((reportData.stats?.avgSpentPerCustomer || 0)).toLocaleString('ru-RU')} ₽
                        </p>
                      </Card>
                    </div>
                    
                    {/* Таблица топ клиентов */}
                    {reportData.topCustomers && reportData.topCustomers.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3">Топ клиентов по сумме заказов</h3>
                        <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
                          <table className="w-full">
                            <thead className="gradient-bg-primary text-white">
                              <tr>
                                <th className="px-4 py-3 text-left font-bold text-sm">Клиент</th>
                                <th className="px-4 py-3 text-left font-bold text-sm">Email</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Заказов</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Потрачено</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Последний заказ</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {reportData.topCustomers.map((customer: any, idx: number) => (
                                <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                  <td className="px-4 py-3 text-sm font-medium">{customer.name || 'Без имени'}</td>
                                  <td className="px-4 py-3 text-sm text-muted-foreground">{customer.email}</td>
                                  <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">
                                    {customer.orderCount || 0}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                                    {Math.round(customer.totalSpent || 0).toLocaleString('ru-RU')} ₽
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                                    {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('ru-RU') : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {/* Таблица новых клиентов */}
                    {reportData.newCustomers && reportData.newCustomers.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-3">Новые клиенты (за 30 дней)</h3>
                        <div className="border-2 border-green-200 rounded-xl overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-green-500 text-white">
                              <tr>
                                <th className="px-4 py-3 text-left font-bold text-sm">Клиент</th>
                                <th className="px-4 py-3 text-left font-bold text-sm">Email</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Дата регистрации</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Заказов</th>
                                <th className="px-4 py-3 text-right font-bold text-sm">Потрачено</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {reportData.newCustomers.map((customer: any, idx: number) => (
                                <tr key={idx} className="hover:bg-green-50/50 transition-colors">
                                  <td className="px-4 py-3 text-sm font-medium">{customer.name || 'Без имени'}</td>
                                  <td className="px-4 py-3 text-sm text-muted-foreground">{customer.email}</td>
                                  <td className="px-4 py-3 text-sm text-right">
                                    {new Date(customer.createdAt).toLocaleDateString('ru-RU')}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                                    {customer.orderCount || 0}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                                    {Math.round(customer.totalSpent || 0).toLocaleString('ru-RU')} ₽
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-gray-200">
                <Button onClick={() => setReportDialogOpen(false)} className="btn-gradient rounded-xl font-semibold">
                  Закрыть
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-6">
          <Card className="card-glass border-blue-200/60 animate-fade-in">
            <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
              <CardTitle className="text-white font-black flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                Способы доставки
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-6">
                Управление способами доставки и тарифами.
              </p>
              <div className="space-y-4">
                {shippingMethods.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Загрузка способов доставки...
                  </p>
                ) : (
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <Card key={method.id} className="p-4 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">{method.name}</h3>
                            {method.description && (
                              <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                            )}
                            <div className="flex gap-4 text-sm">
                              <span className="font-semibold">Стоимость: {method.price.toLocaleString('ru-RU')} ₽</span>
                              {method.estimatedDays && (
                                <span className="text-muted-foreground">Срок: {method.estimatedDays} дн.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/shipping-methods")
                    if (response.ok) {
                      const methods = await response.json()
                      setShippingMethods(methods)
                    }
                  } catch (error) {
                    console.error("Error fetching shipping methods:", error)
                    alert("Ошибка при загрузке способов доставки")
                  }
                }}
                className="w-full mt-4 btn-gradient rounded-xl font-semibold"
              >
                Обновить список
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

  const statusLabels: Record<string, string> = {
    PENDING: "Ожидает рассмотрения",
    APPROVED: "Одобрен",
    PROCESSING: "Обрабатывается",
    COMPLETED: "Завершён",
    REJECTED: "Отклонён",
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl sm:text-4xl font-black mb-6 gradient-text animate-gradient">
        Возвраты ({returns.length})
      </h2>
      {returns.length === 0 ? (
        <Card className="p-12 text-center card-glass border-blue-200/60">
          <RotateCcw className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xl font-bold mb-2">Нет возвратов</p>
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
              <Card key={return_.id} className="card-modern hover:border-blue-300/80 animate-fade-in">
                <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-black text-white mb-2">Возврат #{return_.id.slice(-8)}</CardTitle>
                      <p className="text-sm text-white/90">
                        Заказ #{return_.order?.id?.slice(-8) || 'N/A'} | Клиент: {return_.user?.name || return_.user?.email || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white mb-2">
                        {return_.refundAmount?.toLocaleString("ru-RU") || 0} ₽
                      </p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusColor}`}>
                        {statusLabels[return_.status] || return_.status}
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
                      className="flex-1 h-11 rounded-xl border-2 border-blue-200 bg-background px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-semibold"
                    >
                      <option value="PENDING">{statusLabels.PENDING}</option>
                      <option value="APPROVED">{statusLabels.APPROVED}</option>
                      <option value="PROCESSING">{statusLabels.PROCESSING}</option>
                      <option value="COMPLETED">{statusLabels.COMPLETED}</option>
                      <option value="REJECTED">{statusLabels.REJECTED}</option>
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


