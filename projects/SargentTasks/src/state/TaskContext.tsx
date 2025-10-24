import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { Task, TaskStatus } from '../types'
import { api } from '../utils/api'

type State = {
  tasks: Task[]
  loading: boolean
}

type Action =
  | { type: 'SET_TASKS'; tasks: Task[] }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'REMOVE_TASK'; id: string }
  | { type: 'SET_LOADING'; value: boolean }

const TaskStateContext = createContext<State | undefined>(undefined)
const TaskDispatchContext = createContext<{
  add: (input: Pick<Task, 'title' | 'description' | 'status'>) => Promise<void>
  update: (id: string, patch: Partial<Task>) => Promise<void>
  remove: (id: string) => Promise<void>
  refresh: () => Promise<void>
} | undefined>(undefined)

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.tasks }
    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => (t.id === action.task.id ? action.task : t))
      }
    case 'REMOVE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) }
    case 'SET_LOADING':
      return { ...state, loading: action.value }
    default:
      return state
  }
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { tasks: [], loading: true })

  useEffect(() => {
    void (async () => {
      dispatch({ type: 'SET_LOADING', value: true })
      const items = await api.list()
      dispatch({ type: 'SET_TASKS', tasks: items })
      dispatch({ type: 'SET_LOADING', value: false })
    })()
  }, [])

  const actions = useMemo(() => ({
    add: async (input: Pick<Task, 'title' | 'description' | 'status'>) => {
      const created = await api.create(input)
      dispatch({ type: 'ADD_TASK', task: created })
    },
    update: async (id: string, patch: Partial<Task>) => {
      const updated = await api.update(id, patch)
      dispatch({ type: 'UPDATE_TASK', task: updated })
    },
    remove: async (id: string) => {
      await api.remove(id)
      dispatch({ type: 'REMOVE_TASK', id })
    },
    refresh: async () => {
      dispatch({ type: 'SET_LOADING', value: true })
      const items = await api.list()
      dispatch({ type: 'SET_TASKS', tasks: items })
      dispatch({ type: 'SET_LOADING', value: false })
    }
  }), [])

  return (
    <TaskStateContext.Provider value={state}>
      <TaskDispatchContext.Provider value={actions}>
        {children}
      </TaskDispatchContext.Provider>
    </TaskStateContext.Provider>
  )
}

export function useTasks() {
  const ctx = useContext(TaskStateContext)
  if (!ctx) throw new Error('useTasks must be used inside TaskProvider')
  return ctx
}

export function useTaskActions() {
  const ctx = useContext(TaskDispatchContext)
  if (!ctx) throw new Error('useTaskActions must be used inside TaskProvider')
  return ctx
}

