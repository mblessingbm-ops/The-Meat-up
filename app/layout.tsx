import type { Metadata } from 'next'
import { Cormorant_Garamond, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-primary-loaded',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-loaded',
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'The Meat Up | Business Management',
    template: '%s | The Meat Up',
  },
  description: 'Business management platform for The Meat Up — meat retail operations.',
  icons: { icon: '/favicon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Override font vars with loaded fonts */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-primary: var(--font-primary-loaded, 'Cormorant Garamond', Georgia, serif);
            --font-mono: var(--font-mono-loaded, 'JetBrains Mono', 'Fira Code', monospace);
          }
        ` }} />
        {/* Force dark mode always — The Meat Up is dark-only */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.documentElement.classList.add('dark');
        `}} />
      </head>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'var(--font-primary)',
              fontSize: '15px',
              fontWeight: '500',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-md)',
            },
            success: {
              style: {
                background: 'var(--success-subtle)',
                borderColor: 'var(--success-border)',
                color: 'var(--success)',
              },
            },
            error: {
              duration: 0,
              style: {
                background: 'var(--danger-subtle)',
                borderColor: 'var(--danger-border)',
                color: 'var(--danger)',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
