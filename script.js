// Estado da AplicaÃ§Ã£o
let currentCategory = '';
let cart = JSON.parse(localStorage.getItem('calegari_cart')) || [];

function saveCart() {
    localStorage.setItem('calegari_cart', JSON.stringify(cart));
}
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
// const checkoutBtn = document.getElementById('checkout-btn');
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

// RenderizaÃ§Ã£o do Catálogo
function renderCatalog(category) {
    catalogContainer.innerHTML = '';
    const items = catalogo[category];
    
    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openModal(item);
        
        let loadingAttr = index < 4 ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
        card.innerHTML = `
            <img src="${item.thumb || item.image}" alt="Estampa ${item.id}" ${loadingAttr}>
            <div class="codigo">${item.id}</div>
        `;
        catalogContainer.appendChild(card);
    });
}

// Lógica do Modal de Produto
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
    const errMsg = document.getElementById('modal-error-msg');
    if(errMsg) errMsg.style.display = 'none';
    
    // Lógica do Strass
    const strassContainer = document.getElementById('strass-selector-container');
    let hasStrass = false;
    
    if (!currentCategory.includes('Body') && strassCategories.some(c => currentCategory.includes(c)) && !currentCategory.includes('Selo') && !noStrassItems.includes(item.id)) {
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
    
    // Lógica de Cores da Camisa / Viés
    const colorContainer = document.getElementById('color-selector-container');
    const colorTitle = colorContainer ? colorContainer.querySelector('h3') : null;
    const colorInfantil = document.getElementById('color-options-infantil');
    const colorSilkscreen = document.getElementById('color-options-silkscreen');
    const colorInfantilSelo = document.getElementById('color-options-infantil-selo');
    const colorBabylookSelo = document.getElementById('color-options-babylook-selo');
    const colorBody = document.getElementById('color-options-body');
    
    // Esconde todos inicialmente
    if(colorInfantil) colorInfantil.style.display = 'none';
    if(colorSilkscreen) colorSilkscreen.style.display = 'none';
    if(colorInfantilSelo) colorInfantilSelo.style.display = 'none';
    if(colorBabylookSelo) colorBabylookSelo.style.display = 'none';
    if(colorBody) colorBody.style.display = 'none';
    
    if (currentCategory === 'Body Infantil' || currentCategory === 'estampasbody') {
        colorContainer.style.display = 'block';
        if(colorTitle) colorTitle.innerText = 'Cor do Viés (Gola/Manga):';
        if(colorBody) colorBody.style.display = 'flex';
        const defaultRadio = document.querySelector('input[name="color-option-body"][value="Branco"]');
        if(defaultRadio) defaultRadio.checked = true;
    } else {
        if(colorTitle) colorTitle.innerText = 'Cor da Camisa:';
        if (currentCategory === 'Sublimação Infantil' || currentCategory === 'Sublimação Infantil') {
            colorContainer.style.display = 'block';
            if(colorInfantil) colorInfantil.style.display = 'flex';
            const defaultRadio = document.querySelector('input[name="color-option"][value="Branco"]');
            if(defaultRadio) defaultRadio.checked = true;
        } else if (currentCategory === 'Silkscreen') {
            colorContainer.style.display = 'block';
            if(colorSilkscreen) colorSilkscreen.style.display = 'flex';
            const defaultRadio = document.querySelector('input[name="color-option-silk"][value="Preta"]');
            if(defaultRadio) defaultRadio.checked = true;
        } else if (currentCategory === 'Viscolycra Infantil Selo') {
            colorContainer.style.display = 'block';
            if(colorInfantilSelo) colorInfantilSelo.style.display = 'flex';
            const defaultRadio = document.querySelector('#color-options-infantil-selo input[name="color-option"][value="Preta"]');
            if(defaultRadio) defaultRadio.checked = true;
        } else if (currentCategory === 'Baby Look Selo') {
            colorContainer.style.display = 'block';
            if(colorBabylookSelo) colorBabylookSelo.style.display = 'flex';
            const defaultRadio = document.querySelector('#color-options-babylook-selo input[name="color-option"][value="Preta"]');
            if(defaultRadio) defaultRadio.checked = true;
        } else {
            colorContainer.style.display = 'none';
        }
    }
    
    // Lógica da Cor da Estampa (Print Color)
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
    
    // Atualiza PP para categorias Infantis (exceto Body)
    const ppContainer = document.getElementById('group-size-pp');
    if (currentCategory.includes('Infantil') && currentCategory !== 'Body Infantil') {
        ppContainer.style.display = 'flex';
    } else {
        ppContainer.style.display = 'none';
    }
    modal.style.display = 'flex';
    history.pushState({ type: 'modal' }, '', '#produto');
}

