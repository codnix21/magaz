# Настройка платежей и Email-уведомлений

## Платежная система YooKassa

### 1. Регистрация в YooKassa

1. Зарегистрируйтесь на [https://yookassa.ru/](https://yookassa.ru/)
2. Пройдите верификацию магазина
3. Получите Shop ID и Secret Key в личном кабинете

### 2. Настройка переменных окружения

Добавьте в `.env`:

```env
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
```

### 3. Настройка Webhook

В личном кабинете YooKassa укажите URL для webhook:
```
https://your-domain.com/api/payments/webhook
```

Или для разработки с помощью ngrok:
```
https://your-ngrok-url.ngrok.io/api/payments/webhook
```

### 4. Тестирование

Для тестирования используйте тестовые карты:
- Успешная оплата: `5555 5555 5555 4477`
- Отклоненная оплата: `5555 5555 5555 4444`

## Email-уведомления через Resend

### 1. Регистрация в Resend

1. Зарегистрируйтесь на [https://resend.com/](https://resend.com/)
2. Создайте API ключ в разделе API Keys
3. Верифицируйте домен (или используйте `onboarding@resend.dev` для тестирования)

### 2. Настройка переменных окружения

Добавьте в `.env`:

```env
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
SITE_NAME=Ваш Магазин
```

### 3. Отправка писем

Система автоматически отправляет:
- Email подтверждения при создании заказа
- Email об изменении статуса заказа

### 4. Тестирование

Для тестирования можно использовать `onboarding@resend.dev` как `RESEND_FROM_EMAIL` (письма будут отправляться, но с ограничениями).

## Альтернативные решения

### Email

Если Resend недоступен, можно использовать:
- **Nodemailer** с SMTP
- **SendGrid**
- **Mailgun**
- **AWS SES**

### Платежи

Если YooKassa недоступен, можно интегрировать:
- **Stripe** (для международных платежей)
- **SberPay**
- **CloudPayments**
- **Tinkoff Bank**

## Пример настройки с Nodemailer (альтернатива)

Если хотите использовать Nodemailer вместо Resend:

1. Установите зависимости:
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

2. Создайте файл `lib/email-nodemailer.ts` (пример):
```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  // ... реализация
}
```

3. Добавьте в `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

