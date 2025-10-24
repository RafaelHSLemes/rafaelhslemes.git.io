import { motion } from 'framer-motion'
import { useTaskActions } from '../../state/TaskContext'
import { StatusLabels, Task, TaskStatus } from '../../types'

export function TaskCard({ task }: { task: Task }) {
  const { update, remove } = useTaskActions()

  async function onStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as TaskStatus
    await update(task.id, { status })
  }

  return (
    <div className="task">
      <div className="task-head">
        <strong className="task-title">{task.title}</strong>
        <span className="task-dates">{new Date(task.createdAt).toLocaleString('pt-BR')}</span>
      </div>
      {task.description && <p className="task-desc">{task.description}</p>}
      <div className="task-actions">
        <label className="muted">Status</label>
        <select value={task.status} onChange={onStatusChange}>
          <option value="PENDENTE">{StatusLabels.PENDENTE}</option>
          <option value="EM_PROGRESSO">{StatusLabels.EM_PROGRESSO}</option>
          <option value="CONCLUIDA">{StatusLabels.CONCLUIDA}</option>
        </select>
        <motion.button whileTap={{ scale: 0.96 }} className="danger" onClick={() => remove(task.id)}>Excluir</motion.button>
      </div>
    </div>
  )
}

