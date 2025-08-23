"use client";
import Link from "next/link";
import { useAuth } from "../lib/auth";

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  return (
    <nav className="border-b border-gray-200 dark:border-neutral-800">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold">TaskCollab</Link>
          {user && (
            <>
              <Link className="text-sm hover:underline" href="/tasks">Tasks</Link>
              {hasRole("admin") && (
                <Link className="text-sm hover:underline" href="/admin/users">Users</Link>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="badge">{user.email} · {user.role}{user.active === false ? " · inactive" : ""}</span>
              <button className="btn-secondary" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn-secondary" href="/login">Login</Link>
              <Link className="btn-primary" href="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
