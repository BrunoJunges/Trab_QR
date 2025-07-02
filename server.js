const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();

app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'db.json');
const ACCESS_TOKEN = 'TEST-1878735546276571-061710-1f95a0eeb875ee52a8922c23d22cd4ac-1068179850';

let pedidos = [];

// Carrega pedidos do arquivo JSON
function carregarPedidos() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const json = JSON.parse(data);
    pedidos = json.pedidos || [];
  } catch (err) {
    pedidos = [];
  }
}

// Salva pedidos no arquivo JSON
function salvarPedidos() {
  const json = JSON.stringify({ pedidos }, null, 2);
  fs.writeFileSync(DB_PATH, json, 'utf-8');
}

// Inicializa os pedidos ao iniciar o servidor
carregarPedidos();

// Retorna pedidos e status das mesas
app.get('/pedidos', (req, res) => {
  const mesasStatus = [1, 2, 3, 4, 5].map(num => {
    const pedidoMesa = pedidos.find(p => p.mesa === String(num));

    let status = 'livre';
    if (pedidoMesa?.status === 'comendo') {
      status = 'comendo';
    } else if (pedidoMesa?.status === 'aguardando' || pedidoMesa?.status === 'pendente') {
      status = 'aguardando';
    }

    return {
      mesa: String(num),
      status
    };
  });

  res.json({
    mesas: mesasStatus,
    pedidos: pedidos
  });
});

// Cria um novo pedido
app.post('/pedidos', (req, res) => {
  const novoPedido = { id: gerarId(), ...req.body };
  pedidos.push(novoPedido);
  salvarPedidos();
  res.status(201).json(novoPedido);
});

// Atualiza o status de um pedido
app.patch('/pedidos/:id', (req, res) => {
  const { id } = req.params;
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) {
    return res.status(404).json({ erro: "Pedido não encontrado" });
  }

  const novoStatus = req.body.status;

  if (novoStatus === 'entregue') {
    pedido.status = 'comendo';
    salvarPedidos();
    res.json(pedido);

    const mesa = pedido.mesa;
    setTimeout(() => {
      pedidos = pedidos.filter(p => p.mesa !== mesa);
      salvarPedidos();
    }, 300000); // 5 minutos
  } else {
    Object.assign(pedido, req.body);
    salvarPedidos();
    res.json(pedido);
  }
});

// Cria preferência de pagamento (Mercado Pago)
app.post('/pagamento', async (req, res) => {
  const pedido = req.body;

  try {
    const response = await axios.post(
      'https://api.mercadopago.com/checkout/preferences',
      {
        items: pedido.itens.map(item => ({
          title: item.nome,
          quantity: 1,
          currency_id: "BRL",
          unit_price: item.preco
        })),
        payer: {
          email: 'test_user_19653727@testuser.com'
        },
        back_urls: {
          success: "http://localhost:3000/sucesso.html",
          failure: "http://localhost:3000/erro.html",
          pending: "http://localhost:3000/pendente.html"
        }
        // auto_return removido para evitar erro
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const initPoint = response.data.init_point;
    res.json({ url: initPoint });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error.response?.data || error.message);
    res.status(500).json({ erro: "Erro ao criar pagamento" });
  }
});

// Gera um ID aleatório para pedido
function gerarId() {
  return Math.random().toString(36).substring(2, 6);
}

// Inicia o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
