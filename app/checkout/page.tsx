"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Gift, X, Plus, MapPin, Truck } from "lucide-react"

interface CartItem {
  id: string
  quantity: number
  variantId?: string | null
  product: {
    id: string
    name: string
    price: number
    image: string
    discountPercent?: number
  }
  variant?: {
    id: string
    name: string
    value: string
    price?: number | null
  }
}

interface Address {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
  country: string
  region?: string | null
  city: string
  postalCode?: string | null
  street: string
  isDefault: boolean
}

interface ShippingMethod {
  id: string
  name: string
  description?: string | null
  price: number
  freeShippingThreshold?: number | null
  estimatedDays?: number | null
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [shippingAddress, setShippingAddress] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [shippingCost, setShippingCost] = useState(0)
  const [total, setTotal] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "Россия",
    region: "",
    city: "",
    postalCode: "",
    street: "",
  })
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string | null>(null)
  const [orderComment, setOrderComment] = useState("")
  const [addressError, setAddressError] = useState<string | null>(null)
  const [shippingMethodError, setShippingMethodError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    fetchCart()
    fetchAddresses()
    fetchShippingMethods()
  }, [session])

  useEffect(() => {
    if (selectedShippingMethodId && subtotal > 0) {
      calculateShipping()
    }
  }, [selectedShippingMethodId, subtotal])

  useEffect(() => {
    updateTotals(cartItems, appliedPromo, shippingCost)
  }, [shippingCost])

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.items || [])
        if (data.items.length === 0) {
          router.push("/cart")
        } else {
          updateTotals(data.items, appliedPromo, shippingCost)
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses")
      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
        const defaultAddr = data.find((a: Address) => a.isDefault)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id)
          setShippingAddress(formatAddress(defaultAddr))
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
    }
  }

  const fetchShippingMethods = async () => {
    try {
      const response = await fetch("/api/shipping-methods")
      if (response.ok) {
        const data = await response.json()
        setShippingMethods(data)
        if (data.length > 0) {
          setSelectedShippingMethodId(data[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching shipping methods:", error)
    }
  }

  const calculateShipping = async () => {
    if (!selectedShippingMethodId) return
    try {
      const response = await fetch(`/api/shipping-methods/${selectedShippingMethodId}/calculate?total=${subtotal}`)
      if (response.ok) {
        const data = await response.json()
        setShippingCost(data.cost)
      }
    } catch (error) {
      console.error("Error calculating shipping:", error)
    }
  }

  const formatAddress = (addr: Address): string => {
    return `${addr.country}${addr.region ? `, ${addr.region}` : ""}, ${addr.city}${addr.postalCode ? `, ${addr.postalCode}` : ""}, ${addr.street}`
  }

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    setAddressError(null)
    const addr = addresses.find(a => a.id === addressId)
    if (addr) {
      setShippingAddress(formatAddress(addr))
      setShowNewAddress(false)
    }
  }

  const handleSaveNewAddress = async () => {
    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAddress,
          type: "SHIPPING",
          isDefault: addresses.length === 0,
        }),
      })
      if (response.ok) {
        const addr = await response.json()
        await fetchAddresses()
        setSelectedAddressId(addr.id)
        setShippingAddress(formatAddress(addr))
        setShowNewAddress(false)
        setNewAddress({
          firstName: "",
          lastName: "",
          phone: "",
          country: "Россия",
          region: "",
          city: "",
          postalCode: "",
          street: "",
        })
        setAddressError(null)
      }
    } catch (error) {
      console.error("Error saving address:", error)
      setAddressError("Не удалось сохранить адрес. Попробуйте позже.")
    }
  }

  const updateTotals = (items: CartItem[], promo: any = null, shipping: number = 0) => {
    const newSubtotal = items.reduce((sum, item) => {
      const itemPrice = item.variant?.price || item.product.price
      const discount = item.product.discountPercent || 0
      const finalPrice = discount > 0 
        ? Math.round(itemPrice * (1 - discount / 100))
        : itemPrice
      return sum + finalPrice * item.quantity
    }, 0)
    setSubtotal(newSubtotal)

    let finalDiscount = 0
    if (promo) {
      finalDiscount = promo.discountAmount
    }
    setDiscountAmount(finalDiscount)
    setTotal(newSubtotal - finalDiscount + shipping)
  }

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return

    setPromoLoading(true)
    try {
      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.toUpperCase(),
          subtotal,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAppliedPromo(data.promoCode)
        updateTotals(cartItems, data.promoCode, shippingCost)
      } else {
        const error = await response.json()
        // TODO: заменить на красивый UI-бэйдж/тост, сейчас просто лог
        console.error("Promo code error:", error.error || "Неверный промокод")
      }
    } catch (error) {
      console.error("Error applying promo code:", error)
      // TODO: заменить на пользовательское уведомление
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromoCode = () => {
    setAppliedPromo(null)
    setPromoCode("")
    updateTotals(cartItems, null, shippingCost)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddressError(null)
    setShippingMethodError(null)

    if (!shippingAddress.trim()) {
      setAddressError("Пожалуйста, выберите или добавьте адрес доставки")
      return
    }
    if (!selectedShippingMethodId) {
      setShippingMethodError("Пожалуйста, выберите способ доставки")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress,
          addressId: selectedAddressId,
          shippingMethodId: selectedShippingMethodId,
          shippingCost,
          comment: orderComment.trim() || null,
          cartItems: cartItems.map((item) => ({
            productId: item.product.id,
            variantId: item.variantId || null,
            quantity: item.quantity,
            product: item.product,
          })),
          promoCode: appliedPromo ? appliedPromo.code : null,
          paymentMethod,
        }),
      })

      if (response.ok) {
        const order = await response.json()

        // Если выбрана онлайн оплата, создаем платеж
        if (paymentMethod === 'online') {
          setProcessingPayment(true)
          try {
            const paymentResponse = await fetch("/api/payments/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: order.id }),
            })

            if (paymentResponse.ok) {
              const payment = await paymentResponse.json()
              // Перенаправляем на страницу оплаты YooKassa
              window.location.href = payment.confirmationUrl
              return
            } else {
              const error = await paymentResponse.json()
              console.error("Payment creation error:", error.error || "Ошибка при создании платежа")
            }
          } catch (paymentError) {
            console.error("Error creating payment:", paymentError)
            // TODO: можно подсветить блок оплаты, сейчас только лог
          } finally {
            setProcessingPayment(false)
          }
        }

        // Если оплата наличными или произошла ошибка с онлайн оплатой
        router.push(`/orders?order=${order.id}&status=created`)
      } else {
        const error = await response.json()
        console.error("Order creation error:", error.error || "Ошибка при оформлении заказа")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      // TODO: добавить пользовательское уведомление
    } finally {
      setSubmitting(false)
    }
  }

  if (!session) {
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
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 gradient-text animate-gradient">
          Оформление заказа
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Завершите оформление вашего заказа</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <Card className="card-glass border-blue-200/60 animate-fade-in">
            <CardHeader className="gradient-bg-primary text-white rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl shadow-xl p-4 sm:p-5 md:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl font-black text-white flex items-center gap-2 sm:gap-3">
                <div className="bg-white/20 backdrop-blur-md p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                Адрес доставки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              {/* Выбор существующего адреса */}
              {addresses.length > 0 && !showNewAddress && (
                <div className="space-y-2">
                  <Label>Выберите адрес</Label>
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleAddressSelect(addr.id)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedAddressId === addr.id
                            ? "border-blue-600 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">
                              {addr.firstName} {addr.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatAddress(addr)}
                            </p>
                            {addr.phone && (
                              <p className="text-sm text-muted-foreground">
                                {addr.phone}
                              </p>
                            )}
                          </div>
                          {addr.isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              По умолчанию
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewAddress(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить новый адрес
                  </Button>
                </div>
              )}

              {/* Форма нового адреса */}
              {showNewAddress && (
                <div className="space-y-3 p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-lg font-semibold">Новый адрес</Label>
                    {addresses.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewAddress(false)}
                      >
                        Отмена
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName" className="text-sm sm:text-base">Имя *</Label>
                      <Input
                        id="firstName"
                        value={newAddress.firstName}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, firstName: e.target.value })
                        }
                        required
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm sm:text-base">Фамилия *</Label>
                      <Input
                        id="lastName"
                        value={newAddress.lastName}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, lastName: e.target.value })
                        }
                        required
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      value={newAddress.phone}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Страна *</Label>
                    <Input
                      id="country"
                      value={newAddress.country}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, country: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Регион/Область</Label>
                    <Input
                      id="region"
                      value={newAddress.region}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, region: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city">Город *</Label>
                      <Input
                        id="city"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Индекс</Label>
                      <Input
                        id="postalCode"
                        value={newAddress.postalCode}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, postalCode: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="street">Улица, дом, квартира *</Label>
                    <Input
                      id="street"
                      value={newAddress.street}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, street: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleSaveNewAddress}
                    disabled={
                      !newAddress.firstName ||
                      !newAddress.lastName ||
                      !newAddress.country ||
                      !newAddress.city ||
                      !newAddress.street
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    Сохранить адрес
                  </Button>
                </div>
              )}

              {/* Если нет адресов, показываем форму сразу */}
              {addresses.length === 0 && !showNewAddress && (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewAddress(true)}
                    className="w-full mb-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить адрес доставки
                  </Button>
                </div>
              )}

              {/* Резервный вариант - текстовое поле */}
              {!showNewAddress && (
                <div className="space-y-2">
                  <Label htmlFor="address">Или укажите адрес вручную</Label>
                  <Textarea
                    id="address"
                    placeholder="Укажите полный адрес доставки"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={3}
                  />
                  {addressError && (
                    <p className="text-xs text-red-600 mt-1">
                      {addressError}
                    </p>
                  )}
                </div>
              )}

              {/* Способ доставки */}
              <div className="space-y-2 pt-4 border-t">
                <Label className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Способ доставки *
                </Label>
                {shippingMethods.length > 0 ? (
                  <div className="space-y-2">
                    {shippingMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedShippingMethodId(method.id)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedShippingMethodId === method.id
                            ? "border-blue-600 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{method.name}</p>
                            {method.description && (
                              <p className="text-sm text-muted-foreground">
                                {method.description}
                              </p>
                            )}
                            {method.estimatedDays && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Примерно {method.estimatedDays} {method.estimatedDays === 1 ? "день" : method.estimatedDays < 5 ? "дня" : "дней"}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">
                              {shippingCost === 0 && subtotal >= (method.freeShippingThreshold || Infinity)
                                ? "Бесплатно"
                                : `${method.price.toLocaleString("ru-RU")} ₽`}
                            </p>
                            {method.freeShippingThreshold && subtotal < method.freeShippingThreshold && (
                              <p className="text-xs text-muted-foreground">
                                Бесплатно от {method.freeShippingThreshold.toLocaleString("ru-RU")} ₽
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Загрузка способов доставки...</p>
                )}
                {shippingMethodError && (
                  <p className="text-xs text-red-600 mt-1">
                    {shippingMethodError}
                  </p>
                )}
              </div>

              {/* Комментарий к заказу */}
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="comment">Комментарий к заказу</Label>
                <Textarea
                  id="comment"
                  placeholder="Дополнительные пожелания или инструкции для доставки"
                  value={orderComment}
                  onChange={(e) => setOrderComment(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="promo">Промокод</Label>
                {appliedPromo ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Gift className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-800">{appliedPromo.code}</p>
                      {appliedPromo.description && (
                        <p className="text-sm text-green-600">{appliedPromo.description}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemovePromoCode}
                      className="h-9 w-9 sm:h-10 sm:w-10 text-green-600 hover:text-red-600"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      id="promo"
                      placeholder="Введите промокод"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleApplyPromoCode()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleApplyPromoCode}
                      disabled={promoLoading || !promoCode.trim()}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 min-h-[44px] px-4 sm:px-6 text-sm sm:text-base"
                    >
                      <Gift className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Применить
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="payment">Способ оплаты</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="online"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'cash')}
                      className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 cursor-pointer"
                    />
                    <Label htmlFor="online" className="font-normal cursor-pointer text-sm sm:text-base">
                      Онлайн оплата (YooKassa)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="cash"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'cash')}
                      className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 cursor-pointer"
                    />
                    <Label htmlFor="cash" className="font-normal cursor-pointer text-sm sm:text-base">
                      Оплата при получении
                    </Label>
                  </div>
                </div>
                {paymentMethod === 'online' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Вы будете перенаправлены на безопасную страницу оплаты YooKassa
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass border-blue-200/60 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="gradient-bg-primary text-white rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl shadow-xl p-4 sm:p-5 md:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl font-black text-white">Ваш заказ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {item.product.price.toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                    <p className="font-semibold">
                      {(item.product.price * item.quantity).toLocaleString("ru-RU")} ₽
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Подытог:</span>
                  <span>{subtotal.toLocaleString("ru-RU")} ₽</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Скидка:</span>
                    <span>-{discountAmount.toLocaleString("ru-RU")} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Итого:</span>
                  <span>{total.toLocaleString("ru-RU")} ₽</span>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full btn-gradient rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6 min-h-[48px] sm:min-h-[52px] md:min-h-[56px]"
                size="lg"
                disabled={submitting || processingPayment}
              >
                <span className="hidden sm:inline">{processingPayment ? "Создание платежа..." : submitting ? "Оформление..." : paymentMethod === 'online' ? "Оплатить заказ" : "Подтвердить заказ"}</span>
                <span className="sm:hidden">{processingPayment ? "Платеж..." : submitting ? "Оформление..." : paymentMethod === 'online' ? "Оплатить" : "Подтвердить"}</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
    </div>
  )
}


