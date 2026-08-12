// Estado da AplicaÃ§Ã£o
let currentCategory = '';
let cart = [];
const WHATSAPP_NUMBER = '5512991431935'; 

// ConfiguraÃ§Ãµes de Variantes (Strass)
const strassCategories = ['Infantil', 'Baby Look', 'estampas/Infantil', 'estampas/Baby Look'];
const noStrassItems = ['FTI-002', 'FTI-004', 'FTI-009', 'FTI-015'];
const sublimacaoInfantilStrassIds = ['0001', '0002', '0003', '0004', '0005', '0006', '0008', '0009', '0010', '0012', '0013', '0014', '0015', '0016', '0017', '0018', '0020', '0024', '0029', '0034', '0035', '0036'];

// Elementos DOM
const tabsContainer = document.getElementById('tabs-container');
const catalogContainer = document.getElementById('catalog-container');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const checkoutBtn = document.getElementById('checkout-btn');
const emptyCartMsg = document.querySelector('.empty-cart-message');

// InicializaÃ§Ã£o
document.addEventListener('DOMContentLoaded', () => {
    // catalogo Ã© carregado do dados.js
    if (typeof catalogo === 'undefined' || Object.keys(catalogo).length === 0) {
        catalogContainer.innerHTML = '<p style="text-align:center;width:100%;padding:50px;">Nenhuma estampa encontrada. Execute o gerador_dados.py</p>';
        return;
    }

    const categories = Object.keys(catalogo);
    currentCategory = categories[0];
    
    renderTabs(categories);
    renderCatalog(currentCategory);
    updateCartUI();
});

// RenderizaÃ§Ã£o das Abas
function renderTabs(categories) {
    tabsContainer.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `tab ${cat === currentCategory ? 'active' : ''}`;
        btn.innerText = cat;
        btn.onclick = () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = cat;
            renderCatalog(cat);
        };
        tabsContainer.appendChild(btn);
    });
}

// RenderizaÃ§Ã£o do CatÃ¡logo
function renderCatalog(category) {
    catalogContainer.innerHTML = '';
    const items = catalogo[category];
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openModal(item);
        
        card.innerHTML = `
            <img src="${item.thumb || item.image}" alt="Estampa ${item.id}" loading="lazy">
            <div class="codigo">${item.id}</div>
        `;
        catalogContainer.appendChild(card);
    });
}

// LÃ³gica do Modal de Produto
let currentProduct = null;

