const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let pedidos = [];

app.get('/pedidos', (req, res) => {
  res.json(pedidos);
});

app.post('/pedidos', (req, res) => {
  const novoPedido = { id: gerarId(), ...req.body };
  pedidos.push(novoPedido);
  res.status(201).json(novoPedido);
});

app.patch('/pedidos/:id', (req, res) => {
  const { id } = req.params;
  const pedido = pedidos.find(p => p.id === id);
  if (pedido) {
    Object.assign(pedido, req.body);
    res.json(pedido);
  } else {
    res.status(404).json({ erro: "Pedido não encontrado" });
  }
});

function gerarId() {
  return Math.random().toString(36).substring(2, 6);
}

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