function closeModal(isPopState = false) {
    const modal = document.getElementById('product-modal');
    if (modal.style.display !== 'none') {
        modal.style.display = 'none';
        currentProduct = null;
        if (!isPopState && window.location.hash === '#produto') {
            history.back();
        }
    }
}

function changeQty(inputId, change) {
    const errMsg = document.getElementById('modal-error-msg');
    if(errMsg) errMsg.style.display = "none";
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

// Lógica do Carrinho
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
        const errMsg = document.getElementById('modal-error-msg');
        if (errMsg) {
            errMsg.innerText = "Por favor, selecione ao menos uma quantidade.";
            errMsg.style.display = "block";
        }
        return;
    } else {
        const errMsg = document.getElementById('modal-error-msg');
        if (errMsg) errMsg.style.display = "none";
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
    
    // Captura cor da camisa / viés se aplicável
    let colorSelection = '';
    const colorContainer = document.getElementById('color-selector-container');
    if (colorContainer.style.display !== 'none') {
        if (currentCategory === 'Body Infantil' || currentCategory === 'estampasbody') {
            const selectedColorRadio = document.querySelector('input[name="color-option-body"]:checked');
            if (selectedColorRadio) colorSelection = selectedColorRadio.value;
        } else if (currentCategory === 'Silkscreen') {
            const selectedColorRadio = document.querySelector('input[name="color-option-silk"]:checked');
            if (selectedColorRadio) colorSelection = selectedColorRadio.value;
        } else {
            const selectedColorRadio = document.querySelector('input[name="color-option"]:checked');
            if (selectedColorRadio) colorSelection = selectedColorRadio.value;
        }
    }
    
    // Captura cor da estampa se aplicável
    let printColorSelection = '';
    const printColorContainer = document.getElementById('print-color-selector-container');
    if (printColorContainer.style.display !== 'none') {
        const selectedPrintColor = document.querySelector('input[name="print-color-option"]:checked');
        if (selectedPrintColor) printColorSelection = selectedPrintColor.value;
    }
    
    // Verifica se já tem esse produto no carrinho (considerando a variante e a cor)
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
    
    // Feedback visual sem interrupção
    showToast("Produto adicionado ao carrinho! 🛒");
    saveCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function openCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    drawer.classList.add('open');
    overlay.style.display = 'block';
    history.pushState({ type: 'cart' }, '', '#carrinho');
}

function closeCart(isPopState = false) {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    drawer.classList.remove('open');
    overlay.style.display = 'none';
    if (!isPopState) {
        if (window.location.hash === '#carrinho') {
            history.back();
        }
    }
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer.classList.contains('open')) {
        closeCart();
    } else {
        openCart();
    }
}

function openHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.style.display = 'flex';
        history.pushState({ type: 'help' }, '', '#ajuda');
    }
}

function closeHelpModal(isPopState = false) {
    const modal = document.getElementById('help-modal');
    if (modal && modal.style.display !== 'none') {
        modal.style.display = 'none';
        if (!isPopState && window.location.hash === '#ajuda') {
            history.back();
        }
    }
}

window.addEventListener('popstate', function(event) {
    const helpModal = document.getElementById('help-modal');
    if (helpModal && helpModal.style.display !== 'none') {
        closeHelpModal(true);
    }
    const modal = document.getElementById('product-modal');
    if (modal && modal.style.display !== 'none') {
        closeModal(true);
    }
    const drawer = document.getElementById('cart-drawer');
    if (drawer && drawer.classList.contains('open')) {
        closeCart(true);
    }
});

