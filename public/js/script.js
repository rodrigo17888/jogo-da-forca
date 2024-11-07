let palavraSecretaCategoria;
let palavraSecretaSorteada;

let listaDinamica = [];
let tentativas = 6;
let jogarNovamente = true;

let listaDePalavras = [];
let pontuacaoUsuario = 0;

// Função para carregar as palavras do arquivo JSON
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

// Seleciona uma palavra secreta aleatória e define a categoria
function criarPalavraSecreta() {
  const indexPalavra = parseInt(Math.random() * listaDePalavras.length);
  palavraSecretaSorteada = listaDePalavras[indexPalavra].nome;
  palavraSecretaCategoria = listaDePalavras[indexPalavra].categoria;
}

carregarPalavras();

// Exibe a palavra na tela com espaços para letras
function montarPalavraNaTela() {
  const categoria = document.getElementById("categoria");
  const palavraTela = document.getElementById("palavra-secreta");

  categoria.innerHTML = palavraSecretaCategoria;
  palavraTela.innerHTML = "";

  for (let i = 0; i < palavraSecretaSorteada.length; i++) {
    if (!listaDinamica[i]) {
      listaDinamica[i] = palavraSecretaSorteada[i] === " " ? " " : "&nbsp;";
    }
    const classe =
      palavraSecretaSorteada[i] === " " ? "letrasEspaco" : "letras";
    palavraTela.innerHTML += `<div class='${classe}'>${listaDinamica[i]}</div>`;
  }
}

// Verifica se a letra escolhida está correta
function verificaLetraEscolhida(letra) {
  document.getElementById(`tecla-${letra}`).disabled = true;
  if (tentativas > 0) {
    mudarStyleLetra(`tecla-${letra}`, false);
    comparaListas(letra);
    montarPalavraNaTela();
  }
}

// Atualiza o estilo da letra escolhida
function mudarStyleLetra(tecla, condicao) {
  const estilo = condicao
    ? { background: "#008000", color: "#ffffff" }
    : { background: "#ff0000", color: "#ffffff" };
  Object.assign(document.getElementById(tecla).style, estilo);
}

// Verifica se a letra está na palavra e calcula pontuação
async function comparaListas(letra) {
  const posicao = palavraSecretaSorteada.indexOf(letra);
  if (posicao < 0) {
    tentativas--;
    carregarImagemForca();

    if (tentativas === 0) {
      abreModal(
        "OPS!",
        `Não foi dessa vez... A palavra secreta era: <br><p style='color: red; font-weight: bold; font-size: 20px;'>${palavraSecretaSorteada}</p>`
      );
      piscarBtnJogarNovamente();
    }
  } else {
    mudarStyleLetra(`tecla-${letra}`, true);
    for (let i = 0; i < palavraSecretaSorteada.length; i++) {
      if (palavraSecretaSorteada[i] === letra) listaDinamica[i] = letra;
    }
  }

  const vitoria = listaDinamica.join("") === palavraSecretaSorteada;
  if (vitoria) {
    const categoriaPontuacao = [
      "NOME DE PESSOA",
      "TIME DE FUTEBOL",
      "NOVELA",
    ].includes(palavraSecretaCategoria)
      ? 15
      : 5;
    pontuacaoUsuario += categoriaPontuacao;
    await enviarPontuacao(
      localStorage.getItem("nomeUsuario"),
      pontuacaoUsuario,
      palavraSecretaCategoria
    );
    abreModal(
      "PARABÉNS",
      "<p style='color: GREEN; font-weight: bold; font-size: 20px;'>VOCÊ ACERTOU A PALAVRA</p>"
    );
    tentativas = 0;
    piscarBtnJogarNovamente();
  }
}

// Faz o botão "Jogar Novamente" piscar
async function piscarBtnJogarNovamente() {
  while (jogarNovamente) {
    document.getElementById("reiniciar").style.backgroundColor = "#2BDC00";
    await atraso(500);
    document.getElementById("reiniciar").style.backgroundColor = "#A7DC38";
    await atraso(500);
  }
}

// Cria um atraso de tempo
function atraso(tempo) {
  return new Promise((resolve) => setTimeout(resolve, tempo));
}

// Atualiza a imagem da forca com base nas tentativas
function carregarImagemForca() {
  const imagens = [
    "./img/forca.png",
    "./img/forca01.png",
    "./img/forca02.png",
    "./img/forca03.png",
    "./img/forca04.png",
    "./img/forca05.png",
    "./img/forca06.png",
  ];
  document.getElementById("imagem").style.background = `url('${
    imagens[6 - tentativas]
  }')`;
}

// Exibe o modal com uma mensagem
function abreModal(titulo, mensagem) {
  document.getElementById("exampleModalLabel").innerText = titulo;
  document.getElementById("modalBody").innerHTML = mensagem;
  $("#myModal").modal("show");
}

// Envia a pontuação para a API
async function enviarPontuacao(nome, acertos) {
  try {
    const resposta = await fetch("/api/atualizar-pontuacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, acertos }),
    });
    if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
    console.log("Pontuação salva com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar pontuação:", error);
  }
}

// Carrega o ranking ao carregar a página
async function carregarRanking() {
  try {
    const resposta = await fetch("/api/ranking");
    if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
    const ranking = await resposta.json();
    console.log("Ranking carregado:", ranking);
  } catch (error) {
    console.error("Erro ao carregar o ranking:", error);
  }
}
document.addEventListener("DOMContentLoaded", carregarRanking);

// Redireciona para a página de ranking
function irParaRanking() {
  window.location.href = "ranking.html";
}

// Redireciona para a página de dúvidas
function irParaDuvidas() {
  window.location.href = "duvidas.html";
}

// Cadastra o usuário e redireciona para o jogo
function cadastrarUsuario(nome) {
  localStorage.setItem("nomeUsuario", nome);
  fetch("http://localhost:3000/cadastrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Erro ao cadastrar usuário");
      window.location.href = "jogo.html";
    })
    .catch((error) => {
      console.error(error);
      window.location.href = "jogo.html";
    });
}
