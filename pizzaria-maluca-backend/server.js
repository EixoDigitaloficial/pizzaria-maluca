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

const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
    console.log(`🚀 SERVIDOR ONLINE NA PORTA ${PORT}`);
});