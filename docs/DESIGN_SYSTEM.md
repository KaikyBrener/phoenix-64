# Design System — PHOENIX V5

Referência visual da proposta. A implementação de referência fica em [`prototipo/index.html`](../prototipo/index.html); os valores abaixo são os mesmos do bloco `:root` desse arquivo.

## Princípios

1. **Bancada, não painel.** Toda ferramenta é entrada → saída. A interface mostra os dois lados e o que aconteceu entre eles.
2. **A brasa marca o que fazer.** O laranja da marca aparece só em ação primária, item selecionado e progresso. Ele não decora nada.
3. **O conteúdo é o protagonista.** Imagens e códigos ocupam as maiores áreas. A interface ao redor fica calma.
4. **Estado sempre visível.** Processando, pronto, erro e vazio têm texto, ícone e lugar fixo.

## 1. Paleta de cores

O tema é escuro, como no app atual. O fundo deixa o preto puro (`#050505`) e passa a um carvão com leve tom quente, coerente com a brasa.

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#12100E` | Fundo da página |
| `--surface` | `#1A1714` | Painéis, barra lateral, régua |
| `--raised` | `#24201C` | Botão secundário, item em foco na navegação |
| `--sunken` | `#0D0C0A` | Campos de código, área de upload |
| `--line` | `#352F29` | Divisórias e bordas de painéis (decorativas) |
| `--line-2` | `#4A423A` | Borda de diálogo e toast |
| `--field` | `#746A60` | Borda de controles interativos (3,4:1 sobre `--surface`) |
| `--ink` | `#F3EEE7` | Texto principal |
| `--ink-2` | `#B3A99D` | Texto secundário, rótulos, metadados |
| `--ink-3` | `#8F857A` | Placeholder e ícones desabilitados |
| `--ember` | `#FF6B1A` | Ação primária, seleção, barra de saída na régua (cor atual da marca) |
| `--ember-hover` | `#FF8338` | Hover da ação primária |
| `--ember-ink` | `#FF9A5C` | Brasa usada como texto ou link sobre fundo escuro |
| `--on-ember` | `#1C0D03` | Texto sobre a brasa |
| `--ember-tint` | `rgba(255,107,26,.12)` | Fundo de item ativo, área de upload com arquivo por cima |
| `--ok` | `#5CC98A` | Sucesso; redução de tamanho na régua |
| `--err` | `#F2617A` | Erro e ação destrutiva |
| `--focus` | `#FFB089` | Anel de foco |

**Contraste (WCAG 2.x), calculado:**

| Par | Razão |
|---|---|
| `--ink` sobre `--bg` | 16,4:1 |
| `--ink-2` sobre `--bg` / `--surface` / `--raised` | 8,2 / 7,7 / 7,0:1 |
| `--ember-ink` sobre `--surface` | 8,5:1 |
| `--on-ember` sobre `--ember` | 6,6:1 |
| `--ok` sobre `--surface` | 8,7:1 |
| `--err` sobre `--surface` | 5,8:1 |
| `--focus` sobre `--bg` | 10,7:1 |
| `--field` sobre `--surface` / `--sunken` | 3,4 / 3,7:1 |

**Regras**
- Brasa nunca indica erro, e vermelho nunca indica ação principal. Isso substitui o uso atual de `btn-danger` e `text-danger` como cor de marca.
- Status nunca depende só da cor: sucesso e erro sempre levam ícone e texto.
- Sem gradientes decorativos, grade de fundo ou brilho (`--shadow-glow`). O único gradiente é o padrão xadrez do visualizador, que mostra transparência.

### Migração dos tokens atuais

| Atual (`css/css_style.css`) | Proposto |
|---|---|
| `--primary-color: #ff6b1a` | `--ember` (mesmo valor) |
| `--bg-main: #050505` | `--bg: #12100E` |
| `--bg-sidebar: #0d0d0d` | `--surface: #1A1714` |
| `--bg-surface: rgba(20,20,20,.75)` | `--surface` opaco |
| `--border-color: rgba(255,255,255,.08)` | `--line` |
| `--text-secondary: #9ca3af` | `--ink-2: #B3A99D` |
| `--primary-glow`, `--shadow-glow`, `--shadow-lg` | Removidos |
| Bootstrap `danger` como marca | `--ember` para marca, `--err` para erro |

