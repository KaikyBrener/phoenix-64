# Design System — PHOENIX V5

Referência visual da proposta, **revisão 2**. A implementação de referência fica em [`prototipo/index.html`](../prototipo/index.html); os valores abaixo são os do bloco `:root` desse arquivo.

## Princípios

1. **Rápido antes de bonito.** Nada que atrase abrir ou responder: sem fontes externas, sem espera artificial, sem animação automática.
2. **O resultado fica à vista.** A ação principal e o resultado cabem na tela sem rolar, em notebook e celular.
3. **Componentes iguais, arranjos diferentes.** Botões, campos e status são sempre os mesmos. A disposição de cada ferramenta segue o que se confere nela.
4. **A brasa marca o que fazer.** Laranja só em ação primária e item selecionado.
5. **Cada elemento precisa ajudar a usar.** Se não ajuda a escolher, converter, conferir ou copiar, sai.

## 1. Cores

Tema escuro, como no app atual. O fundo deixa o preto puro e passa a um carvão quente.

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#12100E` | Fundo |
| `--surface` | `#1A1714` | Painéis, barra lateral |
| `--raised` | `#24201C` | Botão secundário, hover |
| `--sunken` | `#0D0C0A` | Campos e área de upload |
| `--line` | `#352F29` | Divisórias (decorativas) |
| `--field` | `#746A60` | Borda de controles (3,4:1 sobre `--surface`) |
| `--ink` | `#F3EEE7` | Texto principal |
| `--ink-2` | `#B3A99D` | Texto secundário |
| `--ink-3` | `#8F857A` | Placeholder |
| `--ember` | `#FF6B1A` | Ação primária, seleção, barra de saída (cor atual da marca) |
| `--ember-hover` | `#FF8338` | Hover da ação primária |
| `--ember-ink` | `#FF9A5C` | Brasa como texto ou link |
| `--on-ember` | `#1C0D03` | Texto sobre a brasa |
| `--ember-tint` | `rgba(255,107,26,.12)` | Item ativo, arquivo sobre a área de upload |
| `--ok` | `#5CC98A` | Sucesso, "Copiado", redução de tamanho |
| `--err` | `#F2617A` | Erro e ação destrutiva |
| `--focus` | `#FFB089` | Anel de foco |

**Contraste calculado (WCAG 2.x):** `--ink`/`--bg` 16,4:1 · `--ink-2`/`--surface` 7,7:1 · `--ember-ink`/`--surface` 8,5:1 · `--on-ember`/`--ember` 6,6:1 · `--ok`/`--surface` 8,7:1 · `--err`/`--surface` 5,8:1 · `--field`/`--surface` 3,4:1.

**Regras:** brasa nunca indica erro e vermelho nunca indica ação principal. Status sempre com ícone e texto. Sem gradientes, brilhos, grade de fundo ou desfoque. O único padrão é o xadrez atrás das imagens, que mostra transparência.

### Migração dos tokens atuais

| Atual | Proposto |
|---|---|
| `--primary-color: #ff6b1a` | `--ember` (mesmo valor) |
| `--bg-main: #050505` | `--bg: #12100E` |
| `--bg-sidebar`, `--bg-surface` translúcido | `--surface` opaco |
| `--text-secondary: #9ca3af` | `--ink-2: #B3A99D` |
| `--primary-glow`, `--shadow-glow`, `--shadow-lg`, gradientes do `body` | Removidos |
| Bootstrap `danger` como marca | `--ember` para marca, `--err` para erro |

## 2. Tipografia

**Fontes do sistema, sem download.** Inter (7 pesos) e IBM Plex (proposta da revisão 1) foram descartadas: qualquer fonte externa custa uma conexão a outro domínio e arquivos antes de o texto aparecer na forma final.

| Papel | Pilha |
|---|---|
| Interface | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |
| Código Base64 | `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace` |

| Nível | Tamanho | Peso | Uso |
|---|---|---|---|
| Título da tela | `clamp(22px, 2.2vw, 26px)` / 1,2 | 600 | Um por tela, curto |
| Título de painel | 15 px | 600 | "Base64", "Código", "Imagem" |
| Corpo e botões | 16 px / 15 px | 400 / 500 | — |
| Meta e status | 13 a 14 px | 400 | Dimensões, tamanhos, mensagens |
| Código | 13 px / 1,55 mono | 400 | Base64 |

Mínimo de 13 px. Rótulos em frase normal. Números com `tabular-nums`; medidas não quebram linha. O título é menor que na revisão 1 (era até 36 px) para devolver altura ao resultado.

## 3. Espaçamento e alturas

