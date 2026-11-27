# Canvas de UI/UX — PHOENIX V5

Proposta de evolução visual e de experiência, **revisão 2**. Este documento não altera o app: o protótipo em [`prototipo/index.html`](../prototipo/index.html) é independente e não está integrado ao Phoenix.

- **Base analisada:** `main` do repositório `KaikyBrener/phoenix-64` no commit `2eebca2` (27/11/2026), inspecionada no código e em capturas de tela.
- **Auditoria considerada:** Auditoria Técnica PHOENIX V5 (commit `c0568d7`, 09/10/2026). Os achados foram tratados como pontos a verificar; o resultado está na seção 4.3.
- **Documentos relacionados:** [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) e [`DECISOES_DE_DESIGN.md`](DECISOES_DE_DESIGN.md).

---

## 1. Requisito principal

O Phoenix é usado com frequência e para operações repetidas. Por isso, **velocidade, leveza e simplicidade são requisitos, não acabamento**:

- abrir rápido: sem fontes externas, poucas dependências e nada carregado que não seja usado;
- responder rápido: o resultado aparece assim que está pronto, sem espera artificial;
- não atrapalhar a repetição: a ferramenta certa abre direto, o resultado fica à vista sem rolagem, e a cópia é imediata e confirmada;
- nada na tela que não ajude a usar a ferramenta.

Toda decisão desta proposta foi revisada contra esse requisito.

## 2. O que mudou da revisão 1 para a 2

| # | Pedido | O que mudou |
|---|---|---|
| 1 | Sem espera artificial | Removidas todas as pausas (`sleep`) do protótipo. O status "Convertendo…" só aparece se a operação passar de 150 ms. |
| 2 | Início simples, última ferramenta | O Início virou só a lista das 5 ferramentas. Sem métricas, cartões ou recentes. Sem endereço, o app abre direto na última ferramenta usada. |
| 3 | Régua compacta e contextual | A régua virou uma linha de números com duas barras de 4 px, que só aparece quando há resultado. |
| 4 | Alturas | Campos e prévias com altura limitada pela tela (`clamp`). O botão Copiar fica visível sem rolagem em 1366 × 700, 1024 × 640, 390 × 740 e 360 × 640. |
| 5 | Cópia automática configurável | Chave "Copiar ao converter", lembrada no navegador. Ao copiar, o botão vira "Copiado" com check e o status diz quantos caracteres foram copiados. |
| 6 | Fontes e dependências | Fontes do sistema no lugar de IBM Plex/Inter. O protótipo não faz nenhuma requisição externa. Plano de redução das dependências do app na seção 7. |
| 7 | Compressão honesta | A simulação segue as regras de `compressor.js` e, se não chegar a 200 KB, mostra o erro e desabilita o download. |
| 8 | Estatísticas | Tentativa só conta depois de passar na validação, e a taxa é conversões concluídas ÷ tentativas válidas × 100, como no app. |
| 9 | Telas não idênticas | Componentes iguais, arranjos diferentes: o código domina em Imagem → Base64, a foto em Biometria facial, o antes e depois em 200 KB. |
| 10 | Menos elementos | Saíram: cartões de métricas e recentes do Início, descrições longas (somem no celular), nota de protótipo em toda tela, animação da régua, folha de ferramentas no celular e o botão "Mostrar imagem" (a imagem aparece ao colar). Ícones ficaram só como marcador de cada ferramenta. |

## 3. Visão do produto e público

O Phoenix é uma bancada de conversão que roda inteira no navegador: entra uma imagem, um código Base64 ou um texto e sai o formato necessário, sem enviar nada a servidores.

O perfil de quem usa é **hipótese**, porque o repositório não tem dados de uso:

| Quem (hipótese) | Tarefa repetida | Ferramenta |
|---|---|---|
| Desenvolvedor ou integrador | Colar imagem como data URL em HTML, CSS, JSON ou API | Imagem → Base64 |
| Quem cadastra rostos em sistemas de acesso | Gerar Base64 de foto já em 640 × 480, JPEG 80% | Biometria facial |
| Quem recebe um Base64 | Ver e salvar a imagem | Base64 → Imagem |
| Quem envia imagem a formulário com limite | Reduzir para até 200 KB | Imagem → 200 KB |
| Quem trata textos para sistemas | Codificar e decodificar UTF-8 | Texto ↔ Base64 |

## 4. Problemas identificados

