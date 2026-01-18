/* ============================================================
    CONEXÃO COM O SERVIDOR (RENDER) - CONFIGURAÇÕES VIVAS
   ============================================================ */
const API_BASE_URL = "https://pizzaria-maluca.onrender.com/api";

// Os preços e o status virão diretamente do seu Painel Admin no Render
let precosPizza = {}; 
let configGeral = {};

// Limites de sabores por tamanho
const limitesSabores = { "P": 1, "M": 2, "G": 3, "F": 3 };

/* ============================================================
    SEUS DADOS ORIGINAIS (MANTIDOS)
   ============================================================ */
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

let carrinho = [];
let itemAtual = null; 

// ============================================================
// INICIALIZAÇÃO COM SINCRONIA (RENDER)
// ============================================================

window.onload = async () => {
    await sincronizarComServidor();
};

async function sincronizarComServidor() {
    try {
        const res = await fetch(`${API_BASE_URL}/config`);
        configGeral = await res.json();
        
        // Sincroniza os preços que você definiu no Admin
        precosPizza = configGeral.precos;

        // Atualiza o banner visual de preços
        if(document.getElementById('v-preco-p')) document.getElementById('v-preco-p').innerText = precosPizza.P.toFixed(2);
        if(document.getElementById('v-preco-m')) document.getElementById('v-preco-m').innerText = precosPizza.M.toFixed(2);
        if(document.getElementById('v-preco-g')) document.getElementById('v-preco-g').innerText = precosPizza.G.toFixed(2);

        // Atualiza o status da loja (Aberto/Fechado)
        definirStatusLoja(configGeral.statusLoja === 'aberto');
        
        // Renderiza o menu usando os novos preços
        renderizarMenu();
    } catch (e) {
        console.error("Erro ao conectar ao Render. Verifique se o backend está Live.");
    }
}

// ============================================================
// LÓGICA DE RENDERIZAÇÃO E CARRINHO (SUA LÓGICA ORIGINAL)
// ============================================================

function renderizarMenu() {
    renderCategoria('lista-tradicionais', menuPizzas.tradicionais);
    renderCategoria('lista-gourmet', menuPizzas.gourmet);
    renderCategoria('lista-doces', menuPizzas.doces);
    renderBebidas();
}

function renderCategoria(id, lista) {
    const box = document.getElementById(id);
    if(!box) return;
    box.innerHTML = "";
    lista.forEach(item => {
        box.innerHTML += `
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
            </div>`;
    });
}

function renderBebidas() {
    const box = document.getElementById('lista-bebidas');
    if(!box) return;
    box.innerHTML = "";
    cardapioBebidas.forEach((bebida, index) => {
        box.innerHTML += `
            <div class="item-card">
                <div class="item-img-box"><img src="${bebida.img}" onerror="this.src='img/pizzas/LOGO PIZZA.png'"></div>
                <h3>${bebida.nome}</h3>
                <button class="btn-checkout-next" onclick="abrirModalBebida(${index})">Escolher</button>
            </div>`;
    });
}

function abrirModalPizza(nome, tam) {
    itemAtual = { tipo: 'pizza', nomeBase: nome, tamanho: tam, limite: limitesSabores[tam], preco: precosPizza[tam] };
    document.getElementById('modal-title').innerText = `Pizza ${tam} - Selecione os Sabores`;
    document.getElementById('modal-subtitle').innerText = `Escolha até ${itemAtual.limite} sabor(es).`;
    
    const container = document.getElementById('modal-options');
    container.innerHTML = "";
    const todosSabores = [...menuPizzas.tradicionais, ...menuPizzas.gourmet, ...menuPizzas.doces];
    todosSabores.forEach(s => {
        container.innerHTML += `<label><input type="checkbox" name="selecao" value="${s.nome}"> ${s.nome}</label>`;
    });
    document.getElementById('modal-selecao').classList.remove('hidden');
}

/* MANTENHA SUAS FUNÇÕES DE: abrirModalBebida, confirmarSelecao, atualizarCarrinho, enviarPedidoWhatsApp EXATAMENTE IGUAIS */

function definirStatusLoja(aberta) {
    const status = document.getElementById('status-loja');
    if(!status) return;
    status.innerHTML = aberta ? '<span class="dot"></span> Aberto' : '<span class="dot"></span> Fechado';
    status.className = `status-indicator ${aberta ? 'aberto' : 'fechado'}`;
}

function toggleCategoria(id) {
    const lista = document.getElementById(`lista-${id}`);
    if (lista) lista.classList.toggle('hidden');
}

function fecharModal() { document.getElementById('modal-selecao').classList.add('hidden'); }