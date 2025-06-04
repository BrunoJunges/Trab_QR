const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'db.json');

let pedidos = [];

// Carrega pedidos do arquivo JSON no início do servidor
function carregarPedidos() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const json = JSON.parse(data);
    pedidos = json.pedidos || [];
  } catch (err) {
    pedidos = [];
  }
}

// Salva os pedidos no arquivo JSON após alterações
function salvarPedidos() {
  const json = JSON.stringify({ pedidos }, null, 2);
  fs.writeFileSync(DB_PATH, json, 'utf-8');
}

// Carrega pedidos ao iniciar
carregarPedidos();

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

app.post('/pedidos', (req, res) => {
  const novoPedido = { id: gerarId(), ...req.body };
  pedidos.push(novoPedido);
  salvarPedidos(); // salvar após adicionar
  res.status(201).json(novoPedido);
});

app.patch('/pedidos/:id', (req, res) => {
  const { id } = req.params;
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) {
    return res.status(404).json({ erro: "Pedido não encontrado" });
  }

  const novoStatus = req.body.status;

  if (novoStatus === 'entregue') {
    // Altera para "comendo"
    pedido.status = 'comendo';
    salvarPedidos();
    res.json(pedido);

    // Após 5 minutos (300000 ms), remove todos os pedidos da mesa e salva
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

function gerarId() {
  return Math.random().toString(36).substring(2, 6);
}

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
