/**
 * ROTA: config.js
 * Objetivo: Gerenciar as configurações da loja (preços, status, zap).
 */
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const caminhoConfig = path.join(__dirname, '..', 'data', 'config.json');

// Rota GET: O site usa para carregar os preços e status
router.get('/', (req, res) => {
    const dados = fs.readFileSync(caminhoConfig, 'utf-8');
    res.json(JSON.parse(dados));
});

// Rota POST: O painel Admin usa para salvar alterações
router.post('/atualizar', (req, res) => {
    try {
        const novasConfigs = req.body;
        fs.writeFileSync(caminhoConfig, JSON.stringify(novasConfigs, null, 2));
        res.json({ sucesso: true, mensagem: "Configurações atualizadas!" });
    } catch (error) {
        res.status(500).json({ sucesso: false, erro: error.message });
    }
});

module.exports = router;

// Rota para atualizar apenas a senha (usada na recuperação)
router.post('/atualizar-senha', (req, res) => {
    try {
        const { novaSenha } = req.body; // Recebe a senha de 6 dígitos
        const dados = JSON.parse(fs.readFileSync(caminhoConfig, 'utf-8')); // Lê config atual
        
        dados.senhaMestre = novaSenha; // Atualiza a senha no objeto
        
        fs.writeFileSync(caminhoConfig, JSON.stringify(dados, null, 2)); // Salva no arquivo
        res.json({ sucesso: true, mensagem: "Senha alterada com sucesso!" });
    } catch (error) {
        res.status(500).json({ sucesso: false, erro: error.message });
    }
});