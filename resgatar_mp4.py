import os
import subprocess
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

pasta_silk = os.path.join(os.path.dirname(os.path.abspath(__file__)), "estampas", "silkscreen")

print("Iniciando resgate dos MP4s corrompidos...")
arquivos = [f for f in os.listdir(pasta_silk) if f.lower().endswith('.mp4')]

for arq in arquivos:
    caminho_antigo = os.path.join(pasta_silk, arq)
    caminho_novo = os.path.join(pasta_silk, "resgate_" + arq)
    
    print(f"Resgatando: {arq}...")
    
    # Re-codifica o video ignorando erros de tempo e forcando uma taxa constante
    cmd = [
        ffmpeg_exe,
        "-y",
        "-err_detect", "ignore_err",
        "-i", caminho_antigo,
        "-vf", "fps=24,scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-vcodec", "libx264",
        "-crf", "23",
        caminho_novo
    ]
    
    resultado = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    if resultado.returncode == 0:
        # Substitui o arquivo original pelo resgatado
        os.remove(caminho_antigo)
        os.rename(caminho_novo, caminho_antigo)
        print(f"[OK] {arq} consertado com sucesso!")
    else:
        print(f"[ERRO] Falha ao resgatar {arq}.")
        if os.path.exists(caminho_novo):
            os.remove(caminho_novo)

print("\nConcluido! Todos os videos foram regravados com o tempo correto.")
