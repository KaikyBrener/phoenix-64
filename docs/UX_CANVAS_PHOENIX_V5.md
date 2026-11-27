# Canvas de UI/UX — PHOENIX V5

Proposta de evolução visual e de experiência. Este documento não altera o app: o protótipo em [`prototipo/index.html`](../prototipo/index.html) é independente e não está integrado ao Phoenix.

- **Base analisada:** `main` do repositório `KaikyBrener/phoenix-64` no commit `2eebca2` (27/11/2026), inspecionado no código e em capturas de tela em 1400, 820 e 390 px.
- **Auditoria considerada:** Auditoria Técnica PHOENIX V5 (commit `c0568d7`, 09/10/2026). Os achados foram tratados como pontos a verificar; o resultado está na seção 3.3.
- **Documentos relacionados:** [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) e [`DECISOES_DE_DESIGN.md`](DECISOES_DE_DESIGN.md).

---

## 1. Visão do produto

O Phoenix é uma bancada de conversão que roda inteira no navegador. A pessoa entra com uma imagem, um código Base64 ou um texto, e sai com o formato de que precisa, sem enviar nada a servidores.

A proposta mantém essa essência e ajusta três pontos: cada ferramenta tem um lugar próprio e previsível, entrada e saída aparecem sempre lado a lado, e o efeito da conversão sobre o tamanho fica visível.

## 2. Público e necessidades

As necessidades abaixo saem do que o código faz. O perfil de quem usa é **hipótese**: o repositório não tem dados de uso.

| Quem (hipótese) | O que precisa fazer | Ferramenta |
|---|---|---|
| Desenvolvedor ou integrador | Colar uma imagem como data URL em HTML, CSS, JSON ou API | Imagem → Base64 |
| Quem cadastra rostos em sistemas de acesso | Gerar o Base64 de uma foto já em 640 × 480, JPEG 80% | Biometria facial |
| Quem recebeu um Base64 e quer ver ou salvar a imagem | Decodificar, conferir e baixar | Base64 → Imagem |
| Quem precisa enviar imagem a um formulário com limite | Reduzir para até 200 KB com a melhor qualidade possível | Imagem → 200 KB |
| Quem trata textos em sistemas que exigem Base64 | Codificar e decodificar UTF-8 sem perder acentos | Texto ↔ Base64 |

Necessidades comuns a todos:

- chegar à ferramenta certa em um clique;
- saber o que vai sair (data URL ou Base64 puro, formato, tamanho);
- copiar ou baixar sem dúvida sobre o que foi copiado;
- reaproveitar conversões recentes;
- confiar que nada sai do navegador.

## 3. Problemas identificados

### 3.1 Comprovados por inspeção