function openModal(item) {
    currentProduct = item;
    const modal = document.getElementById('product-modal');
    
    // Configura Imagem ou VÃ­deo no Modal
    const imgEl = document.getElementById('modal-image');
    const videoEl = document.getElementById('modal-video');
    
    // Lógica das Variações (Videos/Strass Dinâmico)
    const variationContainer = document.getElementById('variation-selector-container');
    const variationOptions = document.getElementById('variation-options');
    
    // Função local para atualizar a mídia
    function updateMedia(mediaUrl) {
        if (mediaUrl.toLowerCase().endsWith('.mp4')) {
            imgEl.style.display = 'none';
            videoEl.style.display = 'block';
            videoEl.src = mediaUrl;
            videoEl.playbackRate = 2.5;
        } else {
            videoEl.style.display = 'none';
            videoEl.src = '';
            imgEl.style.display = 'block';
            imgEl.src = mediaUrl;
        }
    }
    
    if (item.variations && item.variations.length > 1) {
        variationContainer.style.display = 'block';
        variationOptions.innerHTML = '';
        
        item.variations.forEach((vari, index) => {
            const label = document.createElement('label');
            label.className = 'variant-option';
            
            const isChecked = index === 0 ? 'checked' : '';
            
            label.innerHTML = `
                <input type="radio" name="variation-option" value="${vari.name}" ${isChecked}>
                <span class="variant-btn">${vari.name}</span>
            `;
            
            // Event listener para trocar video na hora
            label.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked) {
                    updateMedia(vari.image);
                }
            });
            
            variationOptions.appendChild(label);
        });
        
        // Exibe o primeiro por padrão
        updateMedia(item.variations[0].image);
    } else {
        variationContainer.style.display = 'none';
        updateMedia(item.image);
    }

    
    document.getElementById('modal-title').innerText = item.id;
    
    // LÃ³gica do Strass
    const strassContainer = document.getElementById('strass-selector-container');
    let hasStrass = false;
    
    if (strassCategories.some(c => currentCategory.includes(c)) && !currentCategory.includes('Selo') && !noStrassItems.includes(item.id)) {
        hasStrass = true;
    } else if ((currentCategory === 'SublimaÃ§Ã£o Infantil' || currentCategory === 'Sublimação Infantil') && sublimacaoInfantilStrassIds.includes(item.id)) {
        hasStrass = true;
    }
    
    if (hasStrass) {
        strassContainer.style.display = 'block';
        document.querySelector('input[name="strass-option"][value="Com Pedrinha"]').checked = true;
    } else {
        strassContainer.style.display = 'none';
    }
    
    // Lógica de Cores da Camisa
    const colorContainer = document.getElementById('color-selector-container');
    const colorInfantil = document.getElementById('color-options-infantil');
    const colorSilkscreen = document.getElementById('color-options-silkscreen');
    const colorInfantilSelo = document.getElementById('color-options-infantil-selo');
    const colorBabylookSelo = document.getElementById('color-options-babylook-selo');
    
    // Esconde todos inicialmente
    if(colorInfantil) colorInfantil.style.display = 'none';
    if(colorSilkscreen) colorSilkscreen.style.display = 'none';
    if(colorInfantilSelo) colorInfantilSelo.style.display = 'none';
    if(colorBabylookSelo) colorBabylookSelo.style.display = 'none';
    
    if (currentCategory === 'SublimaÃ§Ã£o Infantil' || currentCategory === 'Sublimação Infantil') {
        colorContainer.style.display = 'block';
        if(colorInfantil) colorInfantil.style.display = 'flex';
        document.querySelector('input[name="color-option"][value="Branco"]').checked = true;
    } else if (currentCategory === 'Silkscreen') {
        colorContainer.style.display = 'block';
        if(colorSilkscreen) colorSilkscreen.style.display = 'flex';
        document.querySelector('input[name="color-option-silk"][value="Preta"]').checked = true;
    } else if (currentCategory === 'Viscolycra Infantil Selo') {
        colorContainer.style.display = 'block';
        if(colorInfantilSelo) colorInfantilSelo.style.display = 'flex';
        document.querySelector('#color-options-infantil-selo input[name="color-option"][value="Preta"]').checked = true;
    } else if (currentCategory === 'Baby Look Selo') {
        colorContainer.style.display = 'block';
        if(colorBabylookSelo) colorBabylookSelo.style.display = 'flex';
        document.querySelector('#color-options-babylook-selo input[name="color-option"][value="Preta"]').checked = true;
    } else {
        colorContainer.style.display = 'none';
    }
    
    // LÃ³gica da Cor da Estampa (Print Color)
    const printColorContainer = document.getElementById('print-color-selector-container');
    if (currentCategory === 'Silkscreen') {
        printColorContainer.style.display = 'block';
        document.querySelector('input[name="print-color-option"][value="Branca"]').checked = true;
    } else {
        printColorContainer.style.display = 'none';
    }
    
    // Resetar inputs
    ['size-pp', 'size-p', 'size-m', 'size-g', 'size-gg', 'size-xg'].forEach(id => {
        document.getElementById(id).value = '0';
    });
    
    // Mostra o tamanho XG apenas para Baby Look
    const xgContainer = document.getElementById('group-size-xg');
    if (currentCategory.includes('Baby Look')) {
        xgContainer.style.display = 'flex';
    } else {
        xgContainer.style.display = 'none';
    }
    
    // Atualiza PP para categorias Infantis
    const ppContainer = document.getElementById('group-size-pp');
    if (currentCategory.includes('Infantil')) {
        ppContainer.style.display = 'flex';
    } else {
        ppContainer.style.display = 'none';
    }
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
    currentProduct = null;
}

