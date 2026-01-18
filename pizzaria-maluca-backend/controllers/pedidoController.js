/**
 * CONTROLADOR: pedidoController.js
 * DESCRIÇÃO: Processa o pedido e salva em um arquivo JSON físico.
 */

const fs = require('fs');
const path = require('path');

exports.criarPedido = (req, res) => {
    try {
        const novoPedido = req.body;
        
        // Define o caminho do arquivo (pasta data/pedidos.json)
        const caminhoArquivo = path.join(__dirname, '..', 'data', 'pedidos.json');

        // 1. LER os pedidos já existentes
        let pedidosExistentes = [];
        if (fs.existsSync(caminhoArquivo)) {
            const dadosAtuais = fs.readFileSync(caminhoArquivo, 'utf-8');
            pedidosExistentes = JSON.parse(dadosAtuais);
        }

        // 2. ADICIONAR o novo pedido com ID e Data
        const pedidoCompleto = {
            id: Date.now(), // ID único baseado no tempo
            dataHora: new Date().toLocaleString(),
            ...novoPedido
        };
        pedidosExistentes.push(pedidoCompleto);

        // 3. SALVAR de volta no arquivo
        fs.writeFileSync(caminhoArquivo, JSON.stringify(pedidosExistentes, null, 2));

        console.log(`✅ Pedido #${pedidoCompleto.id} salvo com sucesso no banco de dados!`);

        res.status(201).json({
            sucesso: true,
            mensagem: "Pedido processado e salvo!",
            protocolo: pedidoCompleto.id
        });

    } catch (error) {
        console.error("🚨 Erro ao salvar pedido:", error);
        res.status(500).json({ sucesso: false, erro: "Erro ao gravar pedido." });
    }
};