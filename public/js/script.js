let palavraSecretaCategoria;
let palavraSecretaSorteada;

let listaDinamica = [];
let tentativas = 6;
let jogarNovamente = true;

let listaDePalavras = [];
let pontuacaoUsuario = 0;

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
  let palavrasAcertadas =
    JSON.parse(localStorage.getItem("palavrasAcertadas")) || [];

  let palavrasDisponiveis = listaDePalavras.filter(
    (palavra) => !palavrasAcertadas.includes(palavra.nome)
  );

  if (palavrasDisponiveis.length === 0) {
    localStorage.removeItem("palavrasAcertadas");
    palavrasAcertadas = [];
    palavrasDisponiveis = listaDePalavras;
  }

  const indexPalavra = parseInt(Math.random() * palavrasDisponiveis.length);
  const palavraSelecionada = palavrasDisponiveis[indexPalavra];

  palavraSecretaSorteada = palavraSelecionada.nome;
  palavraSecretaCategoria = palavraSelecionada.categoria;
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
    const categoriaPontuacao =
      palavraSecretaCategoria === "NOME DE PESSOA" ||
      palavraSecretaCategoria === "TIME DE FUTEBOL" ||
      palavraSecretaCategoria === "NOVELA" ||
      palavraSecretaCategoria === "JOGADOR" ||
      palavraSecretaCategoria === "PROGRAMA DE TV" ||
      palavraSecretaCategoria === "DESENHO ANIMADO"
        ? 10
        : 5;
    pontuacaoUsuario += categoriaPontuacao;

    enviarPontuacao(
      localStorage.getItem("nomeUsuario"),
      pontuacaoUsuario,
      palavraSecretaCategoria
    );
    abreModal(
      "PARABÉNS",
      `<p style='color: GREEN; font-weight: bold; font-size: 20px;'>VOCÊ ACERTOU A PALAVRA</p>`
    );
    tentativas = 0;
    piscarBtnJogarNovamente();
    marcarPalavraComoAcertada();
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

function marcarPalavraComoAcertada() {
  let palavrasAcertadas =
    JSON.parse(localStorage.getItem("palavrasAcertadas")) || [];
  if (!palavrasAcertadas.includes(palavraSecretaSorteada)) {
    palavrasAcertadas.push(palavraSecretaSorteada);
    localStorage.setItem(
      "palavrasAcertadas",
      JSON.stringify(palavrasAcertadas)
    );
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
    const response = await fetch(
      `https://eliwdfrelzhtzdagibno.supabase.co/rest/v1/ranking?nome=eq.${nome}`,
      {
        method: "GET",
        headers: {
          apikey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaXdkZnJlbHpodHpkYWdpYm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MzA4MjMsImV4cCI6MjA0NjUwNjgyM30.CMuNNsTc8uufiKpccAv4-n5AdTdij8bccX7Gbh6HsjU",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaXdkZnJlbHpodHpkYWdpYm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MzA4MjMsImV4cCI6MjA0NjUwNjgyM30.CMuNNsTc8uufiKpccAv4-n5AdTdij8bccX7Gbh6HsjU",
        },
      }
    );

    const existingData = await response.json();

    if (existingData.length > 0) {
      const novaPontuacao = existingData[0].pontuacao + pontuacao;

      const updateResponse = await fetch(
        `https://eliwdfrelzhtzdagibno.supabase.co/rest/v1/ranking?nome=eq.${nome}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaXdkZnJlbHpodHpkYWdpYm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MzA4MjMsImV4cCI6MjA0NjUwNjgyM30.CMuNNsTc8uufiKpccAv4-n5AdTdij8bccX7Gbh6HsjU",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaXdkZnJlbHpodHpkYWdpYm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MzA4MjMsImV4cCI6MjA0NjUwNjgyM30.CMuNNsTc8uufiKpccAv4-n5AdTdij8bccX7Gbh6HsjU",
          },
          body: JSON.stringify({
            pontuacao: novaPontuacao,
          }),
        }
      );

      if (!updateResponse.ok) {
        const updateError = await updateResponse.json();
        throw new Error(
          `Erro ao atualizar pontuação: ${JSON.stringify(updateError)}`
        );
      }

      console.log("Pontuação atualizada com sucesso!");
    } else {
      const insertResponse = await fetch(
        "https://eliwdfrelzhtzdagibno.supabase.co/rest/v1/ranking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaXdkZnJlbHpodHpkYWdpYm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MzA4MjMsImV4cCI6MjA0NjUwNjgyM30.CMuNNsTc8uufiKpccAv4-n5AdTdij8bccX7Gbh6HsjU",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaXdkZnJlbHpodHpkYWdpYm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MzA4MjMsImV4cCI6MjA0NjUwNjgyM30.CMuNNsTc8uufiKpccAv4-n5AdTdij8bccX7Gbh6HsjU",
          },
          body: JSON.stringify({
            nome: nome,
            pontuacao: pontuacao,
          }),
        }
      );

      if (!insertResponse.ok) {
        const insertError = await insertResponse.json();
        throw new Error(
          `Erro ao enviar pontuação: ${JSON.stringify(insertError)}`
        );
      }

      console.log("Pontuação enviada com sucesso!");
    }
  } catch (error) {
    console.error("Erro ao processar pontuação:", error);
  }
}

async function carregarRanking() {
  try {
    const response = await fetch(
      "https://eliwdfrelzhtzdagibno.supabase.co/rest/v1/ranking",
      {
        method: "GET",
        headers: {
          apikey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaXdkZnJlbHpodHpkYWdpYm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MzA4MjMsImV4cCI6MjA0NjUwNjgyM30.CMuNNsTc8uufiKpccAv4-n5AdTdij8bccX7Gbh6HsjU",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaXdkZnJlbHpodHpkYWdpYm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MzA4MjMsImV4cCI6MjA0NjUwNjgyM30.CMuNNsTc8uufiKpccAv4-n5AdTdij8bccX7Gbh6HsjU",
        },
      }
    );
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
    body: JSON.stringify({ nome: nome }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao cadastrar usuário");
      }
      return response.text();
    })
    .then((message) => {
      console.log(message);
      window.location.href = "jogo.html";
    })
    .catch((error) => {
      console.error(error);
      window.location.href = "jogo.html";
    });
}
