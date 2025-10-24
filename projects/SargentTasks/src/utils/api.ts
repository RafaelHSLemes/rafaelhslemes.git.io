import { AllStatuses, Task } from '../types'

// API client com fallback para localStorage.
const BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined

const key = 'taskboard.tasks'

function nowIso() {
  return new Date().toISOString()
}

function readLocal(): Task[] {
  const raw = localStorage.getItem(key)
  if (!raw) return []
  try { return JSON.parse(raw) as Task[] } catch { return [] }
}

function writeLocal(items: Task[]) {
  localStorage.setItem(key, JSON.stringify(items))
}

async function listLocal(): Promise<Task[]> {
  return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

async function createLocal(input: Pick<Task, 'title' | 'description' | 'status'>): Promise<Task> {
  const items = readLocal()
  const id = crypto.randomUUID()
  const t: Task = { id, title: input.title, description: input.description, status: input.status, createdAt: nowIso(), updatedAt: nowIso() }
  items.unshift(t)
  writeLocal(items)
  return t
}

async function updateLocal(id: string, patch: Partial<Task>): Promise<Task> {
  const items = readLocal()
  const i = items.findIndex(t => t.id === id)
  if (i < 0) throw new Error('not_found')
  const updated: Task = {
    ...items[i],
    ...patch,
    updatedAt: nowIso(),
  }
  // valida status
  if (updated.status && !AllStatuses.includes(updated.status)) throw new Error('invalid_status')
  items[i] = updated
  writeLocal(items)
  return updated
}

async function removeLocal(id: string): Promise<void> {
  const items = readLocal().filter(t => t.id !== id)
  writeLocal(items)
}

// Remote API (opcional): deve oferecer endpoints RESTful
async function listRemote(): Promise<Task[]> {
  const res = await fetch(`${BASE_URL}/tasks`)
  return await res.json()
}
async function createRemote(input: Pick<Task, 'title' | 'description' | 'status'>): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
  return await res.json()
}
async function updateRemote(id: string, patch: Partial<Task>): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
  return await res.json()
}
async function removeRemote(id: string): Promise<void> {
  await fetch(`${BASE_URL}/tasks/${id}`, { method: 'DELETE' })
}

export const api = {
  list: BASE_URL ? listRemote : listLocal,
  create: BASE_URL ? createRemote : createLocal,
  update: BASE_URL ? updateRemote : updateLocal,
  remove: BASE_URL ? removeRemote : removeLocal,
}

