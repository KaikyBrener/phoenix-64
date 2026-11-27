# Decisões de design — PHOENIX V5

Registro do que se propõe, por quê, e o que ainda precisa de aprovação. **Revisão 2:** decisões revistas com o requisito principal de que o Phoenix abra rápido, responda rápido e não atrapalhe operações repetidas. Para cada decisão: como é hoje (`main`, commit `2eebca2`), a proposta, o motivo e os problemas do [canvas](UX_CANVAS_PHOENIX_V5.md) que ela resolve.

## Resumo

| # | Decisão | Resolve | Mudou na revisão 2 | Aprovação |
|---|---|---|---|---|
| D1 | Abrir na última ferramenta; Início é só a lista de ferramentas | P9 | Sim | Sim |
| D2 | Uma entrada por ferramenta; Biometria facial com tela própria | P1, P2 | Sim | Sim |
| D3 | Componentes iguais, arranjo próprio por ferramenta | P4, P8 | Sim | Não |
| D4 | Linha de tamanho compacta, só com resultado | P11 | Sim | Não |
| D5 | Brasa só para ação e seleção; vermelho só para erro | P3 | Não | Não |
| D6 | Carvão quente, sem efeitos | P12 | Não | Sim |
| D7 | Cópia automática com chave e confirmação clara | P10 | Sim | Não |
| D8 | Sem espera artificial; indicador só acima de 150 ms | P5 | Sim | Não |
| D9 | Etiqueta de formato e contagem no código | P2, P11 | Não | Não |
| D10 | Fontes do sistema | P15 | Sim (substitui IBM Plex) | Sim |
| D11 | Barra inferior com 3 destinos no celular | — | Sim | Sim |
| D12 | Ícones SVG inline | P6, P14 | Não | Não |
| D13 | Nome e versão do produto | P13 | Não | Sim |
| D14 | Base64 → Imagem decodifica ao colar | — | Nova | Sim |
| D15 | Reduzir dependências do app | P14 | Nova | Sim |
| D16 | Estatísticas no Histórico, com a regra original | P9 | Nova | Sim |
| D17 | Compressão nunca anuncia sucesso acima de 200 KB | — | Nova | Não |
| D18 | Alturas limitadas pela tela | P4 | Nova | Não |

---

### D1. Abrir na última ferramenta

- **Antes:** a primeira tela é uma saudação com quatro cartões de métricas; para converter é preciso abrir outra tela.
- **Revisão 1:** Início com área de soltar, lista de ferramentas, métricas e recentes.
- **Revisão 2:** sem endereço, o app abre **direto na última ferramenta usada** (guardada no navegador). Na primeira visita, abre o Início, que é só a lista das 5 ferramentas com a marca "última usada". Soltar ou colar uma imagem no Início ainda leva a Imagem → Base64.
- **Por quê:** em uso repetido, a ferramenta já está aberta ao entrar: zero cliques antes de colar a imagem.
- **Precisa aprovar:** abrir na última ferramenta ou sempre no Início com a última ferramenta em primeiro lugar. A primeira opção é mais rápida; a segunda é mais previsível.
- **Custo técnico:** uma chave nova no `localStorage` (por exemplo, `phoenix_ultima_ferramenta`), sem tocar nas chaves existentes.

### D2. Uma ferramenta, uma tela

- **Antes:** "Conversor" e "Imagem → Base64" abrem a mesma tela. Biometria facial é um modo escondido dentro dela.
- **Revisão 2:** Biometria facial tem tela própria (`#biometria`), sem o controle "Padrão | Biometria facial". O motor de conversão continua o mesmo.
- **Por quê:** quem faz cadastro facial chega pela tarefa. Sem o controle segmentado, a tela tem um elemento a menos e não reprocessa sem pedido.
- **Troca:** a imagem carregada não passa de uma ferramenta para a outra.
- **Precisa aprovar:** o nome do item ("Biometria facial" ou "Foto para cadastro facial").

### D3. Componentes iguais, arranjos diferentes

- **Revisão 1:** o mesmo esqueleto de entrada, saída e régua em todas as ferramentas.
- **Revisão 2:** botões, campos, status e linha de tamanho são idênticos, mas cada tela é arranjada pelo que se confere nela:
  - Imagem → Base64: o arquivo vira uma linha compacta e o **código** ocupa a maior área;
  - Biometria facial: a **foto ajustada** fica em destaque, para conferir enquadramento e tamanho;
  - Base64 → Imagem: código e **imagem** lado a lado;
  - Imagem → 200 KB: **antes e depois** lado a lado;
  - Texto ↔ Base64: dois campos com as ações no meio.
