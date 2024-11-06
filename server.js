require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuração da conexão com o banco de dados MySQL usando variáveis de ambiente
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    process.exit(1);
  }
  console.log("Conectado ao banco de dados!");
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Rota para cadastrar usuários
app.post("/cadastrar", (req, res) => {
  const { nome } = req.body;

  console.log("Cadastro recebido:", req.body);

  if (!nome) {
    return res.status(400).send("Nome é obrigatório");
  }

  const checkUserQuery = "SELECT * FROM usuarios WHERE nome = ?";
  db.query(checkUserQuery, [nome], (err, results) => {
    if (err) {
      console.error("Erro ao verificar usuário:", err);
      return res.status(500).send("Erro ao verificar usuário: " + err.message);
    }

    if (results.length > 0) {
      return res.send("Usuário já cadastrado");
    } else {
      const sql = "INSERT INTO usuarios (nome) VALUES (?)";
      db.query(sql, [nome], (err, result) => {
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
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao obter ranking:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post("/atualizar-pontuacao", (req, res) => {
  const { nome, acertos } = req.body;

  if (!nome || acertos === undefined) {
    return res.status(400).send("Nome e acertos são obrigatórios.");
  }

  const getCurrentScoreQuery = "SELECT pontuacao FROM ranking WHERE nome = ?";
  db.query(getCurrentScoreQuery, [nome], (err, results) => {
    if (err) {
      console.error("Erro ao obter pontuação atual:", err);
      return res
        .status(500)
        .send("Erro ao obter pontuação atual: " + err.message);
    }

    let currentScore = 0;
    if (results.length > 0) {
      currentScore = results[0].pontuacao;
    }

    const newScore = currentScore + acertos;

    const sql =
      "INSERT INTO ranking (nome, pontuacao) VALUES (?, ?) ON DUPLICATE KEY UPDATE pontuacao = ?";
    db.query(sql, [nome, newScore, newScore], (err, result) => {
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
