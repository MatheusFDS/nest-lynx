'use client'
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { api } from '../services/api'
import type { LoginResponse } from '../types/api'

// Tipos
interface User {
  id: string
  name: string
  email: string
  role: string
  tenantId: string
  driverId?: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; refreshToken: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN'; payload: { token: string } }
  | { type: 'SET_LOADING'; payload: boolean }

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshTokenFn: () => Promise<boolean>
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,
}

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isLoading: false,
        isAuthenticated: true,
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'REFRESH_TOKEN':
      return {
        ...state,
        token: action.payload.token,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    default:
      return state
  }
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Verificar token no localStorage ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const refreshToken = localStorage.getItem('refreshToken')
        const userData = localStorage.getItem('user')

        // Se não tem dados salvos, apenas parar o loading
        if (!token || !refreshToken || !userData) {
          dispatch({ type: 'SET_LOADING', payload: false })
          return
        }

        const user = JSON.parse(userData)
        
        // Verificar se o token ainda é válido fazendo uma requisição simples
        try {
          // Simular verificação básica - apenas tentar usar o token
          const currentUser = await api.getCurrentUser()
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: currentUser, token, refreshToken }
          })
        } catch (error) {
          console.log('Token inválido, tentando renovar...')
          
          // Token inválido, tentar renovar
          try {
            const response = await api.refreshToken(refreshToken)
            localStorage.setItem('token', response.access_token)
            
            // Tentar novamente com o novo token
            const currentUser = await api.getCurrentUser()
            
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { 
                user: currentUser, 
                token: response.access_token, 
                refreshToken 
              }
            })
          } catch (refreshError) {
            console.log('Não foi possível renovar o token')
            // Não conseguiu renovar, limpar dados
            dispatch({ type: 'LOGOUT' })
            clearLocalStorage()
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
        dispatch({ type: 'LOGOUT' })
        clearLocalStorage()
      }
    }

    // Aguardar um pouco antes de verificar para evitar problemas de hidratação
    const timer = setTimeout(initializeAuth, 100)
    return () => clearTimeout(timer)
  }, [])

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'LOGIN_START' })

      const response: LoginResponse = await api.login({ email, password })
      
      // Salvar no localStorage
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('refreshToken', response.refresh_token)
      localStorage.setItem('user', JSON.stringify(response.user))

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.access_token,
          refreshToken: response.refresh_token,
        },
      })

      return true
    } catch (error) {
      console.error('Erro no login:', error)
      dispatch({ type: 'LOGIN_FAILURE' })
      return false
    }
  }

  // Função de logout
  const logout = async () => {
    try {
      // Chamar API de logout se houver token
      if (state.token) {
        await api.logout()
      }
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      dispatch({ type: 'LOGOUT' })
      clearLocalStorage()
    }
  }

  // Função para renovar token
  const refreshTokenFn = async (): Promise<boolean> => {
    try {
      if (!state.refreshToken) return false

      const response = await api.refreshToken(state.refreshToken)
      
      localStorage.setItem('token', response.access_token)
      
      dispatch({
        type: 'REFRESH_TOKEN',
        payload: { token: response.access_token },
      })

      return true
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      dispatch({ type: 'LOGOUT' })
      clearLocalStorage()
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshTokenFn,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

// Funções auxiliares
function clearLocalStorage() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}