### 4.1 Comprovados por inspeção

| # | Problema | Evidência |
|---|---|---|
| P1 | Dois itens do menu levam à mesma tela ("Conversor" e "Imagem → Base64"). | `index.html` linhas 45 e 62, ambos `data-tab="conversor"`. |
| P2 | Biometria facial fica escondida como modo do conversor e entrega formato diferente sem avisar: o modo Padrão gera data URL e o facial gera Base64 puro. | `index.html:193`; `js/main.js:183` e `:210-216`. |
| P3 | A cor de erro do Bootstrap é usada como cor da marca (`btn-danger`, `text-danger`, `border-danger`). | 35 ocorrências em `index.html`. |
| P4 | Áreas vazias e desequilibradas: prévia de 180 px sozinha no topo do conversor; cartão de resultado vazio ocupando a tela em "Imagem → 200 KB". | Capturas da `main`; `index.html:220`. |
| P5 | Modal bloqueante de "Processando…" em operações de milissegundos, seguido de toast. | `js/main.js:142`; `js/compressor.js` (`AlertHelper.loading`). |
| P6 | Botões só com ícone sem nome acessível no histórico e nos favoritos. | `js/main.js:479-484`. |
| P7 | Os quatro textareas principais não têm rótulo. | Achado #10 da auditoria. |
| P8 | Nomes de ação variam: "Copiar Manual", "TXT", "Download da Imagem", "Download". | `index.html:275`, `:278`, `:394`. |
| P9 | A primeira tela é uma saudação com quatro cartões de métricas; converter exige mais um clique. | Captura da `main`. |
| P10 | Cópia automática sempre ligada e sem controle. | `js/main.js`: `CONFIG.autoCopy = true`. |
| P11 | O Base64 aparece sem contagem nem peso. | Painel "Código Base64". |
| P12 | Brilhos, gradientes radiais, grade de fundo e vidro fosco disputam atenção com o conteúdo. | `css/css_style.css` linhas 2-45. |
| P13 | Versão inconsistente: "PHOENIX V5", comentário "PHOENIX V4", repositório `phoenix-64`. | `index.html:6`, `css/css_style.css:790`. |
| P14 | Muito peso de terceiros para o que é usado: cerca de 224 KB comprimidos em CSS, JS e fonte de ícones, contra cerca de 27 KB do código do próprio app. A fonte do Bootstrap Icons (131 KB) é baixada para 28 ícones. | Medição na seção 7. |
| P15 | Inter carregada em 7 pesos (300 a 900) de um domínio externo. | `index.html:16`. |

### 4.2 Hipóteses a validar

| # | Hipótese | Como validar |
|---|---|---|
| H1 | Pouca gente descobre que pode colar a imagem com Ctrl+V. | Observar 5 pessoas convertendo uma captura de tela. |
| H2 | Quem usa a Biometria facial às vezes cola o formato errado no sistema de destino. | Perguntar qual formato o sistema aceita. |
| H3 | Parte relevante do uso é no celular. | Analytics sem dados pessoais no Cloudflare ou pergunta direta. |
| H4 | A maioria repete a mesma ferramenta várias vezes seguidas. | Contar trocas de ferramenta por sessão. Sustenta a decisão de abrir na última usada. |
| H5 | A cópia automática ajuda mais do que atrapalha. | Ver quantos desligam a chave. |

### 4.3 Verificação da auditoria de 09/10/2026 na `main` atual

| Achado | Situação em `2eebca2` |
|---|---|
| #1 Migração do IndexedDB pode apagar dados sem confirmar | Presente (`_idbPutLote` resolve no `onerror`). |
| #2 Arquivos internos publicados no deploy | Presente (sem `.assetsignore`). Falta testar no domínio. |
| #3 Prévia da Biometria facial mostra o original | Presente (`js/main.js:148`). |
| #4 Inicialização sem tratamento de erro | Presente (`js/main.js:15-18`). |
| #5 `.wranglerignore` com codificação quebrada | Presente na `main`; corrigido no PR #5, ainda aberto. |
| #6 Favoritos sem limite | Presente. |
| #7 Leitura dupla do arquivo | Presente (`js/main.js:145` e `:148`). Também é um ponto de desempenho. |
| #8 README fala em localStorage | Presente. |
| #9 Código órfão | `facialModeBadges` confirmado; regras CSS órfãs não reverificadas. |
| #10 Textareas sem rótulo | Presente (P7). |

