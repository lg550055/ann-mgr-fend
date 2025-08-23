export type Role = "admin" | "user"

export interface User {
    id: string
    email: string
    role: Role
    active: boolean
}

export interface AuthResponse {
    token: string
    user: User
}

export interface Task {
    id: string
    title: string
    description?: string
    status: "todo" | "wip" | "done"
    assignees: Pick<User, "id" | "email">[]
    creatorId: string
    createdAt: string
}
