import type { Metadata } from "next"
import { Share_Tech_Mono, Rajdhani } from "next/font/google"
import "./globals.css"

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
})

const rajdhani = Rajdhani({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Historial de Peso",
  description: "Registro de peso, fluctuaciones y meta de peso",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${shareTechMono.variable} ${rajdhani.variable}`}>
      <body className="bg-background">{children}</body>
    </html>
  )
}
