// Estado da Aplicação
let currentCategory = '';
let currentSubFilter = 'Todos';
let currentProduct = null;
let searchQuery = '';
let sortOrder = 'asc';
let currentPage = 1;
const ITEMS_PER_PAGE = 24;

let cart = JSON.parse(localStorage.getItem('calegari_cart')) || [];

function saveCart() {
    localStorage.setItem('calegari_cart', JSON.stringify(cart));
}
const WHATSAPP_NUMBER = '5512991431935'; 

// Configurações de Variantes (Strass)
const strassCategories = ['Frente Total Infantil', 'Frente Total BabyLook', 'Infantil', 'Baby Look', 'estampas/Infantil', 'estampas/Baby Look'];
const noStrassItems = ['FTI-002', 'FTI-004', 'FTI-009', 'FTI-015', 'FTI-019', 'FTI-020', 'FTI-021', 'FTI-022', 'FTI-023'];
const sublimacaoInfantilStrassIds = ['0002', '0004', '0005', '0006', '0008', '0009', '0010', '0012', '0013', '0014', '0015', '0016', '0018', '0020', '0029', '0035', '0036'];

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
    currentPage = 1;
    
    renderTabs(categories);
    renderSubFilters(currentCategory);
    renderCatalog();
    updateCartUI();

    setupToolbar();
    setupQuickScroll();

    const tabsNav = document.getElementById('tabs-container');
    if (tabsNav) {
        tabsNav.addEventListener('scroll', updateTabsArrows);
        window.addEventListener('resize', updateTabsArrows);
    }
    updateTabsArrows();
    setTimeout(updateTabsArrows, 200);
});

// Configuração da Barra de Ferramentas (Busca e Ordenação)
function setupToolbar() {
    const searchInput = document.getElementById('catalog-search');
    const clearBtn = document.getElementById('search-clear-btn');
    const sortSelect = document.getElementById('catalog-sort');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            currentPage = 1;
            if (clearBtn) {
                clearBtn.style.display = searchQuery ? 'flex' : 'none';
            }
            renderCatalog();
        });
    }

    if (clearBtn) {
        clearBtn.onclick = () => {
            if (searchInput) searchInput.value = '';
            searchQuery = '';
            clearBtn.style.display = 'none';
            currentPage = 1;
            renderCatalog();
        };
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortOrder = e.target.value;
            currentPage = 1;
            renderCatalog();
        });
    }
}

// Configuração dos Botões Flutuantes Rápidos (Topo e Fim)
function setupQuickScroll() {
    const btnTop = document.getElementById('btn-scroll-top');
    const btnBottom = document.getElementById('btn-scroll-bottom');

    if (btnTop) {
        btnTop.onclick = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }
    if (btnBottom) {
        btnBottom.onclick = () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        };
    }

    const handleScroll = () => {
        const scrollY = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        
        if (btnTop) {
            btnTop.style.opacity = scrollY > 250 ? '1' : '0.25';
            btnTop.style.pointerEvents = scrollY > 250 ? 'auto' : 'none';
        }
        if (btnBottom) {
            btnBottom.style.opacity = scrollY < maxScroll - 250 ? '1' : '0.25';
            btnBottom.style.pointerEvents = scrollY < maxScroll - 250 ? 'auto' : 'none';
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
}

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

// Obter Temas Disponíveis na Categoria Atual (Descoberta Automática de Subpastas)
function getCategoryThemes(category) {
    const items = catalogo[category] || [];
    const themeSet = new Set();
    items.forEach(item => {
        if (item.tema && item.tema.trim() !== '') {
            themeSet.add(item.tema.trim());
        }
    });
    const themes = Array.from(themeSet);
    // Ordena temas alfabeticamente, garantindo que 'Outros' fique no final
    themes.sort((a, b) => {
        if (a.toLowerCase() === 'outros') return 1;
        if (b.toLowerCase() === 'outros') return -1;
        return a.localeCompare(b, 'pt-BR');
    });
    return themes;
}

// Renderização dos Sub-filtros por Tema
function renderSubFilters(category) {
    const container = document.getElementById('subfilters-container');
    const list = document.getElementById('subfilters-list');
    
    if (!container || !list) return;
    
    const themes = getCategoryThemes(category);
    
    // Se não houver subtemas ou apenas 1 ("Outros"), oculta a barra
    if (themes.length <= 1) {
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
        currentPage = 1;
        renderSubFilters(category);
        renderCatalog();
    };
    list.appendChild(allBtn);
    
    // Botões dos Temas
    themes.forEach(themeName => {
        const btn = document.createElement('button');
        btn.className = `subfilter-btn ${currentSubFilter === themeName ? 'active' : ''}`;
        btn.innerText = themeName;
        btn.onclick = () => {
            currentSubFilter = themeName;
            currentPage = 1;
            renderSubFilters(category);
            renderCatalog();
        };
        list.appendChild(btn);
    });
}

// Renderização das Abas de Categorias
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
            currentPage = 1;
            renderSubFilters(cat);
            renderCatalog();
            setTimeout(updateTabsArrows, 300);
        };
        tabsContainer.appendChild(btn);
    });
    setTimeout(updateTabsArrows, 100);
}

