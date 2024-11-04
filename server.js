const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Permite requisições de outros domínios
app.use(bodyParser.json()); // Middleware para ler JSON

// Configuração da conexão com o Supabase
const supabaseUrl = "https://mnakiqkfkuqdnlsvipyq.supabase.co"; // Altere para o seu URL do Supabase
const supabaseKey = process.env.SUPABASE_KEY; // Altere para sua chave anônima do Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Rota para cadastrar usuários
app.post("/cadastrar", async (req, res) => {
  const { nome } = req.body;

  console.log("Cadastro recebido:", req.body); // Verifique os dados recebidos

  if (!nome) {
    return res.status(400).send("Nome é obrigatório");
  }

  // Verifica se o usuário já existe
  const { data: existingUser, error: userError } = await supabase
    .from("usuarios")
    .select("*")
    .eq("nome", nome);

  if (userError) {
    console.error("Erro ao verificar usuário:", userError);
    return res
      .status(500)
      .send("Erro ao verificar usuário: " + userError.message);
  }

  if (existingUser.length > 0) {
    // Usuário já existe
    return res.send("Usuário já cadastrado");
  } else {
    // Caso o usuário não exista, insira-o
    const { error: insertError } = await supabase
      .from("usuarios")
      .insert([{ nome }]);

    if (insertError) {
      console.error("Erro ao cadastrar usuário:", insertError);
      return res
        .status(500)
        .send("Erro ao cadastrar usuário: " + insertError.message);
    }
    res.send("Usuário cadastrado com sucesso");
  }
});

// Rota para obter ranking
app.get("/ranking", async (req, res) => {
  const { data, error } = await supabase
    .from("ranking")
    .select("*")
    .order("pontuacao", { ascending: false });

  if (error) {
    console.error("Erro ao obter ranking:", error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

app.post("/atualizar-pontuacao", async (req, res) => {
  const { nome, acertos } = req.body;

  if (!nome || acertos === undefined) {
    return res.status(400).send("Nome e acertos são obrigatórios.");
  }

  // Primeiro, busca a pontuação atual do usuário
  const { data: existingScore, error: scoreError } = await supabase
    .from("ranking")
    .select("pontuacao")
    .eq("nome", nome);

  if (scoreError) {
    console.error("Erro ao obter pontuação atual:", scoreError);
    return res
      .status(500)
      .send("Erro ao obter pontuação atual: " + scoreError.message);
  }

  let currentScore = 0;
  if (existingScore.length > 0) {
    currentScore = existingScore[0].pontuacao; // Pontuação atual do usuário
  }

  // Calcula a nova pontuação
  const newScore = currentScore + acertos;

  // Atualiza a pontuação no banco de dados
  const { error: updateError } = await supabase
    .from("ranking")
    .upsert([{ nome, pontuacao: newScore }], { onConflict: ["nome"] });

  if (updateError) {
    console.error("Erro ao atualizar pontuação:", updateError);
    return res
      .status(500)
      .send("Erro ao atualizar pontuação: " + updateError.message);
  }
  res.send("Pontuação atualizada com sucesso!");
});
