(() => {
  const root = document;
  const updateUrl = (window.__KANBAN__ && window.__KANBAN__.updateUrl) || '/api/tasks';

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`${updateUrl}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Falha ao atualizar');
      window.location.reload();
    } catch (e) { alert('Erro ao atualizar status'); }
  }

  async function removeTask(id) {
    if (!confirm('Excluir esta tarefa?')) return;
    try {
      const res = await fetch(`${updateUrl}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir');
      window.location.reload();
    } catch (e) { alert('Erro ao excluir'); }
  }

  root.addEventListener('change', (ev) => {
    const el = ev.target;
    if (el.classList.contains('status-picker')) {
      const taskEl = el.closest('.task');
      const id = taskEl && taskEl.getAttribute('data-id');
      if (id) updateStatus(id, el.value);
    }
  });

  root.addEventListener('click', (ev) => {
    const el = ev.target;
    if (el.classList.contains('delete-btn')) {
      const taskEl = el.closest('.task');
      const id = taskEl && taskEl.getAttribute('data-id');
      if (id) removeTask(id);
    }
  });
})();
