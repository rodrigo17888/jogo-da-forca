require("dotenv").config(); // Para carregar as variáveis de ambiente
const express = require("express");
const { Client } = require("pg"); // Biblioteca para conectar ao PostgreSQL
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Para permitir requisições de outras origens
app.use(bodyParser.json()); // Para interpretar o corpo da requisição como JSON

// Configuração da conexão com o banco de dados PostgreSQL do Supabase
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necessário para conexões seguras com o Supabase
  },
});

// Conectar ao banco de dados
client
  .connect()
  .then(() => console.log("Conectado ao banco de dados!"))
  .catch((err) => console.error("Erro ao conectar ao banco de dados:", err));

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Rota para cadastrar usuários
app.post("/cadastrar", (req, res) => {
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).send("Nome é obrigatório");
  }

  const checkUserQuery = "SELECT * FROM usuarios WHERE nome = $1";
  client.query(checkUserQuery, [nome], (err, results) => {
    if (err) {
      console.error("Erro ao verificar usuário:", err);
      return res.status(500).send("Erro ao verificar usuário: " + err.message);
    }

    if (results.rows.length > 0) {
      return res.send("Usuário já cadastrado");
    } else {
      const sql = "INSERT INTO usuarios (nome) VALUES ($1)";
      client.query(sql, [nome], (err, result) => {
        if (err) {
          console.error("Erro ao cadastrar usuário:", err);
          return res
            .status(500)
            .send("Erro ao cadastrar usuário: " + err.message);
        }
        res.send("Usuário cadastrado com sucesso");
      });
    }
  });
});

// Rota para obter ranking
app.get("/ranking", (req, res) => {
  const query = "SELECT * FROM ranking ORDER BY pontuacao DESC";
  client.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao obter ranking:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results.rows);
  });
});

// Rota para atualizar pontuação
app.post("/atualizar-pontuacao", (req, res) => {
  const { nome, acertos } = req.body;

  if (!nome || acertos === undefined) {
    return res.status(400).send("Nome e acertos são obrigatórios.");
  }

  const getCurrentScoreQuery = "SELECT pontuacao FROM ranking WHERE nome = $1";
  client.query(getCurrentScoreQuery, [nome], (err, results) => {
    if (err) {
      console.error("Erro ao obter pontuação atual:", err);
      return res
        .status(500)
        .send("Erro ao obter pontuação atual: " + err.message);
    }

    let currentScore = 0;
    if (results.rows.length > 0) {
      currentScore = results.rows[0].pontuacao;
    }

    const newScore = currentScore + acertos;

    const sql =
      "INSERT INTO ranking (nome, pontuacao) VALUES ($1, $2) ON CONFLICT (nome) DO UPDATE SET pontuacao = EXCLUDED.pontuacao";
    client.query(sql, [nome, newScore], (err, result) => {
      if (err) {
        console.error("Erro ao atualizar pontuação:", err);
        return res
          .status(500)
          .send("Erro ao atualizar pontuação: " + err.message);
      }
      res.send("Pontuação atualizada com sucesso!");
    });
  });
});
