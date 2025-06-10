import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

interface UseAuthGuardOptions {
  requiredRoles?: string[]
  redirectTo?: string
  enabled?: boolean
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { 
    requiredRoles = [], 
    redirectTo = '/login', 
    enabled = true 
  } = options
  
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!enabled || isLoading) return

    // Verificar autenticação
    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    // Verificar roles se especificadas
    if (requiredRoles.length > 0 && user) {
      const hasRequiredRole = requiredRoles.includes(user.role) || user.role === 'superadmin'
      
      if (!hasRequiredRole) {
        router.push('/dashboard') // ou página de erro 403
        return
      }
    }
  }, [isAuthenticated, user, isLoading, router, requiredRoles, redirectTo, enabled])

  return {
    isAuthenticated,
    user,
    isLoading,
    hasAccess: isAuthenticated && (
      requiredRoles.length === 0 || 
      (user && (requiredRoles.includes(user.role) || user.role === 'superadmin'))
    )
  }
}