const API_BASE_URL = "https://pizzaria-maluca.onrender.com/api";
let precosPizza = {}; 

async function carregarDados() {
    try {
        const res = await fetch(`${API_BASE_URL}/config`);
        const config = await res.json();
        precosPizza = config.precos;

        // Atualiza Preços no Banner (IDs devem bater com o index.html)
        if(document.getElementById('v-preco-p')) document.getElementById('v-preco-p').innerText = precosPizza.P.toFixed(2);
        if(document.getElementById('v-preco-m')) document.getElementById('v-preco-m').innerText = precosPizza.M.toFixed(2);
        if(document.getElementById('v-preco-g')) document.getElementById('v-preco-g').innerText = precosPizza.G.toFixed(2);

        // Atualiza Status da Loja
        const statusDiv = document.getElementById('status-loja');
        if (statusDiv) {
            statusDiv.innerHTML = config.statusLoja === 'aberto' ? '<span class="dot"></span> Aberto' : '<span class="dot-red"></span> Fechado';
            statusDiv.className = `status-indicator ${config.statusLoja}`;
        }
    } catch (e) { 
        console.error("Erro ao conectar ao servidor Render. O backend pode estar 'dormindo'."); 
    }
}

// Abre e fecha as categorias no clique
function toggleCategoria(id) {
    const lista = document.getElementById(`lista-${id}`);
    if (lista) lista.classList.toggle('hidden');
}

window.onload = carregarDados;