- Escala: 4 · 6 · 8 · 10 · 12 · 14 · 16 · 24 px.
- Painel: 14 px de respiro e 10 px entre itens. Entre painéis, 14 px. Entre título e ferramenta, 16 px (12 px no celular).
- Raios: 6 px em controles e 10 px em painéis.
- **Alturas limitadas pela tela, nunca fixas grandes.** Os painéis não esticam para igualar a coluna vizinha (`align-items: start`).

| Elemento | Notebook | Celular (≤ 820 px) |
|---|---|---|
| Campo de código (Imagem → Base64, Base64 → Imagem) | `clamp(150px, 34vh, 340px)` | `clamp(110px, 20vh, 200px)` |
| Campo de código (Biometria facial) | `clamp(110px, 20vh, 200px)` | 72 px |
| Campos de texto (Texto ↔ Base64) | `clamp(140px, 30vh, 320px)` | `clamp(110px, 20vh, 200px)` |
| Área de upload vazia | mín. 150 px | mín. 120 px |
| Foto ajustada (Biometria facial) | `clamp(170px, 32vh, 300px)` | `clamp(130px, 22vh, 200px)` |
| Antes e depois (200 KB) | `clamp(130px, 30vh, 280px)` cada | idem, lado a lado |

Meta verificada: o botão Copiar (ou Baixar) visível sem rolar em 1366 × 700, 1024 × 640, 390 × 740 e 360 × 640.

## 4. Componentes

### Botões

| Variante | Aparência | Uso |
|---|---|---|
| Primário | Fundo `--ember`, texto `--on-ember` | Uma ação principal por contexto: Copiar, Escolher imagem, Baixar imagem, Codificar |
| Primário confirmado | Fundo `--ok`, ícone de check, rótulo "Copiado" por 2,5 s | Depois de copiar (manual ou automático) |
| Secundário | Fundo `--raised`, borda `--field` | .txt, Decodificar, Outra imagem |
| Discreto | Sem fundo nem borda | Limpar, Trocar, ações por item |
| Quadrado | 40 × 40, só ícone, com `aria-label` e `title` | Favoritar, Copiar/Remover em listas |
| Destrutivo | Texto `--err`; no hover, fundo `--err-tint` | Limpar histórico ou favoritos, sempre com confirmação |

Altura de 40 px; a barra inferior do celular tem alvos de 52 px. Nomes iguais em toda parte: Copiar → Copiado · .txt · Baixar imagem · Favoritar · Limpar · Trocar · Remover.

### Chave "Copiar ao converter"

Fica na barra de ações das ferramentas que geram Base64 de imagem. É um `<input type="checkbox">` com aparência de chave e rótulo visível, ligado por padrão, como hoje. A escolha fica salva no navegador e vale para as duas ferramentas.

| Situação | O que a tela mostra |
|---|---|
| Ligada, cópia funcionou | Botão Copiar vira "Copiado" (verde, check) e o status diz "Copiado automaticamente · 178.670 caracteres" |
| Ligada, navegador bloqueou | Status em `--err`: "Pronto, mas o navegador bloqueou a cópia automática. Use Copiar." |
| Desligada | Status: "Pronto · 178.670 caracteres. Use Copiar." |

### Campos

Fundo `--sunken`, borda `--field`, rótulo sempre presente (o título do painel é o `<label>`), placeholder com exemplo e reticências, contador no cabeçalho do painel, erro logo abaixo ligado por `aria-describedby`, `spellcheck="false"` e `translate="no"` no código.

### Área de upload

Borda tracejada, uma linha "Arraste, cole (Ctrl+V) ou", botão "Escolher imagem" e as regras em uma linha. Depois do envio, some e dá lugar ao arranjo da ferramenta. Arrastar nunca é o único caminho. O link "exemplo" existe só no protótipo.

### Linha de tamanho (antes "régua")

Compacta e contextual: **só aparece quando há resultado.**
- Uma linha: `Arquivo 130,8 KB → Base64 174,5 KB  +33%`. A variação fica em `--ember-ink` quando cresce, em `--ok` quando diminui e em `--err` quando passa do limite.
- Duas barras de 4 px na mesma escala; a marca do limite é uma linha de 2 px (só em Imagem → 200 KB).
- Sem frase explicativa, sem título e sem animação.

### Status, erro, toast e diálogo

- **Status:** uma linha no painel, com `aria-live="polite"`. Só mostra "Convertendo…" ou "Comprimindo…" se a operação passar de **150 ms**; abaixo disso, vai direto ao resultado.
- **Erro de entrada:** junto do campo, dizendo o que corrigir.
- **Toast:** só para ações fora do painel (copiar ou remover da lista, favoritar). Some em 2,6 s.
- **Diálogo:** `<dialog>` nativo, só para apagar listas inteiras, com foco inicial em "Cancelar".
- **Não existe** modal de carregamento nem toast de sucesso para conversão.

### Prévias