## 2. Tipografia

| Papel | Família | Por quê |
|---|---|---|
| Interface | IBM Plex Sans 400/500/600 | Desenho técnico e neutro, ótimo em tamanhos pequenos e com números claros. Tira o app do Inter genérico. |
| Conteúdo Base64 | IBM Plex Mono 400 | Mesma família, larguras fixas para ler e conferir códigos longos. Usada só no conteúdo, nunca em rótulos. |

Fontes via Google Fonts, permitidas pela CSP atual (`fonts.googleapis.com`, `fonts.gstatic.com`), com `system-ui` e `ui-monospace` como alternativa.

**Escala**

| Nível | Tamanho / altura de linha | Peso | Uso |
|---|---|---|---|
| Título de tela | `clamp(28px, 3.2vw, 36px)` / 1,1, tracking −0,02em | 600 | `h1` de cada tela |
| Seção | 18 px / 1,3 | 600 | "Ferramentas", "Atividade" |
| Título de painel | 16 px / 1,3 | 600 | "Imagem", "Base64" |
| Corpo | 16 px / 1,5 | 400 | Texto e botões (botões 15 px / 500) |
| Meta | 14 px / 1,4 | 400 | Metadados, status, ajuda |
| Mínimo | 13 px | 400 | Notas e etiquetas. Nada menor |
| Código | 13,5 px / 1,6 mono | 400 | Base64 |
| Número de destaque | 28 px, tracking −0,02em | 600 | Estatísticas |

Rótulos sempre em frase normal, sem caixa alta e sem espaçamento largo. Números em colunas e réguas usam `font-variant-numeric: tabular-nums`. Medidas e unidades não quebram linha ("140,3 KB", "640 × 480").

## 3. Hierarquia visual

1. Título da tela e descrição de uma linha que diz o que a ferramenta faz.
2. Bancada: os dois painéis com o mesmo peso visual. O conteúdo (imagem ou código) ocupa a maior área.
3. Ação primária em brasa, uma por painel de saída.
4. Régua de tamanho, ficha de dados e status.
5. Navegação, em tom secundário até ser selecionada.

## 4. Espaçamento e grade

- Escala: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64 px.
- Painel: cabeçalho com 14 × 16 px; corpo com 16 px e intervalo de 14 px.
- Bancada: 16 px entre painéis. Entre título e bancada, 24 px (18 px no celular).
- Conteúdo com até 1240 px de largura e margem lateral `clamp(16px, 4vw, 48px)`. Barra lateral de 248 px.
- Raios: 6 px em controles, 10 px em áreas internas, 14 px em painéis. Um elemento interno nunca tem raio maior que o do pai.

## 5. Botões

| Variante | Aparência | Uso |
|---|---|---|
| Primário | Fundo `--ember`, texto `--on-ember` | Uma ação principal por contexto: Copiar, Escolher imagem, Mostrar imagem, Baixar imagem, Codificar |
| Secundário | Fundo `--raised`, borda `--field` | Ações de apoio: Baixar .txt, Favoritar, Trocar imagem, Decodificar |
| Discreto | Sem fundo nem borda, texto `--ink-2` | Limpar, ações por item em listas |
| Destrutivo | Borda `--field`, texto `--err`; no hover, fundo `--err-tint` | Limpar histórico, Limpar favoritos (sempre com confirmação) |
| Link | Texto `--ember-ink` sublinhado | Alternativas: "Usar imagem de exemplo", "Ver histórico" |

- Altura mínima de 44 px; botão só com ícone tem 44 × 44 px (40 × 40 em listas no celular).
- Ícone à esquerda do texto, 20 px.
- **Carregando:** `aria-busy="true"`, spinner no lugar do ícone, rótulo mantido, botão desabilitado só enquanto processa.
- **Desabilitado:** opacidade de 45% e cursor `not-allowed`. Só quando não há o que fazer, por exemplo Copiar sem código.
- **Nomes padronizados** (a mesma ação tem o mesmo nome em toda parte): Copiar · Baixar .txt · Baixar imagem · Favoritar / Nos favoritos · Limpar · Trocar imagem · Remover.