- **Por quê:** um esqueleto único gerava painéis vazios (ex.: prévia grande onde o que importa é o código).

### D4. Linha de tamanho

- **Revisão 1:** régua em painel próprio, de largura total, com título, frase explicativa, estado vazio e animação.
- **Revisão 2:** uma linha de números (`Arquivo 130,8 KB → Base64 174,5 KB +33%`) e duas barras de 4 px, **só quando há resultado**, dentro do painel da entrada. Sem animação. A marca do limite aparece só em Imagem → 200 KB.
- **Por quê:** a informação continua (crescimento do Base64, redução da Biometria, distância até 200 KB), mas em uma linha e duas barras finas, em vez de um painel próprio que aparecia até sem resultado.

### D5. Cor com significado

- **Antes:** a marca usa as classes de erro do Bootstrap (35 vezes).
- **Proposta:** `--ember` (mesmo `#FF6B1A`) para ação e seleção; `--err` só para erro e exclusão; `--ok` para sucesso, "Copiado" e redução.

### D6. Carvão quente, sem efeitos

- **Antes:** preto `#050505`, gradientes radiais, grade sobreposta, superfícies translúcidas com desfoque e brilho laranja.
- **Proposta:** carvão `#12100E` com superfícies opacas e bordas finas. Sombra só em toast e diálogo.
- **Por quê:** o laranja continua sendo a marca, mas aparece onde importa. Sem desfoque e brilho, a página também pinta mais rápido em celulares fracos.
- **Precisa aprovar:** abandonar o preto puro e o brilho.

### D7. Cópia automática configurável e visível

- **Antes:** `CONFIG.autoCopy = true`, sem controle; o aviso é um toast.
- **Revisão 2:** chave "Copiar ao converter" na barra de ações, ligada por padrão e lembrada no navegador. Confirmação em dois lugares que a pessoa já está olhando: o botão vira "Copiado" (verde, com check) por 2,5 s, e o status diz "Copiado automaticamente · N caracteres". Se o navegador bloquear, o status avisa e orienta a usar Copiar.
- **Custo técnico:** uma chave nova no `localStorage`.

### D8. Sem espera artificial

- **Antes:** modal "Processando…" a cada conversão, seguido de um toast "Sucesso!".
- **Revisão 1:** linha de status com tempo **mínimo** de 350 a 450 ms (uma pausa artificial).
- **Revisão 2:** nenhuma pausa. O status "Convertendo…" só aparece se a operação passar de 150 ms; antes disso, o resultado já está na tela. Sem modal e sem toast de sucesso na conversão.
- **Medido no protótipo:** Imagem → Base64 de 1200 × 800 em 48 a 126 ms, sem indicador. Compressão de 2,6 MB para 195 KB em 0,64 a 0,75 s, com indicador.

### D9. Formato explícito

Etiqueta "Data URL" ou "Base64 puro" no painel de saída e contagem de caracteres no status. O modo Padrão gera data URL e a Biometria facial gera Base64 puro (`main.js:183` e `:210-216`).

### D10. Fontes do sistema

- **Antes:** Inter em 7 pesos via Google Fonts.
- **Revisão 1:** IBM Plex Sans e Plex Mono via Google Fonts.
- **Revisão 2:** `system-ui` e `ui-monospace`. Nenhum arquivo de fonte é baixado.
- **Por quê:** fonte externa adiciona outra conexão e arquivos antes do texto aparecer na forma final, e a fonte do sistema é a que cada pessoa já lê melhor no seu aparelho. A identidade fica com a cor, a marca e o arranjo.
- **Precisa aprovar:** abrir mão de uma fonte própria.

### D11. Barra inferior com 3 destinos

- **Antes:** botão "Menu" que abre um painel lateral com oito itens.
- **Revisão 2:** barra inferior com Ferramentas, Histórico e Favoritos. A folha extra de ferramentas da revisão 1 saiu: "Ferramentas" abre o Início, que já é a lista.
- **Precisa aprovar:** barra inferior ou o painel lateral atual reorganizado.

### D12. Ícones SVG inline

14 símbolos inline no lugar de uma fonte de 131 KB (mais 14 KB de CSS) usada para 28 ícones. Botões só com ícone ganham `aria-label`.

