import { AuthResponse, Task, User } from "@/types"

const API_URL = process.env.API_URL || ""

async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            ...(token && { Authorization: `Bearer ${token}` })
        },
        cache: "no-store"
    })

    if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || res.statusText)
    }

    return res.json() as T
}

export const api = {
    // auth
    async login(email: string, password: string) {
        return http<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password})
        })
    },
    async register(email: string, password: string) {
        return http<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password})
        })
    },
    // tasks
    listTasks() {
        return http<Task[]>("/tasks")
    },
    createTask(payload: Partial<Task>) {
        return http<Task>("/tasks", {
            method: "POST",
            body: JSON.stringify(payload)
        })
    },
    updateTask(id: string, patch: Partial<Task>) {
        return http<Task>(`/tasks/${id}`, {
            method: "POST",
            body: JSON.stringify(patch)
        })
    },
    deleteTask(id: string) {
    return http<{ ok: true }>(`/tasks/${id}`, { method: "DELETE" })
    },
    // admin users
    listUsers() {
        return http<Task[]>("/users")
    },
    addUser(user: { email: string; role?: "admin" | "user" }) {
    return http<User>("/users", { method: "POST", body: JSON.stringify(user) })
    },
    deleteUser(id: string) {
        return http<{ ok: true }>(`/users/${id}`, { method: "DELETE" })
    },
    setUserActive(id: string, active: boolean) {
        return http<User>(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
        });
    }
}