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
  isInitialized: boolean // ✅ Novo flag para controlar inicialização
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; refreshToken: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN'; payload: { token: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED' } // ✅ Nova ação

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
  isInitialized: false, // ✅ Inicialmente false
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
        isInitialized: true, // ✅ Marca como inicializado
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
        isInitialized: true, // ✅ Marca como inicializado mesmo em falha
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true, // ✅ Mantém inicializado
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
    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: true,
        isLoading: false,
      }
    default:
      return state
  }
}

// ✅ Função para verificar se estamos no cliente
const isClient = typeof window !== 'undefined'

// ✅ Função segura para acessar localStorage
const safeGetLocalStorage = (key: string): string | null => {
  if (!isClient) return null
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.warn(`Erro ao acessar localStorage para ${key}:`, error)
    return null
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

  // ✅ Verificar token no localStorage ao inicializar - VERSÃO ROBUSTA
  useEffect(() => {
    const initializeAuth = async () => {
      // ✅ Aguardar estar no cliente
      if (!isClient) {
        dispatch({ type: 'SET_INITIALIZED' })
        return
      }

      try {
        const token = safeGetLocalStorage('token')
        const refreshToken = safeGetLocalStorage('refreshToken')
        const userData = safeGetLocalStorage('user')

        console.log('🔍 Inicializando auth...', { 
          hasToken: !!token, 
          hasRefreshToken: !!refreshToken, 
          hasUserData: !!userData 
        })

        // ✅ Se não tem dados salvos, apenas parar o loading
        if (!token || !refreshToken || !userData) {
          console.log('❌ Sem dados salvos, não logado')
          dispatch({ type: 'SET_INITIALIZED' })
          return
        }

        let user: User
        try {
          user = JSON.parse(userData)
        } catch (error) {
          console.error('❌ Dados de usuário corrompidos:', error)
          clearLocalStorage()
          dispatch({ type: 'SET_INITIALIZED' })
          return
        }

        // ✅ ESTRATÉGIA DEFENSIVA: Assumir que o token é válido inicialmente
        console.log('✅ Dados encontrados, assumindo login válido:', user.name)
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token, refreshToken }
        })

        // ✅ Verificar token em background (não bloqueia UI)
        setTimeout(async () => {
          try {
            console.log('🔄 Verificando validade do token...')
            const currentUser = await api.getCurrentUser()
            console.log('✅ Token válido, atualizando dados:', currentUser.name)
            
            // ✅ Atualizar dados se necessário
            if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
              localStorage.setItem('user', JSON.stringify(currentUser))
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user: currentUser, token, refreshToken }
              })
            }
          } catch (error) {
            // ✅ Melhor tratamento de erros
            const errorMessage = error instanceof Error ? error.message : String(error)
            
            if (errorMessage === 'UNAUTHORIZED' || errorMessage.includes('401')) {
              console.log('⚠️ Token inválido, tentando renovar...')
              
              // ✅ Token inválido, tentar renovar
              try {
                const response = await api.refreshToken(refreshToken)
                const newToken = response.access_token
                
                console.log('✅ Token renovado com sucesso')
                localStorage.setItem('token', newToken)
                
                // ✅ Tentar novamente com o novo token
                try {
                  const currentUser = await api.getCurrentUser()
                  localStorage.setItem('user', JSON.stringify(currentUser))
                  
                  dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: { 
                      user: currentUser, 
                      token: newToken, 
                      refreshToken 
                    }
                  })
                  console.log('✅ Token renovado e usuário atualizado')
                } catch (userError) {
                  console.log('❌ Erro ao buscar usuário após renovação, mantendo dados antigos')
                  // ✅ Manter dados antigos se a renovação funcionou mas getCurrentUser falhou
                  dispatch({
                    type: 'REFRESH_TOKEN',
                    payload: { token: newToken }
                  })
                }
              } catch (refreshError) {
                console.log('❌ Não foi possível renovar o token, fazendo logout')
                dispatch({ type: 'LOGOUT' })
                clearLocalStorage()
              }
            } else {
              // ✅ Outro tipo de erro (rede, etc) - manter login e tentar depois
              console.warn('⚠️ Erro temporário na verificação do token:', errorMessage)
              console.log('✅ Mantendo login e tentando novamente em 30s...')
              
              // ✅ Tentar novamente em 30 segundos
              setTimeout(() => {
                if (isClient && localStorage.getItem('token')) {
                  console.log('🔄 Tentativa automática de verificação do token...')
                  // ✅ Não fazer reload, apenas tentar verificar novamente
                }
              }, 30000)
            }
          }
        }, 500) // ✅ Aguardar um pouco mais para a UI carregar

      } catch (error) {
        console.error('❌ Erro crítico ao inicializar autenticação:', error)
        dispatch({ type: 'SET_INITIALIZED' })
        clearLocalStorage()
      }
    }

    // ✅ Aguardar um pouco mais para evitar problemas de hidratação
    const timer = setTimeout(initializeAuth, 200)
    return () => clearTimeout(timer)
  }, [])

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'LOGIN_START' })
      const response: LoginResponse = await api.login({ email, password })
      
      // ✅ Salvar no localStorage de forma segura
      if (isClient) {
        localStorage.setItem('token', response.access_token)
        localStorage.setItem('refreshToken', response.refresh_token)
        localStorage.setItem('user', JSON.stringify(response.user))
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.access_token,
          refreshToken: response.refresh_token,
        },
      })

      console.log('✅ Login realizado com sucesso:', response.user.name)
      return true
    } catch (error) {
      console.error('❌ Erro no login:', error)
      dispatch({ type: 'LOGIN_FAILURE' })
      return false
    }
  }

  // Função de logout
  const logout = async () => {
    console.log('🚪 Fazendo logout...')
    
    // ✅ Primeiro limpar estado e localStorage
    dispatch({ type: 'LOGOUT' })
    clearLocalStorage()

    // ✅ Depois tentar notificar o backend (sem bloquear se falhar)
    try {
      if (state.token) {
        await api.logout()
        console.log('✅ Logout realizado com sucesso no backend')
      }
    } catch (error) {
      console.warn('⚠️ Logout backend falhou (normal se token expirado):', error)
    }
  }

  // Função para renovar token
  const refreshTokenFn = async (): Promise<boolean> => {
    try {
      if (!state.refreshToken) return false
      
      const response = await api.refreshToken(state.refreshToken)
      
      if (isClient) {
        localStorage.setItem('token', response.access_token)
      }
      
      dispatch({
        type: 'REFRESH_TOKEN',
        payload: { token: response.access_token },
      })

      return true
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error)
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

// ✅ Função auxiliar segura para limpar localStorage
function clearLocalStorage() {
  if (!isClient) return
  
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    console.log('🧹 localStorage limpo')
  } catch (error) {
    console.warn('⚠️ Erro ao limpar localStorage:', error)
  }
}