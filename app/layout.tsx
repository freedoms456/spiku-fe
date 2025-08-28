import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
<<<<<<< HEAD
  title: 'Next App',
  description: 'Created with Next',
  generator: 'next.dev',
=======
  title: 'next App',
  description: 'Created with next',
  generator: 'next.app',
>>>>>>> 6c284cdf65c09949b970dcf3da232917ca0dc86b
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
<<<<<<< HEAD
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
=======
    <html lang="en" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html {
                font-family: ${GeistSans.style.fontFamily};
                --font-sans: ${GeistSans.variable};
                --font-mono: ${GeistMono.variable};
              }
            `,
          }}
        />
>>>>>>> 6c284cdf65c09949b970dcf3da232917ca0dc86b
      </head>
      <body>{children}</body>
    </html>
  )
}
