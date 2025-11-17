"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useSession } from "next-auth/react"

interface CartContextType {
  cartItemsCount: number
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType>({
  cartItemsCount: 0,
  refreshCart: async () => {},
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const { data: session } = useSession()

  const refreshCart = async () => {
    if (!session) {
      setCartItemsCount(0)
      return
    }

    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        const count = data.items.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        )
        setCartItemsCount(count)
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    }
  }

  useEffect(() => {
    refreshCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  return (
    <CartContext.Provider value={{ cartItemsCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}


