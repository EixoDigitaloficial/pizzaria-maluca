const API_BASE_URL = "https://pizzaria-maluca.onrender.com/api";
let configGeral = {};
let precosPizza = {}; 
let carrinho = [];
let itemAtual = null; 

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
        const res = await fetch(`${API_BASE_URL}/config`);
        configGeral = await res.json();
        precosPizza = configGeral.precos;

        // Atualiza Preços das Pizzas no Banner
        if(document.getElementById('v-preco-p')) document.getElementById('v-preco-p').innerText = precosPizza.P.toFixed(2);
        if(document.getElementById('v-preco-m')) document.getElementById('v-preco-m').innerText = precosPizza.M.toFixed(2);
        if(document.getElementById('v-preco-g')) document.getElementById('v-preco-g').innerText = precosPizza.G.toFixed(2);

        const statusDiv = document.getElementById('status-loja');
        if (statusDiv) {
            statusDiv.innerHTML = configGeral.statusLoja === 'aberto' ? '<span class="dot"></span> Aberto' : '<span class="dot"></span> Fechado';
            statusDiv.className = `status-indicator ${configGeral.statusLoja}`;
        }

        const taxaEntregaEl = document.getElementById('v-taxa-entrega');
        if(taxaEntregaEl) taxaEntregaEl.innerText = `R$ ${configGeral.taxaEntrega.toFixed(2)}`;

        renderizarMenu();
    } catch (e) { console.error("Erro ao conectar ao servidor."); }
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
            <div class="item-img-box"><img src="${item.img}"></div>
            <h3>${item.nome}</h3>
            <p>${item.desc || ''}</p>
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
    // Forçamos a criação dos cards de bebida para que eles não sumam
    box.innerHTML = `
        <div class="item-card"><img src="img/bebidas/agua 01.png" width="80"><h3>Água</h3><button class="btn-checkout-next" onclick="abrirModalBebida('Agua')">ESCOLHER</button></div>
        <div class="item-card"><img src="img/bebidas/Refrigerantes 01.png" width="80"><h3>Refrigerantes</h3><button class="btn-checkout-next" onclick="abrirModalBebida('Refri')">ESCOLHER</button></div>
        <div class="item-card"><img src="img/bebidas/sucos 01.png" width="80"><h3>Sucos Naturais</h3><button class="btn-checkout-next" onclick="abrirModalBebida('Suco')">ESCOLHER</button></div>`;
}

function abrirModalBebida(tipo) {
    const b = configGeral.bebidas;
    const container = document.getElementById('modal-options');
    container.innerHTML = "";
    document.getElementById('modal-subtitle').innerText = "Selecione as opções abaixo:";

    if (tipo === 'Agua') {
        document.getElementById('modal-title').innerText = "Água Mineral";
        itemAtual = { tipo: 'bebida', nome: 'Água' };
        container.innerHTML = `
            <label><input type="radio" name="selecao_unica" value="Sem Gás|${b.aguasemGas}"> Sem Gás - R$ ${b.aguasemGas.toFixed(2)}</label>
            <label><input type="radio" name="selecao_unica" value="Com Gás|${b.AguacomGas}"> Com Gás - R$ ${b.AguacomGas.toFixed(2)}</label>`;
    } 
    else if (tipo === 'Suco') {
        document.getElementById('modal-title').innerText = "Sucos Naturais";
        itemAtual = { tipo: 'bebida', nome: 'Suco' };
        // Correção para mostrar tipo e sabores no mesmo modal
        container.innerHTML = `<b>Opção:</b><br>
            <label><input type="radio" name="tipo_bebida" value="Com Leite|${b.sucocomLeite}"> Com Leite (R$ ${b.sucocomLeite.toFixed(2)})</label>
            <label><input type="radio" name="tipo_bebida" value="Sem Leite|${b.sucosemLeite}"> Sem Leite (R$ ${b.sucosemLeite.toFixed(2)})</label><br>
            <b>Sabor:</b><br>` + 
            ["Abacaxi", "Laranja", "Morango", "Acerola", "Maracujá", "Limão"].map(s => `<label><input type="radio" name="sabor_bebida" value="${s}"> ${s}</label>`).join('');
    }
    else if (tipo === 'Refri') {
        document.getElementById('modal-title').innerText = "Refrigerantes";
        itemAtual = { tipo: 'bebida', nome: 'Refri' };
        // Correção para mostrar tamanhos e sabores
        container.innerHTML = `<b>Tamanho:</b><br>
            <label><input type="radio" name="tipo_bebida" value="1Lt|${b.refri1l}"> 1 Litro - R$ ${b.refri1l.toFixed(2)}</label>
            <label><input type="radio" name="tipo_bebida" value="2Lt|${b.refri2l}"> 2 Litros - R$ ${b.refri2l.toFixed(2)}</label><br>
            <b>Sabor:</b><br>` + 
            ["Cola", "Guaraná", "Fanta", "Jesus"].map(s => `<label><input type="radio" name="sabor_bebida" value="${s}"> ${s}</label>`).join('');
    }
    document.getElementById('modal-selecao').classList.remove('hidden');
}

