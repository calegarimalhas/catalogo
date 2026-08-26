// Estado da Aplicação
let currentCategory = '';
let currentSubFilter = 'Todos';
let cart = JSON.parse(localStorage.getItem('calegari_cart')) || [];

function saveCart() {
    localStorage.setItem('calegari_cart', JSON.stringify(cart));
}
const WHATSAPP_NUMBER = '5512991431935'; 

// Configurações de Variantes (Strass)
const strassCategories = ['Infantil', 'Baby Look', 'estampas/Infantil', 'estampas/Baby Look'];
const noStrassItems = ['FTI-002', 'FTI-004', 'FTI-009', 'FTI-015'];
const sublimacaoInfantilStrassIds = ['0002', '0004', '0005', '0006', '0008', '0009', '0010', '0012', '0013', '0014', '0015', '0016', '0018', '0020', '0029', '0035', '0036'];

// Dicionário de Filtros por Categoria/Tema
const FILTROS_CATEGORIAS = {
    "Baby Look": {
        "Nossa Senhora Aparecida": ["BBLK001", "BBLK002", "BBLK003", "BBLK004", "BBLK005", "BBLK008", "BBLK009", "BBLK010", "BBLK011", "BBLK012", "BBLK013", "BBLK014", "BBLK015", "BBLK016", "BBLK017", "BBLK018", "BBLK020", "BBLK021", "BBLK022", "BBLK023", "BBLK024", "BBLK025", "BBLK026", "BBLK027", "BBLK028", "BBLK040", "BBLK043", "BBLK044", "BBLK045", "BBLK046"],
        "São Miguel": ["BBLK007", "BBLK029"],
        "Nossa Senhora das Graças": ["BBLK019", "BBLK035", "BBLK037"],
        "Nossa Senhora de Fátima": ["BBLK006", "BBLK030", "BBLK032", "BBLK038"],
        "São Bento": ["BBLK031", "BBLK036"],
        "Nossa Senhora de Guadalupe": ["BBLK033", "BBLK039"],
        "Sagrada Família": ["BBLK034"],
        "Santíssimo": ["BBLK042"],
        "São José": ["BBLK041"]
    },
    "Body": {
        "Nossa Senhora Aparecida": ["0002", "0003", "0005", "0006", "0007", "0020", "0021", "0023", "0024", "0029", "0031", "0032", "0033"],
        "Anjinhos": ["0001", "0004", "0008", "0009", "0018", "0019", "0022", "0025", "0026", "0027", "0028", "0030"],
        "Futebol": ["0037", "0038", "0039", "0040", "0041", "0042", "0043", "0044", "0045", "0046", "0047", "0048"],
        "Desenhos": ["0034", "0035", "0036"],
        "Fé": ["0010", "0011", "0012", "0013", "0014", "0015", "0016", "0017"]
    },
    "Frente Total": {
        "Nossa Senhora Aparecida": ["FT001", "FT002", "FT003", "FT004", "FT005", "FT010", "FT034", "FT037", "FT038", "FT043", "FT044", "FT045", "FT046", "FT061", "FT071", "FT073", "FT075", "FT076", "FT077", "FT078"],
        "Nossa Senhora de Fátima": ["FT006", "FT021", "FT022", "FT023", "FT024", "FT067"],
        "São Bento": ["FT007", "FT011", "FT012", "FT049", "FT057"],
        "Cristo": ["FT008", "FT009", "FT013", "FT014", "FT015", "FT026", "FT027", "FT040", "FT041", "FT051"],
        "Nossa Senhora das Graças": ["FT029", "FT048", "FT059", "FT068", "FT069", "FT070"],
        "São Miguel": ["FT031", "FT032", "FT042"],
        "São Jorge": ["FT025", "FT035", "FT036", "FT056"],
        "Outros": ["FT016", "FT017", "FT018", "FT019", "FT020", "FT028", "FT030", "FT033", "FT039", "FT047", "FT050", "FT052", "FT053", "FT054", "FT055", "FT058", "FT060", "FT062", "FT063", "FT064", "FT065", "FT066", "FT072", "FT074"]
    },
    "Infantil": {
        "Nossa Senhora Aparecida": ["FTI-005", "FTI-006", "FTI-007", "FTI-010", "FTI-012", "FTI-016", "FTI-018", "FTI-022", "FTI-023", "FTI-024", "FTI-025", "FTI-026", "FTI-027"],
        "Anjinhos": ["FTI-001", "FTI-002", "FTI-003", "FTI-004", "FTI-008", "FTI-009"],
        "Cristo": ["FTI-013", "FTI-014", "FTI-015"],
        "São Bento": ["FTI-021"],
        "São Miguel": ["FTI-019"],
        "Outros": ["FTI-011", "FTI-017", "FTI-020"]
    },
    "Visco Infantil Selo": {
        "Nossa Senhora Aparecida": ["SI-001", "SI-002", "SI-004", "SI-005", "SI-007", "SI-008", "SI-009"],
        "Anjinhos": ["SI-003", "SI-006"],
        "Outros": ["SI-010"]
    },
    "Baby Look Selo": {
        "Nossa Senhora Aparecida": ["0001", "0002", "0006", "0007", "0009", "0013", "0014", "0016", "0017", "0018", "0023", "0024", "0025", "0027", "0029", "0031", "0035", "0037", "0039", "0040", "0041", "0042", "0043", "0044", "0045", "0050", "0051", "0056", "0057", "0059", "0062", "0063"],
        "São Bento": ["0005", "0008", "0046", "0058"],
        "Nossa Senhora de Fátima": ["0055"],
        "Nossa Senhora das Graças": ["0015", "0053", "0054"],
        "São Miguel": ["0019", "0047"],
        "Cristo": ["0004", "0012", "0033", "0061"],
        "Outros": ["0003", "0010", "0011", "0020", "0021", "0022", "0026", "0028", "0030", "0032", "0034", "0036", "0038", "0048", "0049", "0052", "0060", "0064"]
    },
    "Sublimação Infantil": {
        "Nossa Senhora Aparecida": ["0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008", "0009", "0010", "0011", "0012", "0013", "0014", "0015", "0016", "0023", "0024", "0029", "0030", "0031", "0032", "0035", "0036", "0037", "0038", "0039", "0040", "0041", "0042", "0044", "0045", "0046", "0047", "0048", "0051", "0052", "0054", "0055", "0056", "0059", "0060", "0062", "0063", "0066"],
        "Anjinhos": ["0017", "0018", "0019", "0020", "0025", "0026", "0027", "0028", "0043", "0049", "0050", "0064", "0065", "0067", "0068"],
        "São Bento": ["0061"],
        "Outros": ["0021", "0022", "0033", "0034", "0053", "0057", "0058", "0069", "0070", "0071", "0072", "0073", "0074", "0075", "0076"]
    },
    "Silkscreen": {
        "Nossa Senhora Aparecida": ["0001", "0005", "0006", "0013", "0014", "0019", "0023", "0024", "0026", "0028", "0032", "0033", "0034", "0035", "0038", "0039", "0045", "0047", "0048"],
        "São Bento": ["0003", "0008", "0018", "0037", "0066", "0067"],
        "São Miguel": ["0015"],
        "São Jorge": ["0022", "0059", "0060"],
        "Nossa Senhora das Graças": ["0044", "0052"],
        "Cristo": ["0043", "0046", "0055", "0056", "0061", "0062", "0063", "0064", "0068", "0072", "0073", "0075", "0076"],
        "Outros": ["0002", "0004", "0007", "0009", "0010", "0011", "0012", "0016", "0017", "0020", "0021", "0025", "0027", "0029", "0030", "0031", "0036", "0040", "0041", "0042", "0049", "0050", "0051", "0053", "0054", "0057", "0058", "0065", "0069", "0070", "0071", "0074", "0077"]
    }
};

