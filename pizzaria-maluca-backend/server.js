const express = require('express'); 
const cors = require('cors');       
require('dotenv').config();         

const pedidosRoutes = require('./routes/pedidos'); 
const configRoutes = require('./routes/config'); 

const app = express(); 

// Configuração de CORS para permitir que seu site (frontend) acesse a API
app.use(cors());          
app.use(express.json());  

// Rota de teste (você já confirmou que esta funcionando no Render)
app.get('/', (req, res) => {
    res.status(200).json({ status: "Online", message: "API Pizzaria Maluca" });
});

// Rotas da API
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/config', configRoutes);

// O Render usa a porta 10000 por padrão, por isso o process.env.PORT é essencial
const PORT = process.env.PORT || 10000; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVIDOR ONLINE NA PORTA ${PORT}`);
});