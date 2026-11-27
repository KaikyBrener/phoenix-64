# Decisões de design — PHOENIX V5

Registro do que mudou na proposta, por quê, e o que ainda precisa de aprovação. Para cada decisão: como é hoje (`main`, commit `2eebca2`), o que se propõe, o motivo e o problema do [canvas](UX_CANVAS_PHOENIX_V5.md) que ela resolve.

## Resumo

| # | Decisão | Resolve | Aprovação |
|---|---|---|---|
| D1 | Início vira área de soltar imagem + lista de ferramentas | P9 | Sim |
| D2 | Navegação sem duplicidade; Biometria facial com entrada própria | P1, P2 | Sim |
| D3 | Mesmo esqueleto em todas as ferramentas (entrada, saída, ações) | P4, P8 | Não |
| D4 | Régua de tamanho como componente de assinatura | P11 | Sim |
| D5 | Brasa só para ação e seleção; vermelho só para erro | P3 | Não |
| D6 | Paleta carvão quente, sem brilhos nem gradientes | P12 | Sim |
| D7 | Cópia automática: manter, mas avisar e permitir desligar | P10 | Sim |
| D8 | Status no painel e toasts no lugar de modais | P5 | Não |
| D9 | Etiqueta de formato e contagem no código | P2, P11 | Não |
| D10 | IBM Plex Sans + Plex Mono no lugar de Inter | — | Sim |
| D11 | Barra inferior com 4 destinos no celular | — | Sim |
| D12 | Ícones SVG inline em vez de Bootstrap Icons | P6 | Não |
| D13 | Nome e versão do produto | P13 | Sim |

---

### D1. Início direto ao trabalho

- **Antes:** saudação "Bem-vindo ao PHOENIX V5", selo de privacidade e quatro cartões de métricas. Para converter, a pessoa precisa abrir outra tela.
- **Proposta:** título "O que você vai converter?", uma área grande para soltar, escolher ou colar a imagem (leva direto a Imagem → Base64 com o arquivo carregado), a lista das cinco ferramentas com o que entra e o que sai, e o bloco "Atividade" com as mesmas quatro estatísticas e as três conversões recentes.
- **Por quê:** a ação mais comum vira o primeiro elemento da tela. As estatísticas continuam lá, mas não ocupam o lugar da ferramenta. A Frontend Design pede que a abertura mostre o que é mais característico do assunto; aqui, isso é a conversão.

### D2. Uma ferramenta, um lugar

- **Antes:** "Conversor" e "Imagem → Base64" abrem a mesma tela. A Biometria facial é um modo escondido dentro dela.
- **Proposta:** grupos "Ferramentas" (5) e "Seus dados" (2). Biometria facial vira item próprio, com endereço `#biometria`, e compartilha a tela com Imagem → Base64 através do controle "Padrão | Biometria facial". O motor de conversão é o mesmo de hoje.
- **Por quê:** quem faz cadastro facial chega pela tarefa, não pelo formato. Links diretos fazem Voltar e compartilhamento funcionarem (diretriz Vercel: estado na URL).
- **Precisa aprovar:** o nome "Biometria facial" no menu, ou outro, como "Foto para cadastro facial".

### D3. Esqueleto único: entrada, saída, ações

- **Antes:** cada aba tem layout próprio (colunas 4/8, 6/6, cartões numerados "1." e "2.", seção de download separada). Os nomes das ações variam.
- **Proposta:** painel de entrada à esquerda e de saída à direita, cada um com título e metadado no cabeçalho, e ações no painel de saída com nomes padronizados (Copiar, Baixar…, Favoritar, Limpar). No celular, a ordem fica entrada → saída → régua.
- **Por quê:** aprender uma ferramenta ensina as outras. Também resolve os vazios desequilibrados, porque os dois painéis têm a mesma altura mínima.

### D4. Régua de tamanho

- **Antes:** tamanhos aparecem como números soltos em blocos de estatística ("Tamanho Imagem", "Tamanho Base64").
- **Proposta:** duas barras na mesma escala (entrada e saída), variação percentual no título, linha de limite quando existe (200 KB) e uma frase que explica o resultado.
- **Por quê:** é a informação que o Phoenix tem e outras ferramentas não mostram: o Base64 cresce cerca de 33%, a Biometria facial reduz mais de 90%, e a compressão mostra quanto sobra até 200 KB. É o elemento de identidade da proposta, porque vem do próprio trabalho da ferramenta e não é enfeite.
- **Precisa aprovar:** se a régua entra em todas as ferramentas de imagem ou só em Biometria facial e Imagem → 200 KB.

### D5. Cor com significado

- **Antes:** a marca é aplicada com classes de erro do Bootstrap (`btn-danger`, `text-danger`, `border-danger`), 35 vezes no HTML.
- **Proposta:** `--ember` (o mesmo `#FF6B1A`) para ação primária e seleção; `--err` (`#F2617A`) só para erro e exclusão; `--ok` para sucesso e redução.
- **Por quê:** hoje um botão "Converter" e um erro têm a mesma cor. A UI/UX Pro Max pede tokens semânticos e não depender só da cor; a Vercel, não usar cor como único sinal de estado.

### D6. Paleta carvão quente, sem efeitos