// Filtra, Busca e Ordena os Itens
function getFilteredItems() {
    let items = catalogo[currentCategory] || [];
    
    // 1. Filtro por Tema (Sub-filtro)
    if (currentSubFilter && currentSubFilter !== 'Todos') {
        items = items.filter(item => (item.tema || 'Outros') === currentSubFilter);
    }
    
    // 2. Busca Instantânea
    if (searchQuery.trim()) {
        const term = searchQuery.trim().toLowerCase();
        items = items.filter(item => {
            const idMatch = item.id && item.id.toLowerCase().includes(term);
            const temaMatch = item.tema && item.tema.toLowerCase().includes(term);
            return idMatch || temaMatch;
        });
    }
    
    // 3. Ordenação
    items = [...items];
    if (sortOrder === 'desc') {
        items.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' }));
    } else {
        items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));
    }
    
    return items;
}

// Renderização do Catálogo com Paginação
function renderCatalog() {
    catalogContainer.innerHTML = '';
    const filteredItems = getFilteredItems();
    const totalItems = filteredItems.length;
    
    if (totalItems === 0) {
        catalogContainer.innerHTML = `
            <div style="text-align: center; width: 100%; padding: 50px 15px; color: #666;">
                <p style="font-size: 1.15rem; font-weight: 700; margin-bottom: 6px;">Nenhuma estampa encontrada.</p>
                <p style="font-size: 0.92rem; color: #888;">Tente outro termo na busca ou selecione outro tema.</p>
            </div>
        `;
        renderPagination(0, 1);
        return;
    }
    
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
    const pageItems = filteredItems.slice(startIndex, endIndex);
    
    pageItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openModal(item);
        
        let loadingAttr = index < 6 ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
        card.innerHTML = `
            <img src="${item.thumb || item.image}" alt="Estampa ${item.id}" ${loadingAttr}>
            <div class="codigo">${item.id}</div>
        `;
        catalogContainer.appendChild(card);
    });
    
    renderPagination(totalItems, totalPages);
}

