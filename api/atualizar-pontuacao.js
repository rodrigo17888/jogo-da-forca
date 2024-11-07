import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { nome, acertos } = req.body;

    const { data, error } = await supabase
      .from("ranking")
      .insert([{ nome, pontuacao: acertos }]);

    if (error) {
      res
        .status(500)
        .json({ error: "Erro ao atualizar a pontuação", details: error });
      return;
    }

    res.status(200).json({ message: "Pontuação salva com sucesso!" });
  } else {
    res.status(405).json({ message: "Método não permitido" });
  }
}
