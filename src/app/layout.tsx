import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Comunitaria II · UAX',
  description: 'Test de autoevaluación para Enfermería Familiar y Comunitaria II',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
