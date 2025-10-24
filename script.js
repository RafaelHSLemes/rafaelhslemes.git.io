// Theme: toggle + persist
(function initTheme() {
  const root = document.documentElement;
  const key = 'theme-preference';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const stored = localStorage.getItem(key);
  const initial = stored || (prefersDark ? 'dark' : 'light');
  if (initial === 'dark') root.setAttribute('data-theme', 'dark');
  const btn = document.getElementById('themeToggle');
  const updateIcon = () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    btn.querySelector('.icon').textContent = isDark ? '☀️' : '🌙';
    btn.setAttribute('aria-pressed', String(isDark));
  };
  btn.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    if (isDark) {
      root.removeAttribute('data-theme');
      localStorage.setItem(key, 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem(key, 'dark');
    }
    updateIcon();
  });
  updateIcon();
})();

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Top-level tabs (Sobre, Projetos)
(() => {
  const buttons = Array.from(document.querySelectorAll('.tab-btn'));
  const panels = Array.from(document.querySelectorAll('.tab-panel'));
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.getAttribute('aria-controls'));
      buttons.forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', String(b === btn)); });
      panels.forEach(p => p.classList.toggle('is-active', p === target));
    });
  });
})();

// Load projects manifest and build tabs/panels
(async function loadProjects() {
  const tabs = document.getElementById('projectTabs');
  const panels = document.getElementById('projectPanels');
  if (!tabs || !panels) return;
  try {
    const res = await fetch('projects/projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Manifest not found');
    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) throw new Error('No projects');

    items.forEach((proj, idx) => {
      const idSafe = 'proj-' + (proj.id || idx);
      // Tab
      const tab = document.createElement('button');
      tab.className = 'project-tab' + (idx === 0 ? ' is-active' : '');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', idSafe);
      tab.textContent = proj.title || proj.id || `Projeto ${idx+1}`;
      tabs.appendChild(tab);

      // Panel
      const panel = document.createElement('section');
      panel.id = idSafe;
      panel.className = 'project-item' + (idx === 0 ? ' is-active' : '');

      const header = document.createElement('div');
      header.className = 'project-header';

      const h3 = document.createElement('h3');
      h3.className = 'project-title';
      h3.textContent = proj.title || proj.id || `Projeto ${idx+1}`;

      const actions = document.createElement('div');
      actions.className = 'project-actions';
      if (proj.link) {
        const view = document.createElement('a');
        view.href = proj.link;
        view.target = '_blank';
        view.rel = 'noopener';
        view.className = 'btn';
        view.textContent = 'Abrir';
        actions.appendChild(view);
      }
      if (proj.repo) {
        const repo = document.createElement('a');
        repo.href = proj.repo;
        repo.target = '_blank';
        repo.rel = 'noopener';
        repo.className = 'btn';
        repo.textContent = 'Repositório';
        actions.appendChild(repo);
      }
      const cta = document.createElement('a');
      cta.href = proj.link || proj.repo || '#';
      cta.target = proj.link || proj.repo ? '_blank' : '';
      cta.rel = 'noopener';
      cta.className = 'btn cta';
      cta.textContent = 'Ver projeto';
      actions.appendChild(cta);

      header.appendChild(h3);
      header.appendChild(actions);
      panel.appendChild(header);

      if (proj.image) {
        const img = document.createElement('img');
        img.src = proj.image;
        img.alt = proj.title ? `Imagem do projeto ${proj.title}` : 'Imagem do projeto';
        img.style.maxWidth = '100%';
        img.style.border = '1px solid var(--line)';
        img.style.borderRadius = '12px';
        img.style.margin = '8px 0';
        panel.appendChild(img);
      }

      if (proj.description) {
        const p = document.createElement('p');
        p.textContent = proj.description;
        panel.appendChild(p);
      }

      if (Array.isArray(proj.tags) && proj.tags.length) {
        const tags = document.createElement('div');
        tags.className = 'tags';
        proj.tags.forEach(t => {
          const tag = document.createElement('span');
          tag.className = 'tag';
          tag.textContent = t;
          tags.appendChild(tag);
        });
        panel.appendChild(tags);
      }

      panels.appendChild(panel);

      tab.addEventListener('click', () => {
        document.querySelectorAll('.project-tab').forEach(b => b.classList.remove('is-active'));
        document.querySelectorAll('.project-item').forEach(p => p.classList.remove('is-active'));
        tab.classList.add('is-active');
        panel.classList.add('is-active');
      });
    });
  } catch (e) {
    const fallback = document.createElement('p');
    fallback.className = 'muted';
    fallback.textContent = 'Nenhum projeto disponível no momento.';
    panels?.appendChild(fallback);
  }
})();

