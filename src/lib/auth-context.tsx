import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface UserProfile {
  username: string
  email: string
  firstName: string
  lastName: string
  avatar: string
}

interface AuthContextValue {
  isAuthenticated: boolean
  user: UserProfile | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // TODO: Replace with Authentik initialization logic
      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error('Failed to initialize authentication:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async () => {
    try {
      // TODO: Implement Authentik login logic
      console.log('Login functionality to be implemented with Authentik')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const logout = async () => {
    try {
      // TODO: Implement Authentik logout logic
      console.log('Logout functionality to be implemented with Authentik')
      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getUserProfile = (): UserProfile | null => {
    return user
      ? {
          username: 'preferred_username' in user ? (user as Record<string, string>).preferred_username : user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar || `https://www.gravatar.com/avatar/?d=identicon`,
        }
      : null
  }

  const value: AuthContextValue = {
    isAuthenticated,
    user: getUserProfile(),
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
