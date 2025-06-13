import express from 'express';
import pool from './db.js';
import dotenv from "dotenv"
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import abrigosRoutes from './src/routes/abrigosRoutes.js';
dotenv.config()
const app = express();

app.use(express.json());
abrigosRoutes(app);

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-2.0-flash'), // set default model
});

//Liberando acesso a todos os domínios para testar localmente
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
