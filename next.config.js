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
    // Ускоряем компиляцию в dev режиме
    experimental: {
      optimizePackageImports: [
        'lucide-react', 
        '@radix-ui/react-dialog', 
        '@radix-ui/react-tabs',
        '@radix-ui/react-label',
        '@radix-ui/react-separator',
        '@radix-ui/react-slot',
        'next-auth',
      ],
      // Ускоряем компиляцию
      turbo: {
        rules: {
          '*.svg': {
            loaders: ['@svgr/webpack'],
            as: '*.js',
          },
        },
      },
      // Ускоряем компиляцию страниц
      serverComponentsExternalPackages: ['prisma'],
    },
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
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**',
        '**/pagefile.sys',
        '**/hiberfil.sys',
        '**/swapfile.sys',
        '**/DumpStack.log.tmp',
        '**/DumpStack.log',
        '**/System Volume Information/**',
        '**/Thumbs.db',
        '**/Desktop.ini',
        '**/RECYCLER/**',
        '**/$Recycle.Bin/**',
        '**/Windows/**',
        '**/Program Files/**',
        '**/ProgramData/**',
      ],
      aggregateTimeout: 300,
      poll: false,
    }
    return config
  },
}

module.exports = nextConfig