// Elementos DOM
const tabsContainer = document.getElementById('tabs-container');
const catalogContainer = document.getElementById('catalog-container');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const emptyCartMsg = document.querySelector('.empty-cart-message');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // catalogo é carregado do dados.js
    if (typeof catalogo === 'undefined' || Object.keys(catalogo).length === 0) {
        catalogContainer.innerHTML = '<p style="text-align:center;width:100%;padding:50px;">Nenhuma estampa encontrada. Execute o gerador_dados.py</p>';
        return;
    }

    const categories = Object.keys(catalogo);
    currentCategory = categories[0];
    currentSubFilter = 'Todos';
    
    renderTabs(categories);
    renderSubFilters(currentCategory);
    renderCatalog(currentCategory);
    updateCartUI();

    const tabsNav = document.getElementById('tabs-container');
    if (tabsNav) {
        tabsNav.addEventListener('scroll', updateTabsArrows);
        window.addEventListener('resize', updateTabsArrows);
    }
    updateTabsArrows();
    setTimeout(updateTabsArrows, 200);
});

// Funções para controle da navegação das abas por setas
function scrollTabs(amount) {
    const container = document.getElementById('tabs-container');
    if (container) {
        container.scrollBy({ left: amount, behavior: 'smooth' });
    }
}

function updateTabsArrows() {
    const container = document.getElementById('tabs-container');
    const leftBtn = document.querySelector('.tabs-arrow-left');
    const rightBtn = document.querySelector('.tabs-arrow-right');

    if (!container || !leftBtn || !rightBtn) return;

    const isScrollable = container.scrollWidth > container.clientWidth + 5;
    if (!isScrollable) {
        leftBtn.style.display = 'none';
        rightBtn.style.display = 'none';
        return;
    }

    leftBtn.style.display = 'flex';
    rightBtn.style.display = 'flex';

    if (container.scrollLeft <= 5) {
        leftBtn.style.opacity = '0.3';
        leftBtn.style.pointerEvents = 'none';
    } else {
        leftBtn.style.opacity = '1';
        leftBtn.style.pointerEvents = 'auto';
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    if (container.scrollLeft >= maxScrollLeft - 5) {
        rightBtn.style.opacity = '0.3';
        rightBtn.style.pointerEvents = 'none';
    } else {
        rightBtn.style.opacity = '1';
        rightBtn.style.pointerEvents = 'auto';
    }
}

// Renderização dos Sub-filtros por Tema
function renderSubFilters(category) {
    const container = document.getElementById('subfilters-container');
    const list = document.getElementById('subfilters-list');
    
    if (!container || !list) return;
    
    const categoryFilters = FILTROS_CATEGORIAS[category];
    
    if (!categoryFilters || Object.keys(categoryFilters).length === 0) {
        container.style.display = 'none';
        list.innerHTML = '';
        currentSubFilter = 'Todos';
        return;
    }
    
    container.style.display = 'block';
    list.innerHTML = '';
    
    // Botão "Todos"
    const allBtn = document.createElement('button');
    allBtn.className = `subfilter-btn ${currentSubFilter === 'Todos' ? 'active' : ''}`;
    allBtn.innerText = 'Todos';
    allBtn.onclick = () => {
        currentSubFilter = 'Todos';
        renderSubFilters(category);
        renderCatalog(category);
    };
    list.appendChild(allBtn);
    
    // Botões dos Temas
    for (const themeName of Object.keys(categoryFilters)) {
        const btn = document.createElement('button');
        btn.className = `subfilter-btn ${currentSubFilter === themeName ? 'active' : ''}`;
        btn.innerText = themeName;
        btn.onclick = () => {
            currentSubFilter = themeName;
            renderSubFilters(category);
            renderCatalog(category);
        };
        list.appendChild(btn);
    }
}

// Renderização das Abas
function renderTabs(categories) {
    tabsContainer.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `tab ${cat === currentCategory ? 'active' : ''}`;
        btn.innerText = cat;
        btn.onclick = () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            currentCategory = cat;
            currentSubFilter = 'Todos';
            renderSubFilters(cat);
            renderCatalog(cat);
            setTimeout(updateTabsArrows, 300);
        };
        tabsContainer.appendChild(btn);
    });
    setTimeout(updateTabsArrows, 100);
}

