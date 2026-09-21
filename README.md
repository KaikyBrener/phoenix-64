# PHOENIX V5

Conversor de imagens para Base64 com histórico local.

## Como usar

1. Abrir `index.html` no navegador
2. Selecionar uma imagem (PNG, JPG, JPEG, WEBP)
3. O Base64 aparece automaticamente
4. Clicar em "Copiar" ou "Baixar"

O histórico salva automaticamente em localStorage.

## O que faz

- Converter imagem → Base64 (modo Padrão e Biometria Facial)
- Converter Base64 → Imagem (detecta MIME: JPEG, PNG, WEBP)
- Codificar/decodificar texto em Base64
- Comprimir imagem para até 200 KB (aba "Imagem → 200 KB", 100% local, via Canvas)
- Guardar histórico (últimas 20 conversões)
- Gerenciar favoritos

## Estrutura

```
js/
├── storage.js     - Salva/carrega do localStorage
├── conversor.js   - Valida e converte arquivos
├── compressor.js  - Aba "Imagem → 200 KB" (compressão via Canvas)
└── main.js        - Gerencia UI e eventos

index.html         - Página principal
css/css_style.css  - Estilos (tema escuro)
```

## Rodando localmente

Não precisa build. É só servir os arquivos:

```bash
# Python
python3 -m http.server 8000

# Node
npx http-server
```

Depois abrir `http://localhost:8000`

## Limitações

- localStorage tem limite (~5-10 MB)
- Arquivos acima de 3 MB são rejeitados pelo conversor
- localStorage pode não funcionar em navegação privada (alguns navegadores)

## Browsers

Chrome, Firefox, Safari, Edge (últimas versões)
