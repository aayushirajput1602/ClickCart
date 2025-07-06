"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => void
  updateProfile: (profileData: Partial<User>) => Promise<void>
  isLoading: boolean
  token: string | null
  rememberMe: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    const savedRememberMe = localStorage.getItem("rememberMe") === "true"

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setRememberMe(savedRememberMe)

      // Verify token is still valid
      verifyTokenValidity(savedToken)
        .then((isValid) => {
          if (isValid) {
            // Fetch fresh user data from server
            fetchUserProfile(savedToken)
          } else {
            // Token expired, clear everything
            logout()
          }
        })
        .catch(() => {
          logout()
        })
    }
    setIsLoading(false)
  }, [])

  const verifyTokenValidity = async (authToken: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const updatedUser = {
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phone: data.user.phone,
          dateOfBirth: data.user.dateOfBirth,
          address: data.user.address,
        }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
      } else {
        // If profile fetch fails, token might be expired
        logout()
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      logout()
    }
  }

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      setUser(data.user)
      setToken(data.token)
      setRememberMe(rememberMe)

      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)
      localStorage.setItem("rememberMe", rememberMe.toString())

      // Set token expiration reminder
      if (rememberMe) {
        // Set reminder for 29 days (1 day before expiration)
        const reminderTime = 29 * 24 * 60 * 60 * 1000
        setTimeout(() => {
          console.log("Token will expire in 1 day. Please login again.")
        }, reminderTime)
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      return data
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    if (!token) {
      throw new Error("Not authenticated")
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update profile")
      }

      // Fetch updated user data
      await fetchUserProfile(token)
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setRememberMe(false)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("rememberMe")
    localStorage.removeItem("cart")
    localStorage.removeItem("wishlist")

    // Trigger custom event to clear cart and wishlist
    window.dispatchEvent(new CustomEvent("userLogout"))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isLoading,
        token,
        rememberMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