function confirmarSelecao() {
    if (itemAtual.tipo === 'bebida') {
        const tipoB = document.querySelector('input[name="tipo_bebida"]:checked');
        const saborB = document.querySelector('input[name="sabor_bebida"]:checked');
        const unica = document.querySelector('input[name="selecao_unica"]:checked');

        let nomeFinal, precoFinal;

        if (unica) {
            const [n, p] = unica.value.split('|');
            nomeFinal = `${itemAtual.nome} ${n}`;
            precoFinal = parseFloat(p);
        } else if (tipoB && saborB) {
            const [t, p] = tipoB.value.split('|');
            nomeFinal = `${itemAtual.nome} ${saborB.value} (${t})`;
            precoFinal = parseFloat(p);
        } else { return alert("Por favor, selecione todas as opções!"); }

        carrinho.push({ nome: nomeFinal, preco: precoFinal });
    } else {
        const sel = Array.from(document.querySelectorAll('input[name="selecao"]:checked')).map(i => i.value);
        if(sel.length === 0 || sel.length > itemAtual.limite) return alert("Escolha os sabores corretamente!");
        carrinho.push({ nome: `Pizza ${itemAtual.tamanho} (${sel.join('/')})`, preco: itemAtual.preco });
    }
    fecharModal();
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const itensDiv = document.getElementById('carrinho-itens');
    let sub = 0;
    itensDiv.innerHTML = carrinho.map(i => { 
        sub += i.preco; 
        return `<div class="cart-item"><span>${i.nome}</span> <b>R$ ${i.preco.toFixed(2)}</b></div>`;
    }).join('');
    
    if(carrinho.length === 0) itensDiv.innerHTML = '<p class="empty-msg">Escolha seus sabores favoritos!</p>';
    
    document.getElementById('subtotal').innerText = `R$ ${sub.toFixed(2)}`;
    const entrega = sub > 0 ? configGeral.taxaEntrega : 0;
    document.getElementById('total-geral').innerText = `R$ ${(sub + entrega).toFixed(2)}`;
}

function abrirModalPizza(nome, tam) {
    itemAtual = { tipo: 'pizza', nome, tamanho: tam, limite: limitesSabores[tam], preco: precosPizza[tam] };
    document.getElementById('modal-title').innerText = `Pizza ${tam} - ${nome}`;
    const container = document.getElementById('modal-options');
    const todos = [...menuPizzas.tradicionais, ...menuPizzas.gourmet, ...menuPizzas.doces];
    container.innerHTML = todos.map(s => `<label><input type="checkbox" name="selecao" value="${s.nome}"> ${s.nome}</label>`).join('');
    document.getElementById('modal-selecao').classList.remove('hidden');
}

function fecharModal() { document.getElementById('modal-selecao').classList.add('hidden'); }
function limparCarrinho() { carrinho = []; atualizarCarrinho(); }
function mudarPagina(p) { 
    if(p === 'checkout' && carrinho.length === 0) return alert("Carrinho vazio!");
    document.getElementById('page-menu').classList.toggle('hidden', p !== 'menu');
    document.getElementById('page-checkout').classList.toggle('hidden', p !== 'checkout');
}

function enviarPedidoWhatsApp() {
    const n = document.getElementById('nome_cliente').value;
    const e = document.getElementById('endereco_cliente').value;
    const p = document.getElementById('pagamento_cliente').value;
    if(!n || !e) return alert("Preencha os dados!");
    let msg = `*🍕 NOVO PEDIDO*\n*Cliente:* ${n}\n*Endereço:* ${e}\n*Pagamento:* ${p}\n\n*ITENS:*\n`;
    carrinho.forEach(i => msg += `- ${i.nome} (R$ ${i.preco.toFixed(2)})\n`);
    msg += `\n*TOTAL:* ${document.getElementById('total-geral').innerText}`;
    window.open(`https://api.whatsapp.com/send?phone=${configGeral.whatsapp}&text=${encodeURIComponent(msg)}`);
}

window.onload = sincronizarComServidor;