import { useState } from 'react'
import { useTaskActions } from '../../state/TaskContext'
import { TaskStatus } from '../../types'

export function TaskForm() {
  const { add } = useTaskActions()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('PENDENTE')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await add({ title: title.trim(), description: description.trim(), status })
    setTitle('')
    setDescription('')
    setStatus('PENDENTE')
  }

  return (
    <form onSubmit={onSubmit} className="form">
      <div className="grid">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" maxLength={140} required />
        <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
          <option value="PENDENTE">Pendente</option>
          <option value="EM_PROGRESSO">Em Progresso</option>
          <option value="CONCLUIDA">Concluída</option>
        </select>
      </div>
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição (opcional)" rows={2} maxLength={2000} />
      <div>
        <button type="submit">Adicionar</button>
      </div>
    </form>
  )
}