function changeQty(inputId, change) {
    const input = document.getElementById(inputId);
    let val = parseInt(input.value) || 0;
    val += change;
    if (val < 0) val = 0;
    input.value = val;
}

// Fechar modal clicando fora
window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// LÃ³gica do Carrinho
function addToCart() {
    if (!currentProduct) return;
    
    const sizes = {
        'PP': parseInt(document.getElementById('size-pp').value) || 0,
        'P': parseInt(document.getElementById('size-p').value) || 0,
        'M': parseInt(document.getElementById('size-m').value) || 0,
        'G': parseInt(document.getElementById('size-g').value) || 0,
        'GG': parseInt(document.getElementById('size-gg').value) || 0,
        'XG': parseInt(document.getElementById('size-xg').value) || 0,
    };
    
    const totalItems = Object.values(sizes).reduce((a, b) => a + b, 0);
    
    if (totalItems === 0) {
        alert("Por favor, selecione ao menos uma quantidade.");
        return;
    }
    
    // Captura Variação (Nova Lógica de array)
    let variationSelection = '';
    let selectedImage = currentProduct.image; // default image
    
    const variationContainer = document.getElementById('variation-selector-container');
    if (variationContainer && variationContainer.style.display !== 'none') {
        const selectedRadio = document.querySelector('input[name="variation-option"]:checked');
        if (selectedRadio) {
            variationSelection = selectedRadio.value;
            // Acha a imagem correspondente
            if (currentProduct.variations) {
                const vari = currentProduct.variations.find(v => v.name === variationSelection);
                if(vari) selectedImage = vari.image;
            }
        }
    }
    
    // Captura variante (Strass) legado se aplicável (para categorias sem 'Selo')
    let strassSelection = '';
    const strassContainer = document.getElementById('strass-selector-container');
    if (strassContainer && strassContainer.style.display !== 'none') {
        const selectedRadio = document.querySelector('input[name="strass-option"]:checked');
        if (selectedRadio) {
            strassSelection = selectedRadio.value;
            // Imagem do strass legado
            selectedImage = currentProduct[strassSelection === 'Com Pedrinha' ? 'strass_image' : 'image'];
        }
    }
    
    // Mescla as seleções para o carrinho
    const finalVariant = variationSelection || strassSelection;
    
    // Captura cor da camisa se aplicÃ¡vel
    let colorSelection = '';
    const colorContainer = document.getElementById('color-selector-container');
    if (colorContainer.style.display !== 'none') {
        if (currentCategory === 'Silkscreen') {
            const selectedColorRadio = document.querySelector('input[name="color-option-silk"]:checked');
            if (selectedColorRadio) colorSelection = selectedColorRadio.value;
        } else {
            const selectedColorRadio = document.querySelector('input[name="color-option"]:checked');
            if (selectedColorRadio) colorSelection = selectedColorRadio.value;
        }
    }
    
    // Captura cor da estampa se aplicÃ¡vel
    let printColorSelection = '';
    const printColorContainer = document.getElementById('print-color-selector-container');
    if (printColorContainer.style.display !== 'none') {
        const selectedPrintColor = document.querySelector('input[name="print-color-option"]:checked');
        if (selectedPrintColor) printColorSelection = selectedPrintColor.value;
    }
    
    // Verifica se jÃ¡ tem esse produto no carrinho (considerando a variante e a cor)
    const existingItemIndex = cart.findIndex(item => 
        item.id === currentProduct.id && 
        item.variant === finalVariant && 
        item.color === colorSelection &&
        item.printColor === printColorSelection
    );
    
    if (existingItemIndex >= 0) {
        // Atualiza quantidades
        const item = cart[existingItemIndex];
        item.sizes['PP'] += sizes['PP'];
        item.sizes['P'] += sizes['P'];
        item.sizes['M'] += sizes['M'];
        item.sizes['G'] += sizes['G'];
        item.sizes['GG'] += sizes['GG'];
        item.sizes['XG'] += sizes['XG'];
    } else {
        // Adiciona novo
        cart.push({
            id: currentProduct.id,
            image: selectedImage,
            thumb: currentProduct.thumb,
            category: currentCategory,
            variant: finalVariant,
            color: colorSelection,
            printColor: printColorSelection,
            sizes: sizes
        });
    }
    
    closeModal();
    updateCartUI();
    
    // Feedback visual (abre a gaveta do carrinho brevemente ou mostra notificaÃ§Ã£o)
    toggleCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    
    if (drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        overlay.style.display = 'none';
    } else {
        drawer.classList.add('open');
        overlay.style.display = 'block';
    }
}

