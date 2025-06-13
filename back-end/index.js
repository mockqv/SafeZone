import express from 'express';
import pool from './db.js';
import dotenv from "dotenv"
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
dotenv.config()
const app = express();

app.use(express.json());

const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-2.0-flash'), // set default model
});

const abrigoTemplate = {
  nome: "Abrigo Exemplo",
  endereco: "Rua das Flores, 123",
  tipo: "Temporário",
  capacidade: 100,
  recursos: "Água, alimentos, primeiros socorros",
  latitude: -30.1234,
  longitude: -51.2345
};

//Liberando acesso a todos os domínios para testar localmente
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// app.get('/abrigos', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM abrigos ORDER BY nome');
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ erro: 'Erro ao buscar abrigos' });
//   }
// });

app.get('/getAbrigos', async (req, res) => {
  try {
    const { text } = await ai.generate(`Por favor envie os abrigos localizados no brasil para abrigar pessoas quando há eventos climáticos de alta intensidade, apenas em formato de array de objeto como esse ${abrigoTemplate}! APENAS MANDE O ARRAY DE OBJETOS NADA MAIS, TODOS OS CAMPOS SÃO DE EXTREMA IMPORTANCIA, NÃO SE ESQUEÇA DE NENHUM`);

    const cleanedResponse = text
    .replace(/^```json\n/, '')
    .replace(/\n```$/, '')

    const response = JSON.parse(cleanedResponse)
    res.status(200).send(response)
    // return(text)

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar abrigos' });
  }
})

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
