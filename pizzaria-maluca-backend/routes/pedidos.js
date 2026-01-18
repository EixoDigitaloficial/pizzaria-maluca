/**
 * ROTA: pedidos.js
 * Objetivo: Definir os pontos de entrada (endpoints) para pedidos.
 */

const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

// Define que quando o Front-end fizer um POST em "/enviar", o controlador será chamado
router.post('/enviar', pedidoController.criarPedido);

module.exports = router;