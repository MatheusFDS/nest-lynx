'use client'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { Box, CircularProgress } from '@mui/material'
import ThemeProvider from './components/theme/ThemeProvider'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

function AppInitializer({ children }: { children: ReactNode }) {
  const { isInitialized } = useAuth()

  if (!isInitialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  return <>{children}</>
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <AppInitializer>{children}</AppInitializer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}