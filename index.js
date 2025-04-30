const urlParams = new URLSearchParams(window.location.search);
const numeroMesa = urlParams.get('mesa') || '1'; // Padrão é mesa 1
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

function gerarPDF(pedido, total) {
    console.log("Gerando PDF com os seguintes dados:", pedido, total); // Log para depuração
    try {
        const { jsPDF } = window.jspdf;  // Carrega o jsPDF corretamente
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text(`Comanda - Mesa ${numeroMesa}`, 10, 10);
        doc.setFontSize(12);

        let y = 20; // Posição inicial no eixo Y
        pedido.forEach(item => {
            console.log(`Adicionando item: ${item.nome} - R$ ${item.preco.toFixed(2)}`); // Log para depuração
            doc.text(`${item.nome} - R$ ${item.preco.toFixed(2)}`, 10, y);
            y += 10; // Incrementa a posição Y para o próximo item
        });

        // Adiciona o total
        console.log(`Total: R$ ${total.toFixed(2)}`); // Log para depuração
        doc.text(`Total: R$ ${total.toFixed(2)}`, 10, y + 10);

        // Salva o PDF
        doc.save(`comanda_mesa_${numeroMesa}.pdf`);
    } catch (e) {
        console.error("Erro ao gerar o PDF:", e);
    }
}

function finalizarPedido() {
    console.log("Finalizando pedido..."); // Log para depuração
    console.log("Pedido atual:", pedido); // Log para depuração
    console.log("Total atual:", total); // Log para depuração

    const popup = document.getElementById('popup');
    if (popup) {
        popup.style.display = 'block'; // Exibe o popup de pagamento
        gerarPDF(pedido, total); // Chama a função para gerar o PDF
    } else {
        console.error('Elemento com id "popup" não encontrado.');
    }
}

function fecharPopup() {
  document.getElementById("popup").style.display = "none";
  resetarComanda();
}

function resetarComanda() {
  pedido = [];
  total = 0;
  pedidoUl.innerHTML = "";
  totalSpan.textContent = "0.00";
}

function fecharAgradecimento() {
  document.getElementById("agradecimentoPopup").style.display = "none";
  resetarComanda();
}

function confirmarPagamento() {
  fecharPopup();
  document.getElementById("agradecimentoPopup").style.display = "block";
  document.getElementById("mensagem-agradecimento").textContent =
    `Obrigado por comprar conosco! Por favor, apresente o comprovante de pagamento da Mesa ${numeroMesa} na saída.`;
}