### D13. Nome e versão

Marca "Phoenix" sem versão na interface; a versão fica no README e no título da página. **Precisa aprovar:** qual é a versão oficial (V5 ou outra) e se ela aparece na interface.

### D14. Base64 → Imagem sem botão

- **Antes:** colar o código e clicar em "Converter para Imagem".
- **Proposta:** a imagem aparece ao colar. Ao digitar, decodifica 200 ms depois da última tecla. Erros aparecem junto do campo.
- **Por quê:** tira um passo da tarefa mais comum da tela.
- **Precisa aprovar:** remover o botão.

### D15. Reduzir dependências do app

| Dependência | Peso comprimido | Proposta |
|---|---|---|
| Inter (7 pesos) | não medido | Remover (D10) |
| Bootstrap Icons (CSS + fonte) | 144,5 KB | Trocar por SVG inline (D12) |
| SweetAlert2 (JS + CSS) | 25,6 KB | Trocar por status no painel, toast simples e `<dialog>` nativo (D8) |
| Lucide | não medido | Remover (já feito no PR #5) |
| Bootstrap CSS + JS | 54 KB | Manter nesta etapa. O JS só serve ao menu do celular, que a barra inferior dispensa; o CSS sustenta o layout atual e trocá-lo é uma etapa própria |

As trocas de ícones e de alertas tiram cerca de 170 KB comprimidos de terceiros, sem contar a Inter. Para comparar: o código do próprio app tem cerca de 27 KB comprimido. **Precisa aprovar:** a ordem das trocas e se o Bootstrap fica.

### D16. Estatísticas no Histórico

- **Antes:** quatro cartões no topo do dashboard.
- **Proposta:** uma linha no topo do Histórico ("Hoje 4 · Total 37 · Taxa de sucesso 95%"); o número de favoritos aparece no menu. O cálculo não muda: só conta tentativa depois que o arquivo passa na validação, e a taxa é conversões concluídas ÷ tentativas válidas × 100. Base64 → Imagem, 200 KB e Texto não entram, como hoje.
- **Precisa aprovar:** tirar as estatísticas da primeira tela.

### D17. Compressão honesta

A simulação do protótipo segue as regras de `compressor.js` (formato de saída, busca de qualidade entre 70% e 95%, redução de dimensões até 32 px). Se o resultado não couber em 200 KB, a tela mostra "Não foi possível chegar a 200 KB. O menor resultado ficou com N" em vermelho, a linha de tamanho marca "acima do limite" e o download fica desabilitado. Testado forçando um limite impossível.

### D18. Alturas limitadas pela tela

Campos e prévias usam `clamp()` com base na altura da janela, e os painéis não esticam para igualar a coluna vizinha. Os títulos das telas diminuíram (até 26 px) e as descrições somem no celular. Verificado: a ação principal fica visível sem rolar em 1366 × 700, 1024 × 640, 390 × 740 e 360 × 640.

---

## O que não muda

- Regras de conversão (`services.js`, `conversor.js`, `compressor.js`): limites, formatos, qualidade e dimensões.
- Armazenamento de histórico, favoritos e estatísticas (IndexedDB e localStorage). As únicas chaves novas propostas são a última ferramenta (D1) e a preferência de cópia (D7).
- Histórico com 20 itens; favoritos sem limite (o achado #6 continua aberto).
- HTML, CSS e JavaScript sem framework.

## Decisões que precisam de aprovação

1. **D1:** abrir na última ferramenta ou no Início.
2. **D2:** Biometria facial com tela própria, e o nome do item.
3. **D6:** sair do preto puro e remover os brilhos.
4. **D10:** fontes do sistema no lugar de uma fonte própria.
5. **D11:** barra inferior no celular.
6. **D13:** versão exibida.
7. **D14:** Base64 → Imagem sem o botão de converter.
8. **D15:** ordem das trocas de dependência e destino do Bootstrap.
9. **D16:** estatísticas fora da primeira tela.

## Pendências técnicas para a integração

- Antes de mesclar a `dev` na `main`, decidir se `prototipo/` e `docs/` devem ser publicados: o `wrangler.jsonc` publica a raiz inteira (achado #2).
- O protótipo expõe `window.__proto` só para os testes automáticos; isso não vai para o app.
- Achados técnicos #1, #2, #4, #6 e #7 seguem abertos; o #7 entra no plano de desempenho.
