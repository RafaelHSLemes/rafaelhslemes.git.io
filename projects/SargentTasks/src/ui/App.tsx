import { Board } from './components/Board'
import { TaskForm } from './components/TaskForm'
import './index.css'

export function App() {
  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>TaskBoard – SargentTasks</h1>
          <p className="muted">Lista de tarefas com status e animações (localStorage ou API mock)</p>
        </div>
        <a className="link" href="https://github.com/rafaelhslemes" target="_blank" rel="noreferrer">GitHub</a>
      </header>

      <section className="card">
        <h2>Adicionar tarefa</h2>
        <TaskForm />
      </section>

      <Board />
    </div>
  )
}