- **Antes:** preto `#050505`, gradientes radiais laranja e branco no fundo, grade sobreposta, superfícies translúcidas com desfoque e sombras com brilho laranja.
- **Proposta:** carvão `#12100E` com superfícies opacas em degraus (`#1A1714`, `#24201C`, `#0D0C0A`), bordas finas e sombra só em toast e diálogo.
- **Por quê:** o laranja continua sendo a marca, mas aparece onde importa. O tom quente do fundo vem da própria brasa e evita o par genérico "preto puro + uma cor neon", que a Frontend Design aponta como sinal de interface feita por IA. Sem desfoque nem brilho, o app fica mais leve em celular.
- **Precisa aprovar:** o abandono do preto puro e do brilho, que são marcas visuais da versão atual.

### D7. Cópia automática visível

- **Antes:** `CONFIG.autoCopy = true`. Toda conversão sobrescreve a área de transferência, e o aviso é um toast.
- **Proposta no protótipo:** manter o comportamento, mas anunciar na linha de status ("Pronto. 191.642 caracteres copiados automaticamente.") e, se a cópia falhar, orientar a usar Copiar.
- **Proposta para decidir:** adicionar um controle "Copiar ao converter", ligado por padrão e lembrado no navegador. Não está no protótipo, porque seria uma função nova.
- **Por quê:** sobrescrever a área de transferência sem pedido pode apagar algo que a pessoa ia colar.

### D8. Feedback sem modal

- **Antes:** modal de "Processando…" (SweetAlert2) em operações quase instantâneas, seguido de um toast "Sucesso!".
- **Proposta:** spinner dentro do botão, com o rótulo mantido; linha de status no painel com tempo mínimo de 350 a 450 ms, para não piscar; toasts só para ações fora do painel. O diálogo modal fica só para confirmar exclusões.
- **Por quê:** modal interrompe e esconde o resultado. A Vercel orienta botões de carregamento com spinner e rótulo, indicadores com tempo mínimo e anúncios via `aria-live`.

### D9. Formato explícito

- **Antes:** o modo Padrão entrega data URL e o facial entrega Base64 puro (`main.js:183` e `:210-216`), sem indicação.
- **Proposta:** etiqueta "Data URL" ou "Base64 puro" no cabeçalho do painel de saída, e contagem de caracteres no status.
- **Por quê:** colar o formato errado é a falha mais provável na integração com outros sistemas (hipótese H2).

### D10. Tipografia IBM Plex

- **Antes:** Inter em todos os pesos, de 300 a 900.
- **Proposta:** IBM Plex Sans (400, 500, 600) na interface e IBM Plex Mono (400) só no conteúdo Base64.
- **Por quê:** a Plex tem desenho técnico, de engenharia, que combina com uma bancada de conversão, e a família inclui uma versão mono para o código. Três pesos bastam e carregam menos que sete. A UI/UX Pro Max sugeriu JetBrains Mono para títulos; a proposta usa mono só no código, porque títulos em mono pesam a leitura.
- **Precisa aprovar:** a troca de fonte.

### D11. Navegação no celular

- **Antes:** botão "Menu" que abre um painel lateral com oito itens.
- **Proposta:** barra superior com a marca e a tela atual, e barra inferior fixa com Início, Ferramentas (abre uma folha com as cinco), Histórico e Favoritos.
- **Por quê:** os destinos ficam ao alcance do polegar e a barra inferior respeita o limite de cinco itens (UI/UX Pro Max, "bottom nav ≤ 5").
- **Precisa aprovar:** a barra inferior. A alternativa é manter o painel lateral atual, só reorganizado.

### D12. Ícones

- **Antes:** Bootstrap Icons via CDN, e Lucide carregado sem uso. Botões só com ícone sem nome acessível.
- **Proposta:** conjunto pequeno de SVG inline com significado fixo, `aria-hidden` quando decorativos, `aria-label` e `title` em botões só com ícone.
- **Por quê:** menos requisições externas e nenhum ícone sem função.

### D13. Nome e versão

- **Antes:** "PHOENIX V5" em caixa alta no título, comentário "PHOENIX V4" no CSS e repositório `phoenix-64`.
- **Proposta:** marca "Phoenix" com a versão discreta ao lado ("V5") só na barra lateral.
- **Precisa aprovar:** qual é a versão oficial e se ela deve aparecer na interface.

---

## O que não muda

- Regras de conversão (`services.js`, `conversor.js`, `compressor.js`): limites, formatos, qualidade e dimensões.
- Armazenamento: IndexedDB para histórico e favoritos, localStorage para estatísticas. O protótipo guarda tudo só em memória e não toca nesses dados.
- Histórico com 20 itens, favoritos sem limite (o achado #6 continua em aberto), estatísticas com o mesmo cálculo.
- HTML, CSS e JavaScript sem framework. O protótipo é um arquivo HTML único, no mesmo estilo de tecnologia do app.

## Decisões que precisam de aprovação

1. **D1:** o Início sem a saudação e sem os cartões de métricas no topo.
2. **D2:** Biometria facial como item próprio do menu, e o nome desse item.
3. **D4:** onde a régua de tamanho aparece.
4. **D6:** sair do preto puro e remover os efeitos de brilho.
5. **D7:** criar ou não o controle de cópia automática.
6. **D10:** trocar Inter por IBM Plex.
7. **D11:** barra inferior no celular.
8. **D13:** nome e versão exibidos.

## Pendências técnicas para a integração

- Antes de levar a `dev` para a `main`, decidir se `prototipo/` e `docs/` devem ser publicados. O `wrangler.jsonc` publica a raiz inteira, então hoje eles iriam para o site (ver achado #2).
- No protótipo, a compressão para 200 KB é uma versão simplificada só para demonstrar a tela; o algoritmo real é o de `compressor.js`.
- Os achados técnicos #1, #2, #4, #6 e #7 da auditoria seguem abertos e não dependem do redesign.
