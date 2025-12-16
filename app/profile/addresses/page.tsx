"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Edit, Trash2, MapPin, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  type: 'SHIPPING' | 'BILLING' | 'BOTH'
}

export default function AddressesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "Россия",
    region: "",
    city: "",
    postalCode: "",
    street: "",
    type: "SHIPPING" as 'SHIPPING' | 'BILLING' | 'BOTH',
    isDefault: false,
  })

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    fetchAddresses()
  }, [session])

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses")
      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
        setError(null)
      } else {
        const data = await response.json().catch(() => null)
        setError(data?.error || "Не удалось загрузить адреса")
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
      setError("Не удалось загрузить адреса. Попробуйте позже.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (address: Address) => {
    setError(null)
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone || "",
      country: address.country,
      region: address.region || "",
      city: address.city,
      postalCode: address.postalCode || "",
      street: address.street,
      type: address.type,
      isDefault: address.isDefault,
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  const handleDelete = async (addressId: string) => {
    setDeleteId(addressId)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/addresses/${deleteId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        await fetchAddresses()
        setError(null)
      } else {
        const data = await response.json().catch(() => null)
        setError(data?.error || "Не удалось удалить адрес")
      }
    } catch (error) {
      console.error("Error deleting address:", error)
      setError("Не удалось удалить адрес. Попробуйте позже.")
    } finally {
      setDeleteId(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId 
        ? `/api/addresses/${editingId}`
        : "/api/addresses"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchAddresses()
        setShowForm(false)
        setEditingId(null)
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          country: "Россия",
          region: "",
          city: "",
          postalCode: "",
          street: "",
          type: "SHIPPING",
          isDefault: false,
        })
        setError(null)
      } else {
        const data = await response.json().catch(() => null)
        setError(data?.error || "Не удалось сохранить адрес")
      }
    } catch (error) {
      console.error("Error saving address:", error)
      setError("Не удалось сохранить адрес. Попробуйте позже.")
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const address = addresses.find(a => a.id === addressId)
      if (!address) return

      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      })

      if (response.ok) {
        await fetchAddresses()
        setError(null)
      } else {
        const data = await response.json().catch(() => null)
        setError(data?.error || "Не удалось обновить адрес по умолчанию")
      }
    } catch (error) {
      console.error("Error setting default address:", error)
      setError("Не удалось обновить адрес по умолчанию. Попробуйте позже.")
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
        <div className="mb-8 sm:mb-6 animate-fade-in">
          <Link href="/profile" className="inline-block mb-6">
            <Button variant="ghost" className="rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 font-semibold">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад к профилю
            </Button>
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 gradient-text animate-gradient">
            Адресная книга
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Управление адресами доставки</p>
        </div>

        {error && (
          <div className="mb-6 animate-fade-in">
            <Card className="border-red-300 bg-red-50/80 text-red-800">
              <CardContent className="py-3 text-sm">
                {error}
              </CardContent>
            </Card>
          </div>
        )}

        {!showForm ? (
          <>
            <div className="mb-6">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить адрес
              </Button>
            </div>

            {addresses.length === 0 ? (
              <Card className="p-12 text-center card-glass border-blue-200/60 animate-fade-in">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-xl font-bold mb-2">Нет сохраненных адресов</p>
                <p className="text-muted-foreground mb-6">
                  Добавьте адрес для быстрого оформления заказов
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="btn-gradient rounded-xl font-bold px-8 py-6"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Добавить адрес
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {addresses.map((address) => (
                  <Card
                    key={address.id}
                    className={`card-modern transition-all ${
                      address.isDefault
                        ? "border-blue-400 bg-blue-50/50"
                        : "hover:border-blue-300/80"
                    } animate-fade-in`}
                  >
                    <CardHeader className={`${address.isDefault ? 'gradient-bg-primary' : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50'} text-white rounded-t-2xl shadow-xl border-b-2 ${address.isDefault ? 'border-white/20' : 'border-blue-200/50'}`}>
                      <div className="flex items-start justify-between">
                        <CardTitle className={`flex items-center gap-2 ${address.isDefault ? 'text-white font-black' : ''}`}>
                          <div className={`p-2 rounded-xl ${address.isDefault ? 'bg-white/20 backdrop-blur-md' : 'bg-blue-600/10'}`}>
                            <MapPin className={`h-5 w-5 ${address.isDefault ? 'text-white' : 'text-blue-600'}`} />
                          </div>
                          {address.isDefault && (
                            <span className="text-xs bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-xl font-bold border border-white/30">
                              По умолчанию
                            </span>
                          )}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(address)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(address.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-2">
                      <p className="font-semibold text-lg">
                        {address.firstName} {address.lastName}
                      </p>
                      {address.phone && (
                        <p className="text-muted-foreground">{address.phone}</p>
                      )}
                      <p className="text-muted-foreground">
                        {address.country}
                        {address.region && `, ${address.region}`}, {address.city}
                        {address.postalCode && `, ${address.postalCode}`}
                      </p>
                      <p className="text-muted-foreground">{address.street}</p>
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                          className="mt-4 w-full"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Сделать адресом по умолчанию
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <Card className="card-glass border-blue-200/60 max-w-2xl mx-auto animate-fade-in">
            <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
              <CardTitle className="text-white font-black text-xl">
                {editingId ? "Редактировать адрес" : "Новый адрес"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Имя *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Фамилия *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="country">Страна *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="region">Регион/Область</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Город *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Индекс</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({ ...formData, postalCode: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="street">Улица, дом, квартира *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">
                    Сделать адресом по умолчанию
                  </Label>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 btn-gradient rounded-xl font-semibold"
                  >
                    Сохранить
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                      setFormData({
                        firstName: "",
                        lastName: "",
                        phone: "",
                        country: "Россия",
                        region: "",
                        city: "",
                        postalCode: "",
                        street: "",
                        type: "SHIPPING",
                        isDefault: false,
                      })
                    }}
                    className="rounded-xl"
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Удалить адрес?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Этот адрес будет удалён безвозвратно. Продолжить?
            </p>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteId(null)}
                className="rounded-xl"
              >
                Отмена
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 rounded-xl"
              >
                Удалить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

