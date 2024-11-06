// api/jogo.js
const { Client } = require("pg");
const cors = require("cors");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

module.exports = async (req, res) => {
  // Habilitar CORS
  cors()(req, res, async () => {
    if (req.method === "GET") {
      const query = "SELECT * FROM ranking ORDER BY pontuacao DESC";
      try {
        const results = await client.query(query);
        res.status(200).json(results.rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    } else if (req.method === "POST") {
      const { nome, acertos } = req.body;
      if (!nome || acertos === undefined) {
        return res.status(400).send("Nome e acertos são obrigatórios.");
      }

      const getCurrentScoreQuery =
        "SELECT pontuacao FROM ranking WHERE nome = $1";
      try {
        const results = await client.query(getCurrentScoreQuery, [nome]);
        let currentScore = 0;
        if (results.rows.length > 0) {
          currentScore = results.rows[0].pontuacao;
        }
        const newScore = currentScore + acertos;

        const sql =
          "INSERT INTO ranking (nome, pontuacao) VALUES ($1, $2) ON CONFLICT (nome) DO UPDATE SET pontuacao = EXCLUDED.pontuacao";
        await client.query(sql, [nome, newScore]);
        res.status(200).send("Pontuação atualizada com sucesso!");
      } catch (err) {
        res.status(500).send("Erro ao atualizar pontuação: " + err.message);
      }
    }
  });
};
