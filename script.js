const API_BASE_URL = "https://pizzaria-maluca.onrender.com/api";

// Dados Globais
let precosPizza = {}; 
let configGeral = {};
let carrinho = [];
let itemAtual = null; 
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
    { nome: "Refrigerantes", img: "img/bebidas/Refrigerantes 01.png", tamanhos: [ {rotulo: "1Lt", valor: 10.00}, {rotulo: "2Lt", valor: 12.00} ], sabores: ["Cola", "Guaraná", "Fanta", "Jesus"] },
    { nome: "Sucos Naturais", img: "img/bebidas/sucos 01.png", opcoes: ["Com Leite (R$ 8,00)", "Sem Leite (R$ 5,00)"], sabores: ["Abacaxi", "Laranja", "Morango"] }
];

// --- SINCRONIZAÇÃO COM O RENDER ---
window.onload = () => sincronizarComServidor();

async function sincronizarComServidor() {
    try {
        const res = await fetch(`${API_BASE_URL}/config`);
        configGeral = await res.json();
        precosPizza = configGeral.precos;

        // Atualiza Banner
        document.getElementById('v-preco-p').innerText = precosPizza.P.toFixed(2);
        document.getElementById('v-preco-m').innerText = precosPizza.M.toFixed(2);
        document.getElementById('v-preco-g').innerText = precosPizza.G.toFixed(2);
        document.getElementById('v-taxa-entrega').innerText = `R$ ${configGeral.taxaEntrega.toFixed(2)}`;

        definirStatusLoja(configGeral.statusLoja === 'aberto');
        renderizarMenu();
    } catch (e) { console.error("Erro ao carregar dados do Render."); }
}

// --- FUNÇÕES DE RENDERIZAÇÃO ---
function renderizarMenu() {
    renderCategoria('lista-tradicionais', menuPizzas.tradicionais);
    renderCategoria('lista-gourmet', menuPizzas.gourmet);
    renderCategoria('lista-doces', menuPizzas.doces);
    renderBebidas();
}

function renderCategoria(id, lista) {
    const box = document.getElementById(id);
    box.innerHTML = lista.map(item => `
        <div class="item-card">
            <div class="item-img-box"><img src="${item.img}" onerror="this.src='img/pizzas/LOGO PIZZA.png'"></div>
            <h3>${item.nome}</h3>
            <p style="font-size:12px; color:#888;">${item.desc || ''}</p>
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
    box.innerHTML = cardapioBebidas.map((b, i) => `
        <div class="item-card">
            <div class="item-img-box"><img src="${b.img}" onerror="this.src='img/pizzas/LOGO PIZZA.png'"></div>
            <h3>${b.nome}</h3>
            <button class="btn-checkout-next" onclick="abrirModalBebida(${i})">Escolher</button>
        </div>`).join('');
}

// --- LÓGICA DO MODAL E CARRINHO ---
function abrirModalPizza(nome, tam) {
    itemAtual = { tipo: 'pizza', nomeBase: nome, tamanho: tam, limite: limitesSabores[tam], preco: precosPizza[tam] };
    document.getElementById('modal-title').innerText = `Pizza ${tam} - Selecione Sabores`;
    document.getElementById('modal-subtitle').innerText = `Escolha até ${itemAtual.limite} sabor(es).`;
    const container = document.getElementById('modal-options');
    const todosSabores = [...menuPizzas.tradicionais, ...menuPizzas.gourmet, ...menuPizzas.doces];
    container.innerHTML = todosSabores.map(s => `<label><input type="checkbox" name="selecao" value="${s.nome}"> ${s.nome}</label>`).join('');
    document.getElementById('modal-selecao').classList.remove('hidden');
}

function abrirModalBebida(index) {
    const b = cardapioBebidas[index];
    itemAtual = { tipo: 'bebida', ...b, index };
    document.getElementById('modal-title').innerText = b.nome;
    const container = document.getElementById('modal-options');
    container.innerHTML = "";
    if(b.opcoes) b.opcoes.forEach(o => container.innerHTML += `<label><input type="radio" name="selecao" value="${o}"> ${o}</label>`);
    if(b.sabores) b.sabores.forEach(s => container.innerHTML += `<label><input type="radio" name="sabor" value="${s}"> ${s}</label>`);
    document.getElementById('modal-selecao').classList.remove('hidden');
}

function confirmarSelecao() {
    if(itemAtual.tipo === 'pizza') {
        const sel = Array.from(document.querySelectorAll('input[name="selecao"]:checked')).map(i => i.value);
        if(sel.length === 0 || sel.length > itemAtual.limite) return alert("Selecione corretamente!");
        carrinho.push({ nome: `Pizza ${itemAtual.tamanho} (${sel.join('/')})`, preco: itemAtual.preco });
    } else {
        const principal = document.querySelector('input[name="selecao"]:checked');
        if(!principal) return alert("Escolha uma opção!");
        carrinho.push({ nome: `${itemAtual.nome} - ${principal.value}`, preco: itemAtual.preco || 0 });
    }
    fecharModal();
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const container = document.getElementById('carrinho-itens');
    let sub = 0;
    container.innerHTML = carrinho.map(i => { sub += i.preco; return `<div class="cart-item"><span>${i.nome}</span> <b>R$ ${i.preco.toFixed(2)}</b></div>`}).join('');
    document.getElementById('subtotal').innerText = `R$ ${sub.toFixed(2)}`;
    const entrega = sub > 0 ? configGeral.taxaEntrega : 0;
    document.getElementById('total-geral').innerText = `R$ ${(sub + entrega).toFixed(2)}`;
}

function enviarPedidoWhatsApp() {
    const nome = document.getElementById('nome_cliente').value;
    const end = document.getElementById('endereco_cliente').value;
    if(!nome || !end) return alert("Preencha os dados!");
    let msg = `*🍕 NOVO PEDIDO*\n*Cliente:* ${nome}\n*Endereço:* ${end}\n\n*ITENS:*\n`;
    carrinho.forEach(i => msg += `- ${i.nome} (R$ ${i.preco.toFixed(2)})\n`);
    msg += `\n*TOTAL:* ${document.getElementById('total-geral').innerText}`;
    window.open(`https://api.whatsapp.com/send?phone=${configGeral.whatsapp}&text=${encodeURIComponent(msg)}`);
}

function definirStatusLoja(aberta) {
    const s = document.getElementById('status-loja');
    s.innerHTML = aberta ? '<span class="dot"></span> Aberto' : '<span class="dot"></span> Fechado';
    s.className = `status-indicator ${aberta ? 'aberto' : 'fechado'}`;
}
function fecharModal() { document.getElementById('modal-selecao').classList.add('hidden'); }
function mudarPagina(p) { 
    document.getElementById('page-menu').classList.toggle('hidden', p !== 'menu'); 
    document.getElementById('page-checkout').classList.toggle('hidden', p !== 'checkout'); 
}
function limparCarrinho() { carrinho = []; atualizarCarrinho(); }