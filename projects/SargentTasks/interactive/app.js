const KEY = 'sargenttasks_demo_tasks_v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function save(tasks) { localStorage.setItem(KEY, JSON.stringify(tasks)); }
function uid() { return Math.random().toString(36).slice(2, 9); }

let tasks = load();
if (tasks.length === 0) {
  tasks = [
    { id: uid(), title: 'Ler requisitos', status: 'TODO', createdAt: Date.now() },
    { id: uid(), title: 'Modelar entidades', status: 'DOING', createdAt: Date.now() },
    { id: uid(), title: 'Configurar CI', status: 'DONE', createdAt: Date.now() },
  ];
  save(tasks);
}

const lists = {
  TODO: document.getElementById('list-todo'),
  DOING: document.getElementById('list-doing'),
  DONE: document.getElementById('list-done'),
};

function formatDate(ms) { const d = new Date(ms); return d.toLocaleString(); }

function render() {
  Object.values(lists).forEach(l => l.innerHTML = '');
  tasks.forEach(t => {
    const el = document.createElement('div');
    el.className = 'card';
    el.setAttribute('draggable', 'true');
    el.dataset.id = t.id;
    el.innerHTML = `
      <div class="title">${escapeHtml(t.title)}</div>
      <div class="meta">
        <span>${t.status}</span>
        <span class="actions">
          <button class="btn" data-edit>Editar</button>
          <button class="btn" data-del>Excluir</button>
        </span>
      </div>`;

    el.addEventListener('dragstart', (ev) => {
      ev.dataTransfer.setData('text/plain', t.id);
      setTimeout(() => el.classList.add('dragging'));
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));

    el.addEventListener('click', (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.edit !== undefined) {
        const title = prompt('Novo título', t.title);
        if (title && title.trim()) {
          t.title = title.trim();
          save(tasks); render();
        }
      }
      if (target.dataset.del !== undefined) {
        if (confirm('Excluir tarefa?')) {
          tasks = tasks.filter(x => x.id !== t.id);
          save(tasks); render();
        }
      }
    });

    lists[t.status].appendChild(el);
  });
}

function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

function setupDnD() {
  document.querySelectorAll('.list').forEach(list => {
    list.addEventListener('dragover', (ev) => { ev.preventDefault(); list.classList.add('drop-target'); });
    list.addEventListener('dragleave', () => list.classList.remove('drop-target'));
    list.addEventListener('drop', (ev) => {
      ev.preventDefault();
      list.classList.remove('drop-target');
      const id = ev.dataTransfer.getData('text/plain');
      const item = tasks.find(x => x.id === id);
      if (!item) return;
      const status = list.id === 'list-todo' ? 'TODO' : list.id === 'list-doing' ? 'DOING' : 'DONE';
      item.status = status;
      save(tasks); render();
    });
  });
}

function setupForms() {
  document.getElementById('form-todo').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const form = ev.target;
    const title = form.title.value.trim();
    if (!title) return;
    tasks.unshift({ id: uid(), title, status: 'TODO', createdAt: Date.now() });
    form.reset();
    save(tasks); render();
  });
}

setupForms();
setupDnD();
render();

