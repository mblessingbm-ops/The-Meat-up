/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly expose Supabase vars to all runtimes including Edge Middleware.
  // NEXT_PUBLIC_ prefix alone is not sufficient in Edge Runtime without this.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@react-email/components', 'resend'],
  },
  // Prevent static generation failures on authenticated/Supabase routes
  staticPageGenerationTimeout: 0,
}

module.exports = nextConfig
