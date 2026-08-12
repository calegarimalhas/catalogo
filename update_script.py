import re

with open('script.js', 'r', encoding='utf-8') as f:
    code = f.read()

def replace_between(text, start_str, end_str, replacement):
    start = text.find(start_str)
    if start == -1: return text
    end = text.find(end_str, start)
    if end == -1: return text
    return text[:start] + replacement + text[end:]

# 1. Add logic for Variations inside openModal
variation_logic = '''    // Lógica das Variações (Videos/Strass Dinâmico)
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
            
            label.innerHTML = 
                <input type="radio" name="variation-option" value="" >
                <span class="variant-btn"></span>
            ;
            
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
'''

# We need to replace the initial videoEl / imgEl logic:
old_media_logic = '''    if (item.image.toLowerCase().endsWith('.mp4')) {
        imgEl.style.display = 'none';
        videoEl.style.display = 'block';
        videoEl.src = item.image;
        videoEl.playbackRate = 2.5; // Acelera o video para transicoes mais dinamicas
    } else {
        videoEl.style.display = 'none';
        videoEl.src = '';
        imgEl.style.display = 'block';
        imgEl.src = item.image;
    }'''

code = code.replace(old_media_logic, variation_logic)

# 2. Add Colors logic for the new tabs
color_logic_start = "    // Lógica de Cores da Camisa"
color_logic_end = "    // Lógica da Cor da Estampa (Print Color)"

new_color_logic = '''    // Lógica de Cores da Camisa
    const colorContainer = document.getElementById('color-selector-container');
    const colorInfantil = document.getElementById('color-options-infantil');
    const colorSilkscreen = document.getElementById('color-options-silkscreen');
    const colorInfantilSelo = document.getElementById('color-options-infantil-selo');
    const colorBabylookSelo = document.getElementById('color-options-babylook-selo');
    
    // Esconde todos
    if(colorInfantil) colorInfantil.style.display = 'none';
    if(colorSilkscreen) colorSilkscreen.style.display = 'none';
    if(colorInfantilSelo) colorInfantilSelo.style.display = 'none';
    if(colorBabylookSelo) colorBabylookSelo.style.display = 'none';
    
    if (currentCategory === 'Sublimação Infantil') {
        colorContainer.style.display = 'block';
        colorInfantil.style.display = 'flex';
        document.querySelector('input[name="color-option"][value="Branco"]').checked = true;
    } else if (currentCategory === 'Silkscreen') {
        colorContainer.style.display = 'block';
        colorSilkscreen.style.display = 'flex';
        document.querySelector('input[name="color-option-silk"][value="Preta"]').checked = true;
    } else if (currentCategory === 'Sublimação Infantil Selo') {
        colorContainer.style.display = 'block';
        colorInfantilSelo.style.display = 'flex';
        document.querySelector('#color-options-infantil-selo input[name="color-option"][value="Preta"]').checked = true;
    } else if (currentCategory === 'Baby Look Selo') {
        colorContainer.style.display = 'block';
        colorBabylookSelo.style.display = 'flex';
        document.querySelector('#color-options-babylook-selo input[name="color-option"][value="Preta"]').checked = true;
    } else {
        colorContainer.style.display = 'none';
    }
'''

code = replace_between(code, color_logic_start, color_logic_end, new_color_logic)

# 3. Size XG for Baby Look Selo and Sublimação Infantil Selo PP
xg_logic_start = "    // Mostra o tamanho XG"
xg_logic_end = "    modal.style.display = 'flex';"

new_xg_logic = '''    // Mostra o tamanho XG apenas para Baby Look
    const xgContainer = document.getElementById('group-size-xg');
    if (currentCategory.includes('Baby Look')) {
        xgContainer.style.display = 'flex';
    } else {
        xgContainer.style.display = 'none';
    }
    
    // Atualiza PP para Sublimação Infantil Selo
    const ppContainer = document.getElementById('group-size-pp');
    if (currentCategory.includes('Sublimação Infantil')) {
        ppContainer.style.display = 'flex';
    } else {
        ppContainer.style.display = 'none';
    }
'''
code = replace_between(code, "    // Mostra o tamanho PP", "    modal.style.display = 'flex';", new_xg_logic)

# 4. addToCart logic
add_cart_old = '''    // Captura variante (Strass) se aplicável
    let strassSelection = '';
    const strassContainer = document.getElementById('strass-selector-container');
    if (strassContainer.style.display !== 'none') {
        const selectedRadio = document.querySelector('input[name="strass-option"]:checked');
        if (selectedRadio) {
            strassSelection = selectedRadio.value;
        }
    }'''

add_cart_new = '''    // Captura Variação (Nova Lógica de array)
    let variationSelection = '';
    let selectedImage = currentProduct.image;
    const variationContainer = document.getElementById('variation-selector-container');
    if (variationContainer && variationContainer.style.display !== 'none') {
        const selectedVarRadio = document.querySelector('input[name="variation-option"]:checked');
        if (selectedVarRadio) {
            variationSelection = selectedVarRadio.value;
            // Achar a URL certa para o carrinho
            const vObj = currentProduct.variations.find(v => v.name === variationSelection);
            if(vObj) selectedImage = vObj.image;
        }
    }

    // Captura variante (Strass Padrão) se aplicável
    let strassSelection = '';
    const strassContainer = document.getElementById('strass-selector-container');
    if (strassContainer.style.display !== 'none') {
        const selectedRadio = document.querySelector('input[name="strass-option"]:checked');
        if (selectedRadio) {
            strassSelection = selectedRadio.value;
        }
    }
    
    // Junta as duas caso precise
    if (variationSelection) {
        strassSelection = strassSelection ? ${strassSelection} () : variationSelection;
    }
'''
code = code.replace(add_cart_old, add_cart_new)

# Fix duplicate cart item logic (add variant Image)
cart_push_old = '''        // Adiciona novo
        cart.push({
            id: currentProduct.id,
            image: currentProduct.image,'''
cart_push_new = '''        // Adiciona novo
        cart.push({
            id: currentProduct.id,
            image: selectedImage,'''
code = code.replace(cart_push_old, cart_push_new)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(code)
