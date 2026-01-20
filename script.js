// CONFIGURAÇÃO DO BACKEND
const API_URL = "https://pizzaria-maluca.onrender.com/api/config";
let configGeral = {};
let carrinho = [];
let itemAtual = null;
let metodoEnvio = 'entrega';

// CARDÁPIO DE PIZZAS
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

// --- SINCRONIZAÇÃO COM O MONGODB ---
async function sincronizarComServidor() {
    try {
        const res = await fetch(API_URL);
        configGeral = await res.json();
        
        document.getElementById('v-preco-p').innerText = configGeral.precosPizzas.p.toFixed(2);
        document.getElementById('v-preco-m').innerText = configGeral.precosPizzas.m.toFixed(2);
        document.getElementById('v-preco-g').innerText = configGeral.precosPizzas.g.toFixed(2);
        document.getElementById('v-preco-f').innerText = configGeral.precosPizzas.f.toFixed(2);
        
        document.getElementById('banner-loading').classList.add('hidden');
        document.getElementById('banner-precos').classList.remove('hidden');

        const statusDiv = document.getElementById('status-loja');
        statusDiv.innerHTML = `<span class="dot"></span> Loja Aberta`;
        statusDiv.className = `status-indicator aberto`;

        renderizarMenu();
    } catch (e) { 
        console.error("Erro ao conectar banco.");
    }
}

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

// RENDERIZAÇÃO DAS BEBIDAS CORRIGIDA
function renderBebidas() {
    const box = document.getElementById('lista-bebidas');
    if(!box) return;
    
    const bebidas = [
        { nome: "Água Mineral", img: "img/bebidas/agua 01.png", tipo: "Agua" },
        { nome: "Refrigerantes", img: "img/bebidas/Refrigerantes 01.png", tipo: "Refri" },
        { nome: "Sucos Naturais", img: "img/bebidas/sucos 01.png", tipo: "Suco" }
    ];

    box.innerHTML = bebidas.map(b => `
        <div class="item-card">
            <div class="item-img-box"><img src="${b.img}" onerror="this.src='img/pizzas/LOGO PIZZA.png'"></div>
            <h3>${b.nome}</h3>
            <button class="btn-checkout-next" onclick="abrirModalBebida('${b.tipo}')">ESCOLHER</button>
        </div>`).join('');
}

// MODAL DE BEBIDAS CORRIGIDO
function abrirModalBebida(tipo) {
    const container = document.getElementById('modal-options');
    const titulo = document.getElementById('modal-title');
    container.innerHTML = "";
    
    if (tipo === 'Agua') {
        titulo.innerText = "Escolha sua Água";
        itemAtual = { tipo: 'bebida', nome: 'Água' };
        container.innerHTML = `
            <label><input type="radio" name="bebida_sel" value="Sem Gás|5.00"> Sem Gás - R$ 5,00</label>
            <label><input type="radio" name="bebida_sel" value="Com Gás|6.00"> Com Gás - R$ 6,00</label>`;
    } else if (tipo === 'Refri') {
        titulo.innerText = "Escolha seu Refrigerante";
        itemAtual = { tipo: 'bebida', nome: 'Refri' };
        container.innerHTML = `
            <label><input type="radio" name="bebida_sel" value="Coca-Cola 2L|14.00"> Coca-Cola 2L - R$ 14,00</label>
            <label><input type="radio" name="bebida_sel" value="Guaraná 2L|12.00"> Guaraná 2L - R$ 12,00</label>`;
    } else if (tipo === 'Suco') {
        titulo.innerText = "Escolha seu Suco";
        itemAtual = { tipo: 'bebida', nome: 'Suco' };
        container.innerHTML = `
            <label><input type="radio" name="bebida_sel" value="Laranja 500ml|10.00"> Laranja 500ml - R$ 10,00</label>
            <label><input type="radio" name="bebida_sel" value="Uva 500ml|10.00"> Uva 500ml - R$ 10,00</label>`;
    }
    
    document.getElementById('modal-selecao').classList.remove('hidden');
}