Fundo xadrez para mostrar transparência. A imagem é centralizada e **nunca ampliada** além do tamanho real. Miniatura de 64 px em Imagem → Base64 e 40 px nas listas.

## 5. Arranjo de cada ferramenta

| Ferramenta | O que domina | Arranjo (notebook) | Celular |
|---|---|---|---|
| Imagem → Base64 | O código | Coluna estreita (240 a 320 px): arquivo em linha (miniatura, nome, dimensões, Trocar) e linha de tamanho. Coluna larga: código e ações | Arquivo, código, ações |
| Biometria facial | A foto ajustada | Coluna média (260 a 400 px) com a foto e "original → final · JPEG 80%". Coluna larga com código mais baixo | Foto, código de 72 px, ações |
| Base64 → Imagem | A imagem | Duas colunas iguais; decodifica ao colar, sem botão | Código, depois imagem |
| Imagem → 200 KB | A comparação | Uma faixa: antes e depois lado a lado, linha de tamanho com o limite, Baixar | Igual, lado a lado |
| Texto ↔ Base64 | Os dois textos | Dois campos com as ações numa coluna no meio | Campo, ações em linha, campo |
| Histórico / Favoritos | A lista | Lista densa (40 px por item). O Histórico tem a linha de estatísticas no topo | Igual |
| Início | As ferramentas | Lista de 5 itens (até 720 px de largura) com "última usada" | Igual |

## 6. Navegação

- Barra lateral de 216 px: 5 ferramentas, divisória, Histórico e Favoritos com contagem, e uma linha "Processamento local" no rodapé.
- Celular (≤ 820 px): barra superior de 48 px (marca e tela atual) e barra inferior com 3 destinos (Ferramentas, Histórico, Favoritos).
- Sem endereço, o app abre na última ferramenta usada; na primeira visita, no Início.
- Item ativo com `aria-current="page"`, fundo `--ember-tint` e ícone em brasa.

## 7. Ícones

SVG inline (`<symbol>` + `<use>`), grade de 24 px, traço de 1,75, desenho no estilo Lucide (licença ISC). São 14 símbolos, um significado fixo cada: grade (Ferramentas), imagem, `< >` (Base64 → Imagem), rosto (Biometria), setas para dentro (200 KB), T (Texto), relógio (Histórico), estrela (Favoritos), copiar, baixar, lixeira, check, alerta e a marca. Decorativos levam `aria-hidden`; botões só com ícone levam `aria-label`. Na integração, isso substitui os 28 ícones do Bootstrap Icons, cuja fonte tem 131 KB.

## 8. Desempenho

| Regra | Motivo |
|---|---|
| Nenhuma fonte externa | Evita outra conexão e o texto trocando de fonte depois de aparecer |
| Nenhuma espera artificial | O resultado aparece quando fica pronto |
| Indicador só acima de 150 ms | Evita piscar em operações instantâneas |
| Decodificar Base64 ao colar; ao digitar, 200 ms após a última tecla | Não trabalhar a cada caractere em códigos de centenas de milhares de caracteres |
| Sem animação automática; transições de 120 ms só em cor e borda, desligadas com `prefers-reduced-motion` | Nada se move sem a pessoa pedir |
| Ícones inline, sem fonte de ícones | 14 símbolos contra uma fonte de 131 KB |
| Ler o arquivo uma vez (achado #7) | Metade da leitura e da memória por conversão |
| Liberar URLs temporárias (`URL.revokeObjectURL`) ao trocar o resultado | Não acumular memória em uso repetido |

## 9. Responsividade

| Faixa | Comportamento |
|---|---|
| > 1000 px | Duas colunas nas ferramentas |
| 821 a 1000 px | Barra lateral; ferramentas em uma coluna |
| ≤ 820 px | Barras superior e inferior; descrições curtas das telas escondidas |
| ≤ 420 px | Miniatura do arquivo em 52 px |

Sem rolagem horizontal de 360 a 1440 px. `env(safe-area-inset-*)` nas barras. Zoom nunca bloqueado; campos de texto em 16 px no celular.

## 10. Acessibilidade

Contraste conforme a seção 1 · foco visível com `:focus-visible` · todo campo com `<label>` · botões só com ícone com `aria-label` · status com `aria-live="polite"` e erros de arquivo com `role="alert"` · `aria-pressed` no favorito · `<dialog>` nativo · alternativa ao arrasto (botão e Ctrl+V) · `prefers-reduced-motion` respeitado · `lang="pt-BR"`.

## 11. Voz e texto

Frases curtas e no imperativo. A mesma ação tem o mesmo nome até a confirmação (Copiar → Copiado). Erros dizem o que houve e como resolver ("A imagem tem 4,2 MB. O limite é 3 MB; reduza em Imagem → 200 KB."). Números em pt-BR ("178.670 caracteres", "130,8 KB").