Os achados #1, #2, #4 e #6 são técnicos e ficam fora do escopo visual. O #7 entra no plano de desempenho. O protótipo já mostra #3, #9 e #10 resolvidos.

## 5. Organização das ferramentas

| Ferramenta | Entrada | Saída | Arranjo na tela | Grava no histórico |
|---|---|---|---|---|
| Imagem → Base64 | PNG, JPG, WEBP até 3 MB | Data URL | Arquivo em linha compacta; o código ocupa a maior área | Sim |
| Biometria facial | Foto até 3 MB | Base64 puro de JPEG 80%, até 640 × 480 | Foto ajustada em destaque; código menor | Sim |
| Base64 → Imagem | Base64 ou data URL | Imagem para ver e baixar | Código e imagem lado a lado; decodifica ao colar | Não |
| Imagem → 200 KB | PNG, JPG, WEBP | Imagem ≤ 200 KB | Antes e depois lado a lado, uma linha de tamanho com o limite | Não (intencional) |
| Texto ↔ Base64 | Texto ou Base64 | Base64 ou texto | Dois campos com as ações no meio; Ctrl+Enter codifica | Não |
| Histórico | — | 20 conversões mais recentes | Lista densa, com as estatísticas em uma linha no topo | — |
| Favoritos | — | Códigos marcados | Lista densa | — |

As estatísticas (conversões hoje, total, taxa de sucesso) continuam existindo, com o mesmo cálculo, mas saíram do Início e ficam numa linha no topo do Histórico. O número de favoritos aparece no menu.

## 6. Navegação e fluxos

```
Phoenix (sem endereço: abre na última ferramenta usada; na primeira visita, em #inicio)
├── #inicio           lista das 5 ferramentas, com "última usada"
├── #imagem-base64
├── #biometria
├── #base64-imagem
├── #comprimir
├── #texto
├── #historico        com a linha de estatísticas
└── #favoritos
```

- **Desktop:** barra lateral de 216 px com as 5 ferramentas e, separados, Histórico e Favoritos com contagem.
- **Celular:** barra superior (marca e tela atual) e barra inferior com 3 destinos: Ferramentas, Histórico, Favoritos.
- Cada tela tem endereço próprio, então Voltar, favoritos do navegador e links funcionam.

**F1. Uso repetido de Imagem → Base64**
1. O app abre direto na ferramenta (última usada).
2. A pessoa cola (Ctrl+V), arrasta ou escolhe a imagem.
3. O código aparece assim que está pronto; com a cópia automática ligada, o botão vira "Copiado" e o status confirma os caracteres copiados.
4. A próxima imagem pode ser colada na mesma tela, sem limpar nada.

**F2. Cadastro facial:** a foto ajustada aparece em destaque com "900 × 1125 → 384 × 480 · JPEG 80%", e o código vem com a etiqueta "Base64 puro".

**F3. Ver um Base64:** colar o código já mostra a imagem. Ao digitar, a decodificação espera 200 ms sem teclas para não trabalhar a cada caractere. Erros aparecem junto do campo.

**F4. Reduzir para 200 KB:** antes e depois lado a lado. Se o limite não for atingido, a tela diz o menor tamanho obtido e não oferece download.

## 7. Desempenho e dependências

Pesos medidos dos arquivos usados hoje pela `main` (comprimidos com gzip, como o navegador recebe):

