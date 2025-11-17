/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Используем remotePatterns вместо устаревшего domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Увеличиваем таймаут для загрузки изображений (по умолчанию 10 секунд)
    minimumCacheTTL: 60,
    // Отключаем оптимизацию изображений в dev режиме для ускорения работы
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Оптимизация для dev режима
  ...(process.env.NODE_ENV === 'development' && {
    // Отключаем некоторые проверки для ускорения
    reactStrictMode: false,
  }),
  // Ускоряем компиляцию
  swcMinify: true,
  // Уменьшаем размер бандла
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Исключаем системные файлы Windows из отслеживания
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/pagefile.sys',
          '**/hiberfil.sys',
          '**/swapfile.sys',
          '**/System Volume Information/**',
          '**/Thumbs.db',
          '**/Desktop.ini',
        ],
      }
    }
    return config
  },
}

module.exports = nextConfig


