import os
import json
import csv
import re
import urllib.parse

def sanitizar_texto(texto):
    if not texto:
        return ""
    t = str(texto)
    t = re.sub(r'Sublima[^a-zA-Z0-9\s]o', 'Sublimação', t, flags=re.IGNORECASE)
    t = re.sub(r'Gra[^a-zA-Z0-9\s]as', 'Graças', t, flags=re.IGNORECASE)
    t = re.sub(r'F[^a-zA-Z0-9\s]tima', 'Fátima', t, flags=re.IGNORECASE)
    t = re.sub(r'\bS[^a-zA-Z0-9\s]o\b', 'São', t, flags=re.IGNORECASE)
    t = re.sub(r'C[^a-zA-Z0-9\s]d', 'Cód.', t, flags=re.IGNORECASE)
    return t

def get_price(cat_name):
    """Retorna o preço unitário de atacado com base na tabela_precos.js"""
    cat = cat_name.lower()
    if "dtf" in cat:
        return 9.50 if "infantil" in cat else 15.00
    if "babylook" in cat or "baby look" in cat:
        return 22.90
    if "frente total" in cat:
        if "infantil" in cat:
            return 13.00
        return 24.50
    if "silk" in cat:
        return 13.50
    if "selo" in cat:
        return 14.60 if "infantil" in cat else 22.40
    if "body" in cat:
        return 12.00
    if "sublima" in cat:
        return 8.10 if "infantil" in cat else 12.80
    return 12.80

