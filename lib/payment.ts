// YooKassa payment integration

interface YooKassaPaymentRequest {
  amount: {
    value: string
    currency: string
  }
  confirmation: {
    type: string
    return_url: string
  }
  capture: boolean
  description: string
  metadata?: {
    orderId: string
    userId: string
  }
}

interface YooKassaPaymentResponse {
  id: string
  status: string
  amount: {
    value: string
    currency: string
  }
  confirmation: {
    confirmation_url: string
  }
  created_at: string
  description: string
  metadata?: {
    orderId: string
    userId: string
  }
}

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

export async function createYooKassaPayment(data: {
  amount: number
  orderId: string
  userId: string
  description: string
}): Promise<{ paymentId: string; confirmationUrl: string } | null> {
  if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
    console.warn('YooKassa credentials not configured')
    return null
  }

  try {
    const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64')

    const paymentRequest: YooKassaPaymentRequest = {
      amount: {
        value: data.amount.toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: `${BASE_URL}/orders?payment=success`,
      },
      capture: true,
      description: data.description,
      metadata: {
        orderId: data.orderId,
        userId: data.userId,
      },
    }

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': `${data.orderId}-${Date.now()}`,
      },
      body: JSON.stringify(paymentRequest),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.description || 'Failed to create payment')
    }

    const paymentData: YooKassaPaymentResponse = await response.json()

    return {
      paymentId: paymentData.id,
      confirmationUrl: paymentData.confirmation.confirmation_url,
    }
  } catch (error: any) {
    console.error('Error creating YooKassa payment:', error.message || error)
    throw error
  }
}

export async function checkYooKassaPaymentStatus(paymentId: string): Promise<string | null> {
  if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
    return null
  }

  try {
    const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64')

    const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const paymentData: YooKassaPaymentResponse = await response.json()
    return paymentData.status
  } catch (error: any) {
    console.error('Error checking YooKassa payment status:', error.message || error)
    return null
  }
}