function updateCartUI() {
    // Atualiza contador da bolinha
    const totalItems = cart.reduce((total, item) => {
        return total + Object.values(item.sizes).reduce((a, b) => a + b, 0);
    }, 0);
    cartCount.innerText = totalItems;
    
    // Atualiza lista do carrinho
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-message">Seu carrinho estÃ¡ vazio.</div>';
        checkoutBtn.disabled = true;
        return;
    }
    
    checkoutBtn.disabled = false;
    cartItemsContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        
        let sizesText = [];
        for (const [size, qty] of Object.entries(item.sizes)) {
            if (qty > 0) sizesText.push(`${qty}x ${size}`);
        }
        
        let displayTitle = item.id;
        
        let extras = [];
        if (item.color) extras.push(`Camisa: ${item.color}`);
        if (item.printColor) extras.push(`Estampa: ${item.printColor}`);
        if (item.variant) extras.push(item.variant);
        let extrasText = extras.length > 0 ? `(${extras.join(' - ')})` : '';
        
        div.innerHTML = `
            <img src="${item.thumb || item.image}" alt="${item.id}">
            <div class="cart-item-info">
                <div class="cart-item-title">${displayTitle} ${extrasText}</div>
                <div class="cart-item-sizes">Tam: ${sizesText.join(', ')}</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItemsContainer.appendChild(div);
    });
}

// FinalizaÃ§Ã£o (WhatsApp)
function checkout() {
    if (cart.length === 0) return;
    
    let text = "*Novo Pedido - Calegari Malhas* ðŸ›ï¸\n\n";
    
    // Agrupa os itens do carrinho por categoria (Aba)
    const groupedCart = {};
    cart.forEach(item => {
        if (!groupedCart[item.category]) {
            groupedCart[item.category] = [];
        }
        groupedCart[item.category].push(item);
    });
    
    // ConstrÃ³i a mensagem segmentada
    for (const [category, items] of Object.entries(groupedCart)) {
        text += `*--- ${category.toUpperCase()} ---*\n`;
        
        items.forEach(item => {
            let extras = [];
            if (item.color) extras.push(`Camisa: ${item.color}`);
            if (item.printColor) extras.push(`Estampa: ${item.printColor}`);
            if (item.variant) extras.push(item.variant);
            let extrasText = extras.length > 0 ? `(${extras.join(' - ')})` : '';
            
            text += `*Estampa: ${item.id}* ${extrasText}\n`;
            let sizesText = [];
            for (const [size, qty] of Object.entries(item.sizes)) {
                if (qty > 0) sizesText.push(`${qty}x ${size}`);
            }
            text += `Tamanhos: ${sizesText.join(', ')}\n\n`;
        });
    }
    
    text += "_Pedido gerado pelo CatÃ¡logo Digital_";
    
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
}