def gerar_planilha_meta():
    diretorio_base = os.path.dirname(os.path.abspath(__file__))
    os.chdir(diretorio_base)
    
    dados_js_path = "dados.js"
    if not os.path.exists(dados_js_path):
        print("Erro: dados.js não encontrado!")
        return

    with open(dados_js_path, "r", encoding="utf-8", errors="replace") as f:
        conteudo = f.read().strip()
    
    # Extrai o JSON da variável `const catalogo = ...;`
    inicio = conteudo.find("{")
    fim = conteudo.rfind("}")
    if inicio == -1 or fim == -1:
        print("Erro: Formato inválido em dados.js")
        return
        
    dados_catalogo = json.loads(conteudo[inicio:fim+1])

    # Prefixo para garantir IDs 100% únicos exigidos pela Meta
    prefix_map = {
        "DTF Adulto": "DTFA",
        "DTF Infantil": "DTFI",
        "Frente Total BabyLook": "FTBLK",
        "Frente Total Infantil": "FTINF",
        "Frente Total Camiseta": "FTCAM",
        "Adulto Selo": "SELAD",
        "Infantil Selo": "SELINF",
        "Silkscreen": "SILK",
        "Body": "BODY",
        "Sublimação Adulto": "SUBAD",
        "Sublimação Infantil": "SUBINF"
    }

    base_domain = "https://calegariestampas.com.br"

    # Linha de comentário oficial da Meta
    comentario_meta = (
        '# Obrigatório | A unique content ID for the item. Use the item\'s SKU if you can. Each content ID must appear only once in your catalog. To run dynamic ads this ID must exactly match the content ID for the same item in your Meta Pixel code. Character limit: 100,'
        '# Obrigatório | A specific and relevant title for the item. See title specifications: https://www.facebook.com/business/help/2104231189874655 Character limit: 200,'
        '# Obrigatório | A short and relevant description of the item. Include specific or unique product features like material or color. Use plain text and don\'t enter text in all capital letters. See description specifications: https://www.facebook.com/business/help/2302017289821154 Character limit: 9999,'
        '# Obrigatório | The current availability of the item. | Valores aceitos: in stock; out of stock,'
        '# Obrigatório | The current condition of the item. | Valores aceitos: new; used,'
        '# Opcional | The price of the item. Format the price as a number followed by the 3-letter currency code (ISO 4217 standards). Use a period (.) as the decimal point; don\'t use a comma.,'
        '# Obrigatório | The URL of the specific product page where people can buy the item.,'
        '# Obrigatório | The URL for the main image of your item. Images must be in a supported format (JPG/GIF/PNG) and at least 500 x 500 pixels.,'
        '# Obrigatório | O nome da marca do item. Limite de caracteres: 100.,'
        '# Opcional | The Google product category for the item. Learn more about product categories: https://www.facebook.com/business/help/526764014610932.,'
        '# Opcional | The Facebook product category for the item. Learn more about product categories: https://www.facebook.com/business/help/526764014610932.,'
        '# Opcional | The quantity of this item you have to sell on Facebook and Instagram with checkout. Must be 1 or higher or the item won\'t be buyable,'
        '# Opcional | The discounted price of the item if it\'s on sale. Format the price as a number followed by the 3-letter currency code (ISO 4217 standards). Use a period (.) as the decimal point; don\'t use a comma. A sale price is required if you want to use an overlay for discounted prices.,'
        '# Opcional | The time range for your sale period. Includes the date and time/time zone when your sale starts and ends. If this field is blank any items with a sale_price remain on sale until you remove the sale price. Use this format: YYYY-MM-DDT23:59+00:00/YYYY-MM-DDT23:59+00:00. Enter the start date as YYYY-MM-DD. Enter a \'T\'. Enter the start time in 24-hour format (00:00 to 23:59) followed by the UTC time zone (-12:00 to +14:00). Enter \'/\' and then repeat the same format for your end date and time. The example row below uses PST time zone (-08:00).,'
        '# Opcional | Use this field to create variants of the same item. Enter the same group ID for all variants within a group. Learn more about variants: https://www.facebook.com/business/help/2256580051262113 Character limit: 100.,'
        '# Opcional | O gênero de uma pessoa para a qual o item é direcionado. | Valores aceitos: female; male; unisex,'
        '# Opcional | The color of the item. Use one or more words to describe the color. Don\'t use a hex code. Character limit: 200.,'
        '# Opcional | The size of the item written as a word or abbreviation or number. For example: small; XL; 12. Character limit: 200.,'
        '# Opcional | A faixa etária para a qual o item é direcionado. | Valores aceitos: adult; all ages; infant; kids; newborn; teen; toddler,'
        '# Opcional | O material de que o item é feito; como algodão; jeans ou couro. Limite de caracteres: 200.,'
        '# Opcional | The pattern or graphic print on the item. Character limit: 100.,'
        '"# Opcional | Detalhes de envio do item. Formate o texto da seguinte maneira: País:Região:Serviço:Preço. Inclua o código de moeda ISO 4217 de 3 dígitos no preço. Para usar a sobreposição de frete grátis nos seus anúncios; insira o preço como 0.0. Use dois-pontos "";"" ou vírgula "";"" para separar vários detalhes de envio para diferentes regiões ou países. Apenas as pessoas na região ou no país especificado verão os detalhes de envio dessa região ou país. Você poderá omitir a região (mantenha os ""::"" duplos) se os detalhes de envio forem iguais para todo o país.",'
        '# Opcional | The shipping weight of the item. Include the unit of measurement (lb/oz/g/kg).,'
        '"# Opcional | Legal disclaimer text for product offers. This text provides important legal or regulatory information that must be displayed with the product offer. For example: ""Valid while supplies last. Terms and conditions apply.""",'
        '"# Opcional | URL linking to the full disclaimer text. This provides a link to a page containing the complete disclaimer information for the product offer. For example: ""https://example.com/terms-and-conditions""",'
        '# Opcional | O URL de um vídeo do seu produto. O link deve ser de um arquivo de vídeo em um site de hospedagem; não de um player de vídeo. Os vídeos devem estar em um formato compatível (.3g2; .3gp; .3gpp; .asf; .avi; .dat; .divx; .dv; .f4v; .flv; .gif; .m2ts; .m4v; .mkv; .mod; .mov; .mp4; .mpe; .mpeg; .mpeg4; .mpg; .mts; .nsv; .ogm; .ogv; .qt; .tod; .ts; .vob ou .wmv).,'
        '# Opcional | O URL de um vídeo do seu produto. O link deve ser de um arquivo de vídeo em um site de hospedagem; não de um player de vídeo. Os vídeos devem estar em um formato compatível (.3g2; .3gp; .3gpp; .asf; .avi; .dat; .divx; .dv; .f4v; .flv; .gif; .m2ts; .m4v; .mkv; .mod; .mov; .mp4; .mpe; .mpeg; .mpeg4; .mpg; .mts; .nsv; .ogm; .ogv; .qt; .tod; .ts; .vob ou .wmv).,'
        '# Opcional | O número global de item comercial (GTIN) do item. Recomendado para ajudar a classificar o item. Pode aparecer no código de barras; na embalagem ou na capa do livro. Forneça o GTIN apenas se tiver certeza de que está correto. Os tipos de GTIN incluem UPC (12 dígitos); EAN (13 dígitos); JAN (8 ou 13 dígitos); ISBN (13 dígitos) ou ITF-14 (14 dígitos),'
        '# Opcional | Add labels to products to help filter them into product sets. Max characters: 110 per label; 5000 labels per product,'
        '# Opcional | Add labels to products to help filter them into product sets. Max characters: 110 per label; 5000 labels per product,'
        '# Opcional | Descreva o estilo de moda desse item.'
    )

    header_cols = [
        "id", "title", "description", "availability", "condition", "price",
        "link", "image_link", "brand", "google_product_category", "fb_product_category",
        "quantity_to_sell_on_facebook", "sale_price", "sale_price_effective_date",
        "item_group_id", "gender", "color", "size", "age_group", "material",
        "pattern", "shipping", "shipping_weight", "offer_disclaimer",
        "offer_disclaimer_url", "video[0].url", "video[0].tag[0]", "gtin",
        "product_tags[0]", "product_tags[1]", "style[0]"
    ]

    linhas_csv = []
    total_itens = 0

    for cat_nome, itens in dados_catalogo.items():
        cat_limpo = sanitizar_texto(cat_nome)
        
        prefix = prefix_map.get(cat_limpo, cat_limpo[:4].upper())
        valor_unitario = get_price(cat_limpo)
        preco_meta = f"{valor_unitario:.2f} BRL"
        preco_formatado_br = f"R$ {valor_unitario:.2f}".replace(".", ",")
        
        # Determinar gênero e faixa etária padrão da categoria
        cat_lower = cat_limpo.lower()
        if "babylook" in cat_lower or "baby look" in cat_lower:
            gender = "female"
            age_group = "adult"
        elif "body" in cat_lower:
            gender = "unisex"
            age_group = "infant"
        elif "infantil" in cat_lower:
            gender = "unisex"
            age_group = "kids"
        else:
            gender = "unisex"
            age_group = "adult"

        for it in itens:
            raw_id = str(it.get("id", "")).strip()
            item_unique_id = f"{prefix}-{raw_id}"
            tema = it.get("tema", "Outros") or "Outros"
            tema_limpo = sanitizar_texto(tema)
            
            # Título descritivo e direto
            if tema_limpo and tema_limpo != "Outros":
                title = f"{cat_limpo} - {tema_limpo} - Cód. {raw_id}"
            else:
                title = f"{cat_limpo} - Cód. {raw_id}"
            
            # Descrição com contexto claro de atacado, valor unitário e regras
            description = (
                f"Estampa Calegari Malhas | Categoria: {cat_limpo} | Tema: {tema_limpo} | Cód: {raw_id}. "
                f"Valor unitário de atacado: {preco_formatado_br}. "
                "Adicione este item ao seu carrinho no WhatsApp e envie seu pedido para "
                "conferência de grade de tamanhos, pedido mínimo e cálculo de frete."
            )

            # Imagem e Vídeo
            img_path = it.get("thumb") or it.get("image") or ""
            video_path = it.get("image") if (it.get("image", "").lower().endswith(".mp4")) else ""
            
            # A imagem principal do Meta precisa ser uma imagem (se image for mp4, usa o thumb)
            if img_path.lower().endswith(".mp4"):
                img_path = it.get("thumb") or ""

            # Monta links com encoding correto para espaços
            image_url = f"{base_domain}/{urllib.parse.quote(img_path.replace('\\', '/'), safe='/')}" if img_path else ""
            video_url = f"{base_domain}/{urllib.parse.quote(video_path.replace('\\', '/'), safe='/')}" if video_path else ""
            
            # Link da página de pedido
            cat_url_param = urllib.parse.quote(cat_limpo)
            product_link = f"{base_domain}/?cat={cat_url_param}&ref={raw_id}"

            linha = {
                "id": item_unique_id,
                "title": title[:200],
                "description": description[:9999],
                "availability": "in stock",
                "condition": "new",
                "price": preco_meta,  # Preço unitário de atacado no formato aceito pela Meta (ex: 15.00 BRL)
                "link": product_link,
                "image_link": image_url,
                "brand": "Calegari Malhas",
                "google_product_category": "Apparel & Accessories > Clothing",
                "fb_product_category": "Clothing & Accessories > Clothing",
                "quantity_to_sell_on_facebook": "",
                "sale_price": "",
                "sale_price_effective_date": "",
                "item_group_id": prefix,
                "gender": gender,
                "color": "",
                "size": "P ao GG" if age_group == "adult" else "Infantil",
                "age_group": age_group,
                "material": "Algodão / Poliéster / Viscolycra",
                "pattern": "Estampada",
                "shipping": "",
                "shipping_weight": "",
                "offer_disclaimer": "",
                "offer_disclaimer_url": "",
                "video[0].url": video_url,
                "video[0].tag[0]": "Demonstração" if video_url else "",
                "gtin": "",
                "product_tags[0]": cat_limpo,
                "product_tags[1]": tema_limpo,
                "style[0]": "Casual"
            }
            linhas_csv.append(linha)
            total_itens += 1

    # Salva o arquivo CSV no formato oficial Meta
    nome_saida = "catalogo_meta.csv"
    with open(nome_saida, "w", encoding="utf-8-sig", newline="") as f:
        # Escreve o comentário de instrução oficial no topo
        f.write(comentario_meta + "\r\n")
        
        writer = csv.DictWriter(f, fieldnames=header_cols)
        writer.writeheader()
        writer.writerows(linhas_csv)

    print(f"\nSucesso! Planilha gerada com {total_itens} produtos e preços de atacado em '{nome_saida}'.")

if __name__ == "__main__":
    gerar_planilha_meta()