| # | Problema | Evidência |
|---|---|---|
| P1 | Dois itens do menu levam à mesma tela: "Conversor" (Navegação) e "Imagem → Base64" (Ferramentas). | `index.html` linhas 45 e 62, ambos com `data-tab="conversor"`. |
| P2 | Biometria facial fica escondida como um modo dentro do conversor e entrega um formato diferente sem avisar. O modo Padrão gera um data URL e o modo facial gera Base64 puro. | `index.html:193`; `js/main.js:183` (data URL) e `js/main.js:210-216` (remove o prefixo). |
| P3 | A cor de erro do Bootstrap é usada como cor da marca. Ações primárias, títulos e bordas usam `btn-danger`, `text-danger` e `border-danger`, então "ação principal" e "erro" ficam iguais. | 35 ocorrências em `index.html`. |
| P4 | Áreas vazias desequilibradas. No conversor, a pré-visualização tem 180 px de altura e fica sozinha no topo da coluna direita. Em "Imagem → 200 KB", o cartão de resultado ocupa a tela inteira vazio antes do envio. | Capturas da `main` em 1400 px; `index.html:220` (`height: 180px`). |
| P5 | Um modal bloqueante de "Processando…" aparece em operações que levam milissegundos, seguido de um toast de sucesso. | `js/main.js:142` (`AlertHelper.loading`). |
| P6 | Botões só com ícone no histórico e nos favoritos, sem nome acessível. | `js/main.js:479-484` (`btn-copy`, `btn-delete` sem `aria-label`). |
| P7 | Os quatro textareas principais não têm rótulo; dependem só do placeholder. | `#base64Output`, `#base64Input`, `#textInput`, `#textBase64Output` (achado #10 da auditoria). |
| P8 | Os rótulos das ações mudam de ferramenta para ferramenta: "Copiar Manual", "TXT", "Download da Imagem", "Download". | `index.html:275`, `:278`, `:394`. |
| P9 | A primeira tela é uma saudação ("Bem-vindo ao PHOENIX V5") com quatro cartões de métricas. Converter exige mais um clique. | Captura da `main`, 1400 e 390 px. |
| P10 | A cópia automática está sempre ligada e não há controle visível. Ao converter, a área de transferência é sobrescrita sem que a pessoa tenha pedido. | `js/main.js`: `CONFIG.autoCopy = true`. |
| P11 | O Base64 aparece sem contagem nem peso, então a pessoa não vê que o código ocupa cerca de 33% mais que o arquivo. | Painel "Código Base64" no conversor. |
| P12 | A estética depende de brilhos, gradientes radiais, grade de fundo e vidro fosco, o que disputa atenção com o conteúdo. | `css/css_style.css` linhas 2-45 (`--shadow-glow`, `radial-gradient`, `body::before`). |
| P13 | A versão aparece de formas diferentes: o título diz "PHOENIX V5", o CSS tem o comentário "PHOENIX V4" e o repositório se chama `phoenix-64`. | `index.html:6`, `css/css_style.css:790`. |

### 3.2 Hipóteses a validar

| # | Hipótese | Como validar |
|---|---|---|
| H1 | Pouca gente descobre que pode colar a imagem com Ctrl+V. | Observar 5 pessoas convertendo uma captura de tela sem instrução. |
| H2 | Quem usa a Biometria facial às vezes cola o Base64 no sistema de destino esperando um data URL, ou o contrário. | Perguntar a quem faz cadastro facial qual formato o sistema de destino aceita. |
| H3 | Uma parte relevante do uso é no celular. | Habilitar analytics sem dados pessoais no Cloudflare ou perguntar aos usuários. |
| H4 | Quem usa "Imagem → 200 KB" gostaria de reencontrar o resultado depois. | Pesquisa curta. Hoje a ferramenta não grava no histórico, e isso é intencional. |
| H5 | A cópia automática ajuda mais do que atrapalha. | Teste A/B ou entrevista. Ver decisão D7. |

### 3.3 Verificação da auditoria de 09/10/2026 na `main` atual

| Achado | Situação em `2eebca2` |
|---|---|
| #1 Migração do IndexedDB pode apagar dados sem confirmar | Presente (`js/storage.js`: `_idbPutLote` resolve no `onerror`). |
| #2 Arquivos internos publicados no deploy | Presente (não há `.assetsignore`). Falta testar no domínio de produção. |
| #3 Preview da Biometria facial mostra o original | Presente (`js/main.js:148`: `gerarPreview(file)` lê o arquivo original). |
| #4 Inicialização sem tratamento de erro | Presente (`js/main.js:15-18`: `await this.storage._pronto` sem `try/catch`). |
| #5 `.wranglerignore` com codificação quebrada | Presente na `main`. Corrigido no PR #5, ainda aberto. |
| #6 Favoritos sem limite | Presente (não há corte em `adicionarAosFavoritos`). |
| #7 Leitura dupla do arquivo | Presente (`js/main.js:145` e `:148`). |
| #8 README fala em localStorage | Presente (`README.md` linhas 5, 14, 27, 33). |
| #9 Código órfão | `facialModeBadges` confirmado (`js/main.js:83`). As regras CSS órfãs não foram reverificadas. |
| #10 Textareas sem rótulo | Presente (P7). |

Os achados #1, #2, #4, #6 e #7 são técnicos e ficam fora do escopo visual. O protótipo não os corrige, porque não altera o app. Os achados #3, #9 e #10 aparecem resolvidos no protótipo: o preview facial mostra a imagem ajustada, não há código órfão e todo campo tem rótulo.

## 4. Oportunidades

1. **Ir direto ao trabalho.** O Início vira uma área para soltar uma imagem e uma lista de ferramentas; a saudação sai.
2. **Uma ferramenta, um lugar.** Biometria facial ganha entrada própria no menu, com endereço próprio (`#biometria`), e continua usando o mesmo motor de conversão.
3. **Entrada e saída sempre lado a lado.** Todas as ferramentas seguem o mesmo esqueleto: painel de entrada, painel de saída e uma barra de ações com os mesmos nomes.
4. **Mostrar o efeito da conversão.** Uma régua de tamanho compara entrada e saída em escala real, inclusive a marca de 200 KB.
5. **Formato explícito.** Uma etiqueta "Data URL" ou "Base64 puro" acompanha o código gerado.
6. **Feedback no lugar certo.** Uma linha de status dentro do painel e toasts discretos substituem modais para operações rápidas. Diálogos ficam só para confirmar ações destrutivas.
7. **Cor com significado.** Laranja-brasa passa a indicar ação e seleção; vermelho fica reservado para erro e exclusão.

## 5. Proposta de valor

> Converta imagens, Base64 e texto no próprio navegador, vendo antes de copiar o que entra, o que sai e quanto pesa.

## 6. Organização das ferramentas

| Ferramenta | Entrada | Saída | Regras preservadas do app | Grava no histórico |
|---|---|---|---|---|
| Imagem → Base64 | PNG, JPG, WEBP até 3 MB (arquivo, arrasto ou Ctrl+V) | Data URL | Limite de 3 MB; cópia automática | Sim |
| Biometria facial | Foto PNG, JPG, WEBP até 3 MB | Base64 puro de JPEG 80%, até 640 × 480, fundo branco | `AppConfig.facial` sem mudanças | Sim |
| Base64 → Imagem | Base64 puro ou data URL | Imagem para ver e baixar | Validação de caracteres; MIME detectado ou do prefixo | Não |
| Imagem → 200 KB | PNG, JPG, WEBP | Imagem ≤ 200 KB, nome `original_200kb.ext` | Algoritmo de `compressor.js` | Não (intencional) |
| Texto ↔ Base64 | Texto ou Base64 | Base64 ou texto | UTF-8 via `TextEncoder`/`TextDecoder` | Não |
| Histórico | — | Lista das 20 conversões mais recentes | Corte FIFO em 20 | — |
| Favoritos | — | Lista de códigos marcados | Sem limite hoje (achado #6) | — |
| Estatísticas | — | Conversões hoje, imagens processadas, favoritos, taxa de sucesso | Mesmo cálculo de `storage.js` e `main.js` | — |

As estatísticas existem no app e foram mantidas como um bloco "Atividade" no Início, não como tela separada.

## 7. Arquitetura de navegação

```
Phoenix
├── Início                    #inicio
├── Ferramentas
│   ├── Imagem → Base64       #imagem-base64
│   ├── Biometria facial      #biometria
│   ├── Base64 → Imagem       #base64-imagem
│   ├── Imagem → 200 KB       #comprimir
│   └── Texto ↔ Base64        #texto
└── Seus dados
    ├── Histórico             #historico
    └── Favoritos             #favoritos
```

- **Desktop (≥ 901 px):** barra lateral fixa com dois grupos. O item ativo tem fundo brasa translúcido e ícone em brasa. Histórico e Favoritos mostram a contagem.
- **Celular (≤ 900 px):** barra superior com a marca e o nome da tela, e barra inferior com quatro destinos (Início, Ferramentas, Histórico, Favoritos). "Ferramentas" abre uma folha com as cinco ferramentas, o que mantém a barra inferior com no máximo cinco itens.
- **Links diretos:** cada tela tem um endereço `#nome`, então Voltar, Avançar, favoritos do navegador e links compartilhados funcionam.
- **Imagem → Base64 e Biometria facial** compartilham a tela. O controle "Padrão | Biometria facial" alterna o perfil e atualiza o endereço.

## 8. Fluxos de utilização

**F1. Gerar Base64 de uma imagem (caminho principal)**
1. A pessoa solta, escolhe ou cola a imagem no Início ou na ferramenta.
2. O botão mostra "Convertendo…" por no mínimo 450 ms, para evitar que o estado pisque.
3. A imagem aparece à esquerda, com dimensões, formato, peso e proporção. O código aparece à direita com a etiqueta "Data URL".
4. A régua mostra o arquivo e o Base64 em escala, com o acréscimo (por exemplo, +33%).
5. A cópia automática acontece e a linha de status confirma: "Pronto. 191.642 caracteres copiados automaticamente."
6. A conversão entra no topo do Histórico.

**F2. Cadastro facial**
1. Na Biometria facial, a pessoa envia a foto.
2. O preview mostra a imagem já ajustada, com tamanho original e final, "JPEG 80%" e peso final.
3. O código aparece com a etiqueta "Base64 puro".
4. Trocar o perfil para "Padrão" reprocessa a mesma imagem.

**F3. Ver a imagem de um Base64**
1. A pessoa cola o código; o contador de caracteres atualiza.
2. Em "Mostrar imagem", um erro aparece junto do campo e diz o que corrigir, por exemplo: "Caractere inválido '#' na posição 4. Base64 só usa letras, números, + / e =."
3. Com sucesso, aparecem a imagem, as dimensões e o formato detectado, e "Baixar imagem" fica disponível.

**F4. Reduzir para 200 KB**
1. A pessoa envia a imagem; original e comprimida ficam lado a lado.
2. A régua marca o limite de 200 KB e mostra a redução, por exemplo −95%.
3. Se a imagem já cabe, nada é alterado e a tela diz isso.

**F5. Reaproveitar do Histórico ou dos Favoritos**
1. Cada item tem miniatura, nome, formato, peso e quando foi convertido.
2. "Copiar Base64" e "Remover" têm rótulo acessível e dica.
3. "Limpar histórico" pede confirmação num diálogo que diz quantos itens serão apagados.

## 9. Design system (resumo)

Detalhes em [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md).

- **Cor:** carvão quente `#12100E` como fundo, superfícies `#1A1714` e `#24201C`, tinta `#F3EEE7`. A brasa `#FF6B1A`, cor atual da marca, fica só em ação primária e seleção. O sucesso usa `#5CC98A` e o erro usa `#F2617A`, sempre com ícone e texto.
- **Tipografia:** IBM Plex Sans na interface e IBM Plex Mono só no conteúdo Base64.
- **Forma:** raios de 6, 10 e 14 px, concêntricos. Superfícies separadas por bordas finas, sem brilho; sombra só em toast e diálogo.
- **Assinatura visual:** a régua de tamanho.

## 10. Componentes

Bancada (painel de entrada, painel de saída, régua) · área de upload · visualizador com fundo xadrez · ficha de dados (`dl` em 2 colunas) · campo de código · etiqueta de formato · botões primário, secundário, discreto e destrutivo · controle segmentado · linha de status · erro junto ao campo · toast · diálogo de confirmação · lista de itens · estado vazio · barra lateral · barra inferior com folha de ferramentas.

## 11. Melhorias prioritárias

| Prioridade | Melhoria | Problemas |
|---|---|---|
| P0 | Separar cor de marca de cor de erro | P3 |
| P0 | Rótulos em campos e botões só com ícone | P6, P7 |
| P0 | Uma entrada por ferramenta, Biometria facial com endereço próprio, links diretos | P1, P2 |
| P1 | Etiqueta de formato (Data URL ou Base64 puro) e contagem de caracteres | P2, P11 |
| P1 | Status no painel em vez de modal de carregamento | P5 |
| P1 | Nomes de ação padronizados: Copiar, Baixar…, Favoritar, Limpar | P8 |
| P1 | Início com área de soltar imagem e lista de ferramentas | P9 |
| P2 | Régua de tamanho | P11 |
| P2 | Remover brilhos, gradientes e grade de fundo | P12 |
| P2 | Uniformizar o nome e a versão do produto | P13 |
| Decidir | Cópia automática com controle visível | P10 (D7) |

## 12. Critérios de sucesso

| Critério | Meta | Como medir |
|---|---|---|
| Tempo até o primeiro Base64 copiado, partindo do Início | ≤ 2 ações (soltar/colar → copiado) | Teste com 5 pessoas |
| Entender o formato gerado | 5 de 5 pessoas dizem corretamente se o código tem prefixo | Pergunta após F1 e F2 |
| Contraste | Texto ≥ 4,5:1; bordas de controles ≥ 3:1 | Cálculo WCAG (ver DESIGN_SYSTEM.md) |
| Acessibilidade | Zero campo ou botão sem nome acessível | axe ou Lighthouse |
| Responsividade | Sem rolagem horizontal de 360 a 1440 px | Capturas automatizadas |
| Feedback | Toda ação com resultado visível em até 500 ms ou estado de carregamento | Teste manual |
| Regressão funcional | Nenhuma regra de conversão, histórico, favoritos ou estatística alterada | Revisão de diff na integração |

## 13. Skills consultadas

| Skill | Como foi usada | Limitação |
|---|---|---|
| Frontend Design (Anthropic) | Plano em duas etapas (tokens, layout, princípios), revisão contra padrões genéricos de IA e autocrítica com capturas. | Usada a cópia local disponível no ambiente, não o repositório do GitHub. |
| UI/UX Pro Max | Busca `--design-system` para utilitário de desenvolvedor e buscas de UX (estados vazios, carregamento, arrastar e soltar). Adotados: estilo escuro de alto contraste, foco visível, alvos de 44 px, alternativa ao arrasto e estados vazios com ação. Rejeitados: o padrão de página "FAQ/Documentation Landing", que não tem relação com o produto, e a troca do laranja por verde, que apagaria a marca. | Usada a cópia local da Skill no ambiente, não o repositório `nextlevelbuilder/ui-ux-pro-max-skill` diretamente. |
| Web Design Guidelines (Vercel) | Diretrizes lidas em vercel.com/design/guidelines e aplicadas: `:focus-visible`, alvos de 44 px no celular, estado em URL, carregamento com tempo mínimo, confirmação de ação destrutiva, `aria-live` para status, rótulos em botões só com ícone, `tabular-nums`, `translate="no"` no código, `theme-color` e `color-scheme`, nada de `transition: all`. | Não foi possível abrir o `SKILL.md` nem o `command.md` do repositório `vercel-labs` (bloqueio de rede no ambiente). As diretrizes vieram da página pública. |
