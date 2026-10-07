import os
import json
import re

def gerar_dados():
    print("Iniciando a leitura das estampas para o Catálogo e Microsite...")
    
    diretorio_base = os.path.dirname(os.path.abspath(__file__))
    os.chdir(diretorio_base)
    
    pasta_estampas = "estampas"
    if not os.path.exists(pasta_estampas):
        print(f"Erro: Pasta '{pasta_estampas}' não encontrada.")
        return
        
    categorias = [d for d in os.listdir(pasta_estampas) if os.path.isdir(os.path.join(pasta_estampas, d))]
    
    dados_catalogo = {}
    extensoes_validas = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4']
    total_estampas = 0
    
    for categoria in categorias:
        caminho_cat = os.path.join(pasta_estampas, categoria)
        
        # Coleta de itens: busca na raiz da categoria e nas subpastas (temas)
        # Cada item é uma tupla: (subpasta, arq, tema)
        itens = []
        
        # Conversão opcional de GIFs para MP4
        teve_conversao = False
        if categoria != "SublimacaoInfantil":
            # Checa GIFs na raiz e subpastas
            pastas_para_checar = [""] + [d for d in os.listdir(caminho_cat) if os.path.isdir(os.path.join(caminho_cat, d))]
            for sub in pastas_para_checar:
                caminho_sub = os.path.join(caminho_cat, sub) if sub else caminho_cat
                for arq in os.listdir(caminho_sub):
                    if arq.lower().endswith('.gif') and not arq.endswith('_thumb.jpg'):
                        gif_path = os.path.join(caminho_sub, arq)
                        mp4_filename = os.path.splitext(arq)[0] + '.mp4'
                        mp4_path = os.path.join(caminho_sub, mp4_filename)
                        if not os.path.exists(mp4_path):
                            print(f"\n--- ATENÇÃO: Encontrado arquivo GIF ({arq}).")
                            try:
                                import subprocess
                                import imageio_ffmpeg
                                ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
                                cmd = [
                                    ffmpeg_exe, "-y", "-i", gif_path,
                                    "-vf", "fps=24,scale=trunc(iw/2)*2:trunc(ih/2)*2",
                                    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                                    "-vcodec", "libx264", "-crf", "23", mp4_path
                                ]
                                resultado = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                                if resultado.returncode == 0:
                                    try:
                                        os.remove(gif_path)
                                    except Exception:
                                        pass
                                    teve_conversao = True
                            except Exception:
                                pass
                                
            if teve_conversao:
                print("\nConversões concluídas. Atualizando leitura de arquivos...\n")
        
        # Leitura de todos os arquivos
        for item in os.listdir(caminho_cat):
            p = os.path.join(caminho_cat, item)
            if os.path.isfile(p):
                itens.append(("", item, "Outros"))
            elif os.path.isdir(p):
                subpasta = item
                caminho_sub = p
                for arq_sub in os.listdir(caminho_sub):
                    p_sub = os.path.join(caminho_sub, arq_sub)
                    if os.path.isfile(p_sub):
                        itens.append((subpasta, arq_sub, subpasta))
        
        if categoria in ["SublimacaoAdulto", "SublimacaoAdulta"]:
            nome_aba = "Sublimação Adulto"
        elif categoria == "BabyLook":
            nome_aba = "Frente Total BabyLook"
        elif categoria == "SublimacaoInfantil":
            nome_aba = "Sublimação Infantil"
        elif categoria.lower() == "silkscreen":
            nome_aba = "Silkscreen"
        elif categoria == "Viscolycra Selo Adulto":
            nome_aba = "Adulto Selo"
        elif categoria == "Viscolycra Selo Infantil":
            nome_aba = "Infantil Selo"
        elif categoria == "estampasbody":
            nome_aba = "Body"
        elif categoria in ["FrenteTotalMasculina", "Frente Total Masculina", "FrenteTotal"]:
            nome_aba = "Frente Total Camiseta"
        elif categoria in ["DTFadulto", "DTF Adulto"]:
            nome_aba = "DTF Adulto"
        elif categoria in ["DTFinfantil", "DTF Infantil"]:
            nome_aba = "DTF Infantil"
        elif categoria == "Infantil":
            nome_aba = "Frente Total Infantil"
        else:
            nome_aba = categoria
        
        grupos = {}
        baby_thumb_numbers = {5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 31, 33, 35, 37, 39, 41, 43, 45, 53, 55, 56, 57}
        
        for subpasta, arq, tema in itens:
            if arq.endswith('_thumb.webp'):
                continue
                
            nome, ext = os.path.splitext(arq)
            
            caminho_pasta = os.path.join(caminho_cat, subpasta) if subpasta else caminho_cat
            todos_arquivos_pasta = [a.lower() for a in os.listdir(caminho_pasta)]
            
            if ext.lower() == '.gif':
                if f"{nome.lower()}.mp4" in todos_arquivos_pasta:
                    continue
                    
            if ext.lower() in extensoes_validas:
                rel_prefix = f"{pasta_estampas}/{categoria}/{subpasta}" if subpasta else f"{pasta_estampas}/{categoria}"
                file_rel_path = f"{rel_prefix}/{arq}"
                thumb_path = file_rel_path
                is_dtf_infantil_baby = False
                num_dtf_infantil = 0
                
                # Extrai ID e variação
                if categoria in ["Viscolycra Selo Adulto", "Viscolycra Selo Infantil"]:
                    if categoria == "Viscolycra Selo Infantil" and nome.startswith("SI_"):
                        if " " in nome:
                            base_id, var_raw = nome.split(" ", 1)
                        else:
                            base_id = nome
                            var_raw = None
                    else:
                        if "_" in nome:
                            base_id, var_raw = nome.split("_", 1)
                        elif "-" in nome:
                            base_id, var_raw = nome.split("-", 1)
                        else:
                            base_id = nome
                            var_raw = None
                    nome_exibicao = base_id.replace("_", "-")
                elif categoria in ["SublimacaoAdulto", "SublimacaoAdulta"] and nome.lower().startswith("mockup_"):
                    nome_exibicao = nome[7:]
                    base_id = nome_exibicao
                    var_raw = None
                elif categoria == "SublimacaoInfantil" and nome.lower().startswith("animacao_"):
                    try:
                        numero = int(nome.split("_")[1])
                        nome_exibicao = str(numero).zfill(4)
                    except:
                        nome_exibicao = nome
                    base_id = nome_exibicao
                    var_raw = None
                elif categoria.lower() == "silkscreen" and nome.lower().startswith("animado_"):
                    try:
                        numero = int(nome.split("_")[1])
                        nome_exibicao = str(numero).zfill(4)
                    except:
                        nome_exibicao = nome
                    base_id = nome_exibicao
                    var_raw = None
                elif categoria in ["DTFadulto", "DTF Adulto"] and (nome.lower().startswith("video_") or nome.lower().startswith("animacao_") or nome.lower().startswith("animado_")):
                    try:
                        numero = int(nome.split("_")[1])
                        nome_exibicao = str(numero).zfill(4)
                    except:
                        nome_exibicao = nome
                    base_id = nome_exibicao
                    var_raw = None
                elif categoria in ["DTFinfantil", "DTF Infantil"] and nome.lower().startswith("mockup_"):
                    raw_num = nome[7:]
                    is_dtf_infantil_baby = raw_num.lower().endswith("baby")
                    clean_num_str = raw_num[:-4] if is_dtf_infantil_baby else raw_num
                    try:
                        num_dtf_infantil = int(clean_num_str)
                        nome_exibicao = str(num_dtf_infantil).zfill(4)
                    except:
                        nome_exibicao = raw_num
                    base_id = nome_exibicao
                    var_raw = None
                else:
                    nome_exibicao = nome
                    base_id = nome
                    var_raw = None
                
                # Trata thumbnail genérica
                full_thumb_path = ""
                if ext.lower() in ['.gif', '.mp4']:
                    if categoria in ["Viscolycra Selo Adulto", "Viscolycra Selo Infantil"]:
                        thumb_filename = f"{base_id}_thumb.webp"
                    else:
                        thumb_filename = f"{nome}_thumb.webp"
                        
                    full_thumb_path = os.path.join(caminho_pasta, thumb_filename)
                    thumb_path = f"{rel_prefix}/{thumb_filename}"
                    
                    if not os.path.exists(full_thumb_path):
                        if categoria == "SublimacaoInfantil" and ext.lower() == '.gif':
                            try:
                                from PIL import Image
                                with Image.open(os.path.join(caminho_pasta, arq)) as img:
                                    img.seek(0)
                                    rgb_img = img.convert('RGB')
                                    rgb_img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                                    rgb_img.save(full_thumb_path, 'webp', quality=85, optimize=True)
                            except Exception:
                                thumb_path = file_rel_path
                        else:
                            try:
                                import subprocess
                                import imageio_ffmpeg
                                from PIL import Image
                                ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
                                temp_frame = os.path.join(caminho_pasta, f"temp_frame_{nome}.jpg")
                                cmd = [ffmpeg_exe, "-y", "-i", os.path.join(caminho_pasta, arq), "-vframes", "1", "-q:v", "2", temp_frame]
                                resultado = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                                if resultado.returncode == 0 and os.path.exists(temp_frame):
                                    with Image.open(temp_frame) as img:
                                        if categoria in ["DTFadulto", "DTF Adulto"]:
                                            w, h = img.size
                                            img = img.crop((0, 0, w - 8, h))
                                        rgb_img = img.convert('RGB')
                                        rgb_img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                                        rgb_img.save(full_thumb_path, 'webp', quality=85, optimize=True)
                                    os.remove(temp_frame)
                                else:
                                    thumb_path = file_rel_path
                            except Exception:
                                thumb_path = file_rel_path
                                
                if categoria in ["DTFinfantil", "DTF Infantil"]:
                    if base_id not in grupos:
                        grupos[base_id] = {
                            "id": nome_exibicao,
                            "image": file_rel_path,
                            "image_baby": file_rel_path,
                            "thumb": file_rel_path,
                            "tema": tema,
                            "variations": []
                        }
                    if is_dtf_infantil_baby:
                        grupos[base_id]["image_baby"] = file_rel_path
                        if num_dtf_infantil in baby_thumb_numbers:
                            grupos[base_id]["thumb"] = file_rel_path
                    else:
                        grupos[base_id]["image"] = file_rel_path
                        if num_dtf_infantil not in baby_thumb_numbers:
                            grupos[base_id]["thumb"] = file_rel_path
                else:
                    if base_id not in grupos:
                        grupos[base_id] = {
                            "id": nome_exibicao,
                            "image": file_rel_path,
                            "thumb": thumb_path,
                            "tema": tema,
                            "variations": []
                        }
                
                if ext.lower() in ['.mp4', '.gif'] and not grupos[base_id]["image"].endswith(('.mp4', '.gif')):
                    grupos[base_id]["image"] = file_rel_path
                    grupos[base_id]["thumb"] = thumb_path
                
                if var_raw:
                    var_clean = re.sub(r'([a-z])c([a-z])', r'\1 com \2', var_raw, flags=re.IGNORECASE)
                    var_clean = var_clean.title().replace(' Com ', ' com ')
                    grupos[base_id]["variations"].append({
                        "name": var_clean,
                        "image": file_rel_path
                    })
                    
        imagens = list(grupos.values())
        imagens.sort(key=lambda x: x["id"])
        
        if imagens:
            dados_catalogo[nome_aba] = imagens
            total_estampas += len(imagens)
            temas_unicos = sorted(list(set(x.get("tema", "Outros") for x in imagens)))
            print(f"Categoria '{nome_aba}': {len(imagens)} estampas em {len(temas_unicos)} tema(s) {temas_unicos}.")
            
    # Reorganização estrita da ordem das abas conforme solicitado
    ordem_abas = [
        "DTF Adulto",
        "DTF Infantil",
        "Frente Total BabyLook",
        "Frente Total Infantil",
        "Frente Total Camiseta",
        "Adulto Selo",
        "Infantil Selo",
        "Silkscreen",
        "Body",
        "Sublimação Adulto",
        "Sublimação Infantil"
    ]
    
    catalogo_ordenado = {}
    for aba in ordem_abas:
        if aba in dados_catalogo:
            catalogo_ordenado[aba] = dados_catalogo[aba]
    for aba, itens_aba in dados_catalogo.items():
        if aba not in catalogo_ordenado:
            catalogo_ordenado[aba] = itens_aba
    dados_catalogo = catalogo_ordenado

    conteudo_js = f"const catalogo = {json.dumps(dados_catalogo, indent=4, ensure_ascii=False)};\n"
    with open("dados.js", "w", encoding="utf-8") as f:
        f.write(conteudo_js)
        
    print(f"\nSucesso! 'dados.js' gerado com um total de {total_estampas} estampas em {len(dados_catalogo)} categorias na ordem correta.")

if __name__ == '__main__':
    gerar_dados()
