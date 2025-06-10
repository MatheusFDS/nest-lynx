'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallbackPath?: string
}

export default function AuthGuard({ 
  children, 
  requiredRoles = [], 
  fallbackPath = '/login' 
}: AuthGuardProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Se não está autenticado, redirecionar para login
      if (!isAuthenticated) {
        router.push(fallbackPath)
        return
      }

      // Se tem roles requeridas, verificar se o usuário possui
      if (requiredRoles.length > 0 && user) {
        const hasRequiredRole = requiredRoles.includes(user.role) || user.role === 'superadmin'
        
        if (!hasRequiredRole) {
          // Redirecionar para página de acesso negado ou dashboard
          router.push('/dashboard')
          return
        }
      }
    }
  }, [isAuthenticated, user, isLoading, router, requiredRoles, fallbackPath])

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
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

  // Se não está autenticado, não mostrar conteúdo
  if (!isAuthenticated) {
    return null
  }

  // Se tem roles requeridas e o usuário não possui, não mostrar conteúdo
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role) || user.role === 'superadmin'
    if (!hasRequiredRole) {
      return null
    }
  }

  return <>{children}</>
}