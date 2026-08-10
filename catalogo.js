// Estado da Aplicação
let currentCategory = '';

// Elementos DOM
const tabsContainer = document.getElementById('tabs-container');
const catalogContainer = document.getElementById('catalog-container');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // catalogo é carregado do dados.js
    if (typeof catalogo === 'undefined' || Object.keys(catalogo).length === 0) {
        catalogContainer.innerHTML = '<p style="text-align:center;width:100%;padding:50px;">Nenhuma estampa encontrada. Execute o gerador_dados.py</p>';
        return;
    }

    const categories = Object.keys(catalogo);
    currentCategory = categories[0];
    
    renderTabs(categories);
    renderCatalog(currentCategory);
});

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
            currentCategory = cat;
            renderCatalog(cat);
        };
        tabsContainer.appendChild(btn);
    });
}

// Renderização do Catálogo
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

// Lógica do Modal de Produto (Modo Mostruário Estático)
function openModal(item) {
    const modal = document.getElementById('product-modal');
    
    // Configura Imagem ou Vídeo no Modal
    const imgEl = document.getElementById('modal-image');
    const videoEl = document.getElementById('modal-video');
    
    if (item.image.toLowerCase().endsWith('.mp4')) {
        imgEl.style.display = 'none';
        videoEl.style.display = 'block';
        videoEl.src = item.image;
        videoEl.playbackRate = 2.5; // Mantém a aceleração do vídeo
    } else {
        videoEl.style.display = 'none';
        videoEl.src = '';
        imgEl.style.display = 'block';
        imgEl.src = item.image;
    }
    
    document.getElementById('modal-title').innerText = item.id;
    
    // Exibir cores informativas
    const infoContainer = document.getElementById('info-cores-container');
    const infoInfantil = document.getElementById('info-cores-infantil');
    const infoSilkCamisa = document.getElementById('info-cores-silkscreen');
    const infoSilkEstampa = document.getElementById('info-estampa-silkscreen');
    
    if (currentCategory === 'Sublimação Infantil') {
        infoContainer.style.display = 'flex';
        infoInfantil.style.display = 'flex';
        infoSilkCamisa.style.display = 'none';
        infoSilkEstampa.style.display = 'none';
    } else if (currentCategory === 'Silkscreen') {
        infoContainer.style.display = 'flex';
        infoInfantil.style.display = 'none';
        infoSilkCamisa.style.display = 'flex';
        infoSilkEstampa.style.display = 'flex';
    } else {
        infoContainer.style.display = 'none';
    }
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
    
    // Pausa e reseta o vídeo ao fechar o modal
    const videoEl = document.getElementById('modal-video');
    videoEl.pause();
    videoEl.src = '';
}

// Fechar modal clicando fora
window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
        closeModal();
    }
}
