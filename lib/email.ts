// Resend email integration
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface OrderEmailData {
  orderId: string
  userName: string
  userEmail: string
  total: number
  discountAmount?: number
  subtotal?: number
  shippingAddress: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('Resend API key not configured, skipping email')
    return
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const siteName = process.env.SITE_NAME || 'Магазин'

    const itemsHtml = data.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString('ru-RU')} ₽</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toLocaleString('ru-RU')} ₽</td>
      </tr>
    `
      )
      .join('')

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Подтверждение заказа #${data.orderId}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Спасибо за ваш заказ!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Здравствуйте, <strong>${data.userName}</strong>!</p>
            
            <p>Ваш заказ #<strong>${data.orderId}</strong> успешно оформлен и находится в обработке.</p>
            
            <h2 style="color: #667eea; margin-top: 30px; margin-bottom: 15px;">Детали заказа:</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: white; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: #667eea; color: white;">
                  <th style="padding: 12px; text-align: left;">Товар</th>
                  <th style="padding: 12px; text-align: center;">Количество</th>
                  <th style="padding: 12px; text-align: right;">Цена</th>
                  <th style="padding: 12px; text-align: right;">Сумма</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
              ${data.subtotal ? `<div style="display: flex; justify-content: space-between; margin-bottom: 10px;"><span>Подытог:</span><strong>${data.subtotal.toLocaleString('ru-RU')} ₽</strong></div>` : ''}
              ${data.discountAmount && data.discountAmount > 0 ? `<div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #10b981;"><span>Скидка:</span><strong>-${data.discountAmount.toLocaleString('ru-RU')} ₽</strong></div>` : ''}
              <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 2px solid #667eea; font-size: 20px; font-weight: bold;">
                <span>Итого:</span>
                <span style="color: #667eea;">${data.total.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #e0e7ff; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0;"><strong>Адрес доставки:</strong></p>
              <p style="margin: 5px 0 0 0;">${data.shippingAddress}</p>
            </div>
            
            <p style="margin-top: 30px;">Вы можете отслеживать статус вашего заказа в <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/orders" style="color: #667eea; text-decoration: none; font-weight: bold;">личном кабинете</a>.</p>
            
            <p style="margin-top: 20px; color: #666; font-size: 14px;">С уважением,<br>Команда ${siteName}</p>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: fromEmail,
      to: data.userEmail,
      subject: `Подтверждение заказа #${data.orderId} - ${siteName}`,
      html: emailHtml,
    })

    console.log(`Order confirmation email sent to ${data.userEmail} for order ${data.orderId}`)
  } catch (error: any) {
    console.error('Error sending order confirmation email:', error)
    // Не бросаем ошибку, чтобы не прерывать процесс оформления заказа
  }
}

export async function sendOrderStatusUpdateEmail(
  userEmail: string,
  userName: string,
  orderId: string,
  status: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('Resend API key not configured, skipping email')
    return
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const siteName = process.env.SITE_NAME || 'Магазин'

    const statusMessages: Record<string, string> = {
      PROCESSING: 'Ваш заказ обрабатывается',
      SHIPPED: 'Ваш заказ отправлен',
      DELIVERED: 'Ваш заказ доставлен',
      CANCELLED: 'Ваш заказ отменен',
    }

    const statusMessage = statusMessages[status] || 'Статус вашего заказа изменен'

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${statusMessage}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${statusMessage}</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Здравствуйте, <strong>${userName}</strong>!</p>
            
            <p>Статус вашего заказа #<strong>${orderId}</strong> изменен на: <strong>${statusMessage}</strong>.</p>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/orders" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Посмотреть заказ</a>
            </div>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">С уважением,<br>Команда ${siteName}</p>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `${statusMessage} - Заказ #${orderId}`,
      html: emailHtml,
    })

    console.log(`Order status update email sent to ${userEmail} for order ${orderId}`)
  } catch (error: any) {
    console.error('Error sending order status update email:', error)
  }
}