## 6. Campos

- **Campo de código:** fundo `--sunken`, borda `--field`, Plex Mono 13,5 px, quebra em qualquer caractere, redimensionável na vertical, mínimo de 260 px (200 px no celular). `spellcheck="false"` e `translate="no"`.
- **Rótulo:** todo campo tem `<label>`. Quando o título do painel já nomeia o campo, o rótulo pode ser visualmente oculto (`.sr`), mas nunca é omitido.
- **Placeholder:** é um exemplo do conteúdo e termina com reticências ("data:image/png;base64,iVBORw0KGgo…"). Nunca substitui o rótulo.
- **Contador:** no cabeçalho do painel ("12.840 caracteres"; no texto, "22 caracteres · 30 bytes").
- **Erro:** borda `--err`, `aria-invalid="true"` e mensagem logo abaixo do campo, ligada por `aria-describedby`. A mensagem diz o que corrigir.
- **Foco:** borda `--ink-2` e anel `--focus` de 2 px com afastamento de 2 px.

## 7. Área de upload

| Estado | Aparência |
|---|---|
| Vazio | Borda tracejada de 1,5 px `--field`, fundo `--sunken`, ícone de envio, instrução, botão "Escolher imagem", link "Usar imagem de exemplo" e regras ("PNG, JPG ou WEBP, até 3 MB") |
| Arquivo por cima | Borda `--ember`, fundo `--ember-tint` |
| Processando | Status "Convertendo…" no painel de saída |
| Erro | Mensagem na linha de status, por exemplo "A imagem tem 4,2 MB. O limite é 3 MB; use Imagem → 200 KB antes." |
| Carregada | A área dá lugar ao visualizador, e "Trocar imagem" aparece abaixo |

Arrastar nunca é a única forma: sempre há um botão, e Ctrl+V funciona nas telas de imagem (critério 2.5.7 da WCAG 2.2).

## 8. Pré-visualizações

