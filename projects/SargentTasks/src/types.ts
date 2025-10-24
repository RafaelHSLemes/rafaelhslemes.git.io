export type TaskStatus = 'PENDENTE' | 'EM_PROGRESSO' | 'CONCLUIDA'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export const StatusLabels: Record<TaskStatus, string> = {
  PENDENTE: 'Pendente',
  EM_PROGRESSO: 'Em Progresso',
  CONCLUIDA: 'Concluída'
}

export const AllStatuses: TaskStatus[] = ['PENDENTE', 'EM_PROGRESSO', 'CONCLUIDA']