| Recurso | Comprimido | Uso real |
|---|---|---|
| Bootstrap 5.3.0 CSS | 30,8 KB | Grade, utilitários e componentes |
| Bootstrap 5.3.0 JS (bundle) | 23,2 KB | Só o offcanvas do menu no celular |
| Bootstrap Icons 1.11.0 CSS | 13,8 KB | 28 ícones |
| Bootstrap Icons 1.11.0 fonte (woff2) | 130,7 KB | 28 ícones |
| SweetAlert2 11.26.25 JS + CSS | 25,6 KB | Alertas, carregamento, confirmação |
| Inter (Google Fonts) | não medido | 7 pesos de outro domínio |
| Lucide 0.259.0 | não medido | Nenhum uso (removido no PR #5, ainda aberto) |
| **Código do próprio app** (HTML, CSS, 5 JS) | **≈ 27 KB** | — |

O protótipo inteiro (HTML, CSS, JS e ícones) tem 55,9 KB, ou 16,4 KB comprimido, e não faz nenhuma requisição externa (verificado no teste automatizado).

**Tempos medidos no protótipo** (Chrome headless neste ambiente, incluindo gerar a imagem de exemplo):
- Imagem → Base64 (PNG 1200 × 800): 48 a 126 ms até o código aparecer, sem indicador de carregamento.
- Imagem → 200 KB (PNG 2400 × 1600, 2,6 MB → 195 KB): 0,64 a 0,75 s. O indicador "Comprimindo…" aparece, porque passa de 150 ms.

**Plano para o app** (detalhes em D15):
1. Fontes do sistema no lugar de Inter.
2. Ícones SVG inline no lugar do Bootstrap Icons: cerca de 145 KB a menos.
3. Status no painel e `<dialog>` nativo no lugar do SweetAlert2: cerca de 26 KB a menos.
4. Remover o Lucide (PR #5).
5. Bootstrap: manter por enquanto. Trocar exige reescrever o layout e fica para uma etapa própria.
6. Achado #7: ler o arquivo uma vez só.

## 8. Melhorias prioritárias

| Prioridade | Melhoria | Problemas |
|---|---|---|
| P0 | Sem espera artificial nem modal de carregamento; indicador só acima de 150 ms | P5 |
| P0 | Abrir na última ferramenta; uma entrada por ferramenta | P1, P2, P9 |
| P0 | Separar cor de marca de cor de erro; rótulos em campos e botões só com ícone | P3, P6, P7 |
| P1 | Cópia automática com chave e confirmação clara | P10 |
| P1 | Fontes do sistema e ícones inline | P14, P15 |
| P1 | Etiqueta de formato e contagem de caracteres | P2, P11 |
| P1 | Alturas limitadas pela tela; resultado sem rolagem | P4 |
| P2 | Linha de tamanho compacta | P11 |
| P2 | Remover brilhos, gradientes e grade de fundo | P12 |
| P2 | Uniformizar nome e versão | P13 |

## 9. Critérios de sucesso

| Critério | Meta | Situação no protótipo |
|---|---|---|
| Ações até o primeiro Base64 copiado, abrindo o app | 1 (colar a imagem) | Atendido com cópia automática ligada |
| Espera artificial | Nenhuma | Atendido (nenhum `sleep`) |
| Indicador de carregamento | Só em operação acima de 150 ms | Atendido (aparece só na compressão) |
| Requisições externas | Nenhuma fonte externa | Protótipo: 0 requisições externas |
| Resultado à vista | Botão Copiar visível sem rolar em 1366 × 700, 1024 × 640, 390 × 740 e 360 × 640 | Atendido |
| Compressão honesta | Nunca indicar sucesso acima de 200 KB | Atendido (testado com limite forçado) |
| Estatísticas | Mesma regra do app | Atendido (arquivo inválido não conta) |
| Contraste | Texto ≥ 4,5:1, bordas de controle ≥ 3:1 | Atendido (DESIGN_SYSTEM.md) |
| Responsividade | Sem rolagem horizontal de 360 a 1440 px | Atendido |
| Regressão | Nenhuma regra de conversão, histórico, favoritos ou estatística alterada | A conferir na integração |

## 10. Skills consultadas

| Skill | Como foi usada | Limitação |
|---|---|---|
| Frontend Design (Anthropic) | Plano de tokens e layout, autocrítica com capturas e o princípio de cortar o que não serve ao uso. Nesta revisão, levou à remoção da animação e dos elementos repetidos. | Cópia local da Skill, não o repositório do GitHub. |
| UI/UX Pro Max | Estilo escuro de alto contraste, foco visível, alvos de toque, alternativa ao arrasto, estados vazios com ação, indicador de carregamento proporcional à espera e barra inferior com no máximo 5 itens. Recusados: o padrão de página "FAQ/Documentation Landing" e a troca do laranja por verde. | Cópia local da Skill, não o repositório `nextlevelbuilder/ui-ux-pro-max-skill`. |
| Web Design Guidelines (Vercel) | Indicador com atraso antes de aparecer, estado na URL, `aria-live`, rótulos em botões só com ícone, `tabular-nums`, `translate="no"`, nada de `transition: all`, e as regras de desempenho (pré-conectar só o necessário, menos fontes). | `SKILL.md` e `command.md` do repositório `vercel-labs` inacessíveis neste ambiente; usada a página pública vercel.com/design/guidelines. |
