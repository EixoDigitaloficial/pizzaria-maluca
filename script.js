// CONFIGURAÇÃO DO BACKEND
const API_URL = "https://pizzaria-maluca.onrender.com/api/config";
let configGeral = {}; let carrinho = []; let itemAtual = null; let metodoEnvio = 'entrega';

// CARDÁPIO DE PIZZAS
const menuPizzas = {
    tradicionais: [
        { nome: "Calabresa", desc: "Molho, muçarela, calabresa e cebola", img: "img/pizzas/pizza 01.png" },
        { nome: "Muçarela", desc: "Muçarela, tomates e azeitonas", img: "img/pizzas/pizza 02.png" },
        { nome: "Portuguesa", desc: "Presunto, ovos, cebola, ervilha, milho", img: "img/pizzas/pizza 03.png" }
    ],
    gourmet: [ { nome: "Parma & Búfala", desc: "Búfala, presunto parma", img: "img/pizzas/pizza 04.png" } ],
    doces: [ { nome: "Chocolate c/ Morango", desc: "Brigadeiro e morangos", img: "img/pizzas/pizza 05.png" } ]
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
    } catch (e) { console.error("Erro banco."); }
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

function renderBebidas() {
    const box = document.getElementById('lista-bebidas');
    const bebidas = [
        { nome: "Água Mineral", img: "img/bebidas/agua 01.png", tipo: "Agua" },
        { nome: "Refrigerantes", img: "img/bebidas/Refrigerantes 01.png", tipo: "Refri" },
        { nome: "Sucos Naturais", img: "img/bebidas/sucos 01.png", tipo: "Suco" }
    ];
    box.innerHTML = bebidas.map(b => `
        <div class="item-card">
            <div class="item-img-box"><img src="${b.img}"></div>
            <h3>${b.nome}</h3>
            <button class="btn-checkout-next" onclick="abrirModalBebida('${b.tipo}')">ESCOLHER</button>
        </div>`).join('');
}

// MODAL DE BEBIDAS COM PREÇOS E SABORES CORRIGIDOS
function abrirModalBebida(tipo) {
    const container = document.getElementById('modal-options');
    const titulo = document.getElementById('modal-title');
    document.getElementById('modal-subtitle').innerText = "Selecione as opções abaixo:";
    container.innerHTML = "";
    
    if (tipo === 'Agua') {
        titulo.innerText = "Água Mineral";
        itemAtual = { tipo: 'bebida', nome: 'Água' };
        container.innerHTML = `
            <label><input type="radio" name="beb_sel" value="Sem Gás|3.00"> Sem Gás - R$ 3,00</label>
            <label><input type="radio" name="beb_sel" value="Com Gás|5.00"> Com Gás - R$ 5,00</label>`;
    } else if (tipo === 'Refri') {
        titulo.innerText = "Refrigerantes";
        itemAtual = { tipo: 'bebida', nome: 'Refri' };
        container.innerHTML = `
            <b>Tamanho:</b><br>
            <label><input type="radio" name="refri_tam" value="1Lt|10.00"> 1Lt - R$ 10.00</label>
            <label><input type="radio" name="refri_tam" value="2Lt|12.00"> 2Lt - R$ 12.00</label><br>
            <b>Sabor:</b><br>` + 
            ["Cola", "Guaraná", "Fanta", "Jesus"].map(s => `<label><input type="radio" name="beb_sel" value="${s}"> ${s}</label>`).join(' ');
    } else if (tipo === 'Suco') {
        titulo.innerText = "Sucos Naturais";
        itemAtual = { tipo: 'bebida', nome: 'Suco' };
        container.innerHTML = `
            <b>Tipo:</b><br>
            <label><input type="radio" name="suco_tipo" value="Com Leite|8.00"> Com Leite (R$ 8,00)</label>
            <label><input type="radio" name="suco_tipo" value="Sem Leite|5.00"> Sem Leite (R$ 5,00)</label><br>
            <b>Sabor:</b><br>` + 
            ["Abacaxi", "Abacaxi c/ Hortelã", "Acerola", "Laranja", "Limão", "Maracujá", "Morango", "Melancia"].map(s => `<label><input type="radio" name="beb_sel" value="${s}"> ${s}</label>`).join(' ');
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
        const sabor = document.querySelector('input[name="beb_sel"]:checked');
        if (!sabor) return alert("Escolha o sabor!");
        
        let nomeF, precoF;
        if (itemAtual.nome === 'Agua') {
            const [n, p] = sabor.value.split('|');
            nomeF = `Água ${n}`; precoF = parseFloat(p);
        } else if (itemAtual.nome === 'Refri') {
            const tam = document.querySelector('input[name="refri_tam"]:checked');
            if (!tam) return alert("Escolha o tamanho!");
            const [t, p] = tam.value.split('|');
            nomeF = `Refri ${sabor.value} (${t})`; precoF = parseFloat(p);
        } else {
            const tipo = document.querySelector('input[name="suco_tipo"]:checked');
            if (!tipo) return alert("Escolha o tipo!");
            const [t, p] = tipo.value.split('|');
            nomeF = `Suco ${sabor.value} (${t})`; precoF = parseFloat(p);
        }
        carrinho.push({ nome: nomeF, preco: precoF });
    } else {
        const sel = Array.from(document.querySelectorAll('input[name="selecao"]:checked')).map(i => i.value);
        if(sel.length === 0 || sel.length > itemAtual.limite) return alert(`Escolha até ${itemAtual.limite} sabores!`);
        carrinho.push({ nome: `Pizza ${itemAtual.tamanho} (${sel.join('/')})`, preco: itemAtual.preco });
    }
    fecharModal(); atualizarCarrinho();
}

