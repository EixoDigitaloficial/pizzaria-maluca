const express = require('express'); 
const cors = require('cors');       
require('dotenv').config();         

const pedidosRoutes = require('./routes/pedidos'); 
const configRoutes = require('./routes/config'); 

const app = express(); 

app.use(cors());          
app.use(express.json());  

app.get('/', (req, res) => {
    res.status(200).json({ status: "Online", message: "API Pizzaria Maluca" });
});

app.use('/api/pedidos', pedidosRoutes);
app.use('/api/config', configRoutes);

// Porta automática do Render ou 10000 para local
const PORT = process.env.PORT || 10000; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVIDOR ONLINE NA PORTA ${PORT}`);
});