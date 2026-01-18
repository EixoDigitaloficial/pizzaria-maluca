/* ============================================================
    CONEXÃO COM O SERVIDOR (RENDER) E LÓGICA DO CARDÁPIO
   ============================================================ */
const API_BASE_URL = "https://pizzaria-maluca.onrender.com/api";

// Dados que virão do servidor Render
let precosPizza = {}; 
let configGeral = {};
let carrinho = [];
let itemAtual = null; 

// Configuração de limites de sabores
const limitesSabores = { "P": 1, "M": 2, "G": 3, "F": 3 };

// Seu Cardápio Original
const menuPizzas = {
    tradicionais: [
        { nome: "Calabresa", desc: "Molho, muçarela, calabresa e cebola", img: "img/pizzas/pizza 01.png" },
        { nome: "Muçarela", desc: "Muçarela, tomates e azeitonas", img: "img/pizzas/pizza 02.png" },
        { nome: "Portuguesa", desc: "Presunto, ovos, cebola, ervilha, milho", img: "img/pizzas/pizza 03.png" }
    ],
    gourmet: [
        { nome: "Parma & Búfala", desc: "Búfala, presunto parma e rúcula", img: "img/pizzas/pizza 04.png" }
    ],
    doces: [
        { nome: "Chocolate c/ Morango", desc: "Brigadeiro com morangos frescos", img: "img/pizzas/pizza 05.png" }
    ]
};

const cardapioBebidas = [
    { nome: "Água", img: "img/bebidas/agua 01.png", opcoes: ["Sem gás", "Com gás", "Coco", "H2OH"], preco: 5.00 },
    { nome: "Refrigerantes", img: "img/bebidas/Refrigerantes 01.png", tamanhos: [{rotulo: "1Lt", valor: 10.00}, {rotulo: "2Lt", valor: 12.00}], sabores: ["Cola", "Guaraná", "Fanta", "Jesus"] },
    { nome: "Sucos Naturais", img: "img/bebidas/sucos 01.png", opcoes: ["Com Leite (R$ 8,00)", "Sem Leite (R$ 5,00)"], sabores: ["Abacaxi", "Laranja", "Morango"] }
];

// --- 1. SINCRONIZAÇÃO COM O RENDER ---
window.onload = async () => {
    await sincronizarComServidor();
};

async function sincronizarComServidor() {
    try {
        const res = await fetch(`${API_BASE_URL}/config`);
        configGeral = await res.json();
        precosPizza = configGeral.precos;

        // Atualiza preços no banner
        if(document.getElementById('v-preco-p')) document.getElementById('v-preco-p').innerText = precosPizza.P.toFixed(2);
        if(document.getElementById('v-preco-m')) document.getElementById('v-preco-m').innerText = precosPizza.M.toFixed(2);
        if(document.getElementById('v-preco-g')) document.getElementById('v-preco-g').innerText = precosPizza.G.toFixed(2);

        // Atualiza status da loja
        definirStatusLoja(configGeral.statusLoja === 'aberto');
        
        renderizarMenu();
    } catch (e) {
        console.error("Erro ao conectar ao Render.");
    }
}

// --- 2. DESENHAR O MENU NA TELA ---
function renderizarMenu() {
    renderCategoria('lista-tradicionais', menuPizzas.tradicionais);
    renderCategoria('lista-gourmet', menuPizzas.gourmet);
    renderCategoria('lista-doces', menuPizzas.doces);
    renderBebidas();
}

function renderCategoria(id, lista) {
    const box = document.getElementById(id);
    if(!box) return;
    box.innerHTML = lista.map(item => `
        <div class="item-card">
            <div class="item-img-box"><img src="${item.img}" onerror="this.src='img/pizzas/LOGO PIZZA.png'"></div>
            <h3>${item.nome}</h3>
            <div class="size-selector">
                <button class="btn-size" onclick="abrirModalPizza('${item.nome}', 'P')">P</button>
                <button class="btn-size" onclick="abrirModalPizza('${item.nome}', 'M')">M</button>
                <button class="btn-size" onclick="abrirModalPizza('${item.nome}', 'G')">G</button>
                <button class="btn-size" onclick="abrirModalPizza('${item.nome}', 'F')">F</button>
            </div>
        </div>`).join('');
}