// Renderização da Barra de Paginação
function renderPagination(totalItems, totalPages) {
    const container = document.getElementById('pagination-container');
    if (!container) return;
    
    if (totalPages <= 1) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    
    container.style.display = 'flex';
    container.innerHTML = `
        <div class="pagination-info">
            Página <strong>${currentPage}</strong> de <strong>${totalPages}</strong>
            <span class="pagination-total">(${totalItems} estampas)</span>
        </div>
        <div class="pagination-controls">
            <button class="pag-btn" id="pag-first" title="Primeira página" ${currentPage === 1 ? 'disabled' : ''}>« Primeira</button>
            <button class="pag-btn" id="pag-prev" title="Página anterior" ${currentPage === 1 ? 'disabled' : ''}>‹ Anterior</button>
            <div class="pag-pages" id="pag-pages-list"></div>
            <button class="pag-btn" id="pag-next" title="Próxima página" ${currentPage === totalPages ? 'disabled' : ''}>Próxima ›</button>
            <button class="pag-btn" id="pag-last" title="Última página (ir ao fim)" ${currentPage === totalPages ? 'disabled' : ''}>Última »</button>
        </div>
    `;
    
    document.getElementById('pag-first').onclick = () => goToPage(1);
    document.getElementById('pag-prev').onclick = () => goToPage(currentPage - 1);
    document.getElementById('pag-next').onclick = () => goToPage(currentPage + 1);
    document.getElementById('pag-last').onclick = () => goToPage(totalPages);
    
    // Geração de botões numéricos
    const pagesList = document.getElementById('pag-pages-list');
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let p = startPage; p <= endPage; p++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pag-num-btn ${p === currentPage ? 'active' : ''}`;
        pageBtn.innerText = p;
        pageBtn.onclick = () => goToPage(p);
        pagesList.appendChild(pageBtn);
    }
}

// Navegação para uma Página com Rolagem Suave para o Topo do Catálogo
function goToPage(page) {
    currentPage = page;
    renderCatalog();
    const anchor = document.querySelector('.catalog-toolbar') || tabsContainer;
    if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

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
    } else if (!currentCategory.includes('Body') && currentCategory !== 'Frente Total Camiseta' && currentCategory !== 'Frente Total' && !currentCategory.includes('DTF') && strassCategories.some(c => currentCategory.includes(c)) && !currentCategory.includes('Selo') && !noStrassItems.includes(item.id)) {
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
    const colorSublimacaoMachao = document.getElementById('color-options-sublimacao-machao');
    const colorInfantil = document.getElementById('color-options-infantil');
    const colorSilkscreenAdulto = document.getElementById('color-options-silkscreen-adulto');
    const colorSilkscreenBaby = document.getElementById('color-options-silkscreen-baby');
    const colorInfantilSeloCamiseta = document.getElementById('color-options-infantil-selo-camiseta');
    const colorInfantilSeloBaby = document.getElementById('color-options-infantil-selo-baby');
    const colorBabylookSelo = document.getElementById('color-options-babylook-selo');
    const colorBody = document.getElementById('color-options-body');
    const colorDtfPolyester = document.getElementById('color-options-dtf-polyester');
    const colorDtfBabylook = document.getElementById('color-options-dtf-babylook');
    const colorDtfInfantilCamiseta = document.getElementById('color-options-dtf-infantil-camiseta');
    const colorDtfInfantilBaby = document.getElementById('color-options-dtf-infantil-baby');

    // Lógica do Modelo de Camiseta (Sublimação Adulto)
    const sublimacaoAdultoModelContainer = document.getElementById('sublimacao-adulto-model-selector-container');
    if (currentCategory.includes('Sublimação Adulta') || currentCategory.includes('Sublimação Adulto')) {
        if (sublimacaoAdultoModelContainer) {
            sublimacaoAdultoModelContainer.style.display = 'block';
            const defaultModel = document.querySelector('input[name="sublimacao-adulto-model-option"][value="Camiseta"]');
            if (defaultModel) defaultModel.checked = true;

            const sublimacaoModelRadios = document.querySelectorAll('input[name="sublimacao-adulto-model-option"]');
            sublimacaoModelRadios.forEach(radio => {
                radio.onchange = (e) => {
                    const isMachao = e.target.value === 'Camiseta Machão';
                    if (isMachao) {
                        if (colorAdulto) colorAdulto.style.display = 'none';
                        if (colorSublimacaoMachao) colorSublimacaoMachao.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-sublimacao-machao input[name="color-option-sublimacao-machao"][value="Branca"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    } else {
                        if (colorSublimacaoMachao) colorSublimacaoMachao.style.display = 'none';
                        if (colorAdulto) colorAdulto.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-adulto input[name="color-option-adulto"][value="Branca"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    }
                };
            });
        }
    } else {
        if (sublimacaoAdultoModelContainer) sublimacaoAdultoModelContainer.style.display = 'none';
    }

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
                        if(defaultRadio) defaultRadio.checked = true;
                    } else {
                        if (colorSilkscreenBaby) colorSilkscreenBaby.style.display = 'none';
                        if (colorSilkscreenAdulto) colorSilkscreenAdulto.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-silkscreen-adulto input[name="color-option-silk"][value="Preta"]');
                        if(defaultRadio) defaultRadio.checked = true;
                    }
                };
            });
        }
    } else {
        if (silkModelContainer) silkModelContainer.style.display = 'none';
    }

    // Lógica de Modelo / Tecido (DTF Adulto)
    const dtfModelContainer = document.getElementById('dtf-model-selector-container');
    if (currentCategory === 'DTF ADULTO' || currentCategory === 'DTF Adulto') {
        if (dtfModelContainer) {
            dtfModelContainer.style.display = 'block';
            const defaultModel = document.querySelector('input[name="dtf-model-option"][value="Camiseta Poliéster"]');
            if (defaultModel) defaultModel.checked = true;

            const dtfModelRadios = document.querySelectorAll('input[name="dtf-model-option"]');
            dtfModelRadios.forEach(radio => {
                radio.onchange = (e) => {
                    const isBaby = e.target.value === 'BabyLook Viscolycra';
                    if (isBaby) {
                        if (colorDtfPolyester) colorDtfPolyester.style.display = 'none';
                        if (colorDtfBabylook) colorDtfBabylook.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-dtf-babylook input[name="color-option-dtf-babylook"][value="Preto"]');
                        if(defaultRadio) defaultRadio.checked = true;
                    } else {
                        if (colorDtfBabylook) colorDtfBabylook.style.display = 'none';
                        if (colorDtfPolyester) colorDtfPolyester.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-dtf-polyester input[name="color-option-dtf-polyester"][value="Preto"]');
                        if(defaultRadio) defaultRadio.checked = true;
                    }
                };
            });
        }
    } else {
        if (dtfModelContainer) dtfModelContainer.style.display = 'none';
    }

    // Lógica de Modelo / Tecido (DTF Infantil)
    const dtfInfantilModelContainer = document.getElementById('dtf-infantil-model-selector-container');
    if (currentCategory === 'DTF Infantil') {
        if (dtfInfantilModelContainer) {
            dtfInfantilModelContainer.style.display = 'block';
            const defaultModel = document.querySelector('input[name="dtf-infantil-model-option"][value="Camiseta"]');
            if (defaultModel) defaultModel.checked = true;

            const dtfInfantilModelRadios = document.querySelectorAll('input[name="dtf-infantil-model-option"]');
            dtfInfantilModelRadios.forEach(radio => {
                radio.onchange = (e) => {
                    const isBaby = e.target.value.includes('Baby');
                    if (isBaby) {
                        updateMedia(item.image_baby || item.image);
                        if (colorDtfInfantilCamiseta) colorDtfInfantilCamiseta.style.display = 'none';
                        if (colorDtfInfantilBaby) colorDtfInfantilBaby.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-dtf-infantil-baby input[name="color-option-dtf-infantil-baby"][value="Preto"]');
                        if(defaultRadio) defaultRadio.checked = true;
                    } else {
                        updateMedia(item.image);
                        if (colorDtfInfantilBaby) colorDtfInfantilBaby.style.display = 'none';
                        if (colorDtfInfantilCamiseta) colorDtfInfantilCamiseta.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-dtf-infantil-camiseta input[name="color-option-dtf-infantil-camiseta"][value="Preto"]');
                        if(defaultRadio) defaultRadio.checked = true;
                    }
                };
            });
        }
    } else {
        if (dtfInfantilModelContainer) dtfInfantilModelContainer.style.display = 'none';
    }

    // Lógica de Modelo / Tecido (Infantil Selo)
    const infantilSeloModelContainer = document.getElementById('infantil-selo-model-selector-container');
    if (currentCategory.includes('Infantil Selo') || currentCategory.includes('Visco Infantil Selo') || currentCategory === 'Viscolycra Infantil Selo') {
        if (infantilSeloModelContainer) {
            infantilSeloModelContainer.style.display = 'block';
            const defaultModel = document.querySelector('input[name="infantil-selo-model-option"][value="Camiseta"]');
            if (defaultModel) defaultModel.checked = true;

            const infantilSeloModelRadios = document.querySelectorAll('input[name="infantil-selo-model-option"]');
            infantilSeloModelRadios.forEach(radio => {
                radio.onchange = (e) => {
                    const isBaby = e.target.value === 'Baby Look Viscolycra';
                    if (isBaby) {
                        if (colorInfantilSeloCamiseta) colorInfantilSeloCamiseta.style.display = 'none';
                        if (colorInfantilSeloBaby) colorInfantilSeloBaby.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-infantil-selo-baby input[name="color-option-infantil-selo-baby"][value="Preto"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    } else {
                        if (colorInfantilSeloBaby) colorInfantilSeloBaby.style.display = 'none';
                        if (colorInfantilSeloCamiseta) colorInfantilSeloCamiseta.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-infantil-selo-camiseta input[name="color-option-infantil-selo-camiseta"][value="Preto"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    }
                };
            });
        }
    } else {
        if (infantilSeloModelContainer) infantilSeloModelContainer.style.display = 'none';
    }
    
    // Esconde todos inicialmente
    if(colorAdulto) colorAdulto.style.display = 'none';
    if(colorSublimacaoMachao) colorSublimacaoMachao.style.display = 'none';
    if(colorInfantil) colorInfantil.style.display = 'none';
    if(colorSilkscreenAdulto) colorSilkscreenAdulto.style.display = 'none';
    if(colorSilkscreenBaby) colorSilkscreenBaby.style.display = 'none';
    if(colorInfantilSeloCamiseta) colorInfantilSeloCamiseta.style.display = 'none';
    if(colorInfantilSeloBaby) colorInfantilSeloBaby.style.display = 'none';
    if(colorBabylookSelo) colorBabylookSelo.style.display = 'none';
    if(colorBody) colorBody.style.display = 'none';
    if(colorDtfPolyester) colorDtfPolyester.style.display = 'none';
    if(colorDtfBabylook) colorDtfBabylook.style.display = 'none';
    if(colorDtfInfantilCamiseta) colorDtfInfantilCamiseta.style.display = 'none';
    if(colorDtfInfantilBaby) colorDtfInfantilBaby.style.display = 'none';
    
    if (colorContainer) {
        if (currentCategory === 'Body' || currentCategory === 'Body Infantil' || currentCategory === 'estampasbody') {
            colorContainer.style.display = 'block';
            if(colorTitle) colorTitle.innerText = 'Cor do Viés (Gola/Manga):';
            if(colorBody) colorBody.style.display = 'flex';
            const defaultRadio = document.querySelector('input[name="color-option-body"][value="Branco"]');
            if(defaultRadio) defaultRadio.checked = true;
        } else {
            if(colorTitle) colorTitle.innerText = 'Cor da Camisa:';
            if (currentCategory.includes('Sublimação Adulta') || currentCategory.includes('Sublimação Adulto')) {
                colorContainer.style.display = 'block';
                const selectedSubModel = document.querySelector('input[name="sublimacao-adulto-model-option"]:checked');
                const isMachao = selectedSubModel && selectedSubModel.value === 'Camiseta Machão';
                if (isMachao) {
                    if (colorSublimacaoMachao) colorSublimacaoMachao.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-sublimacao-machao input[name="color-option-sublimacao-machao"][value="Branca"]');
                    if (defaultRadio) defaultRadio.checked = true;
                } else {
                    if (colorAdulto) colorAdulto.style.display = 'flex';
                    const defaultRadio = document.querySelector('input[name="color-option-adulto"][value="Branca"]');
                    if (defaultRadio) defaultRadio.checked = true;
                }
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
            } else if (currentCategory.includes('Infantil Selo') || currentCategory.includes('Visco Infantil Selo') || currentCategory === 'Viscolycra Infantil Selo') {
                colorContainer.style.display = 'block';
                const selectedModel = document.querySelector('input[name="infantil-selo-model-option"]:checked');
                const isBaby = selectedModel && selectedModel.value === 'Baby Look Viscolycra';
                if (isBaby) {
                    if (colorInfantilSeloCamiseta) colorInfantilSeloCamiseta.style.display = 'none';
                    if (colorInfantilSeloBaby) colorInfantilSeloBaby.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-infantil-selo-baby input[name="color-option-infantil-selo-baby"][value="Preto"]');
                    if (defaultRadio) defaultRadio.checked = true;
                } else {
                    if (colorInfantilSeloBaby) colorInfantilSeloBaby.style.display = 'none';
                    if (colorInfantilSeloCamiseta) colorInfantilSeloCamiseta.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-infantil-selo-camiseta input[name="color-option-infantil-selo-camiseta"][value="Preto"]');
                    if (defaultRadio) defaultRadio.checked = true;
                }
            } else if (currentCategory === 'Baby Look Selo') {
                colorContainer.style.display = 'block';
                if(colorBabylookSelo) colorBabylookSelo.style.display = 'flex';
                const viscoOnlyOptions = document.querySelectorAll('.color-opt-baby-visco-only');
                viscoOnlyOptions.forEach(opt => opt.style.display = 'inline-block');
                const defaultRadio = document.querySelector('input[name="color-option-babylook-selo"][value="Preta"]');
                if(defaultRadio) defaultRadio.checked = true;
            } else if (currentCategory === 'DTF ADULTO' || currentCategory === 'DTF Adulto') {
                colorContainer.style.display = 'block';
                const selectedDtfModel = document.querySelector('input[name="dtf-model-option"]:checked');
                const isBaby = selectedDtfModel && selectedDtfModel.value === 'BabyLook Viscolycra';
                if (isBaby) {
                    if(colorDtfBabylook) colorDtfBabylook.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-dtf-babylook input[name="color-option-dtf-babylook"][value="Preto"]');
                    if(defaultRadio) defaultRadio.checked = true;
                } else {
                    if(colorDtfPolyester) colorDtfPolyester.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-dtf-polyester input[name="color-option-dtf-polyester"][value="Preto"]');
                    if(defaultRadio) defaultRadio.checked = true;
                }
            } else if (currentCategory === 'DTF Infantil') {
                colorContainer.style.display = 'block';
                const selectedDtfModel = document.querySelector('input[name="dtf-infantil-model-option"]:checked');
                const isBaby = selectedDtfModel && selectedDtfModel.value.includes('Baby');
                if (isBaby) {
                    if(colorDtfInfantilBaby) colorDtfInfantilBaby.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-dtf-infantil-baby input[name="color-option-dtf-infantil-baby"][value="Preto"]');
                    if(defaultRadio) defaultRadio.checked = true;
                } else {
                    if(colorDtfInfantilCamiseta) colorDtfInfantilCamiseta.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-dtf-infantil-camiseta input[name="color-option-dtf-infantil-camiseta"][value="Preto"]');
                    if(defaultRadio) defaultRadio.checked = true;
                }
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
    if (currentCategory.includes('Baby Look') || currentCategory.includes('BabyLook')) {
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
    if ((currentCategory.includes('Sublimação Adulta') || currentCategory.includes('Sublimação Adulto')) && sublimacaoAdultoModelContainer) {
        const h3 = sublimacaoAdultoModelContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Escolha o Modelo:`;
        stepNum++;
    }
    if (currentCategory === 'Baby Look Selo' && fabricContainer) {
        const h3 = fabricContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Escolha o Modelo / Tecido:`;
        stepNum++;
    }
    if ((currentCategory === 'DTF ADULTO' || currentCategory === 'DTF Adulto') && dtfModelContainer) {
        const h3 = dtfModelContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Escolha o Modelo / Tecido:`;
        stepNum++;
    }
    if (currentCategory === 'DTF Infantil' && dtfInfantilModelContainer) {
        const h3 = dtfInfantilModelContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Escolha o Modelo / Tecido:`;
        stepNum++;
    }
    if ((currentCategory.includes('Infantil Selo') || currentCategory.includes('Visco Infantil Selo') || currentCategory === 'Viscolycra Infantil Selo') && infantilSeloModelContainer) {
        const h3 = infantilSeloModelContainer.querySelector('h3');
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
    
    // Atualiza PP para categorias Infantis:
    // - Body e Frente Total Infantil: Não possuem PP.
    // - Infantil Selo: Somente a estampa SI-004 possui PP (as demais são apenas P ao GG).
    // - DTF Infantil e Sublimação Infantil: Possuem PP.
    const ppContainer = document.getElementById('group-size-pp');
    const isInfantilSelo = currentCategory.includes('Infantil Selo') || currentCategory.includes('Visco Infantil Selo') || currentCategory === 'Viscolycra Infantil Selo';
    if (isInfantilSelo) {
        const isSi004 = item && (item.id === 'SI-004' || item.id === 'SI_004' || String(item.id).toUpperCase().replace(/[_ ]/g, '-') === 'SI-004');
        if (isSi004) {
            ppContainer.style.display = 'flex';
        } else {
            ppContainer.style.display = 'none';
        }
    } else if (currentCategory.includes('Infantil') && currentCategory !== 'Infantil' && currentCategory !== 'Frente Total Infantil' && !currentCategory.includes('Body')) {
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

    const ppContainer = document.getElementById('group-size-pp');
    if (ppContainer && ppContainer.style.display === 'none') {
        sizes['PP'] = 0;
    }
    const xgContainer = document.getElementById('group-size-xg');
    if (xgContainer && xgContainer.style.display === 'none') {
        sizes['XG'] = 0;
    }
    
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
        if (currentCategory === 'Body Infantil' || currentCategory === 'estampasbody' || currentCategory === 'Body') {
            const selectedColorRadio = document.querySelector('input[name="color-option-body"]:checked');
            if (selectedColorRadio) colorSelection = selectedColorRadio.value;
        } else if (currentCategory === 'Sublimação Adulta Branca' || currentCategory.includes('Sublimação Adulta') || currentCategory.includes('Sublimação Adulto')) {
            const selectedSubModel = document.querySelector('input[name="sublimacao-adulto-model-option"]:checked');
            const isMachao = selectedSubModel && selectedSubModel.value === 'Camiseta Machão';
            const radioSelector = isMachao ? '#color-options-sublimacao-machao input[name="color-option-sublimacao-machao"]:checked' : '#color-options-adulto input[name="color-option-adulto"]:checked';
            const selectedColorRadio = document.querySelector(radioSelector);
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
        } else if (currentCategory.includes('Infantil Selo') || currentCategory.includes('Visco Infantil Selo') || currentCategory === 'Viscolycra Infantil Selo') {
            const selectedModel = document.querySelector('input[name="infantil-selo-model-option"]:checked');
            const isBaby = selectedModel && selectedModel.value === 'Baby Look Viscolycra';
            const radioSelector = isBaby ? '#color-options-infantil-selo-baby input[name="color-option-infantil-selo-baby"]:checked' : '#color-options-infantil-selo-camiseta input[name="color-option-infantil-selo-camiseta"]:checked';
            const selectedColorRadio = document.querySelector(radioSelector);
            if (selectedColorRadio) colorSelection = selectedColorRadio.value;
        } else if (currentCategory === 'DTF ADULTO' || currentCategory === 'DTF Adulto') {
            const selectedDtfModel = document.querySelector('input[name="dtf-model-option"]:checked');
            const isBaby = selectedDtfModel && selectedDtfModel.value === 'BabyLook Viscolycra';
            const radioSelector = isBaby ? '#color-options-dtf-babylook input[name="color-option-dtf-babylook"]:checked' : '#color-options-dtf-polyester input[name="color-option-dtf-polyester"]:checked';
            const selectedColorRadio = document.querySelector(radioSelector);
            if (selectedColorRadio) colorSelection = selectedColorRadio.value;
        } else if (currentCategory === 'DTF Infantil') {
            const selectedDtfModel = document.querySelector('input[name="dtf-infantil-model-option"]:checked');
            const isBaby = selectedDtfModel && selectedDtfModel.value.includes('Baby');
            const radioSelector = isBaby ? '#color-options-dtf-infantil-baby input[name="color-option-dtf-infantil-baby"]:checked' : '#color-options-dtf-infantil-camiseta input[name="color-option-dtf-infantil-camiseta"]:checked';
            const selectedColorRadio = document.querySelector(radioSelector);
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

    // Captura Modelo DTF Adulto ou Infantil se aplicável
    let dtfModelSelection = '';
    const dtfModelContainer = document.getElementById('dtf-model-selector-container');
    const dtfInfantilModelContainer = document.getElementById('dtf-infantil-model-selector-container');
    if (dtfModelContainer && dtfModelContainer.style.display !== 'none') {
        const selectedModelRadio = document.querySelector('input[name="dtf-model-option"]:checked');
        if (selectedModelRadio) dtfModelSelection = selectedModelRadio.value;
    } else if (dtfInfantilModelContainer && dtfInfantilModelContainer.style.display !== 'none') {
        const selectedModelRadio = document.querySelector('input[name="dtf-infantil-model-option"]:checked');
        if (selectedModelRadio) dtfModelSelection = selectedModelRadio.value;
    }

    // Captura Modelo Infantil Selo se aplicável
    let infantilSeloModelSelection = '';
    const infantilSeloModelContainer = document.getElementById('infantil-selo-model-selector-container');
    if (infantilSeloModelContainer && infantilSeloModelContainer.style.display !== 'none') {
        const selectedModelRadio = document.querySelector('input[name="infantil-selo-model-option"]:checked');
        if (selectedModelRadio) infantilSeloModelSelection = selectedModelRadio.value;
    }

    // Captura Modelo Sublimação Adulto se aplicável
    let sublimacaoModelSelection = '';
    const sublimacaoAdultoModelContainer = document.getElementById('sublimacao-adulto-model-selector-container');
    if (sublimacaoAdultoModelContainer && sublimacaoAdultoModelContainer.style.display !== 'none') {
        const selectedModelRadio = document.querySelector('input[name="sublimacao-adulto-model-option"]:checked');
        if (selectedModelRadio) sublimacaoModelSelection = selectedModelRadio.value;
    }

    // Verifica se já tem esse produto no carrinho (considerando variante, tecido, modelo e cor)
    const existingItemIndex = cart.findIndex(item => 
        item.id === currentProduct.id && 
        item.variant === finalVariant && 
        item.fabric === fabricSelection &&
        item.silkModel === silkModelSelection &&
        item.dtfModel === dtfModelSelection &&
        item.sublimacaoModel === sublimacaoModelSelection &&
        item.infantilSeloModel === infantilSeloModelSelection &&
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
            dtfModel: dtfModelSelection,
            sublimacaoModel: sublimacaoModelSelection,
            infantilSeloModel: infantilSeloModelSelection,
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
    
    // Calcula o preço total do pedido
    let totalPrice = 0;
    cart.forEach(item => {
        const qty = Object.values(item.sizes).reduce((a, b) => a + b, 0);
        const unitPrice = getItemUnitPrice(item);
        totalPrice += qty * unitPrice;
    });

    // Atualiza barra flutuante de carrinho na parte inferior
    const stickyBar = document.getElementById('sticky-cart-bar');
    const stickyText = document.getElementById('sticky-cart-text');
    if (stickyBar) {
        if (totalItems > 0) {
            stickyBar.style.display = 'flex';
            if (stickyText) {
                stickyText.innerText = `Ver Meu Pedido (${totalItems} ${totalItems === 1 ? 'peça' : 'peças'} • ${formatMoney(totalPrice)})`;
            }
        } else {
            stickyBar.style.display = 'none';
        }
    }
    
    // Elementos do Resumo de Preço no Footer do Carrinho
    const cartSummaryContainer = document.getElementById('cart-summary');
    const summaryPiecesEl = document.getElementById('cart-summary-pieces');
    const summaryTotalPriceEl = document.getElementById('cart-summary-total-price');

    // Atualiza lista do carrinho
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-message">Seu carrinho está vazio.</div>';
        const btnAp = document.getElementById('checkout-btn-aparecida');
        const btnGua = document.getElementById('checkout-btn-guaratingueta');
        if(btnAp) btnAp.disabled = true;
        if(btnGua) btnGua.disabled = true;
        if (cartSummaryContainer) cartSummaryContainer.style.display = 'none';
        return;
    }
    
    const btnAp = document.getElementById('checkout-btn-aparecida');
    const btnGua = document.getElementById('checkout-btn-guaratingueta');
    if(btnAp) btnAp.disabled = false;
    if(btnGua) btnGua.disabled = false;

    if (cartSummaryContainer) {
        cartSummaryContainer.style.display = 'block';
        if (summaryPiecesEl) summaryPiecesEl.innerText = `${totalItems} ${totalItems === 1 ? 'peça' : 'peças'}`;
        if (summaryTotalPriceEl) summaryTotalPriceEl.innerText = formatMoney(totalPrice);
    }

    cartItemsContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        
        let sizesText = [];
        let itemQty = 0;
        for (const [size, qty] of Object.entries(item.sizes)) {
            if (qty > 0) {
                sizesText.push(`${qty}x ${size}`);
                itemQty += qty;
            }
        }

        const unitPrice = getItemUnitPrice(item);
        const itemSubtotal = itemQty * unitPrice;
        
        let displayTitle = item.id;
        
        let extras = [];
        if (item.sublimacaoModel) extras.push(`Modelo: ${item.sublimacaoModel}`);
        if (item.dtfModel) extras.push(`Modelo: ${item.dtfModel}`);
        if (item.silkModel) extras.push(`Modelo: ${item.silkModel}`);
        if (item.infantilSeloModel) extras.push(`Modelo: ${item.infantilSeloModel}`);
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
                <div class="cart-item-price">
                    <span class="cart-item-unit-price">${itemQty}x ${formatMoney(unitPrice)}</span>
                    <span class="cart-item-subtotal">${formatMoney(itemSubtotal)}</span>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})" title="Remover item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
            </button>
        `;
        cartItemsContainer.appendChild(div);
    });
}