- **Visualizador:** fundo xadrez (20 px) para mostrar transparência, imagem centralizada com `object-fit: contain`, altura máxima de 340 px e sombra leve de duas camadas para destacar a imagem do fundo.
- **Ficha de dados:** `dl` em 2 colunas, com rótulo em 13 px `--ink-2` e valor em 16 px. Imagem → Base64 mostra Dimensões, Formato, Peso e Proporção. Biometria facial mostra Original, Final, Formato e Peso final.
- **Biometria facial:** o preview mostra a imagem ajustada, não a original (corrige o achado #3 da auditoria).
- **Antes e depois** (Imagem → 200 KB): original e comprimida lado a lado, no mesmo tipo de visualizador.
- **Miniaturas em listas:** 48 × 48 px (40 px no compacto), raio de 6 px.

## 9. Régua de tamanho

Componente que mostra o efeito da conversão. Fica abaixo da bancada no desktop e depois do painel de saída no celular.

- Duas barras na mesma escala: entrada em `#6E655B` e saída em `--ember`, ou `--ok` quando a saída é menor.
- Valor em KB ou MB à direita de cada barra, em coluna própria e com `tabular-nums`.
- Variação no título: "+33%" em `--ember-ink`, "−92%" em `--ok`, "Já cabe em 200 KB" em `--ok`.
- Limite opcional: linha vertical de 2 px em `--ink`, com rótulo abaixo da última barra ("Limite 200 KB").
- Uma frase explica o resultado: "Base64 sempre ocupa cerca de 33% a mais que o arquivo, porque usa 4 caracteres para cada 3 bytes."
- Vazia: trilhas tracejadas e instrução do que fazer.
- Movimento: as barras crescem da esquerda em 320 ms ao surgir um resultado. É o único movimento automático do produto e fica desligado com `prefers-reduced-motion`.

## 10. Estados de interação

| Estado | Tratamento |
|---|---|
| Hover | Superfície um tom acima. Primário vai a `--ember-hover`. Transições de 150 ms, só em cor e borda |
| Foco | `:focus-visible` com anel `--focus` de 2 px e afastamento de 2 px em todo elemento interativo |
| Pressionado / selecionado | `aria-pressed` ou `aria-current`, com fundo `--raised` (segmentado) ou `--ember-tint` (navegação) |
| Processando | `aria-busy`, spinner no botão e verbo no gerúndio com reticências na linha de status ("Convertendo…"). Tempo mínimo de 350 a 450 ms |
| Sucesso | Linha de status em `--ok` com ícone de check no painel. Toast só para ações fora do painel (copiar de uma lista, favoritar, remover) |
| Erro | Junto do campo, em `--err`, com ícone de alerta. Diz o que aconteceu e como resolver |
| Vazio | Texto que convida à ação e botão primário ("Converter imagem") |
| Destrutivo | Diálogo nativo `<dialog>` com foco inicial em "Cancelar" e botão destrutivo nomeado pela ação ("Limpar histórico") |

Status e toasts usam `role="status"` / `aria-live="polite"`.

## 11. Ícones

- SVG inline (`<symbol>` + `<use>`), grade de 24 px, traço de 1,75 px, pontas arredondadas, cor `currentColor`. Desenho no estilo Lucide (licença ISC). Na integração, isso permitiria deixar de carregar o Bootstrap Icons do CDN.
- Tamanhos: 20 px em botões e navegação, 16 px em status, 28 a 40 px em áreas de upload.
- Cada ícone tem um significado fixo:

| Ícone | Significado |
|---|---|
| Casa | Início |
| Imagem | Imagem → Base64 / escolher imagem |
| Moldura com rosto | Biometria facial |
| `< >` | Base64 → Imagem |
| Setas para dentro | Imagem → 200 KB |
| T | Texto ↔ Base64 |
| Relógio | Histórico |
| Estrela | Favoritos / Favoritar |
| Duas folhas | Copiar |
| Seta para baixo | Baixar |
| Lixeira | Limpar / Remover |
| Seta para cima | Enviar arquivo |
| Check / alerta | Sucesso / erro |
| Cadeado | Processamento local |

- Ícone decorativo ao lado de texto leva `aria-hidden`. Botão só com ícone leva `aria-label` específico ("Copiar Base64 de logo.png") e `title`.
- Sem emoji como ícone.

## 12. Responsividade

| Faixa | Comportamento |
|---|---|
| > 1080 px | Barra lateral e bancada em 2 colunas (entrada 1fr, saída 1,2fr), régua em largura total abaixo. Início com ferramentas e atividade lado a lado |
| 901 a 1080 px | Barra lateral e bancada empilhada (entrada, saída, régua) |
| ≤ 900 px | Sem barra lateral. Barra superior fixa (marca e tela atual), barra inferior com 4 destinos e folha "Ferramentas" |
| ≤ 600 px | Campos e áreas com 200 px de mínimo. Réguas com o valor abaixo da barra. Ações em linhas que quebram |

- Sem rolagem horizontal de 360 a 1440 px (verificado em 360, 390, 820 e 1400 px).
- `env(safe-area-inset-*)` na barra superior, na inferior e na folha.
- Zoom nunca é bloqueado. Campos de texto em 16 px no celular, para o iOS não ampliar a tela.

## 13. Acessibilidade

- Contraste: texto ≥ 4,5:1 e bordas de controles ≥ 3:1 (tabela na seção 1).
- Todo controle é operável por teclado, na ordem visual. Diálogos usam `<dialog>` com `showModal()` (foco preso, Esc fecha).
- Hierarquia de títulos: um `h1` por tela e `h2` nos painéis e seções. Regiões com `aria-labelledby`.
- Botão ativo de segmentado com `aria-pressed`; item de navegação ativo com `aria-current="page"`.
- Mensagens de status com `aria-live="polite"`; erros ligados ao campo com `aria-describedby`.
- `prefers-reduced-motion: reduce` desliga transições e o crescimento da régua.
- Alvos de toque de no mínimo 44 × 44 px.
- `lang="pt-BR"`, e o código Base64 com `translate="no"`.

## 14. Voz e texto

- Verbos no imperativo e frases curtas: "Escolher imagem", "Mostrar imagem", "Copiar".
- A mesma ação tem o mesmo nome do botão à confirmação: "Favoritar" → "Adicionado aos favoritos".
- Erros dizem o que houve e como resolver, sem pedir desculpas.
- Números no formato pt-BR ("191.642 caracteres", "140,3 KB").
