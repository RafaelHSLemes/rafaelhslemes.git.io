import { AnimatePresence, motion } from 'framer-motion'
import { useTasks } from '../../state/TaskContext'
import { Column } from './Column'
import { TaskCard } from './TaskCard'
import { TaskStatus } from '../../types'

const columns: { key: TaskStatus; title: string }[] = [
  { key: 'PENDENTE', title: 'Pendente' },
  { key: 'EM_PROGRESSO', title: 'Em Progresso' },
  { key: 'CONCLUIDA', title: 'Concluída' }
]

export function Board() {
  const { tasks, loading } = useTasks()
  const byStatus = (s: TaskStatus) => tasks.filter(t => t.status === s)

  return (
    <section className="board">
      {columns.map(c => (
        <Column key={c.key} title={c.title}>
          <AnimatePresence initial={false}>
            {byStatus(c.key).map(task => (
              <motion.div key={task.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <TaskCard task={task} />
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && <div className="muted" style={{ padding: '.5rem' }}>Carregando…</div>}
        </Column>
      ))}
    </section>
  )
}

