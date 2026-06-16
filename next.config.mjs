/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Статика и медиа лежат в public/. Старый сайт — в _legacy/ (не часть сборки).
  outputFileTracingExcludes: {
    '*': ['./_legacy/**', './source/**'],
  },
}

export default nextConfig
