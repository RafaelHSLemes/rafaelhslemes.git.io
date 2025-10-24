(function () {
  const elText = document.getElementById('text');
  const elAuthor = document.getElementById('author');
  const btnNext = document.getElementById('btn-next');
  const btnX = document.getElementById('btn-x');
  const btnLi = document.getElementById('btn-li');
  const elStatus = document.getElementById('status');

  const localQuotes = [
    { text: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson' },
    { text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', author: 'Martin Fowler' },
    { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
    { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
    { text: 'Premature optimization is the root of all evil.', author: 'Donald Knuth' }
  ];

  const endpoints = [
    '/api/quote',        // Node (Express)
    '/quote/random'      // Spring Boot
  ];

  function status(msg) {
    elStatus.textContent = msg;
  }

  function randomLocalQuote() {
    const i = Math.floor(Math.random() * localQuotes.length);
    return localQuotes[i];
  }

  function animate() {
    elText.classList.remove('fade');
    elAuthor.classList.remove('fade');
    void elText.offsetWidth; // reflow
    elText.classList.add('fade');
    elAuthor.classList.add('fade');
  }

  function setBackground() {
    const hues = [200, 260, 320, 20, 160];
    const h1 = hues[Math.floor(Math.random() * hues.length)];
    const h2 = hues[Math.floor(Math.random() * hues.length)];
    document.body.style.background = `radial-gradient(1200px 800px at 10% 10%, hsl(${h1} 90% 45%) 0%, transparent 60%),`+
      `radial-gradient(1200px 800px at 90% 90%, hsl(${h2} 90% 50%) 0%, transparent 60%), #0b1220`;
  }

  async function fetchWithTimeout(url, ms = 1500) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (data && data.text && data.author) return data;
      throw new Error('Invalid payload');
    } finally {
      clearTimeout(id);
    }
  }

  async function getQuote() {
    status('Buscando frase...');
    for (const url of endpoints) {
      try {
        const q = await fetchWithTimeout(url);
        status('OK (API)');
        return q;
      } catch (_) {
        // try next
      }
    }
    status('Usando fallback local');
    return randomLocalQuote();
  }

  function renderQuote(q) {
    elText.textContent = q.text;
    elAuthor.textContent = q.author ? '— ' + q.author : '';
    animate();
    setBackground();
  }

  function currentQuote() {
    return { text: elText.textContent || '', author: (elAuthor.textContent || '').replace(/^\u2014\s*/, '') };
  }

  function shareOnX() {
    const q = currentQuote();
    const text = q.author ? `${q.text} — ${q.author}` : q.text;
    const url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
  }

  function shareOnLinkedIn() {
    const q = currentQuote();
    const text = q.author ? `${q.text} — ${q.author}` : q.text;
    // LinkedIn feed with prefilled text (best effort)
    const url = 'https://www.linkedin.com/feed/?shareActive=true&text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
  }

  btnNext.addEventListener('click', async () => {
    btnNext.disabled = true;
    try {
      const q = await getQuote();
      renderQuote(q);
    } finally {
      btnNext.disabled = false;
    }
  });

  btnX.addEventListener('click', shareOnX);
  btnLi.addEventListener('click', shareOnLinkedIn);

  // First quote
  renderQuote(randomLocalQuote());
})();