function abrirModalPizza(nome, tam) {
    const limites = { "P": 1, "M": 2, "G": 3, "F": 3 };
    itemAtual = { tipo: 'pizza', nome, tamanho: tam, limite: limites[tam], preco: configGeral.precosPizzas[tam.toLowerCase()] };
    document.getElementById('modal-title').innerText = `Pizza ${tam} - ${nome}`;
    const todos = [...menuPizzas.tradicionais, ...menuPizzas.gourmet, ...menuPizzas.doces];
    document.getElementById('modal-options').innerHTML = todos.map(s => `<label><input type="checkbox" name="selecao" value="${s.nome}"> ${s.nome}</label>`).join('');
    document.getElementById('modal-selecao').classList.remove('hidden');
}

function confirmarSelecao() {
    if (itemAtual.tipo === 'bebida') {
        const sel = document.querySelector('input[name="bebida_sel"]:checked');
        if(!sel) return alert("Escolha uma opção!");
        const [nomeB, precoB] = sel.value.split('|');
        carrinho.push({ nome: `${itemAtual.nome}: ${nomeB}`, preco: parseFloat(precoB) });
    } else {
        const sel = Array.from(document.querySelectorAll('input[name="selecao"]:checked')).map(i => i.value);
        if(sel.length === 0 || sel.length > itemAtual.limite) return alert(`Escolha de 1 a ${itemAtual.limite} sabores!`);
        carrinho.push({ nome: `Pizza ${itemAtual.tamanho} (${sel.join('/')})`, preco: itemAtual.preco });
    }
    fecharModal();
    atualizarCarrinho();
}

function atualizarCarrinho() {
    let sub = 0;
    document.getElementById('carrinho-itens').innerHTML = carrinho.map(i => { 
        sub += i.preco; 
        return `<div class="cart-item"><span>${i.nome}</span> <b>R$ ${i.preco.toFixed(2)}</b></div>`;
    }).join('');
    document.getElementById('subtotal').innerText = `R$ ${sub.toFixed(2)}`;
    const taxa = (metodoEnvio === 'entrega' && sub > 0) ? configGeral.taxaEntrega : 0;
    document.getElementById('v-taxa-entrega').innerText = `R$ ${taxa.toFixed(2)}`;
    document.getElementById('total-geral').innerText = `R$ ${(sub + taxa).toFixed(2)}`;
    document.getElementById('checkout-total-exibicao').innerText = `R$ ${(sub + taxa).toFixed(2)}`;
}

function setMetodo(tipo) {
    metodoEnvio = tipo;
    document.getElementById('btn-entrega').className = tipo === 'entrega' ? 'active' : '';
    document.getElementById('btn-retirada').className = tipo === 'retirada' ? 'active' : '';
    document.getElementById('campos-endereco').classList.toggle('hidden', tipo === 'retirada');
    atualizarCarrinho();
}

function mudarPagina(p) { 
    if(p === 'checkout' && carrinho.length === 0) return alert("Carrinho vazio!");
    document.getElementById('page-menu').classList.toggle('hidden', p !== 'menu');
    document.getElementById('page-checkout').classList.toggle('hidden', p !== 'checkout');
    window.scrollTo(0,0);
}

function enviarPedidoWhatsApp() {
    const nome = document.getElementById('nome_cliente').value;
    if(!nome) return alert("Informe seu nome!");
    let msg = `*🍕 NOVO PEDIDO*\n*Cliente:* ${nome}\n*Método:* ${metodoEnvio.toUpperCase()}\n`;
    if(metodoEnvio === 'entrega') {
        const rua = document.getElementById('rua_cliente').value;
        const num = document.getElementById('num_cliente').value;
        const bairro = document.getElementById('bairro_cliente').value;
        const ref = document.getElementById('ref_cliente').value; // CAMPO DE REFERÊNCIA CORRIGIDO
        msg += `*Endereço:* ${rua}, nº ${num} - ${bairro}\n*Referência:* ${ref || 'Não informada'}\n`;
    }
    msg += `\n*ITENS:*\n`;
    carrinho.forEach(i => msg += `- ${i.nome} (R$ ${i.preco.toFixed(2)})\n`);
    msg += `\n*TOTAL:* ${document.getElementById('total-geral').innerText}`;
    window.open(`https://api.whatsapp.com/send?phone=${configGeral.whatsapp}&text=${encodeURIComponent(msg)}`);
}

function fecharModal() { document.getElementById('modal-selecao').classList.add('hidden'); }
function limparCarrinho() { carrinho = []; atualizarCarrinho(); }
window.onload = sincronizarComServidor;