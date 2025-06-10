'use client'
import { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Alert, Box } from '@mui/material'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: string[]
  fallback?: ReactNode
  showError?: boolean
}

export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null,
  showError = false 
}: RoleGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return showError ? (
      <Alert severity="error">
        Usuário não autenticado
      </Alert>
    ) : fallback
  }

  const hasPermission = allowedRoles.includes(user.role) || user.role === 'superadmin'

  if (!hasPermission) {
    if (showError) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert severity="warning">
            Você não tem permissão para acessar este conteúdo.
            <br />
            Roles necessárias: {allowedRoles.join(', ')}
            <br />
            Sua role atual: {user.role}
          </Alert>
        </Box>
      )
    }
    return <>{fallback}</>
  }

  return <>{children}</>
}