// Renderização do Catálogo
function renderCatalog(category) {
    catalogContainer.innerHTML = '';
    let items = catalogo[category] || [];
    
    if (currentSubFilter && currentSubFilter !== 'Todos' && FILTROS_CATEGORIAS[category] && FILTROS_CATEGORIAS[category][currentSubFilter]) {
        const allowedIds = FILTROS_CATEGORIAS[category][currentSubFilter];
        items = items.filter(item => allowedIds.includes(item.id));
    }
    
    if (items.length === 0) {
        catalogContainer.innerHTML = '<p style="text-align:center;width:100%;padding:40px;color:#666;">Nenhuma estampa encontrada para este filtro.</p>';
        return;
    }
    
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
    
    if (currentCategory.includes('Sublimação Infantil')) {
        hasStrass = sublimacaoInfantilStrassIds.includes(item.id);
    } else if (!currentCategory.includes('Body') && !currentCategory.includes('Frente Total') && strassCategories.some(c => currentCategory.includes(c)) && !currentCategory.includes('Selo') && !noStrassItems.includes(item.id)) {
        hasStrass = true;
    }
    
    if (hasStrass) {
        if (strassContainer) strassContainer.style.display = 'block';
        const strassRadio = document.querySelector('input[name="strass-option"][value="Com Pedrinha"]');
        if (strassRadio) strassRadio.checked = true;
    } else {
        if (strassContainer) strassContainer.style.display = 'none';
    }
    
    // Lógica de Tecido / Modelo (Baby Look Selo)
    const fabricContainer = document.getElementById('fabric-selector-container');
    if (currentCategory === 'Baby Look Selo') {
        if (fabricContainer) {
            fabricContainer.style.display = 'block';
            const defaultFabric = document.querySelector('input[name="fabric-option"][value="Baby Visco"]');
            if (defaultFabric) defaultFabric.checked = true;
            
            // Listener para alternar cores dependendo do tecido
            const fabricRadios = document.querySelectorAll('input[name="fabric-option"]');
            fabricRadios.forEach(radio => {
                radio.onchange = (e) => {
                    const isPolyester = e.target.value === 'Baby Poliéster';
                    const viscoOnlyOptions = document.querySelectorAll('.color-opt-baby-visco-only');
                    viscoOnlyOptions.forEach(opt => {
                        opt.style.display = isPolyester ? 'none' : 'inline-block';
                    });
                    if (isPolyester) {
                        const checkedColor = document.querySelector('input[name="color-option-babylook-selo"]:checked');
                        if (checkedColor && (checkedColor.value === 'Pink' || checkedColor.value === 'Vinho')) {
                            const defaultColor = document.querySelector('input[name="color-option-babylook-selo"][value="Marinho"]');
                            if (defaultColor) defaultColor.checked = true;
                        }
                    }
                };
            });
        }
    } else {
        if (fabricContainer) fabricContainer.style.display = 'none';
    }

    // Lógica de Cores da Camisa / Viés
    const colorContainer = document.getElementById('color-selector-container');
    const colorTitle = colorContainer ? colorContainer.querySelector('h3') : null;
    const colorAdulto = document.getElementById('color-options-adulto');
    const colorInfantil = document.getElementById('color-options-infantil');
    const colorSilkscreenAdulto = document.getElementById('color-options-silkscreen-adulto');
    const colorSilkscreenBaby = document.getElementById('color-options-silkscreen-baby');
    const colorInfantilSelo = document.getElementById('color-options-infantil-selo');
    const colorBabylookSelo = document.getElementById('color-options-babylook-selo');
    const colorBody = document.getElementById('color-options-body');

    // Lógica de Modelo de Camiseta (Silkscreen)
    const silkModelContainer = document.getElementById('silk-model-selector-container');
    if (currentCategory === 'Silkscreen') {
        if (silkModelContainer) {
            silkModelContainer.style.display = 'block';
            const defaultModel = document.querySelector('input[name="silk-model-option"][value="Adulto"]');
            if (defaultModel) defaultModel.checked = true;

            const silkModelRadios = document.querySelectorAll('input[name="silk-model-option"]');
            silkModelRadios.forEach(radio => {
                radio.onchange = (e) => {
                    const isBaby = e.target.value === 'Baby Viscolycra';
                    if (isBaby) {
                        if (colorSilkscreenAdulto) colorSilkscreenAdulto.style.display = 'none';
                        if (colorSilkscreenBaby) colorSilkscreenBaby.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-silkscreen-baby input[name="color-option-silk"][value="Preto"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    } else {
                        if (colorSilkscreenBaby) colorSilkscreenBaby.style.display = 'none';
                        if (colorSilkscreenAdulto) colorSilkscreenAdulto.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-silkscreen-adulto input[name="color-option-silk"][value="Preta"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    }
                };
            });
        }
    } else {
        if (silkModelContainer) silkModelContainer.style.display = 'none';
    }
    
    // Esconde todos inicialmente
    if(colorAdulto) colorAdulto.style.display = 'none';
    if(colorInfantil) colorInfantil.style.display = 'none';
    if(colorSilkscreenAdulto) colorSilkscreenAdulto.style.display = 'none';
    if(colorSilkscreenBaby) colorSilkscreenBaby.style.display = 'none';
    if(colorInfantilSelo) colorInfantilSelo.style.display = 'none';
    if(colorBabylookSelo) colorBabylookSelo.style.display = 'none';
    if(colorBody) colorBody.style.display = 'none';
    
    if (colorContainer) {
        if (currentCategory === 'Body' || currentCategory === 'Body Infantil' || currentCategory === 'estampasbody') {
            colorContainer.style.display = 'block';
            if(colorTitle) colorTitle.innerText = 'Cor do Viés (Gola/Manga):';
            if(colorBody) colorBody.style.display = 'flex';
            const defaultRadio = document.querySelector('input[name="color-option-body"][value="Branco"]');
            if(defaultRadio) defaultRadio.checked = true;
        } else {
            if(colorTitle) colorTitle.innerText = 'Cor da Camisa:';
            if (currentCategory.includes('Sublimação Adulta')) {
                colorContainer.style.display = 'block';
                if(colorAdulto) colorAdulto.style.display = 'flex';
                const defaultRadio = document.querySelector('input[name="color-option-adulto"][value="Branca"]');
                if(defaultRadio) defaultRadio.checked = true;
            } else if (currentCategory === 'Sublimação Infantil' || currentCategory === 'Sublimação Infantil') {
                colorContainer.style.display = 'block';
                if(colorInfantil) colorInfantil.style.display = 'flex';
                const defaultRadio = document.querySelector('input[name="color-option-infantil"][value="Branco"]');
                if(defaultRadio) defaultRadio.checked = true;
            } else if (currentCategory === 'Silkscreen') {
                colorContainer.style.display = 'block';
                const silkModelRadio = document.querySelector('input[name="silk-model-option"]:checked');
                const isBabyVisco = silkModelRadio && silkModelRadio.value === 'Baby Viscolycra';
                if (isBabyVisco) {
                    if (colorSilkscreenBaby) colorSilkscreenBaby.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-silkscreen-baby input[name="color-option-silk"][value="Preto"]');
                    if(defaultRadio) defaultRadio.checked = true;
                } else {
                    if (colorSilkscreenAdulto) colorSilkscreenAdulto.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-silkscreen-adulto input[name="color-option-silk"][value="Preta"]');
                    if(defaultRadio) defaultRadio.checked = true;
                }
            } else if (currentCategory.includes('Visco Infantil Selo') || currentCategory === 'Viscolycra Infantil Selo') {
                colorContainer.style.display = 'block';
                if(colorInfantilSelo) colorInfantilSelo.style.display = 'flex';
                const defaultRadio = document.querySelector('#color-options-infantil-selo input[name="color-option"][value="Preta"]');
                if(defaultRadio) defaultRadio.checked = true;
            } else if (currentCategory === 'Baby Look Selo') {
                colorContainer.style.display = 'block';
                if(colorBabylookSelo) colorBabylookSelo.style.display = 'flex';
                const viscoOnlyOptions = document.querySelectorAll('.color-opt-baby-visco-only');
                viscoOnlyOptions.forEach(opt => opt.style.display = 'inline-block');
                const defaultRadio = document.querySelector('input[name="color-option-babylook-selo"][value="Preta"]');
                if(defaultRadio) defaultRadio.checked = true;
            } else {
                colorContainer.style.display = 'none';
            }
        }
    }
    
    // Lógica da Cor da Estampa (Print Color)
    const printColorContainer = document.getElementById('print-color-selector-container');
    if (currentCategory === 'Silkscreen') {
        if (printColorContainer) printColorContainer.style.display = 'block';
        const defaultPrintColor = document.querySelector('input[name="print-color-option"][value="Branca"]');
        if (defaultPrintColor) defaultPrintColor.checked = true;
    } else {
        if (printColorContainer) printColorContainer.style.display = 'none';
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

    // Passo a Passo Numerado Dinâmico para Facilitar para Idosos
    let stepNum = 1;

    if (hasStrass && strassContainer) {
        const h3 = strassContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Escolha o Acabamento:`;
        stepNum++;
    }
    if (currentCategory === 'Baby Look Selo' && fabricContainer) {
        const h3 = fabricContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Escolha o Modelo / Tecido:`;
        stepNum++;
    }
    if (currentCategory === 'Silkscreen' && silkModelContainer) {
        const h3 = silkModelContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Escolha o Modelo:`;
        stepNum++;
    }
    if (colorContainer && colorContainer.style.display !== 'none') {
        const isBody = currentCategory === 'Body' || currentCategory === 'Body Infantil' || currentCategory === 'estampasbody';
        const labelText = isBody ? 'Cor do Viés (Gola/Manga):' : 'Cor da Camisa:';
        if (colorTitle) colorTitle.innerText = `${stepNum}. ${labelText}`;
        stepNum++;
    }
    if (currentCategory === 'Silkscreen' && printColorContainer) {
        const h3 = printColorContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Cor da Estampa:`;
        stepNum++;
    }

    const sizeHelpTip = document.querySelector('.modal-help-tip');
    if (sizeHelpTip) {
        sizeHelpTip.innerText = `👇 ${stepNum}. Escolha a quantidade de cada tamanho:`;
    }
    
    // Atualiza PP para categorias Infantis (exceto Body e a aba Infantil)
    const ppContainer = document.getElementById('group-size-pp');
    if (currentCategory.includes('Infantil') && currentCategory !== 'Infantil' && !currentCategory.includes('Body')) {
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
    let selectedImage = currentProduct.image;
    
    const variationContainer = document.getElementById('variation-selector-container');
    if (variationContainer && variationContainer.style.display !== 'none') {
        const selectedRadio = document.querySelector('input[name="variation-option"]:checked');
        if (selectedRadio) {
            variationSelection = selectedRadio.value;
            if (currentProduct.variations) {
                const vari = currentProduct.variations.find(v => v.name === variationSelection);
                if(vari) selectedImage = vari.image;
            }
        }
    }
    
    // Captura variante (Strass)
    let strassSelection = '';
    const strassContainer = document.getElementById('strass-selector-container');
    if (strassContainer && strassContainer.style.display !== 'none') {
        const selectedRadio = document.querySelector('input[name="strass-option"]:checked');
        if (selectedRadio) {
            strassSelection = selectedRadio.value;
            selectedImage = currentProduct[strassSelection === 'Com Pedrinha' ? 'strass_image' : 'image'];
        }
    }
    
    const finalVariant = variationSelection || strassSelection;

    // Captura Tecido / Modelo se aplicável
    let fabricSelection = '';
    const fabricContainer = document.getElementById('fabric-selector-container');
    if (fabricContainer && fabricContainer.style.display !== 'none') {
        const selectedFabricRadio = document.querySelector('input[name="fabric-option"]:checked');
        if (selectedFabricRadio) fabricSelection = selectedFabricRadio.value;
    }
    
    // Captura cor da camisa / viés se aplicável
    let colorSelection = '';
    const colorContainer = document.getElementById('color-selector-container');
    if (colorContainer.style.display !== 'none') {
        if (currentCategory === 'Body Infantil' || currentCategory === 'estampasbody') {
            const selectedColorRadio = document.querySelector('input[name="color-option-body"]:checked');
            if (selectedColorRadio) colorSelection = selectedColorRadio.value;
        } else if (currentCategory === 'Sublimação Adulta Branca' || currentCategory.includes('Sublimação Adulta')) {
            const selectedColorRadio = document.querySelector('input[name="color-option-adulto"]:checked');
            if (selectedColorRadio) colorSelection = selectedColorRadio.value;
        } else if (currentCategory === 'Sublimação Infantil') {
            const selectedColorRadio = document.querySelector('input[name="color-option-infantil"]:checked');
            if (selectedColorRadio) colorSelection = selectedColorRadio.value;
        } else if (currentCategory === 'Baby Look Selo') {
            const selectedColorRadio = document.querySelector('input[name="color-option-babylook-selo"]:checked');
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
    
    // Captura Modelo Silkscreen se aplicável
    let silkModelSelection = '';
    const silkModelContainer = document.getElementById('silk-model-selector-container');
    if (silkModelContainer && silkModelContainer.style.display !== 'none') {
        const selectedModelRadio = document.querySelector('input[name="silk-model-option"]:checked');
        if (selectedModelRadio) silkModelSelection = selectedModelRadio.value;
    }

    // Verifica se já tem esse produto no carrinho (considerando variante, tecido, modelo e cor)
    const existingItemIndex = cart.findIndex(item => 
        item.id === currentProduct.id && 
        item.variant === finalVariant && 
        item.fabric === fabricSelection &&
        item.silkModel === silkModelSelection &&
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
            fabric: fabricSelection,
            silkModel: silkModelSelection,
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
        if (item.silkModel) extras.push(`Modelo: ${item.silkModel}`);
        if (item.category === 'Baby Look Selo') {
            let fabLabel = item.fabric === 'Baby Poliéster' ? 'Baby Poliéster' : 'Baby Visco';
            extras.push(`${fabLabel}: ${item.color}`);
        } else if (item.color) {
            let colorLabel = (item.category && item.category.includes('Body')) ? 'Viés' : 'Camisa';
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
    
    // Agrupa os itens do carrinho por categoria / modelo de tecido
    const groupedCart = {};
    cart.forEach(item => {
        let groupKey = item.category;
        if (item.category === 'Baby Look Selo') {
            groupKey = item.fabric === 'Baby Poliéster' ? 'BABY POLIÉSTER SELO' : 'VISCOLYCRA SELO ADULTA';
        } else if (item.category === 'Infantil') {
            groupKey = 'FRENTE TOTAL INFANTIL';
        }
        if (!groupedCart[groupKey]) {
            groupedCart[groupKey] = [];
        }
        groupedCart[groupKey].push(item);
    });
    
    // Constrói a mensagem segmentada
    for (const [groupTitle, items] of Object.entries(groupedCart)) {
        text += `*--- ${groupTitle.toUpperCase()} ---*\n`;
        
        items.forEach(item => {
            let extras = [];
            if (item.silkModel) extras.push(`Modelo: ${item.silkModel}`);
            if (item.category === 'Baby Look Selo') {
                let fabLabel = item.fabric === 'Baby Poliéster' ? 'Baby Poliéster' : 'Baby Visco';
                extras.push(`${fabLabel}: ${item.color}`);
            } else if (item.color) {
                let colorLabel = (item.category && item.category.includes('Body')) ? 'Viés' : 'Camisa';
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

    // Esvazia o carrinho e atualiza a interface
    cart = [];
    saveCart();
    updateCartUI();
    closeCart(true);
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

// Funções para o Modal de Zoom na Imagem (Lightbox)
function openZoomModal() {
    const imgEl = document.getElementById('modal-image');
    const videoEl = document.getElementById('modal-video');
    const zoomModal = document.getElementById('zoom-modal');
    const zoomImg = document.getElementById('zoom-image');
    const zoomVideo = document.getElementById('zoom-video');

    if (!zoomModal || !zoomImg || !zoomVideo) return;

    if (videoEl && videoEl.style.display !== 'none' && videoEl.src) {
        zoomImg.style.display = 'none';
        zoomVideo.style.display = 'block';
        zoomVideo.src = videoEl.src;
        zoomVideo.playbackRate = 2.5;
    } else if (imgEl && imgEl.src) {
        zoomVideo.style.display = 'none';
        zoomVideo.src = '';
        zoomImg.style.display = 'block';
        zoomImg.src = imgEl.src;
    }

    zoomModal.style.display = 'flex';
}

function closeZoomModal() {
    const zoomModal = document.getElementById('zoom-modal');
    if (zoomModal) zoomModal.style.display = 'none';
}
