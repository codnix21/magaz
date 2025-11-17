import pool from './db'
import crypto from 'crypto'

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 час
  
  const id = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  await pool.execute(
    'INSERT INTO UserToken (id, userId, token, type, expiresAt) VALUES (?, ?, ?, ?, ?)',
    [id, userId, token, 'PASSWORD_RESET', expiresAt]
  )
  
  return token
}

export async function validatePasswordResetToken(token: string): Promise<string | null> {
  const [rows] = await pool.execute(
    'SELECT userId FROM UserToken WHERE token = ? AND type = "PASSWORD_RESET" AND expiresAt > NOW() AND used = false',
    [token]
  ) as any[]
  
  if (rows.length === 0) {
    return null
  }
  
  return rows[0].userId
}

export async function usePasswordResetToken(token: string): Promise<void> {
  await pool.execute(
    'UPDATE UserToken SET used = true WHERE token = ? AND type = "PASSWORD_RESET"',
    [token]
  )
}

export async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  if (!process.env.RESEND_API_KEY) {
    console.warn('Resend API key not configured, skipping password reset email')
    return
  }

  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Восстановление пароля',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Восстановление пароля</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Здравствуйте, <strong>${name}</strong>!</p>
            <p>Вы запросили восстановление пароля для вашего аккаунта.</p>
            <p>Нажмите на кнопку ниже, чтобы установить новый пароль:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(to right, #2563eb, #4f46e5); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Восстановить пароль
              </a>
            </div>
            <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
            <p style="color: #666; word-break: break-all; background: white; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Ссылка действительна в течение 1 часа. Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.
            </p>
          </div>
        </div>
      `,
    })
    
    console.log(`Password reset email sent to ${email}`)
  } catch (error: any) {
    console.error('Error sending password reset email:', error)
    throw error
  }
}

