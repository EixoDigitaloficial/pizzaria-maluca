/* ============================================================
   CONFIGURAÇÕES GERAIS - RENDER VERSION
   ============================================================ */
const API_BASE_URL = "https://pizzaria-maluca.onrender.com/api";
let precosPizza = {}; 
let configGeral = {};
let carrinho = [];

async function carregarConfiguracoesDaAPI() {
    try {
        const res = await fetch(`${API_BASE_URL}/config`);
        configGeral = await res.json();
        precosPizza = configGeral.precos;
        definirStatusLoja(configGeral.statusLoja === 'aberto');
    } catch (e) {
        console.error("Erro ao conectar ao servidor Render");
    }
}

async function enviarPedidoParaAPI(dadosPedido) {
    try {
        await fetch(`${API_BASE_URL}/pedidos/enviar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosPedido)
        });
    } catch (e) { console.error("Erro ao salvar pedido"); }
}

window.onload = async () => {
    await carregarConfiguracoesDaAPI();
    if(typeof renderizarMenu === "function") renderizarMenu();
};

/* Mantenha o restante das suas funções de menu, modal e carrinho abaixo desta linha */