function updateCartUI() {
    // Atualiza contador da bolinha
    const totalItems = cart.reduce((total, item) => {
        return total + Object.values(item.sizes).reduce((a, b) => a + b, 0);
    }, 0);
    cartCount.innerText = totalItems;
    
    // Atualiza barra flutuante de carrinho na parte inferior
    const stickyBar = document.getElementById('sticky-cart-bar');
    const stickyText = document.getElementById('sticky-cart-text');
    if (stickyBar) {
        if (totalItems > 0) {
            stickyBar.style.display = 'flex';
            if (stickyText) {
                stickyText.innerText = `Ver Meu Pedido (${totalItems} ${totalItems === 1 ? 'peça' : 'peças'})`;
            }
        } else {
            stickyBar.style.display = 'none';
        }
    }
    
    // Atualiza lista do carrinho
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-message">Seu carrinho está vazio.</div>';
        const btnAp = document.getElementById('checkout-btn-aparecida');
        const btnGua = document.getElementById('checkout-btn-guaratingueta');
        if(btnAp) btnAp.disabled = true;
        if(btnGua) btnGua.disabled = true;
        return;
    }
    
    const btnAp = document.getElementById('checkout-btn-aparecida');
    const btnGua = document.getElementById('checkout-btn-guaratingueta');
    if(btnAp) btnAp.disabled = false;
    if(btnGua) btnGua.disabled = false;
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
        if (item.color) {
            let colorLabel = 'Camisa';
            if (item.category && item.category.includes('Body')) {
                colorLabel = 'Viés';
            } else if (item.category === 'Baby Look Selo') {
                colorLabel = 'Baby Visco';
            }
            extras.push(`${colorLabel}: ${item.color}`);
        }
        if (item.printColor) extras.push(`Estampa: ${item.printColor}`);
        if (item.variant) extras.push(item.variant);
        let extrasText = extras.length > 0 ? `(${extras.join(' - ')})` : '';
        
        div.innerHTML = `
            <img src="${item.thumb || item.image}" alt="${item.id}">
            <div class="cart-item-info">
                <div class="cart-item-title">${displayTitle} ${extrasText}</div>
                <div class="cart-item-sizes">Tam: ${sizesText.join(', ')}</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})" title="Remover item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
            </button>
        `;
        cartItemsContainer.appendChild(div);
    });
}

// Finalização (WhatsApp)
function checkout(store) {
    if (cart.length === 0) return;
    
    let phone = '5512991431935'; // Aparecida (default)
    if (store === 'guaratingueta') {
        phone = '5512991420566';
    }
    
    let text = "*Novo Pedido - Calegari Malhas*\n\n";
    
    // Agrupa os itens do carrinho por categoria (Aba)
    const groupedCart = {};
    cart.forEach(item => {
        if (!groupedCart[item.category]) {
            groupedCart[item.category] = [];
        }
        groupedCart[item.category].push(item);
    });
    
    // Constrói a mensagem segmentada
    for (const [category, items] of Object.entries(groupedCart)) {
        let catHeader = category.toUpperCase();
        if (category === 'Baby Look Selo') {
            catHeader = 'VISCOLYCRA SELO ADULTA';
        }
        text += `*--- ${catHeader} ---*\n`;
        
        items.forEach(item => {
            let extras = [];
            if (item.color) {
                let colorLabel = 'Camisa';
                if (item.category && item.category.includes('Body')) {
                    colorLabel = 'Viés';
                } else if (item.category === 'Baby Look Selo') {
                    colorLabel = 'Baby Visco';
                }
                extras.push(`${colorLabel}: ${item.color}`);
            }
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
    
    text += "_Pedido gerado pelo Catálogo Digital_";
    
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
}


function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    
    // Animar icone do carrinho
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => cartIcon.classList.remove('cart-bounce'), 300);
    }
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
