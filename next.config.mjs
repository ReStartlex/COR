/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Статика и медиа лежат в public/. Старый сайт — в _legacy/ (не часть сборки).
  outputFileTracingExcludes: {
    '*': ['./_legacy/**', './source/**'],
  },
  // Чистый URL витрины (public/showcase/<slug>/index.html не отдаётся по dir-URL автоматически).
  async rewrites() {
    return [{ source: '/showcase/:slug', destination: '/showcase/:slug/index.html' }]
  },
}

export default nextConfig
