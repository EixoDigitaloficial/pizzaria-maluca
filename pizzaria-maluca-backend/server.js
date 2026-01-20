require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); 
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔗 CONEXÃO COM O MONGODB COM AUTO-INICIALIZAÇÃO
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("✅ Conectado ao MongoDB com sucesso!");
        
        // VERIFICA SE O BANCO ESTÁ VAZIO E CRIA O PRIMEIRO REGISTRO PARA DESTRAVAR O LOGIN
        const configExistente = await Config.findOne();
        if (!configExistente) {
            console.log("🚀 Banco vazio detectado! Criando dados iniciais...");
            await Config.create({
                statusLoja: 'aberto',
                whatsapp: "55000000000",
                taxaEntrega: 5.00,
                precosPizzas: { p: 35, m: 45, g: 55, f: 70 },
                precosBebidas: { agua: 5, aguaGas: 6, refri1l: 8, refri: 12, sucoSimples: 10, sucoLeite: 12 },
                senhaAdmin: "123456" 
            });
            console.log("✅ Configuração inicial criada com sucesso! Senha padrão: 123456");
        }
    })
    .catch(err => console.error("❌ Erro ao conectar ao MongoDB:", err));

// 📝 DEFINIÇÃO DOS DADOS (Esquema do Banco)
const ConfigSchema = new mongoose.Schema({
    statusLoja: String,
    whatsapp: String,
    taxaEntrega: Number,
    precosPizzas: Object,
    precosBebidas: Object,
    senhaAdmin: String
});
const Config = mongoose.model('Config', ConfigSchema);

// 🌐 ROTA PARA BUSCAR CONFIGURAÇÕES (Usada pelo site e Login)
app.get('/api/config', async (req, res) => {
    try {
        const config = await Config.findOne();
        res.json(config);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar dados do banco" });
    }
});

// 💾 ROTA PARA SALVAR (Usada pelo Painel Admin)
app.post('/api/config', async (req, res) => {
    try {
        await Config.findOneAndUpdate({}, req.body, { upsert: true });
        res.send("Configurações salvas permanentemente no MongoDB!");
    } catch (err) {
        res.status(500).send("Erro ao salvar no banco de dados");
    }
});

// 🔐 ROTA PARA DEFINIR NOVA SENHA (Recuperação via WhatsApp)
app.post('/api/redefinir-senha', async (req, res) => {
    try {
        const { novaSenha } = req.body;
        
        if (!novaSenha || novaSenha.length < 6) {
            return res.status(400).send("A senha deve ter pelo menos 6 números.");
        }
        
        // Atualiza a senha do administrador no banco de dados
        await Config.findOneAndUpdate({}, { senhaAdmin: novaSenha });
        
        console.log("✅ Senha admin atualizada via recuperação.");
        res.send("Senha atualizada com sucesso!");
    } catch (err) {
        console.error("Erro ao atualizar senha:", err);
        res.status(500).send("Erro interno ao salvar nova senha.");
    }
});

// 🚀 INICIALIZAÇÃO DO SERVIDOR
const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => console.log(`🚀 Backend Pizzaria rodando na porta ${PORT}`));