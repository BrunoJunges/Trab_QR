const urlParams = new URLSearchParams(window.location.search);
const numeroMesa = urlParams.get('mesa') || '1';
document.getElementById("titulo-comanda").textContent = `Comanda da Mesa ${numeroMesa}`;

const menuItems = [
  { nome: "Hamburguer", preco: 25.00, imagem: "hambúrguer.png" },
  { nome: "Pizza", preco: 35.00, imagem: "pizza.png" },
  { nome: "Refrigerante", preco: 6.00, imagem: "refrigerante.png" },
  { nome: "Massa Alho e Óleo", preco: 22.00, imagem: "massa.png" },
  { nome: "Batata Frita", preco: 15.00, imagem: "batata.png" },
  { nome: "À la Minuta", preco: 28.00, imagem: "minuta.png" }
];

let pedido = [];
let total = 0;

const menuDiv = document.getElementById("menu");
const pedidoUl = document.getElementById("pedido");
const totalSpan = document.getElementById("total");

menuItems.forEach(item => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="img/${item.imagem}" alt="${item.nome}">
    <h3>${item.nome}</h3>
    <p>R$ ${item.preco.toFixed(2)}</p>
    <button onclick="adicionarItem('${item.nome}', ${item.preco})">Adicionar</button>
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
    status: "pendente" 
  };

  fetch('http://192.168.221.2:3000/pedidos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dadosPedido)
  })
  .then(response => {
    if (response.ok) {
      alert("Pedido enviado para a cozinha com sucesso!");
      resetarComanda();
    } else {
      alert("Erro ao enviar pedido. Tente novamente.");
    }
  })
  
}

function abrirPopup() {
  document.getElementById("popup").style.display = "block";
}

function fecharPopup() {
  document.getElementById("popup").style.display = "none";
}

function limparComanda() {
  pedido = [];
  total = 0;
  pedidoUl.innerHTML = "";
  totalSpan.textContent = "0.00";
}
