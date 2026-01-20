require('dotenv').config(); // Carrega o link do .env
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔗 CONEXÃO COM O MONGODB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Conectado ao MongoDB com sucesso!"))
    .catch(err => console.error("❌ Erro ao conectar ao MongoDB:", err));

// 📝 DEFINIÇÃO DOS DADOS (O que vamos salvar)
const ConfigSchema = new mongoose.Schema({
    whatsapp: String,
    precosPizzas: Object,
    precosBebidas: Object,
    senhaAdmin: String
});
const Config = mongoose.model('Config', ConfigSchema);

// 🌐 ROTA PARA BUSCAR CONFIGURAÇÕES (Quando o site abre)
app.get('/api/config', async (req, res) => {
    try {
        let config = await Config.findOne();
        if (!config) {
            // Se o banco estiver vazio, cria o primeiro registro padrão
            config = await Config.create({
                whatsapp: "55000000000",
                precosPizzas: { p: 35, m: 45, g: 55, f: 70 },
                precosBebidas: { agua: 5, refri: 10 },
                senhaAdmin: "123456"
            });
        }
        res.json(config);
    } catch (err) {
        res.status(500).send("Erro ao buscar dados");
    }
});

// 💾 ROTA PARA SALVAR (O que o lojista altera no painel)
app.post('/api/config', async (req, res) => {
    try {
        await Config.findOneAndUpdate({}, req.body, { upsert: true });
        res.send("Configurações salvas no Banco de Dados!");
    } catch (err) {
        res.status(500).send("Erro ao salvar");
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));