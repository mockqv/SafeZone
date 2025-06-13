import { ai } from "../../index.js";

// app.get('/abrigos', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM abrigos ORDER BY nome');
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ erro: 'Erro ao buscar abrigos' });
//   }
// });

const abrigoTemplate = {
    nome: "Abrigo Exemplo",
    endereco: "Rua das Flores, 123",
    tipo: "Temporário",
    capacidade: 100,
    recursos: "Água, alimentos, primeiros socorros",
    latitude: -30.1234,
    longitude: -51.2345
};

export default async function getAbrigosController(req, res){
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
};