function atualizarCarrinho() {
    let sub = 0;
    document.getElementById('carrinho-itens').innerHTML = carrinho.map(i => { sub += i.preco; return `<div class="cart-item"><span>${i.nome}</span><b>R$ ${i.preco.toFixed(2)}</b></div>`; }).join('');
    document.getElementById('subtotal').innerText = `R$ ${sub.toFixed(2)}`;
    const taxa = (metodoEnvio === 'entrega' && sub > 0) ? configGeral.taxaEntrega : 0;
    document.getElementById('v-taxa-entrega').innerText = `R$ ${taxa.toFixed(2)}`;
    document.getElementById('total-geral').innerText = `R$ ${(sub + taxa).toFixed(2)}`;
    document.getElementById('checkout-total-exibicao').innerText = `R$ ${(sub + taxa).toFixed(2)}`;
}

function setMetodo(t) { metodoEnvio = t; document.getElementById('btn-entrega').className = t === 'entrega' ? 'active' : ''; document.getElementById('btn-retirada').className = t === 'retirada' ? 'active' : ''; document.getElementById('campos-endereco').classList.toggle('hidden', t === 'retirada'); atualizarCarrinho(); }
function mudarPagina(p) { if(p === 'checkout' && carrinho.length === 0) return alert("Vazio!"); document.getElementById('page-menu').classList.toggle('hidden', p !== 'menu'); document.getElementById('page-checkout').classList.toggle('hidden', p !== 'checkout'); window.scrollTo(0,0); }
function enviarPedidoWhatsApp() {
    const n = document.getElementById('nome_cliente').value; if(!n) return alert("Nome!");
    let msg = `*🍕 NOVO PEDIDO*\n*Cliente:* ${n}\n*Método:* ${metodoEnvio.toUpperCase()}\n`;
    if(metodoEnvio === 'entrega') msg += `*Endereço:* ${document.getElementById('rua_cliente').value}, ${document.getElementById('num_cliente').value} - ${document.getElementById('bairro_cliente').value}\n*Ref:* ${document.getElementById('ref_cliente').value}\n`;
    msg += `\n*ITENS:*\n` + carrinho.map(i => `- ${i.nome}`).join('\n') + `\n\n*TOTAL:* ${document.getElementById('total-geral').innerText}`;
    window.open(`https://api.whatsapp.com/send?phone=${configGeral.whatsapp}&text=${encodeURIComponent(msg)}`);
}
function fecharModal() { document.getElementById('modal-selecao').classList.add('hidden'); }
function limparCarrinho() { carrinho = []; atualizarCarrinho(); }
window.onload = sincronizarComServidor;