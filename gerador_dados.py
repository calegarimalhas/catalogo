import os
import json

def gerar_dados():
    print("Iniciando a leitura das estampas para o Microsite...")
    
    # Muda o diretório para o diretório deste script
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
        
        # Converte arquivos .gif pesados para .mp4 automaticamente (ignorando infantis a pedido)
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
                        print(f"Iniciando conversão de alta qualidade para MP4 com FFmpeg nativo...")
                        try:
                            import subprocess
                            import imageio_ffmpeg
                            
                            ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
                            
                            # O comando ffmpeg nativo resolve problemas de transição em GIFs otimizados
                            cmd = [
                                ffmpeg_exe,
                                "-y", # Sobrescreve se existir
                                "-i", gif_path,
                                "-vf", "fps=24,scale=trunc(iw/2)*2:trunc(ih/2)*2", # Forca framerate constante e dimensoes pares
                                "-pix_fmt", "yuv420p",
                                "-movflags", "+faststart",
                                "-vcodec", "libx264",
                                "-crf", "23",
                                mp4_path
                            ]
                            
                            # Executa a conversão
                            resultado = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                            
                            if resultado.returncode == 0:
                                print(f"Sucesso! {arq} convertido para {mp4_filename} sem falhas de transição.")
                                
                                # Remove o GIF original para economizar espaco gigante
                                try:
                                    os.remove(gif_path)
                                    print("Arquivo .gif original apagado para liberar espaço no disco.")
                                except Exception as e:
                                    print(f"Aviso: Não foi possível apagar o GIF original: {e}")
                                    
                                teve_conversao = True
                            else:
                                print(f"Erro do FFmpeg ao converter {arq}: {resultado.stderr.decode('utf-8', errors='ignore')}")
                                
                        except ImportError:
                            print("Aviso: 'imageio_ffmpeg' não está instalado. Pulando a conversão de GIF para MP4.")
                        except Exception as e:
                            print(f"Erro inesperado ao converter {arq}: {e}")
                            
            if teve_conversao:
                print("\nConversões concluídas. Atualizando leitura de arquivos...\n")
        
        # Atualiza a lista de arquivos (caso tenha apagado gifs e criado mp4s)
        arquivos = os.listdir(caminho_cat)
        
        if categoria in ["SublimacaoAdulto", "SublimacaoAdulta"]:
            nome_aba = "Sublimação Adulta Branca"
        elif categoria == "BabyLook":
            nome_aba = "Baby Look"
        elif categoria == "SublimacaoInfantil":
            nome_aba = "Sublimação Infantil"
        elif categoria.lower() == "silkscreen":
            nome_aba = "Silkscreen"
        else:
            nome_aba = categoria
        
        imagens = []
        for arq in arquivos:
            # Pula os proprios thumbnails gerados
            if arq.endswith('_thumb.jpg'):
                continue
                
            nome, ext = os.path.splitext(arq)
            
            # Se for GIF mas ja existir um MP4 com mesmo nome, ignora o GIF para não duplicar
            if ext.lower() == '.gif':
                if f"{nome}.mp4" in [a.lower() for a in arquivos]:
                    continue
                    
            if ext.lower() in extensoes_validas:
                # Thumbnail path
                thumb_path = f"{pasta_estampas}/{categoria}/{arq}"
                
                # Se for gif ou mp4, tentar criar thumbnail estático
                if ext.lower() in ['.gif', '.mp4']:
                    thumb_filename = f"{nome}_thumb.jpg"
                    full_thumb_path = os.path.join(caminho_cat, thumb_filename)
                    thumb_path = f"{pasta_estampas}/{categoria}/{thumb_filename}"
                    
                    if not os.path.exists(full_thumb_path):
                        # Usa PIL para GIFs infantis (que sao otimizados e podem bugar no ffmpeg/cv2)
                        if categoria == "SublimacaoInfantil" and ext.lower() == '.gif':
                            try:
                                from PIL import Image
                                print(f"Gerando miniatura para GIF Infantil com PIL: {arq}...")
                                with Image.open(os.path.join(caminho_cat, arq)) as img:
                                    img.seek(0)
                                    rgb_img = img.convert('RGB')
                                    rgb_img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                                    rgb_img.save(full_thumb_path, 'JPEG', quality=85, optimize=True)
                            except Exception as e:
                                print(f"Aviso: Nao foi possivel gerar thumbnail com PIL para {arq} ({e})")
                                thumb_path = f"{pasta_estampas}/{categoria}/{arq}"
                        else:
                            try:
                                import subprocess
                                import imageio_ffmpeg
                                from PIL import Image
                                
                                ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
                                
                                print(f"Extraindo frame de {arq} com FFmpeg...")
                                temp_frame = os.path.join(caminho_cat, f"temp_frame_{nome}.jpg")
                                cmd = [
                                    ffmpeg_exe,
                                    "-y",
                                    "-i", os.path.join(caminho_cat, arq),
                                    "-vframes", "1",
                                    "-q:v", "2",
                                    temp_frame
                                ]
                                resultado = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                                
                                if resultado.returncode == 0 and os.path.exists(temp_frame):
                                    with Image.open(temp_frame) as img:
                                        rgb_img = img.convert('RGB')
                                        rgb_img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                                        rgb_img.save(full_thumb_path, 'JPEG', quality=85, optimize=True)
                                    
                                    os.remove(temp_frame)
                                else:
                                    print(f"Aviso: FFmpeg falhou ao extrair frame de {arq}")
                                    thumb_path = f"{pasta_estampas}/{categoria}/{arq}"
                                    
                            except Exception as e:
                                print(f"Aviso: Nao foi possivel gerar thumbnail para {arq} ({e})")
                                thumb_path = f"{pasta_estampas}/{categoria}/{arq}" # Fallback
                
                if categoria in ["SublimacaoAdulto", "SublimacaoAdulta"] and nome.lower().startswith("mockup_"):
                    # Remove os primeiros 7 caracteres ("mockup_") mantendo o resto intacto
                    nome_exibicao = nome[7:]
                elif categoria == "SublimacaoInfantil" and nome.lower().startswith("animacao_"):
                    # Extrai o numero apos o animacao_ e preenche com zeros (0001)
                    try:
                        numero = int(nome.split("_")[1])
                        nome_exibicao = str(numero).zfill(4)
                    except:
                        nome_exibicao = nome
                elif categoria.lower() == "silkscreen" and nome.lower().startswith("animado_"):
                    try:
                        numero = int(nome.split("_")[1])
                        nome_exibicao = str(numero).zfill(4)
                    except:
                        nome_exibicao = nome
                else:
                    nome_exibicao = nome
                    
                imagens.append({
                    "id": nome_exibicao,
                    "image": f"{pasta_estampas}/{categoria}/{arq}",
                    "thumb": thumb_path
                })
        
        # Ordena alfabeticamente pelo ID
        imagens.sort(key=lambda x: x["id"])
        
        if imagens:
            dados_catalogo[nome_aba] = imagens
            total_estampas += len(imagens)
            print(f"Categoria '{nome_aba}': {len(imagens)} estampas.")
            
    # Gera o arquivo dados.js
    conteudo_js = f"const catalogo = {json.dumps(dados_catalogo, indent=4)};\n"
    
    with open("dados.js", "w", encoding="utf-8") as f:
        f.write(conteudo_js)
        
    print(f"\nSucesso! 'dados.js' gerado com um total de {total_estampas} estampas em {len(dados_catalogo)} categorias.")

if __name__ == '__main__':
    gerar_dados()
