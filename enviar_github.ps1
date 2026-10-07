cd "D:\backup gabriel\Microsite Pedidos"

Write-Host "Aumentando o limite de memoria do Git..." -ForegroundColor Cyan
git config http.postBuffer 2147483648
git config core.compression 0

Write-Host "Enviando os arquivos base do site..." -ForegroundColor Cyan
git add index.html script.js styles.css dados.js tabela_precos.js gerador_dados.py strass.png tintabranca.png tintadourada.png tintaprata.png
git commit -m "Arquivos base do site e dados atualizados"
git push -u origin master

$pastas = (Get-ChildItem -Path "estampas" -Directory).Name

foreach ($pasta in $pastas) {
    if (Test-Path "estampas\$pasta") {
        Write-Host "Adicionando pasta: $pasta..." -ForegroundColor Yellow
        git add -A "estampas/$pasta"
        git commit -m "Atualiza estampas/$pasta"
        
        Write-Host "Enviando $pasta para o GitHub..." -ForegroundColor Green
        git push
    }
}

Write-Host "Processo concluido! Verifique seu GitHub." -ForegroundColor Cyan
