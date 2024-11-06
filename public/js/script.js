let palavraSecretaCategoria;
let palavraSecretaSorteada;

let listaDinamica = [];
let tentativas = 6;
let jogarNovamente = true;

let listaDePalavras = [];
let pontuacaoUsuario = 0; // Inicializa a pontuação

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

    enviarPontuacao(
      localStorage.getItem("nomeUsuario"),
      pontuacaoUsuario, // Certifique-se de que esse valor está correto
      palavraSecretaCategoria
    );
    // Passa a categoria
    abreModal(
      "PARABÉNS",
      `<p style='color: GREEN; font-weight: bold; font-size: 20px;'>VOCÊ ACERTOU A PALAVRA</p>`
    );
    tentativas = 0;
    piscarBtnJogarNovamente();
  }
}

async function piscarBtnJogarNovamente() {
  while (jogarNovamente === true) {
    document.getElementById("reiniciar").style.backgroundColor = "#2BDC00";
    await atraso(500);
    document.getElementById("reiniciar").style.backgroundColor = "#A7DC38";
    await atraso(500);
  }
}

async function atraso(tempo) {
  return new Promise((x) => setTimeout(x, tempo));
}

function carregarImagemForca() {
  switch (tentativas) {
    case 5:
      document.getElementById("imagem").style.background =
        "url('./img/forca01.png')";
      break;
    case 4:
      document.getElementById("imagem").style.background =
        "url('./img/forca02.png')";
      break;
    case 3:
      document.getElementById("imagem").style.background =
        "url('./img/forca03.png')";
      break;
    case 2:
      document.getElementById("imagem").style.background =
        "url('./img/forca04.png')";
      break;
    case 1:
      document.getElementById("imagem").style.background =
        "url('./img/forca05.png')";
      break;
    case 0:
      document.getElementById("imagem").style.background =
        "url('./img/forca06.png')";
      break;
    default:
      document.getElementById("imagem").style.background =
        "url('./img/forca.png')";
  }
}

function abreModal(titulo, mensagem) {
  let modalTitulo = document.getElementById("exampleModalLabel");
  let modalBody = document.getElementById("modalBody");
  modalTitulo.innerText = titulo;
  modalBody.innerHTML = mensagem;

  $("#myModal").modal({
    show: true,
  });
}

async function enviarPontuacao(nome, pontuacao) {
  try {
    const response = await fetch("http://localhost:3000/atualizar-pontuacao", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome, acertos: pontuacao }), // Envia a pontuação
    });

    const data = await response.text();
    console.log(data); // Loga a resposta do servidor
  } catch (error) {
    console.error("Erro ao enviar pontuação:", error);
  }
}

async function carregarRanking() {
  try {
    const response = await fetch("http://localhost:3000/ranking");
    const ranking = await response.json();
    // Aqui você pode manipular o DOM para exibir os dados do ranking
    const rankingLista = document.getElementById("rankingLista");
    ranking.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.nome}: ${item.pontuacao} pontos - Categoria: ${item.categoria}`;
      rankingLista.appendChild(li);
    });
  } catch (error) {
    console.error("Erro ao carregar o ranking:", error);
  }
}

document.addEventListener("DOMContentLoaded", carregarRanking);

function irParaRanking() {
  window.location.href = "ranking.html";
}

function irParaDuvidas() {
  window.location.href = "duvidas.html";
}

function cadastrarUsuario(nome) {
  localStorage.setItem("nomeUsuario", nome);
  fetch("http://localhost:3000/cadastrar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome: nome }), // Envia o nome do usuário
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao cadastrar usuário");
      }
      return response.text();
    })
    .then((message) => {
      console.log(message); // Exibe a mensagem de sucesso
      window.location.href = "jogo.html"; // Redireciona para o jogo
    })
    .catch((error) => {
      console.error(error); // Lida com erros
      window.location.href = "jogo.html"; // Redireciona para o jogo se já estiver cadastrado
    });
}

fetch("http://localhost:3000/cadastrar", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ nome: nomeDoUsuario }), // Substitua pelo nome do usuário
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("Erro ao cadastrar usuário");
    }
    return response.text();
  })
  .then((message) => {
    console.log(message); // Exibe a mensagem de sucesso
    // Redirecionar para o jogo ou carregar o jogo aqui
  })
  .catch((error) => {
    console.error(error); // Lida com erros
  });