function renderBebidas() {
    const box = document.getElementById('lista-bebidas');
    if(!box) return;
    box.innerHTML = cardapioBebidas.map((b, i) => `
        <div class="item-card">
            <div class="item-img-box"><img src="${b.img}" onerror="this.src='img/pizzas/LOGO PIZZA.png'"></div>
            <h3>${b.nome}</h3>
            <button class="btn-checkout-next" onclick="abrirModalBebida(${i})">Escolher</button>
        </div>`).join('');
}

// --- 3. LÓGICA DO MODAL E CARRINHO ---
function abrirModalPizza(nome, tam) {
    itemAtual = { tipo: 'pizza', nomeBase: nome, tamanho: tam, limite: limitesSabores[tam], preco: precosPizza[tam] };
    document.getElementById('modal-title').innerText = `Pizza ${tam} - Selecione`;
    document.getElementById('modal-subtitle').innerText = `Escolha até ${itemAtual.limite} sabor(es).`;
    
    const container = document.getElementById('modal-options');
    const todosSabores = [...menuPizzas.tradicionais, ...menuPizzas.gourmet, ...menuPizzas.doces];
    container.innerHTML = todosSabores.map(s => `<label><input type="checkbox" name="selecao" value="${s.nome}"> ${s.nome}</label>`).join('');
    document.getElementById('modal-selecao').classList.remove('hidden');
}

function confirmarSelecao() {
    const selecionados = Array.from(document.querySelectorAll('input[name="selecao"]:checked')).map(i => i.value);
    if(itemAtual.tipo === 'pizza' && (selecionados.length === 0 || selecionados.length > itemAtual.limite)) {
        return alert(`Selecione de 1 a ${itemAtual.limite} sabores!`);
    }
    
    const nomeItem = itemAtual.tipo === 'pizza' ? `Pizza ${itemAtual.tamanho} (${selecionados.join('/')})` : `${itemAtual.nome} (${selecionados[0]})`;
    carrinho.push({ nome: nomeItem, preco: itemAtual.preco || 0 });
    
    fecharModal();
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const container = document.getElementById('carrinho-itens');
    let subtotal = 0;
    container.innerHTML = carrinho.map((item, idx) => {
        subtotal += item.preco;
        return `<div class="cart-item"><span>${item.nome}</span> <b>R$ ${item.preco.toFixed(2)}</b></div>`;
    }).join('');
    
    document.getElementById('subtotal').innerText = `R$ ${subtotal.toFixed(2)}`;
    const entrega = subtotal > 0 ? (configGeral.taxaEntrega || 5.00) : 0;
    document.getElementById('total-geral').innerText = `R$ ${(subtotal + entrega).toFixed(2)}`;
}

// --- 4. FUNÇÕES DE INTERFACE ---
function definirStatusLoja(aberta) {
    const status = document.getElementById('status-loja');
    if(!status) return;
    status.innerHTML = aberta ? '<span class="dot"></span> Aberto' : '<span class="dot"></span> Fechado';
    status.className = `status-indicator ${aberta ? 'aberto' : 'fechado'}`;
}

function fecharModal() { document.getElementById('modal-selecao').classList.add('hidden'); }
function mudarPagina(p) {
    document.getElementById('page-menu').classList.toggle('hidden', p !== 'menu');
    document.getElementById('page-checkout').classList.toggle('hidden', p !== 'checkout');
}

function enviarPedidoWhatsApp() {
    const nome = document.getElementById('nome_cliente').value;
    const end = document.getElementById('endereco_cliente').value;
    if(!nome || !end) return alert("Preencha nome e endereço!");

    let msg = `*🍕 NOVO PEDIDO - PIZZARIA MALUCA*\n*Cliente:* ${nome}\n*Endereço:* ${end}\n\n*ITENS:*\n`;
    carrinho.forEach(i => msg += `- ${i.nome} (R$ ${i.preco.toFixed(2)})\n`);
    msg += `\n*TOTAL:* ${document.getElementById('total-geral').innerText}`;

    window.open(`https://api.whatsapp.com/send?phone=${configGeral.whatsapp}&text=${encodeURIComponent(msg)}`);
}