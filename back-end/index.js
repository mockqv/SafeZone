import express from 'express';
import pool from './db.js';
const app = express();

app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });
  
app.get('/abrigos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM abrigos ORDER BY nome');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar abrigos' });
  }
});

app.post('/abrigos', async (req, res) => {
  const { nome, endereco, tipo, capacidade, recursos, latitude, longitude } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO abrigos (nome, endereco, tipo, capacidade, recursos, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nome, endereco, tipo, capacidade, recursos, latitude, longitude]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar abrigo' });
  }
});

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Conectado ao Supabase em: ${result.rows[0].now}`);
  } catch (err) {
    res.status(500).send('Erro na conexão com o banco');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