function getItemGroupKey(item) {
    const cat = item.category || '';
    
    if (cat === 'Silkscreen') {
        const silkM = item.silkModel || 'Adulto';
        if (silkM === 'Baby Viscolycra') {
            return 'SILKSCREEN BABY LOOK VISCOLYCRA';
        } else if (silkM === 'Infantil') {
            return 'SILKSCREEN INFANTIL';
        } else {
            return 'SILKSCREEN ADULTO';
        }
    }

    if (cat === 'DTF ADULTO' || cat === 'DTF Adulto') {
        const dtfM = item.dtfModel || 'Camiseta Poliéster';
        if (dtfM === 'BabyLook Viscolycra') {
            return 'DTF ADULTO BABYLOOK VISCOLYCRA';
        } else if (dtfM === 'Camiseta Machão') {
            return 'DTF ADULTO CAMISETA MACHÃO';
        } else {
            return 'DTF ADULTO CAMISETA POLIÉSTER';
        }
    }

    if (cat === 'DTF Infantil') {
        const dtfM = item.dtfModel || 'Camiseta';
        if (dtfM.includes('Baby')) {
            return 'DTF INFANTIL BABY LOOK VISCOLYCRA';
        } else {
            return 'DTF INFANTIL CAMISETA';
        }
    }

    if (cat === 'Baby Look Selo') {
        if (item.fabric === 'Baby Poliéster') {
            return 'BABY POLIÉSTER SELO';
        } else {
            return 'VISCOLYCRA SELO ADULTA';
        }
    }

    if (cat.includes('Infantil Selo') || cat.includes('Visco Infantil Selo') || cat.includes('Viscolycra Infantil Selo')) {
        const seloM = item.infantilSeloModel || 'Camiseta';
        if (seloM === 'Baby Look Viscolycra' || seloM.includes('Baby')) {
            return 'INFANTIL SELO BABY LOOK VISCOLYCRA';
        }
        return 'INFANTIL SELO CAMISETA';
    }

    if (cat === 'Infantil' || cat === 'Frente Total Infantil') {
        return 'FRENTE TOTAL INFANTIL';
    }

    if (cat.includes('Sublimação Adulta') || cat.includes('Sublimação Adulto') || cat.includes('SublimacaoAdulto')) {
        const subM = item.sublimacaoModel || 'Camiseta';
        if (subM === 'Camiseta Machão') {
            return 'SUBLIMAÇÃO ADULTA CAMISETA MACHÃO';
        }
        return 'SUBLIMAÇÃO ADULTA';
    }

    if (cat.includes('Sublimação Infantil') || cat.includes('SublimacaoInfantil')) {
        return 'SUBLIMAÇÃO INFANTIL';
    }

    if (cat === 'Baby Look' || cat === 'Frente Total BabyLook' || cat.includes('BabyLook Frente total')) {
        return 'BABY LOOK FRENTE TOTAL';
    }

    if (cat === 'Frente Total' || cat === 'Frente Total Camiseta') {
        return 'FRENTE TOTAL ADULTO';
    }

    if (cat.includes('Body')) {
        return 'BODY ESTAMPADO';
    }

    return cat.toUpperCase();
}

