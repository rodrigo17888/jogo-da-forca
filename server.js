const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Permite requisições de outros domínios
app.use(bodyParser.json()); // Middleware para ler JSON

// Configuração da conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: "localhost", // Altere para o seu host
  user: "root", // Altere para o seu usuário do MySQL
  password: "rodrigolopes", // Altere para a sua senha do MySQL
  database: "jogo_forca", // Altere para o seu banco de dados
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    process.exit(1); // Encerra o processo se a conexão falhar
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

  console.log("Cadastro recebido:", req.body); // Verifique os dados recebidos

  if (!nome) {
    return res.status(400).send("Nome é obrigatório");
  }

  // Verifica se o usuário já existe
  const checkUserQuery = "SELECT * FROM usuarios WHERE nome = ?";
  db.query(checkUserQuery, [nome], (err, results) => {
    if (err) {
      console.error("Erro ao verificar usuário:", err);
      return res.status(500).send("Erro ao verificar usuário: " + err.message);
    }

    if (results.length > 0) {
      // Usuário já existe, você pode apenas enviar uma resposta
      return res.send("Usuário já cadastrado");
    } else {
      // Caso o usuário não exista, insira-o
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

  // Primeiro, busca a pontuação atual do usuário
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
      currentScore = results[0].pontuacao; // Pontuação atual do usuário
    }

    // Calcula a nova pontuação
    const newScore = currentScore + acertos;

    // Atualiza a pontuação no banco de dados
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
