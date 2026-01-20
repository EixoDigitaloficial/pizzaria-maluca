const API_URL = "https://pizzaria-maluca.onrender.com/api/config";
let configGeral = {};
let carrinho = [];
let itemAtual = null;
let metodoEnvio = 'entrega';

const limitesSabores = { "P": 1, "M": 2, "G": 3, "F": 3 };

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

async function sincronizarComServidor() {
    try {
        const res = await fetch(API_URL);
        configGeral = await res.json();
        
        // Atualiza Banner de Preços
        document.getElementById('v-preco-p').innerText = configGeral.precosPizzas.p.toFixed(2);
        document.getElementById('v-preco-m').innerText = configGeral.precosPizzas.m.toFixed(2);
        document.getElementById('v-preco-g').innerText = configGeral.precosPizzas.g.toFixed(2);
        document.getElementById('v-preco-f').innerText = configGeral.precosPizzas.f.toFixed(2);
        
        document.getElementById('banner-loading').classList.add('hidden');
        document.getElementById('banner-precos').classList.remove('hidden');

        // Atualiza Status da Loja
        const statusDiv = document.getElementById('status-loja');
        statusDiv.innerHTML = `<span class="dot"></span> Loja Aberta`;
        statusDiv.className = `status-indicator aberto`;

        renderizarMenu();
    } catch (e) {
        document.getElementById('status-loja').innerText = "Erro ao conectar banco";
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
    box.innerHTML = lista.map(item => `
        <div class="item-card">
            <img src="${item.img}" onerror="this.src='img/pizzas/LOGO PIZZA.png'">
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
    box.innerHTML = `
        <div class="item-card"><h3>Água</h3><button class="btn-checkout-next" onclick="abrirModalBebida('Agua')">ESCOLHER</button></div>
        <div class="item-card"><h3>Refrigerantes</h3><button class="btn-checkout-next" onclick="abrirModalBebida('Refri')">ESCOLHER</button></div>
        <div class="item-card"><h3>Sucos</h3><button class="btn-checkout-next" onclick="abrirModalBebida('Suco')">ESCOLHER</button></div>`;
}

function abrirModalPizza(nome, tam) {
    itemAtual = { tipo: 'pizza', nome, tamanho: tam, limite: limitesSabores[tam], preco: configGeral.precosPizzas[tam.toLowerCase()] };
    document.getElementById('modal-title').innerText = `Pizza ${tam} - ${nome}`;
    const todos = [...menuPizzas.tradicionais, ...menuPizzas.gourmet, ...menuPizzas.doces];
    document.getElementById('modal-options').innerHTML = todos.map(s => `<label><input type="checkbox" name="selecao" value="${s.nome}"> ${s.nome}</label>`).join('');
    document.getElementById('modal-selecao').classList.remove('hidden');
}

function confirmarSelecao() {
    if (itemAtual.tipo === 'pizza') {
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
}

function enviarPedidoWhatsApp() {
    const nome = document.getElementById('nome_cliente').value;
    if(!nome) return alert("Informe seu nome!");
    let msg = `*🍕 NOVO PEDIDO*\n*Cliente:* ${nome}\n*Método:* ${metodoEnvio.toUpperCase()}\n\n*ITENS:*\n`;
    carrinho.forEach(i => msg += `- ${i.nome}\n`);
    msg += `\n*TOTAL:* ${document.getElementById('total-geral').innerText}`;
    window.open(`https://api.whatsapp.com/send?phone=${configGeral.whatsapp}&text=${encodeURIComponent(msg)}`);
}

function fecharModal() { document.getElementById('modal-selecao').classList.add('hidden'); }
function limparCarrinho() { carrinho = []; atualizarCarrinho(); }
window.onload = sincronizarComServidor;