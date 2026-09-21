// App Main - Controla toda a aplicação

// Configuração Central
const CONFIG = {
    autoCopy: true
};

class PhoenixApp {
    constructor() {
        this.converter = converter;
        this.storage = storage;
        this.init();
    }

    async init() {
        // Aguarda IndexedDB carregar histórico/favoritos antes de renderizar
        await this.storage._pronto;
        this.setupEventListeners();
        this.atualizarDashboard();
        
        // Revelar cards de métrica com animação suave
        setTimeout(() => {
            document.querySelectorAll('.metric-card').forEach(card => card.classList.add('show'));
        }, 50);
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Navegação (Abas principais)
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => this.mudarAba(e.target.closest('[data-tab]').dataset.tab));
        });

        // Ferramentas
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', (e) => this.mudarAba(e.target.closest('[data-tool]').dataset.tool));
        });

        // Upload
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');

        uploadArea.addEventListener('click', () => imageInput.click());
        uploadArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                imageInput.click();
            }
        });
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.processarArquivo(e.dataTransfer.files[0]);
        });

        imageInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.processarArquivo(e.target.files[0]);
            }
        });

        // Suporte a Clipboard (Ctrl+V)
        window.addEventListener('paste', (e) => {
            const clipboardData = e.clipboardData || window.clipboardData;
            if (clipboardData && clipboardData.files && clipboardData.files.length > 0) {
                const file = clipboardData.files[0];
                if (file.type.startsWith('image/')) {
                    // Força a navegação para a aba do conversor
                    this.mudarAba('conversor');
                    // Processa o arquivo como se tivesse sido upado
                    this.processarArquivo(file);
                }
            }
        });

        // Radio Buttons de Modo de Conversão
        const radiosMode = document.querySelectorAll('input[name="conversionMode"]');
        const facialModeBadges = document.getElementById('facialModeBadges');
        
        radiosMode.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'facial') {
                    this.converter.setEstrategia(new FacialConversionStrategy());
                    if (facialModeBadges) facialModeBadges.style.display = 'block';
                } else {
                    this.converter.setEstrategia(new StandardConversionStrategy());
                    if (facialModeBadges) facialModeBadges.style.display = 'none';
                }
                // Limpar resultado anterior ao trocar de modo
                 this.limparConversorSilencioso();
            });
        });

        // Botões de ação
        document.getElementById('copyBtn').addEventListener('click', () => this.copiarBase64());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadBase64());
        document.getElementById('addFavoriteBtn').addEventListener('click', () => this.adicionarAosFavoritos());
        document.getElementById('limparBtn').addEventListener('click', () => this.limparConversor());

        // Histórico e Favoritos
        document.getElementById('limparHistoricoBtn').addEventListener('click', () => this.limparHistorico());
        document.getElementById('limparFavoritosBtn').addEventListener('click', () => this.limparFavoritos());

        // Base64 para Imagem
        if (document.getElementById('converterBtn')) {
            document.getElementById('converterBtn').addEventListener('click', () => this.converterBase64ParaImagem());
            document.getElementById('downloadImageBtn').addEventListener('click', () => this.downloadImagem());
            document.getElementById('limparBase64Btn').addEventListener('click', () => this.limparBase64ParaImagem());
        }

        // Editor de Texto
        if (document.getElementById('codificarTextBtn')) {
            document.getElementById('codificarTextBtn').addEventListener('click', () => this.codificarTexto());
            document.getElementById('decodificarTextBtn').addEventListener('click', () => this.decodificarTexto());
            document.getElementById('copiarTextBtn').addEventListener('click', () => this.copiarTexto());
            document.getElementById('limparTextBtn').addEventListener('click', () => this.limparTexto());
        }
    }

    // ===== PROCESSAMENTO DE ARQUIVO =====
    async processarArquivo(file) {
        if (!file) return;

        // Validar
        const validacao = this.converter.validarImagem(file);
        if (!validacao.valido) {
            AlertHelper.error('Erro na validação', validacao.erro);
            return;
        }

        // Registrar tentativa válida
        const tentativas = parseInt(localStorage.getItem('phoenix_tentativas') || '0') + 1;
        localStorage.setItem('phoenix_tentativas', tentativas);

        try {
            // Mostrar loading
            AlertHelper.loading('Processando...', 'Convertendo imagem para Base64');

            // Converter
            const { base64, metadados } = await this.converter.converterParaBase64(file);

            // Gerar preview
            const preview = await this.converter.gerarPreview(file);

            // Exibir resultado
            this.exibirResultado(base64, metadados, preview);

            // Salvar no histórico
            this.storage.adicionarAoHistorico({
                nome: metadados.nome,
                tipo: metadados.tipo,
                tamanho: metadados.tamanho,
                base64: base64,
                preview: preview.url
            });

            // Fechar loading
            Swal.close();

            // Mostrar sucesso
            AlertHelper.toast('Sucesso!', 'success', {
                title: 'Sucesso!',
                text: 'Imagem convertida com sucesso'
            });

        } catch (erro) {
            AlertHelper.error('Erro ao processar', erro.message);
        }

        // Atualizar taxa de sucesso no dashboard
        this.atualizarDashboard();
    }

    // ===== EXIBIÇÃO DE RESULTADOS =====
    exibirResultado(base64, metadados, preview) {
        // Textarea com Base64
        const base64Output = document.getElementById('base64Output');
        base64Output.value = base64;

        // Preview
        const previewContainer = document.getElementById('previewContainer');
        previewContainer.innerHTML = '';
        const imgPreview = document.createElement('img');
        imgPreview.style.cssText = 'max-width: 100%; max-height: 300px; border-radius: 0.5rem;';
        imgPreview.alt = 'Preview';
        imgPreview.src = (preview.url && (preview.url.startsWith('data:image/png;base64,') || preview.url.startsWith('data:image/jpeg;base64,') || preview.url.startsWith('data:image/webp;base64,'))) ? preview.url : '';
        previewContainer.appendChild(imgPreview);

        // Informações
        document.getElementById('imageName').textContent = metadados.nome;
        document.getElementById('imageType').textContent = metadados.tipo;
        document.getElementById('imageSize').textContent = metadados.tamanho;
        document.getElementById('imageInfo').style.display = 'block';

        // Estatísticas
        const imagemAtual = this.converter.obterImagemAtual();
        document.getElementById('tamanhoImagem').textContent = metadados.tamanho;
        document.getElementById('tamanhoBase64').textContent = imagemAtual ? this.converter.calcularTamanhoReduzido(imagemAtual) : '-';
        document.getElementById('proporcao').textContent = imagemAtual ? this.converter.calcularProporção(imagemAtual) : '-';

        // Estatísticas Avançadas (Cadastro Facial)
       const advancedStats = document.getElementById('advancedStats');

        if (metadados.estrategia === 'facial') {
            // Remove o prefixo "data:image/...;base64," para exibir apenas o Base64 puro
            const base64SemPrefixo = base64.includes(',')
                ? base64.substring(base64.indexOf(',') + 1)
                : base64;

            // Atualiza o textarea para mostrar somente o Base64 puro
            document.getElementById('base64Output').value = base64SemPrefixo;

            document.getElementById('statResOriginal').textContent = metadados.resolucaoOriginal;
            document.getElementById('statResFinal').textContent = metadados.resolucaoFinal;
            document.getElementById('statSizeOriginal').textContent = metadados.tamanhoOriginalStr;
            document.getElementById('statSizeFinal').textContent = metadados.tamanho;
            document.getElementById('statReduction').textContent = metadados.percentualReducao + '%';
            document.getElementById('statFormat').textContent = metadados.tipo;
            document.getElementById('statJpeg').textContent = metadados.compressaoJPEG;

            // Comprimento do Base64 sem o prefixo
            document.getElementById('statBase64Len').textContent =
                base64SemPrefixo.length.toLocaleString('pt-BR');

            // Sobrescreve cálculo antigo que é irrelevante no facial
            document.getElementById('tamanhoBase64').textContent = metadados.tamanho;
            document.getElementById('proporcao').textContent = '-';

            advancedStats.style.display = 'block';
        } else {
            advancedStats.style.display = 'none';
        }

        // Habilitar botões
        document.getElementById('copyBtn').disabled = false;
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('addFavoriteBtn').disabled = false;

        // Auto-Copy
        if (CONFIG.autoCopy) {
            // Pequeno delay para garantir que a renderização do textarea terminou
            setTimeout(() => {
                this.copiarBase64(true);
            }, 100);
        }
    }

    // ===== AÇÕES =====
    copiarBase64(isAuto = false) {
        const base64Output = document.getElementById('base64Output');
        navigator.clipboard.writeText(base64Output.value).then(() => {
            if (isAuto) {
                const badge = document.getElementById('autoCopyBadge');
                if (badge) badge.style.display = 'inline-block';
                AlertHelper.toast('Auto-Copiado!', 'success', {
                    text: 'O Base64 já está na sua área de transferência.'
                });
            } else {
                AlertHelper.toast('Copiado!', 'success', {
                    text: 'Base64 copiado para a área de transferência'
                });
            }
        }).catch(() => {
            AlertHelper.toast('Erro', 'error', {
                text: 'Falha ao copiar'
            });
        });
    }

    downloadBase64() {
        const base64Output = document.getElementById('base64Output').value;
        const metadados = this.converter.obterMetadadosAtual();

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(base64Output));
        element.setAttribute('download', `${metadados.nome}_base64.txt`);
        element.style.display = 'none';

        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        AlertHelper.toast('Download iniciado!', 'success', {
            text: 'Arquivo salvo com sucesso'
        });
    }

    adicionarAosFavoritos() {
        const metadados = this.converter.obterMetadadosAtual();
        const base64 = this.converter.obterBase64Atual();

        const resultado = this.storage.adicionarAosFavoritos({
            nome: metadados.nome,
            tipo: metadados.tipo,
            tamanho: metadados.tamanho,
            base64: base64,
            preview: document.querySelector('#previewContainer img')?.src || ''
        });

        AlertHelper.toast(resultado.sucesso ? 'Adicionado!' : 'Aviso', resultado.sucesso ? 'success' : 'warning', {
            text: resultado.mensagem
        });

        if (resultado.sucesso) {
            this.atualizarDashboard();
        }
    }

        limparConversorSilencioso() {
        this.converter.limpar();

        document.getElementById('base64Output').value = '';
        document.getElementById('previewContainer').innerHTML = '<p class="text-white-50">Sua imagem aparecerá aqui</p>';
        document.getElementById('imageInfo').style.display = 'none';
        document.getElementById('copyBtn').disabled = true;
        document.getElementById('downloadBtn').disabled = true;
        document.getElementById('addFavoriteBtn').disabled = true;
        document.getElementById('tamanhoImagem').textContent = '-';
        document.getElementById('tamanhoBase64').textContent = '-';
        document.getElementById('proporcao').textContent = '-';

        const badge = document.getElementById('autoCopyBadge');
        if (badge) badge.style.display = 'none';

        const advancedStats = document.getElementById('advancedStats');
        if (advancedStats) advancedStats.style.display = 'none';
    }

    limparConversor() {
        this.limparConversorSilencioso();
    }

    limparHistorico() {
        AlertHelper.confirm('Limpar histórico?', 'Essa ação não pode ser desfeita', {
            confirmButtonText: 'Sim, limpar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.storage.limparHistorico();
                this.atualizarHistorico();
                this.atualizarDashboard();

                AlertHelper.toast('Limpo!', 'success', {
                    text: 'Histórico foi limpo'
                });
            }
        });
    }

    limparFavoritos() {
        AlertHelper.confirm('Limpar favoritos?', 'Essa ação não pode ser desfeita', {
            confirmButtonText: 'Sim, limpar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.storage.limparFavoritos();
                this.atualizarFavoritos();
                this.atualizarDashboard();

                AlertHelper.toast('Limpo!', 'success', {
                    text: 'Favoritos foram limpos'
                });
            }
        });
    }

    // ===== ABAS =====
    mudarAba(abaId) {
        // Ocultar todas
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });

        // Remover ativo dos botões
        document.querySelectorAll('[data-tab], [data-tool]').forEach(btn => {
            btn.classList.remove('active');
        });

        // Mostrar aba selecionada
        const tabElement = document.getElementById(abaId);
        if (tabElement) {
            tabElement.style.display = 'block';
        }
        
        // Marcar botão como ativo (procura em data-tab ou data-tool)
        const activeBtn = document.querySelector(`[data-tab="${abaId}"], [data-tool="${abaId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Atualizar conteúdo se necessário
        if (abaId === 'historico') {
            this.atualizarHistorico();
        } else if (abaId === 'favoritos') {
            this.atualizarFavoritos();
        } else if (abaId === 'dashboard') {
            this.atualizarDashboard();
        }
    }

    // ===== ATUALIZAR CONTEÚDO =====
    atualizarDashboard() {
        const stats = this.storage.obterStats();
        const historico = this.storage.obterHistorico();

        document.getElementById('conversoes-hoje').textContent = stats.conversoesHoje;
        document.getElementById('imagens-processadas').textContent = stats.totalConversoes;
        document.getElementById('favoritos-count').textContent = stats.totalFavoritos;

        // Taxa de sucesso: conversões concluídas / tentativas válidas × 100
        const tentativas = parseInt(localStorage.getItem('phoenix_tentativas') || '0');
        const taxaEl = document.getElementById('taxa-sucesso');
        if (tentativas > 0) {
            const taxa = Math.round((stats.totalConversoes / tentativas) * 100);
            taxaEl.textContent = taxa + '%';
        } else {
            taxaEl.textContent = '-';
        }
        const historicoRecente = document.getElementById('historico-recente');
        if (historico.length === 0) {
            historicoRecente.innerHTML = '<p class="text-white-50">Nenhuma conversão realizada ainda.</p>';
        } else {
            historicoRecente.innerHTML = '';
            historico.slice(0, 3).forEach(item => {
                const container = document.createElement('div');
                container.className = 'd-flex align-items-center justify-content-between py-2 border-bottom border-secondary';
                
                container.innerHTML = `
                    <div class="d-flex align-items-center gap-2">
                        <img src="" style="width: 40px; height: 40px; object-fit: cover; border-radius: 0.25rem;" class="item-img">
                        <div>
                            <p class="mb-0 text-white item-nome"></p>
                            <small class="text-white-50 item-data"></small>
                        </div>
                    </div>
                    <small class="text-danger item-tamanho"></small>
                `;
                
                container.querySelector('.item-img').src = (item.preview && (item.preview.startsWith('data:image/png;base64,') || item.preview.startsWith('data:image/jpeg;base64,') || item.preview.startsWith('data:image/webp;base64,'))) ? item.preview : '';
                container.querySelector('.item-nome').textContent = item.nome;
                container.querySelector('.item-data').textContent = item.data;
                container.querySelector('.item-tamanho').textContent = item.tamanho;
                
                historicoRecente.appendChild(container);
            });
        }
    }

    atualizarHistorico() {
        const historico = this.storage.obterHistorico();
        const historicoList = document.getElementById('historicoList');

        if (historico.length === 0) {
            historicoList.innerHTML = '<p class="text-white-50 py-4">Nenhuma conversão no histórico ainda.</p>';
            return;
        }

        historicoList.innerHTML = '';
        historico.forEach(item => {
            const container = document.createElement('div');
            container.className = 'list-group-item';
            
            container.innerHTML = `
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                        <img src="" style="width: 60px; height: 60px; object-fit: cover; border-radius: 0.5rem;" class="item-img">
                        <div class="flex-grow-1">
                            <p class="mb-1 text-white fw-bold item-nome"></p>
                            <small class="text-white-50 item-detalhes"></small>
                        </div>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-danger btn-copy">
                            <i class="bi bi-files"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            container.querySelector('.item-img').src = (item.preview && (item.preview.startsWith('data:image/png;base64,') || item.preview.startsWith('data:image/jpeg;base64,') || item.preview.startsWith('data:image/webp;base64,'))) ? item.preview : '';
            container.querySelector('.item-nome').textContent = item.nome;
            container.querySelector('.item-detalhes').textContent = `${item.tipo} • ${item.tamanho} • ${item.data}`;
            container.querySelector('.btn-copy').onclick = () => this.copiarDoHistorico(item.id);
            container.querySelector('.btn-delete').onclick = () => this.deletarHistorico(item.id);
            
            historicoList.appendChild(container);
        });
    }

    atualizarFavoritos() {
        const favoritos = this.storage.obterFavoritos();
        const favoritosList = document.getElementById('favoritosList');

        if (favoritos.length === 0) {
            favoritosList.innerHTML = '<p class="text-white-50 py-4">Nenhum favorito salvo ainda.</p>';
            return;
        }

        favoritosList.innerHTML = '';
        favoritos.forEach(item => {
            const container = document.createElement('div');
            container.className = 'list-group-item';
            
            container.innerHTML = `
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                        <img src="" style="width: 60px; height: 60px; object-fit: cover; border-radius: 0.5rem;" class="item-img">
                        <div class="flex-grow-1">
                            <p class="mb-1 text-white fw-bold item-nome"></p>
                            <small class="text-white-50 item-detalhes"></small>
                        </div>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-danger btn-copy">
                            <i class="bi bi-files"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            container.querySelector('.item-img').src = (item.preview && (item.preview.startsWith('data:image/png;base64,') || item.preview.startsWith('data:image/jpeg;base64,') || item.preview.startsWith('data:image/webp;base64,'))) ? item.preview : '';
            container.querySelector('.item-nome').textContent = item.nome;
            container.querySelector('.item-detalhes').textContent = `${item.tipo} • ${item.tamanho} • ${item.data}`;
            container.querySelector('.btn-copy').onclick = () => this.copiarDoFavorito(item.id);
            container.querySelector('.btn-delete').onclick = () => this.deletarFavorito(item.id);
            
            favoritosList.appendChild(container);
        });
    }

    // ===== AUXILIARES =====
    copiarDoHistorico(id) {
        const historico = this.storage.obterHistorico();
        const item = historico.find(h => h.id == id);
        if (item) {
            navigator.clipboard.writeText(item.base64).then(() => {
                AlertHelper.toast('Copiado!', 'success', {
                    text: 'Base64 copiado para a área de transferência'
                });
            }).catch(() => {
                AlertHelper.toast('Erro', 'error', {
                    text: 'Falha ao copiar'
                });
            });
        }
    }

    deletarHistorico(id) {
        AlertHelper.confirm('Deletar item?', 'Essa ação não pode ser desfeita', {
            confirmButtonText: 'Sim, deletar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.storage.deletarDoHistorico(id);
                this.atualizarHistorico();
                this.atualizarDashboard();

                AlertHelper.toast('Deletado!', 'success', {
                    text: 'Item removido do histórico'
                });
            }
        });
    }

    copiarDoFavorito(id) {
        const favoritos = this.storage.obterFavoritos();
        const item = favoritos.find(f => f.id == id);
        if (item) {
            navigator.clipboard.writeText(item.base64).then(() => {
                AlertHelper.toast('Copiado!', 'success', {
                    text: 'Base64 copiado para a área de transferência'
                });
            }).catch(() => {
                AlertHelper.toast('Erro', 'error', {
                    text: 'Falha ao copiar'
                });
            });
        }
    }

    deletarFavorito(id) {
        AlertHelper.confirm('Deletar favorito?', 'Essa ação não pode ser desfeita', {
            confirmButtonText: 'Sim, deletar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.storage.deletarDosFavoritos(id);
                this.atualizarFavoritos();
                this.atualizarDashboard();

                AlertHelper.toast('Deletado!', 'success', {
                    text: 'Favorito removido'
                });
            }
        });
    }

    // ===== BASE64 PARA IMAGEM =====
    converterBase64ParaImagem() {
        let base64Input = document.getElementById('base64Input').value.trim();

        if (!base64Input) {
            AlertHelper.warning('Campo vazio', 'Cole o código Base64 para converter');
            return;
        }

        // Limpar espaços e quebras de linha
        base64Input = base64Input.replace(/\s+/g, '');

        try {
            // Detectar MIME e extrair Base64 puro
            const MIMES_VALIDOS = ['image/jpeg', 'image/png', 'image/webp'];
            let mime = 'image/png'; // fallback para Base64 puro
            let base64Clean = base64Input;

            if (base64Input.startsWith('data:')) {
                const sepIdx = base64Input.indexOf(',');
                if (sepIdx === -1) {
                    AlertHelper.error('Base64 Inválido', 'O formato do Data URL está incorreto.');
                    return;
                }
                const header = base64Input.substring(0, sepIdx); // ex: data:image/jpeg;base64
                const mimeMatch = header.match(/data:([^;]+);base64/);
                if (mimeMatch && MIMES_VALIDOS.includes(mimeMatch[1].toLowerCase())) {
                    mime = mimeMatch[1].toLowerCase();
                } else if (mimeMatch) {
                    AlertHelper.error('Tipo não suportado', 'Apenas JPEG, PNG ou WEBP são suportados.');
                    return;
                } else {
                    AlertHelper.error('Base64 Inválido', 'O cabeçalho do Data URL é inválido.');
                    return;
                }
                base64Clean = base64Input.substring(sepIdx + 1);
            }

            // Validar formato Base64 (apenas caracteres válidos)
            if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Clean)) {
                AlertHelper.error('Base64 Inválido', 'O código contém caracteres inválidos.');
                return;
            }

            // Respeitar limite (cerca de 3MB originais -> ~4MB Base64)
            if (base64Clean.length > 4.1 * 1024 * 1024) {
                AlertHelper.error('Arquivo muito grande', 'O tamanho máximo suportado é de cerca de 3MB.');
                return;
            }

            // Criar imagem
            const img = new Image();
            img.dataset.mime = mime;
            img.onload = () => {
                const container = document.getElementById('base64PreviewContainer');
                container.innerHTML = '';
                container.appendChild(img);
                document.getElementById('downloadImageBtn').disabled = false;

                AlertHelper.toast('Sucesso!', 'success', {
                    text: 'Imagem convertida com sucesso'
                });
            };

            img.onerror = () => {
                AlertHelper.error('Erro na conversão', 'Verifique se o código Base64 está correto (inválido ou corrompido)');
            };

            img.src = `data:${mime};base64,` + base64Clean;
        } catch (error) {
            AlertHelper.error('Erro na conversão', 'Verifique se o código Base64 está correto');
        }
    }

    downloadImagem() {
        const container = document.getElementById('base64PreviewContainer');
        const img = container.querySelector('img');

        if (!img) {
            AlertHelper.warning('Nenhuma imagem', 'Converta um Base64 primeiro');
            return;
        }

        // Determinar extensão a partir do MIME armazenado no elemento
        const mime = img.dataset.mime || 'image/png';
        const extMap = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' };
        const ext = extMap[mime] || 'png';

        const link = document.createElement('a');
        link.href = img.src;
        link.download = 'imagem_' + new Date().getTime() + '.' + ext;
        link.click();

        AlertHelper.toast('Download iniciado!', 'success');
    }

    limparBase64ParaImagem() {
        document.getElementById('base64Input').value = '';
        document.getElementById('base64PreviewContainer').innerHTML = '<p class="text-white-50">A imagem aparecerá aqui</p>';
        document.getElementById('downloadImageBtn').disabled = true;
    }

    // ===== EDITOR DE TEXTO =====
    codificarTexto() {
        const textInput = document.getElementById('textInput').value;

        if (!textInput) {
            AlertHelper.warning('Campo vazio', 'Digite algo para codificar');
            return;
        }

        try {
            const bytes = new TextEncoder().encode(textInput);
            const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
            const encoded = btoa(binary);
            document.getElementById('textBase64Output').value = encoded;

            AlertHelper.toast('Codificado!', 'success', {
                text: 'Texto codificado com sucesso'
            });
        } catch (error) {
            AlertHelper.error('Erro', 'Erro ao codificar o texto');
        }
    }

    decodificarTexto() {
        const textBase64 = document.getElementById('textBase64Output').value.trim();

        if (!textBase64) {
            AlertHelper.warning('Campo vazio', 'Cole um Base64 para decodificar');
            return;
        }

        try {
            const binary = atob(textBase64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            const decoded = new TextDecoder().decode(bytes);
            document.getElementById('textInput').value = decoded;

            AlertHelper.toast('Decodificado!', 'success', {
                text: 'Texto decodificado com sucesso'
            });
        } catch (error) {
            AlertHelper.error('Erro', 'Base64 inválido ou não pode ser decodificado');
        }
    }

    copiarTexto() {
        const textBase64 = document.getElementById('textBase64Output').value;

        if (!textBase64) {
            AlertHelper.warning('Nada para copiar', 'Codifique um texto primeiro');
            return;
        }

        navigator.clipboard.writeText(textBase64).then(() => {
            AlertHelper.toast('Copiado!', 'success', {
                text: 'Texto Base64 copiado para área de transferência'
            });
        });
    }

    limparTexto() {
        document.getElementById('textInput').value = '';
        document.getElementById('textBase64Output').value = '';
    }
}

// Iniciar app quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PhoenixApp();
});