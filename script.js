/* ============================================================
   CONFIGURAÇÕES GERAIS - RENDER VERSION
   ============================================================ */
const API_BASE_URL = "https://pizzaria-maluca.onrender.com/api";
let precosPizza = {}; 
let configGeral = {};
let carrinho = [];

// 1. BUSCA DADOS DO SERVIDOR (PREÇOS E STATUS)
async function carregarConfiguracoesDaAPI() {
    try {
        const res = await fetch(`${API_BASE_URL}/config`);
        configGeral = await res.json();
        precosPizza = configGeral.precos;
        
        // Atualiza o status visual (Aberto/Fechado)
        definirStatusLoja(configGeral.statusLoja === 'aberto');
        
        // ATENÇÃO: Chama a renderização após carregar os preços
        renderizarMenu();
    } catch (e) {
        console.error("Erro ao conectar ao servidor Render:", e);
    }
}

// 2. DEFINE SE A LOJA ESTÁ ABERTA NO SITE
function definirStatusLoja(aberto) {
    const statusElement = document.getElementById('status-loja'); // Certifique-se que esse ID existe no HTML
    if (statusElement) {
        statusElement.innerText = aberto ? "Aberto" : "Fechado";
        statusElement.className = aberto ? "status-aberto" : "status-fechado";
    }
}

// 3. RENDERIZA OS PRODUTOS NA TELA (ESTRUTURA DINÂMICA)
function renderizarMenu() {
    // Exemplo de como preencher os preços nas seções
    // Você deve adaptar os IDs abaixo de acordo com seu HTML
    if (document.getElementById('preco-p')) document.getElementById('preco-p').innerText = `R$ ${precosPizza.P.toFixed(2)}`;
    if (document.getElementById('preco-m')) document.getElementById('preco-m').innerText = `R$ ${precosPizza.M.toFixed(2)}`;
    if (document.getElementById('preco-g')) document.getElementById('preco-g').innerText = `R$ ${precosPizza.G.toFixed(2)}`;
    
    console.log("Cardápio atualizado com dados do Render!");
}

// 4. ENVIA O PEDIDO PARA O BANCO DE DADOS NO RENDER
async function enviarPedidoParaAPI(dadosPedido) {
    try {
        const res = await fetch(`${API_BASE_URL}/pedidos/enviar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosPedido)
        });
        if (res.ok) console.log("Pedido salvo no servidor!");
    } catch (e) { 
        console.error("Erro ao salvar pedido:", e); 
    }
}

// INICIALIZAÇÃO AO CARREGAR A PÁGINA
window.onload = async () => {
    await carregarConfiguracoesDaAPI();
};

/* Mantenha suas funções de 'Adicionar ao Carrinho' e 'Abrir Modal' abaixo desta linha */