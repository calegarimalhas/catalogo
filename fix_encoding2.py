import sys
with open('script.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix the WhatsApp function content
old_whatsapp = '''    let text = "*Novo Pedido - Calegari Malhas* Y>??\\n\\n";'''
new_whatsapp = '''    let text = "*Novo Pedido - Calegari Malhas* 🛍️\\n\\n";'''
code = code.replace(old_whatsapp, new_whatsapp)

# It might be ðŸ› ï¸  instead of Y>?? if python reads it differently. Let's just regex replace it to be safe.
import re
code = re.sub(r'let text = "\*Novo Pedido - Calegari Malhas\*.*?\\n\\n";', 'let text = "*Novo Pedido - Calegari Malhas* 🛍️\\n\\n";', code)

# Fix the hardcoded whatsapp number
code = code.replace('whatsappUrl = https://wa.me/5522998394468?text=;', 'whatsappUrl = https://wa.me/?text=;')

# Fix the old WhatsApp message format (asterisk on Estampa)
code = code.replace('text += *Estampa: * \\n;', 'text += Estampa:  \\n;')
code = code.replace('let sizesText = [];\\n            for (const [size, qty] of Object.entries(item.sizes)) {\\n                if (qty > 0) sizesText.push(${qty}x );\\n            }\\n            text += Tamanhos: \\n\\n;', 'text += Tamanhos: \\n\\n;')
# Actually, the sizesText was already generated above in my previous replace, but since I reverted, it's at the bottom.
# I need to move the sizesText array generation ABOVE the text += Estampa...
# Let's do it carefully:
old_loop_content = '''        items.forEach(item => {
            let extras = [];
            if (item.color) extras.push(Camisa: );
            if (item.printColor) extras.push(Estampa: );
            if (item.variant) extras.push(item.variant);
            let extrasText = extras.length > 0 ? () : '';
            
            text += *Estampa: * \\n;
            let sizesText = [];
            for (const [size, qty] of Object.entries(item.sizes)) {
                if (qty > 0) sizesText.push(${qty}x );
            }
            text += Tamanhos: \\n\\n;
        });'''

new_loop_content = '''        items.forEach(item => {
            let sizesText = [];
            for (const [size, qty] of Object.entries(item.sizes)) {
                if (qty > 0) sizesText.push(${qty}x );
            }
            
            let extras = [];
            if (item.color) extras.push(Camisa: );
            if (item.printColor) extras.push(Estampa: );
            if (item.variant) extras.push(item.variant);
            let extrasText = extras.length > 0 ? () : '';
            
            text += Estampa:  \\n;
            text += Tamanhos: \\n\\n;
        });'''

code = code.replace(old_loop_content, new_loop_content)


# Fix common corrupted characters
code = code.replace('estÃ¡', 'está')
code = code.replace('CatÃ¡logo', 'Catálogo')
code = code.replace('aplicÃ¡vel', 'aplicável')
code = code.replace('jÃ¡', 'já')
code = code.replace('LÃ³gica', 'Lógica')
code = code.replace('notificaÃ§Ã£o', 'notificação')
code = code.replace('Sublimaǜo', 'Sublimação')
code = code.replace('Sublimao', 'Sublimação')
code = code.replace('Catǭlogo', 'Catálogo')
code = code.replace('Aplicaǜo', 'Aplicação')
code = code.replace('Configuraes', 'Configurações')
code = code.replace('Inicializaǜo', 'Inicialização')
code = code.replace('Renderizaǜo', 'Renderização')
code = code.replace('Lgica', 'Lógica')
code = code.replace('Vdeo', 'Vídeo')
code = code.replace('Variaes', 'Variações')
code = code.replace('Dinmico', 'Dinâmico')
code = code.replace('Funo', 'Função')
code = code.replace('mdia', 'mídia')
code = code.replace('padro', 'padrão')
code = code.replace('aplicvel', 'aplicável')
code = code.replace('selees', 'seleções')
code = code.replace('Finalizaǜo', 'Finalização')
code = code.replace('_Pedido gerado pelo Catǭlogo Digital_', '_Pedido gerado pelo Catálogo Digital_')

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(code)
