/* ============================================================
   CONFIGURAÇÕES E LISTA DE PRODUTOS - PIZZARIA MALUCA
   ============================================================ */
const API_BASE_URL = "https://pizzaria-maluca.onrender.com/api";

// 1. LISTA DE PRODUTOS (ADICIONE MAIS SABORES AQUI)
const produtos = [
    { id: 1, nome: "Calabresa Tradicional", categoria: "tradicionais", img: "img/pizzas/calabresa.png" },
    { id: 2, nome: "Mussarela", categoria: "tradicionais", img: "img/pizzas/mussarela.png" },
    { id: 3, nome: "Frango com Catupiry", categoria: "tradicionais", img: "img/pizzas/frango.png" },
    { id: 4, nome: "Portuguesa", categoria: "tradicionais", img: "img/pizzas/portuguesa.png" },
    { id: 5, nome: "Chocolate com Morango", categoria: "doces", img: "img/pizzas/chocolate.png" },
    { id: 6, nome: "Romeu e Julieta", categoria: "doces", img: "img/pizzas/romeu.png" },
    { id: 7, nome: "Coca-Cola 2L", categoria: "bebidas", img: "img/pizzas/coca.png" }
];

// 2. FUNÇÃO QUE MOSTRA OS ITENS NO SITE
function renderizarProdutos() {
    // Limpa as listas antes de preencher
    const listas = {
        tradicionais: document.getElementById('lista-tradicionais'),
        doces: document.getElementById('lista-doces'),
        bebidas: document.getElementById('lista-bebidas')
    };

    // Para cada produto, cria um "Card" no HTML
    produtos.forEach(p => {
        const target = listas[p.categoria];
        if (target) {
            target.innerHTML += `
                <div class="item-card">
                    <div class="item-img-box">
                        <img src="${p.img}" alt="${p.nome}" onerror="this.src='img/pizzas/LOGO PIZZA.png'">
                    </div>
                    <h3>${p.nome}</h3>
                    <button class="btn-checkout-next" onclick="abrirModal(${p.id})">
                        ESCOLHER SABOR
                    </button>
                </div>
            `;
        }
    });
}

// 3. CONEXÃO COM O RENDER (PREÇOS E STATUS)
async function carregarDadosDoServidor() {
    try {
        const res = await fetch(`${API_BASE_URL}/config`);
        const config = await res.json();
        
        // Preenche os preços no banner
        if(document.getElementById('v-preco-p')) document.getElementById('v-preco-p').innerText = config.precos.P.toFixed(2);
        if(document.getElementById('v-preco-m')) document.getElementById('v-preco-m').innerText = config.precos.M.toFixed(2);
        if(document.getElementById('v-preco-g')) document.getElementById('v-preco-g').innerText = config.precos.G.toFixed(2);

        // Atualiza o botão de status
        const statusDiv = document.getElementById('status-loja');
        if (statusDiv) {
            statusDiv.innerHTML = config.statusLoja === 'aberto' ? '🟢 Aberto' : '🔴 Fechado';
            statusDiv.className = `status-indicator ${config.statusLoja}`;
        }
    } catch (e) {
        console.error("Erro ao carregar dados do servidor");
    }
}

// INICIALIZA TUDO AO ABRIR O SITE
window.onload = async () => {
    await carregarDadosDoServidor(); // Busca preços e status
    renderizarProdutos();          // Mostra as pizzas na tela
};