// Finalização (WhatsApp)
function checkout(store) {
    if (cart.length === 0) return;
    
    let phone = '5512991431935'; // Aparecida (default)
    if (store === 'guaratingueta') {
        phone = '5512991420566';
    }
    
    let text = "*Novo Pedido - Calegari Malhas*\n\n";
    let grandTotalPieces = 0;
    
    // Agrupa os itens do carrinho por categoria / modelo de tecido
    const groupedCart = {};
    cart.forEach(item => {
        const groupKey = getItemGroupKey(item);
        if (!groupedCart[groupKey]) {
            groupedCart[groupKey] = [];
        }
        groupedCart[groupKey].push(item);
    });
    
    // Constrói a mensagem segmentada
    for (const [groupTitle, items] of Object.entries(groupedCart)) {
        text += `*--- ${groupTitle} ---*\n`;
        let groupTotalPieces = 0;
        
        items.forEach(item => {
            let extras = [];
            if (item.category === 'Baby Look Selo') {
                let fabLabel = item.fabric === 'Baby Poliéster' ? 'Baby Poliéster' : 'Baby Visco';
                if (item.color) extras.push(`${fabLabel}: ${item.color}`);
            } else if (item.color) {
                let colorLabel = (item.category && item.category.includes('Body')) ? 'Viés' : 'Camisa';
                extras.push(`${colorLabel}: ${item.color}`);
            }
            if (item.printColor) extras.push(`Estampa: ${item.printColor}`);
            if (item.variant) extras.push(item.variant);
            let extrasText = extras.length > 0 ? ` (${extras.join(' - ')})` : '';
            
            let itemQty = 0;
            let sizesText = [];
            for (const [size, qty] of Object.entries(item.sizes)) {
                if (qty > 0) {
                    sizesText.push(`${qty}x ${size}`);
                    itemQty += qty;
                }
            }

            groupTotalPieces += itemQty;
            grandTotalPieces += itemQty;
            
            text += `*Estampa: ${item.id}*${extrasText}\n`;
            text += `Tamanhos: ${sizesText.join(', ')}\n\n`;
        });

        text += `*${groupTotalPieces} ${groupTotalPieces === 1 ? 'peça.' : 'peças.'}*\n\n`;
    }
    
    text += `*TOTAL DO PEDIDO: ${grandTotalPieces} ${grandTotalPieces === 1 ? 'peça' : 'peças'}*\n\n`;
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
