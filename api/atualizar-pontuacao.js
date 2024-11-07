// api/atualizar-pontuacao.js

import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase
const supabase = createClient(
  "https://mnakiqkfkuqdnlsvipyq.supabase.co", // URL do Supabase
  "your-anon-key" // Chave de API pública (anon key)
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { nome, acertos } = req.body;

    try {
      // Insere os dados no banco de dados
      const { data, error } = await supabase
        .from("ranking")
        .insert([{ nome, pontuacao: acertos }]);

      if (error) {
        throw new Error(error.message);
      }

      res.status(200).json({ message: "Pontuação salva com sucesso!" });
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Erro ao atualizar a pontuação",
          details: error.message,
        });
    }
  } else {
    res.status(405).json({ message: "Método não permitido" });
  }
}
