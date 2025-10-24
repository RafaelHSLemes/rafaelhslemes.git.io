import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const quotes = [
  { text: 'O código é como humor. Quando você precisa explicá-lo, é ruim.', author: 'Cory House' },
  { text: 'Programadores e artistas são os únicos profissionais que têm como hobby o próprio trabalho.', author: 'Rasmus Lerdorf' },
  { text: 'Simplicidade é a alma da eficiência.', author: 'Austin Freeman' },
  { text: 'Qualquer tolo pode escrever código que um computador entende. Bons programadores escrevem código que humanos entendem.', author: 'Martin Fowler' },
  { text: 'Primeiro, resolva o problema. Depois, escreva o código.', author: 'John Johnson' },
  { text: 'Antes de otimizar, meça.', author: 'Donald Knuth' },
  { text: 'A única maneira de ir rápido, é ir bem.', author: 'Robert C. Martin' }
];

function randomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

app.get('/api/quote', (req, res) => {
  res.json(randomQuote());
});

app.get('/', (_req, res) => {
  res.type('text/plain').send('DevQuotes Node API. Use GET /api/quote');
});

app.listen(PORT, () => {
  console.log(`DevQuotes Node API ouvindo em http://localhost:${PORT}`);
});

