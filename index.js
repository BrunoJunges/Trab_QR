const urlParams = new URLSearchParams(window.location.search);
const numeroMesa = urlParams.get('mesa') || '1';
document.getElementById("titulo-comanda").textContent = `Comanda da Mesa ${numeroMesa}`;

const menuItems = [
  { nome: "Hamburguer", preco: 25.00, imagem: "hambúrguer.png", descricao: "Pão artesanal, carne 180g, queijo e salada." },
  { nome: "Pizza", preco: 35.00, imagem: "pizza.png", descricao: "Pizza média, 8 fatias, sabores variados." },
  { nome: "Refrigerante", preco: 6.00, imagem: "refrigerante.png", descricao: "Lata 350ml de refrigerante gelado." },
  { nome: "massa alho e <br> óleo", preco: 22.00, imagem: "massa.png", descricao: "Espaguete ao alho e óleo com toque de pimenta." },
  { nome: "Batata Frita", preco: 15.00, imagem: "batata.png", descricao: "Porção média de batatas fritas crocantes." },
  { nome: "À la Minuta", preco: 28.00, imagem: "minuta.png", descricao: "Prato com arroz, feijão, bife, ovo e salada." }
];

let pedido = [];
let total = 0;

const menuDiv = document.getElementById("menu");
const pedidoUl = document.getElementById("pedido");
const totalSpan = document.getElementById("total");

// Criação dos cards com botão '?'
menuItems.forEach(item => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <button class="info-btn" onclick="mostrarDescricao('${item.nome}', \`${item.descricao}\`)">?</button>
    <img src="${item.imagem}" alt="${item.nome}">
    <h3>${item.nome}</h3>
    <p>R$ ${item.preco.toFixed(2)}</p>
    <button class="add-btn" onclick="adicionarItem('${item.nome}', ${item.preco})">Adicionar</button>
  `;

  menuDiv.appendChild(card);
});

function adicionarItem(nome, preco) {
  pedido.push({ nome, preco });
  total += preco;

  const li = document.createElement("li");
  li.textContent = `${nome} - R$ ${preco.toFixed(2)}`;
  pedidoUl.appendChild(li);
  totalSpan.textContent = total.toFixed(2);
}

function fazerPedido() {
  const dadosPedido = {
    mesa: numeroMesa,
    itens: pedido,
    total: total,
    status: "aguardando"
  };

  fetch('http://localhost:3000/pedidos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dadosPedido)
  })
  .then(response => response.json())
  .then(() => {
    return fetch('http://localhost:3000/pagamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosPedido)
    });
  })
  .then(response => response.json())
  .then(dados => {
    if (dados.url) {
      window.location.href = dados.url;
    } else {
      alert("Erro ao iniciar o pagamento.");
    }
  })
  .catch(error => {
    console.error("Erro:", error);
    alert("Erro ao processar pedido ou pagamento.");
  });
}


function resetarComanda() {
  pedido = [];
  total = 0;
  pedidoUl.innerHTML = "";
  totalSpan.textContent = "0.00";
}

// Função que cria o popup com a descrição do prato
function mostrarDescricao(nome, descricao) {
  // Verifica se já existe um popup aberto e remove para evitar múltiplos
  const popupExistente = document.querySelector(".popup-descricao");
  if (popupExistente) popupExistente.remove();

  const popup = document.createElement("div");
  popup.className = "popup-descricao";

  popup.innerHTML = `
    <div class="conteudo-popup">
      <button class="fechar-popup" onclick="this.parentElement.parentElement.remove()">X</button>
      <h2>${nome}</h2>
      <p>${descricao}</p>
    </div>
  `;

  document.body.appendChild(popup);
}
