/* globals React, ReactDOM */
const { useEffect, useMemo, useState, useCallback } = React;

// Preferência de tema armazenada em localStorage
const useTheme = () => {
  const getInitial = () => {
    const stored = localStorage.getItem('ispicus:theme');
    if (stored) return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };
  const [theme, setTheme] = useState(getInitial);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ispicus:theme', theme);
  }, [theme]);
  const toggle = useCallback(() => setTheme(t => (t === 'light' ? 'dark' : 'light')), []);
  return { theme, toggle };
};

const fetchImages = async () => {
  try {
    if (window.ISPICUS_API_BASE) {
      const res = await fetch(`${window.ISPICUS_API_BASE}/api/images/public`);
      if (!res.ok) throw new Error('Erro ao carregar imagens da API');
      const data = await res.json();
      return data.items || data;
    }
    const res = await fetch('assets/data/sample-images.json');
    return await res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
};

const Tag = ({ value, onClick }) => (
  <button className="tag" onClick={() => onClick?.(value)} aria-label={`Filtrar por ${value}`}>{value}</button>
);

const Card = ({ item, onOpen }) => (
  <article className="card" role="listitem">
    <button className="sr-only" aria-hidden onClick={() => onOpen(item)} tabIndex={-1}>abrir</button>
    <img loading="lazy" src={item.thumb || item.url} alt={item.title} onClick={() => onOpen(item)} />
    <div className="card-body">
      <h3 className="title">{item.title}</h3>
      <div className="muted">por {item.author}</div>
      <div className="tags" aria-label="Tags">
        {(item.tags || []).map(t => <Tag key={t} value={t} onClick={() => onOpen({ ...item, tagClicked: t })} />)}
      </div>
    </div>
  </article>
);

const Lightbox = ({ open, item, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, onPrev, onNext]);

  return (
    <div className={`lightbox-backdrop ${open ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Visualizador de imagem">
      {open && (
        <div className="lightbox">
          <img src={item.url} alt={item.title} />
          <div className="lightbox-footer">
            <div>
              <div className="title">{item.title}</div>
              <div className="muted">por {item.author}</div>
            </div>
            <div className="lightbox-controls">
              <button className="icon-btn" onClick={onPrev} aria-label="Anterior">◀</button>
              <button className="icon-btn" onClick={onNext} aria-label="Próxima">▶</button>
              <button className="icon-btn" onClick={onClose} aria-label="Fechar">✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const useImages = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const data = await fetchImages();
      if (!active) return;
      if (!Array.isArray(data)) setError('Falha ao carregar');
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);
  return { items, setItems, loading, error };
};

const App = () => {
  const { theme, toggle } = useTheme();
  const { items, loading, error } = useImages();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('new');
  const [openIndex, setOpenIndex] = useState(-1);

  const filtered = useMemo(() => {
    let r = items;
    if (query) {
      const q = query.toLowerCase();
      r = r.filter(it =>
        it.title.toLowerCase().includes(q) ||
        (it.author || '').toLowerCase().includes(q) ||
        (it.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (tag) {
      r = r.filter(it => (it.tags || []).includes(tag));
    }
    if (sort === 'new') {
      r = [...r].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sort === 'title') {
      r = [...r].sort((a, b) => a.title.localeCompare(b.title));
    }
    return r;
  }, [items, query, tag, sort]);

  const uniqueTags = useMemo(() => {
    const s = new Set();
    items.forEach(it => (it.tags || []).forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, [items]);

  const openAt = useCallback((idx) => setOpenIndex(idx), []);
  const close = useCallback(() => setOpenIndex(-1), []);
  const next = useCallback(() => setOpenIndex(i => (i + 1) % filtered.length), [filtered.length]);
  const prev = useCallback(() => setOpenIndex(i => (i - 1 + filtered.length) % filtered.length), [filtered.length]);

  useEffect(() => {
    if (openIndex >= filtered.length) setOpenIndex(filtered.length - 1);
  }, [filtered.length, openIndex]);

  return (
    <div>
      <header className="header container">
        <div className="brand">
          <div className="brand-badge" aria-hidden></div>
          <h1>IsPicUs</h1>
        </div>
        <div className="controls">
          <input className="input" placeholder="Buscar por título, autor, tags" value={query} onChange={e => setQuery(e.target.value)} aria-label="Buscar" />
          <select className="select" value={tag} onChange={e => setTag(e.target.value)} aria-label="Filtrar por tag">
            <option value="">Todas as tags</option>
            {uniqueTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="select" value={sort} onChange={e => setSort(e.target.value)} aria-label="Ordenar">
            <option value="new">Mais recentes</option>
            <option value="title">Título (A-Z)</option>
          </select>
          <button className="button" onClick={toggle} aria-label="Alternar tema">
            {theme === 'light' ? '🌙 Escuro' : '🌞 Claro'}
          </button>
          <a className="button primary" href="#login" onClick={(e) => { if (!window.ISPICUS_API_BASE) { e.preventDefault(); alert('Modo visitante no GitHub Pages. Conecte uma API para habilitar login.'); } }}>Entrar</a>
        </div>
      </header>

      <main className="container" role="main">
        {loading && <p className="muted">Carregando imagens…</p>}
        {error && <p className="muted">Erro: {String(error)}</p>}
        {!loading && !filtered.length && <p className="muted">Nenhuma imagem encontrada.</p>}
        <section className="grid" role="list" aria-label="Galeria de imagens">
          {filtered.map((item, idx) => (
            <Card key={item.id || idx} item={item} onOpen={() => openAt(idx)} />
          ))}
        </section>
      </main>

      <footer className="footer container">© {new Date().getFullYear()} IsPicUs — Modo visitante</footer>

      <Lightbox
        open={openIndex >= 0 && filtered[openIndex]}
        item={filtered[openIndex] || {}}
        onClose={close}
        onPrev={prev}
        onNext={next}
      />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

