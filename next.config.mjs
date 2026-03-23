// For GitHub Pages subdirectory deployment (e.g. username.github.io/repo-name),
// set NEXT_PUBLIC_BASE_PATH env variable. Leave empty for root domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig
