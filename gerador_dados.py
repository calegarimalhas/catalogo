import os
import json
import re

def gerar_dados():
    print("Iniciando a leitura das estampas para o Microsite...")
    
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
        
        teve_conversao = False
        if categoria != "SublimacaoInfantil":
            arquivos_temp = os.listdir(caminho_cat)
            for arq in arquivos_temp:
                if arq.lower().endswith('.gif') and not arq.endswith('_thumb.jpg'):
                    gif_path = os.path.join(caminho_cat, arq)
                    mp4_filename = os.path.splitext(arq)[0] + '.mp4'
                    mp4_path = os.path.join(caminho_cat, mp4_filename)
                    
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
                                except Exception as e:
                                    pass
                                teve_conversao = True
                        except Exception as e:
                            pass
                            
            if teve_conversao:
                print("\nConversões concluídas. Atualizando leitura de arquivos...\n")
        
        arquivos = os.listdir(caminho_cat)
        
        if categoria in ["SublimacaoAdulto", "SublimacaoAdulta"]:
            nome_aba = "Sublimação Adulta Branca"
        elif categoria == "BabyLook":
            nome_aba = "Baby Look"
        elif categoria == "SublimacaoInfantil":
            nome_aba = "Sublimação Infantil"
        elif categoria.lower() == "silkscreen":
            nome_aba = "Silkscreen"
        elif categoria == "Viscolycra Selo Adulto":
            nome_aba = "Baby Look Selo"
        elif categoria == "Viscolycra Selo Infantil":
            nome_aba = "Viscolycra Infantil Selo"
        else:
            nome_aba = categoria
        
        grupos = {}
        
        for arq in arquivos:
            if arq.endswith('_thumb.jpg'):
                continue
                
            nome, ext = os.path.splitext(arq)
            
            if ext.lower() == '.gif':
                if f"{nome}.mp4" in [a.lower() for a in arquivos]:
                    continue
                    
            if ext.lower() in extensoes_validas:
                thumb_path = f"{pasta_estampas}/{categoria}/{arq}"
                
                # Extrai ID e variao
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
                else:
                    nome_exibicao = nome
                    base_id = nome
                    var_raw = None
                
                # Trata thumbnail genrica
                full_thumb_path = ""
                if ext.lower() in ['.gif', '.mp4']:
                    if categoria in ["Viscolycra Selo Adulto", "Viscolycra Selo Infantil"]:
                        thumb_filename = f"{base_id}_thumb.jpg"
                    else:
                        thumb_filename = f"{nome}_thumb.jpg"
                        
                    full_thumb_path = os.path.join(caminho_cat, thumb_filename)
                    thumb_path = f"{pasta_estampas}/{categoria}/{thumb_filename}"
                    
                    if not os.path.exists(full_thumb_path):
                        if categoria == "SublimacaoInfantil" and ext.lower() == '.gif':
                            try:
                                from PIL import Image
                                with Image.open(os.path.join(caminho_cat, arq)) as img:
                                    img.seek(0)
                                    rgb_img = img.convert('RGB')
                                    rgb_img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                                    rgb_img.save(full_thumb_path, 'JPEG', quality=85, optimize=True)
                            except Exception as e:
                                thumb_path = f"{pasta_estampas}/{categoria}/{arq}"
                        else:
                            try:
                                import subprocess
                                import imageio_ffmpeg
                                from PIL import Image
                                ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
                                temp_frame = os.path.join(caminho_cat, f"temp_frame_{nome}.jpg")
                                cmd = [ffmpeg_exe, "-y", "-i", os.path.join(caminho_cat, arq), "-vframes", "1", "-q:v", "2", temp_frame]
                                resultado = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                                if resultado.returncode == 0 and os.path.exists(temp_frame):
                                    with Image.open(temp_frame) as img:
                                        rgb_img = img.convert('RGB')
                                        rgb_img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                                        rgb_img.save(full_thumb_path, 'JPEG', quality=85, optimize=True)
                                    os.remove(temp_frame)
                                else:
                                    thumb_path = f"{pasta_estampas}/{categoria}/{arq}"
                            except:
                                thumb_path = f"{pasta_estampas}/{categoria}/{arq}"
                                
                if base_id not in grupos:
                    grupos[base_id] = {
                        "id": nome_exibicao,
                        "image": f"{pasta_estampas}/{categoria}/{arq}",
                        "thumb": thumb_path,
                        "variations": []
                    }
                
                if ext.lower() in ['.mp4', '.gif'] and not grupos[base_id]["image"].endswith(('.mp4', '.gif')):
                    grupos[base_id]["image"] = f"{pasta_estampas}/{categoria}/{arq}"
                    grupos[base_id]["thumb"] = thumb_path
                
                if var_raw:
                    var_clean = re.sub(r'([a-z])c([a-z])', r'\1 com \2', var_raw, flags=re.IGNORECASE)
                    var_clean = var_clean.title().replace(' Com ', ' com ')
                    grupos[base_id]["variations"].append({
                        "name": var_clean,
                        "image": f"{pasta_estampas}/{categoria}/{arq}"
                    })
                    
        imagens = list(grupos.values())
        imagens.sort(key=lambda x: x["id"])
        
        if imagens:
            dados_catalogo[nome_aba] = imagens
            total_estampas += len(imagens)
            print(f"Categoria '{nome_aba}': {len(imagens)} estampas.")
            
    conteudo_js = f"const catalogo = {json.dumps(dados_catalogo, indent=4)};\n"
    with open("dados.js", "w", encoding="utf-8") as f:
        f.write(conteudo_js)
        
    print(f"\nSucesso! 'dados.js' gerado com um total de {total_estampas} estampas em {len(dados_catalogo)} categorias.")

if __name__ == '__main__':
    gerar_dados()

