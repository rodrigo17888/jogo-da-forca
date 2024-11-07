// api/ranking.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://mnakiqkfkuqdnlsvipyq.supabase.co", // URL do Supabase
  "your-anon-key" // Chave de API pública
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Consulta o ranking do banco de dados
      const { data, error } = await supabase
        .from("ranking")
        .select("*")
        .order("pontuacao", { ascending: false }); // Ordena pela pontuação

      if (error) {
        throw new Error(error.message);
      }

      res.status(200).json(data);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erro ao carregar o ranking", details: error.message });
    }
  } else {
    res.status(405).json({ message: "Método não permitido" });
  }
}
