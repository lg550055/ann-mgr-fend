"use client";
import { useEffect, useMemo, useState } from "react";
import Protected from "../components/Protected";
import { api } from "../lib/api";
import type { Task, User } from "@/types";
import { useAuth } from "../lib/auth";

export default function TasksPage() {
  return (
    <Protected>
      <TasksView />
    </Protected>
  );
}

function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const load = async () => {
    try {
      setError(null);
      const [t, u] = await Promise.all([
        api.listTasks(),
        api.listUsers().catch(() => [] as User[]), // non-admin may still view names via backend; fallback
      ]);
      setTasks(t);
      setUsers(u);
    } catch (err: any) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const byStatus = useMemo(() => {
    const groups: Record<string, Task[]> = { todo: [], in_progress: [], done: [] };
    for (const t of tasks) groups[t.status].push(t);
    return groups;
  }, [tasks]);

  const createTask = async (form: FormData) => {
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "");
    if (!title) return;
    const newTask = await api.createTask({ title, description });
    setTasks([newTask, ...tasks]);
  };

  const toggleStatus = async (task: Task) => {
    const order = ["todo", "wip", "done"] as const;
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    const updated = await api.updateTask(task.id, { status: next });
    setTasks(tasks.map(t => (t.id === task.id ? updated : t)));
  };

  const deleteTask = async (task: Task) => {
    await api.deleteTask(task.id);
    setTasks(tasks.filter(t => t.id !== task.id));
  };

  const assignUser = async (task: Task, userId: string) => {
    const updated = await api.updateTask(task.id, { assignees: [{ id: userId }] as any });
    setTasks(tasks.map(t => (t.id === task.id ? updated : t)));
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-4">Tasks</h1>
        <form action={createTask} className="flex flex-col md:flex-row gap-3">
          <input name="title" className="input" placeholder="New task title" />
          <input name="description" className="input" placeholder="Optional description" />
          <button className="btn-primary" type="submit">Add</button>
        </form>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {(["todo","wip","done"] as const).map((s) => (
          <div key={s} className="card">
            <h2 className="font-semibold mb-3 uppercase text-xs tracking-wider">{s.replace("_"," ")}</h2>
            {loading ? (
              <p className="text-sm">Loading…</p>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <ul className="space-y-2">
                {byStatus[s].map((t) => (
                  <li key={t.id} className="border border-gray-200 dark:border-neutral-800 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{t.title}</div>
                        {t.description && <div className="text-sm opacity-80">{t.description}</div>}
                        {t.assignees?.length ? (
                          <div className="mt-1 text-xs opacity-80">Assignees: {t.assignees.map(a=>a.email).join(", ")}</div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="btn-secondary text-xs" onClick={() => toggleStatus(t)}>Next</button>
                        <button className="btn-secondary text-xs" onClick={() => deleteTask(t)}>Delete</button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="label">Assign</label>
                      <select className="input" onChange={(e)=> assignUser(t, e.target.value)} defaultValue="">
                        <option value="" disabled>Pick a user</option>
                        {users.filter(u=>u.active!==false).map(u=> (
                          <option key={u.id} value={u.id}>{u.email}</option>
                        ))}
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
