let palavraSecretaCategoria;
let palavraSecretaSorteada;

let listaDinamica = [];
let tentativas = 6;
let jogarNovamente = true;

let listaDePalavras = [];
let pontuacaoUsuario = 0; // Inicializa a pontuação

// Inicialização do Supabase
const supabaseUrl = "https://eliwdfrelzhtzdagibno.supabase.co"; // URL do Supabase
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaXdkZnJlbHpodHpkYWdpYm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MzA4MjMsImV4cCI6MjA0NjUwNjgyM30.CMuNNsTc8uufiKpccAv4-n5AdTdij8bccX7Gbh6HsjU"; // Sua chave de API do Supabase
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function carregarPalavras() {
  try {
    const resposta = await fetch("palavras.json");
    listaDePalavras = await resposta.json();
    criarPalavraSecreta();
    montarPalavraNaTela();
  } catch (erro) {
    console.error("Erro ao carregar o JSON:", erro);
  }
}

function criarPalavraSecreta() {
  const indexPalavra = parseInt(Math.random() * listaDePalavras.length);
  palavraSecretaSorteada = listaDePalavras[indexPalavra].nome;
  palavraSecretaCategoria = listaDePalavras[indexPalavra].categoria;
  listaDePalavras.splice(indexPalavra, 1); // Remove a palavra sorteada para evitar repetição
}

carregarPalavras();

function montarPalavraNaTela() {
  const categoria = document.getElementById("categoria");
  const palavraTela = document.getElementById("palavra-secreta");

  categoria.innerHTML = palavraSecretaCategoria;
  palavraTela.innerHTML = "";

  for (let i = 0; i < palavraSecretaSorteada.length; i++) {
    if (listaDinamica[i] === undefined) {
      if (palavraSecretaSorteada[i] === " ") {
        listaDinamica[i] = " ";
        palavraTela.innerHTML +=
          "<div class='letrasEspaco'>" + listaDinamica[i] + "</div>";
      } else {
        listaDinamica[i] = "&nbsp;";
        palavraTela.innerHTML +=
          "<div class='letras'>" + listaDinamica[i] + "</div>";
      }
    } else {
      if (palavraSecretaSorteada[i] === " ") {
        listaDinamica[i] = " ";
        palavraTela.innerHTML +=
          "<div class='letrasEspaco'>" + listaDinamica[i] + "</div>";
      } else {
        palavraTela.innerHTML +=
          "<div class='letras'>" + listaDinamica[i] + "</div>";
      }
    }
  }
}

function verificaLetraEscolhida(letra) {
  document.getElementById("tecla-" + letra).disabled = true;
  if (tentativas > 0) {
    mudarStyleLetra("tecla-" + letra, false);
    comparaListas(letra);
    montarPalavraNaTela();
  }
}

function mudarStyleLetra(tecla, condicao) {
  if (condicao == false) {
    document.getElementById(tecla).style.background = "#ff0000";
    document.getElementById(tecla).style.color = "#ffffff";
  } else {
    document.getElementById(tecla).style.background = "#008000";
    document.getElementById(tecla).style.color = "#ffffff";
  }
}

async function comparaListas(letra) {
  const posicao = palavraSecretaSorteada.indexOf(letra);
  if (posicao < 0) {
    tentativas--;
    carregarImagemForca();

    if (tentativas === 0) {
      abreModal(
        "OPS!",
        "Não foi dessa vez ... A palavra secreta era: <br> <br> <br>" +
          `<p style='color: red; font-weight: bold; font-size: 20px;'>${palavraSecretaSorteada}</p>`
      );
      piscarBtnJogarNovamente();
    }
  } else {
    mudarStyleLetra("tecla-" + letra, true);
    for (let i = 0; i < palavraSecretaSorteada.length; i++) {
      if (palavraSecretaSorteada[i] === letra) {
        listaDinamica[i] = letra;
      }
    }
  }

  let vitoria = true;
  for (let i = 0; i < palavraSecretaSorteada.length; i++) {
    if (palavraSecretaSorteada[i] !== listaDinamica[i]) {
      vitoria = false;
    }
  }

  if (vitoria) {
    // Definindo a lógica da pontuação baseada na categoria
    const categoriaPontuacao =
      palavraSecretaCategoria === "NOME DE PESSOA" ||
      palavraSecretaCategoria === "TIME DE FUTEBOL" ||
      palavraSecretaCategoria === "NOVELA"
        ? 15
        : 5;
    pontuacaoUsuario += categoriaPontuacao; // Ajusta a lógica da pontuação conforme necessário

    // Envia a pontuação ao Supabase
    try {
      const { data, error } = await supabase
        .from("ranking")
        .upsert([
          {
            nome: localStorage.getItem("nomeUsuario"),
            pontuacao: pontuacaoUsuario,
            categoria: palavraSecretaCategoria,
          },
        ]);

      if (error) {
        throw error;
      }

      console.log("Pontuação enviada com sucesso:", data);
    } catch (error) {
      console.error("Erro ao enviar pontuação:", error);
    }

    abreModal(
      "PARABÉNS",
      `<p style='color: GREEN; font-weight: bold; font-size: 20px;'>VOCÊ ACERTOU A PALAVRA</p>`
    );
    tentativas = 0;
    piscarBtnJogarNovamente();
  }
}

// A função para carregar o ranking
async function carregarRanking() {
  try {
    const { data: ranking, error } = await supabase
      .from("ranking") // Nome da tabela onde as pontuações estão
      .select("nome, pontuacao, categoria")
      .order("pontuacao", { ascending: false }); // Ordenar pela pontuação (de maior para menor)

    if (error) {
      throw error;
    }

    // Exibir os dados no frontend
    const rankingLista = document.getElementById("rankingLista");
    ranking.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.nome}: ${item.pontuacao} pontos - Categoria: ${item.categoria}`;
      rankingLista.appendChild(li);
    });
  } catch (error) {
    console.error("Erro ao carregar ranking:", error);
  }
}

// Função para cadastrar o usuário (já com verificação para evitar cadastro duplicado)
async function cadastrarUsuario(nomeUsuario) {
  if (!nomeUsuario) {
    alert("Por favor, insira seu nome!");
    return;
  }

  localStorage.setItem("nomeUsuario", nomeUsuario); // Salva o nome no localStorage
  const { data, error } = await supabase
    .from("usuarios")
    .upsert([{ nome: nomeUsuario }]);

  if (error) {
    console.error("Erro ao cadastrar o usuário:", error);
  } else {
    window.location.href = "jogo.html";
  }
}
