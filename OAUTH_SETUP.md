# Настройка OAuth (Google и Facebook)

## 📋 Как это работает

OAuth кнопки автоматически отображаются только если провайдеры настроены. Система проверяет наличие credentials через API `/api/auth/providers` и показывает кнопки только для настроенных провайдеров.

## 🔧 Настройка Google OAuth

### Шаг 1: Создание проекта в Google Cloud Console

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Перейдите в **APIs & Services** → **Credentials**
4. Нажмите **Create Credentials** → **OAuth client ID**
5. Если появится запрос, настройте **OAuth consent screen**:
   - Выберите **External** (для тестирования)
   - Заполните обязательные поля:
     - App name: "Интернет-магазин"
     - User support email: ваш email
     - Developer contact: ваш email
   - Сохраните и продолжите

### Шаг 2: Создание OAuth Client ID

1. В разделе **Create OAuth client ID**:
   - Application type: **Web application**
   - Name: "Web Client" (или любое другое)
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://yourdomain.com
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/google
     https://yourdomain.com/api/auth/callback/google
     ```
2. Нажмите **Create**
3. Скопируйте **Client ID** и **Client Secret**

### Шаг 3: Добавление в .env

Добавьте в файл `.env`:

```env
GOOGLE_CLIENT_ID=ваш_client_id_здесь
GOOGLE_CLIENT_SECRET=ваш_client_secret_здесь
```

## 🔧 Настройка Facebook OAuth

### Шаг 1: Создание приложения в Facebook Developers

1. Перейдите на [Facebook Developers](https://developers.facebook.com/)
2. Нажмите **My Apps** → **Create App**
3. Выберите тип приложения: **Consumer** или **Business**
4. Заполните информацию:
   - App name: "Интернет-магазин"
   - Contact email: ваш email
5. Нажмите **Create App**

### Шаг 2: Настройка Facebook Login

1. В Dashboard приложения найдите **Add Product**
2. Найдите **Facebook Login** и нажмите **Set Up**
3. Выберите **Web** платформу
4. В настройках **Facebook Login** → **Settings**:
   - **Valid OAuth Redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/facebook
     https://yourdomain.com/api/auth/callback/facebook
     ```
5. Сохраните изменения

### Шаг 3: Получение App ID и App Secret

1. В Dashboard перейдите в **Settings** → **Basic**
2. Скопируйте **App ID** (это будет `FACEBOOK_CLIENT_ID`)
3. Скопируйте **App Secret** (это будет `FACEBOOK_CLIENT_SECRET`)
   - Если не видите App Secret, нажмите **Show** рядом с ним

### Шаг 4: Добавление в .env

Добавьте в файл `.env`:

```env
FACEBOOK_CLIENT_ID=ваш_app_id_здесь
FACEBOOK_CLIENT_SECRET=ваш_app_secret_здесь
```

## 📝 Пример полного .env файла

```env
# Database
DATABASE_URL=mysql://mag:Magazin1337@codnix.ru:3306/internet_magazin

# NextAuth
NEXTAUTH_SECRET=ваш_секретный_ключ_здесь
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# Facebook OAuth (опционально)
FACEBOOK_CLIENT_ID=1234567890123456
FACEBOOK_CLIENT_SECRET=abcdefghijklmnopqrstuvwxyz123456

# Email (Resend)
RESEND_API_KEY=re_ваш_ключ_здесь
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Payment (YooKassa)
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=ваш_secret_key
```

## ✅ Проверка работы

1. Перезапустите сервер разработки:
   ```bash
   npm run dev
   ```

2. Откройте страницу входа: `http://localhost:3000/auth/signin`

3. Если OAuth настроен правильно:
   - Вы увидите разделитель (Separator)
   - Появятся кнопки "Войти через Google" и/или "Войти через Facebook"

4. Если OAuth не настроен:
   - Кнопки не будут отображаться
   - Ошибок в консоли не будет

## 🔍 Как проверить, какие провайдеры доступны

Откройте в браузере: `http://localhost:3000/api/auth/providers`

Вы увидите JSON с доступными провайдерами:
```json
{
  "credentials": { ... },
  "google": { ... },  // только если настроен
  "facebook": { ... } // только если настроен
}
```

## ⚠️ Важные замечания

1. **Для продакшена**: Обязательно добавьте ваш домен в Authorized redirect URIs
2. **Безопасность**: Никогда не коммитьте `.env` файл в Git
3. **Тестирование**: В режиме разработки Facebook может требовать добавления тестовых пользователей
4. **Google**: Для production может потребоваться верификация приложения

## 🐛 Решение проблем

### Кнопки не отображаются
- Проверьте, что переменные окружения добавлены в `.env`
- Перезапустите сервер после изменения `.env`
- Проверьте `/api/auth/providers` - должны быть нужные провайдеры

### Ошибка "client_id is required"
- Убедитесь, что переменные окружения правильно названы
- Проверьте, что нет лишних пробелов в `.env` файле
- Перезапустите сервер

### Ошибка redirect_uri mismatch
- Проверьте, что redirect URI в настройках OAuth совпадает с `NEXTAUTH_URL/api/auth/callback/[provider]`
- Для localhost: `http://localhost:3000/api/auth/callback/google`
- Для production: `https://yourdomain.com/api/auth/callback/google`
