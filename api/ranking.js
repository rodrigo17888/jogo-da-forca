// api/ranking.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://eliwdfrelzhtzdagibno.supabase.co", // URL do Supabase corrigida
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaXdkZnJlbHpodHpkYWdpYm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MzA4MjMsImV4cCI6MjA0NjUwNjgyM30.CMuNNsTc8uufiKpccAv4-n5AdTdij8bccX7Gbh6HsjU"
);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase.from("ranking").select("*");

    if (error) {
      res
        .status(500)
        .json({ error: "Erro ao carregar o ranking", details: error });
      return;
    }

    res.status(200).json(data);
  } else {
    res.status(405).json({ message: "Método não permitido" });
  }
}
