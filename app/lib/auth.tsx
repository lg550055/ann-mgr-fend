"use client"
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";
import type { User, AuthResponse, Role } from "@/types";
import { useRouter } from "next/navigation";

interface AuthState {
    user: User | null
    token: string | null
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string) => Promise<void>
    logout: () => void
    hasRole: (role: Role) => boolean
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const t = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const u = typeof window !== "undefined" ? localStorage.getItem("user") : null
        if (t && u) {
            setToken(t)
            setUser(JSON.parse(u))
        }
    }, [])

    function storeSession(resp: AuthResponse) {
        setToken(resp.token)
        setUser(resp.user)
        localStorage.setItem("token", resp.token)
        localStorage.setItem("user", JSON.stringify(resp.user))
    }

    const login = async (email: string, password: string) => {
        const resp = await api.login(email, password)
        storeSession(resp)
        router.replace("/tasks")
    }

    const register = async (email: string, password: string) => {
        const resp = await api.register(email, password)
        storeSession(resp)
        router.replace("/tasks")
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.replace("/login")
    }

    const hasRole = (role: Role) => user?.role === role

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, hasRole}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within AuthProvider")
    return ctx
}