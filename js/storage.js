/**
 * Gerenciador de Armazenamento
 * Gerencia a persistência local de histórico, favoritos e estatísticas.
 * - Histórico e favoritos: IndexedDB (dados grandes; Base64/preview)
 * - Stats e tentativas:    localStorage (pequenos, leitura síncrona necessária)
 */

class StorageManager {
    constructor() {
        this.historico = [];
        this.favoritos = [];
        this.stats = this.carregarStats();
        this._db = null;
        this._pronto = this._abrirDB();
    }

    // ===== INDEXEDDB =====
    _abrirDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('phoenix_v5', 1);

            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('historico')) {
                    db.createObjectStore('historico', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('favoritos')) {
                    db.createObjectStore('favoritos', { keyPath: 'id' });
                }
            };

            req.onsuccess = async (e) => {
                this._db = e.target.result;
                await this._migrarLocalStorage();
                await this._carregarTudoDoIDB();
                resolve();
            };

            req.onerror = () => {
                console.warn('[Storage] IndexedDB não disponível, usando localStorage como fallback.');
                // Fallback: carrega do localStorage
                this.historico = this._lsCarregar('phoenix_historico');
                this.favoritos = this._lsCarregar('phoenix_favoritos');
                resolve();
            };
        });
    }

    /** Migra dados existentes do localStorage para o IndexedDB (executa apenas uma vez) */
    async _migrarLocalStorage() {
        if (!this._db) return;
        const migrado = localStorage.getItem('phoenix_idb_migrado');
        if (migrado) return;

        const lsHistorico = this._lsCarregar('phoenix_historico');
        const lsFavoritos = this._lsCarregar('phoenix_favoritos');

        if (lsHistorico.length > 0) {
            await this._idbPutLote('historico', lsHistorico);
        }
        if (lsFavoritos.length > 0) {
            await this._idbPutLote('favoritos', lsFavoritos);
        }

        // Remove dados pesados do localStorage após migração
        localStorage.removeItem('phoenix_historico');
        localStorage.removeItem('phoenix_favoritos');
        localStorage.setItem('phoenix_idb_migrado', '1');
    }

    async _carregarTudoDoIDB() {
        this.historico = await this._idbGetAll('historico');
        // Ordena por timestamp desc (mais recente primeiro)
        this.historico.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        this.favoritos = await this._idbGetAll('favoritos');
        this.favoritos.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }

    // Helpers IDB
    _idbGetAll(store) {
        return new Promise((resolve) => {
            if (!this._db) return resolve([]);
            try {
                const tx = this._db.transaction(store, 'readonly');
                const req = tx.objectStore(store).getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => resolve([]);
            } catch { resolve([]); }
        });
    }

    _idbPut(store, item) {
        return new Promise((resolve) => {
            if (!this._db) return resolve();
            try {
                const tx = this._db.transaction(store, 'readwrite');
                tx.objectStore(store).put(item);
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            } catch { resolve(); }
        });
    }

    _idbPutLote(store, items) {
        return new Promise((resolve) => {
            if (!this._db || items.length === 0) return resolve();
            try {
                const tx = this._db.transaction(store, 'readwrite');
                const os = tx.objectStore(store);
                items.forEach(i => os.put(i));
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            } catch { resolve(); }
        });
    }

    _idbDelete(store, id) {
        return new Promise((resolve) => {
            if (!this._db) return resolve();
            try {
                const tx = this._db.transaction(store, 'readwrite');
                tx.objectStore(store).delete(id);
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            } catch { resolve(); }
        });
    }

    _idbClear(store) {
        return new Promise((resolve) => {
            if (!this._db) return resolve();
            try {
                const tx = this._db.transaction(store, 'readwrite');
                tx.objectStore(store).clear();
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            } catch { resolve(); }
        });
    }

    // Fallback helpers para localStorage
    _lsCarregar(chave) {
        try {
            const d = localStorage.getItem(chave);
            return d ? JSON.parse(d) : [];
        } catch { return []; }
    }

    _lsSalvar(chave, dados) {
        try {
            localStorage.setItem(chave, JSON.stringify(dados));
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                console.warn('[Storage] localStorage cheio, ignorando persistência de fallback.');
            }
        }
    }

    // ===== HISTÓRICO =====
    // Mantido síncrono em memória; persiste async no IDB
    carregarHistorico() { return this.historico; }

    salvarHistorico() {
        if (this._db) {
            // Não usa localStorage para histórico (dados grandes)
            return;
        }
        // Fallback localStorage
        this._lsSalvar('phoenix_historico', this.historico);
    }

    adicionarAoHistorico(item) {
        const novoItem = {
            id: Date.now(),
            nome: item.nome,
            tipo: item.tipo,
            tamanho: item.tamanho,
            base64: item.base64,
            preview: item.preview,
            data: new Date().toLocaleString('pt-BR'),
            timestamp: Date.now()
        };

        this.historico.unshift(novoItem);

        // Manter apenas 20 itens mais recentes (FIFO)
        if (this.historico.length > 20) {
            const removidos = this.historico.splice(20);
            // Remove do IDB os excedentes
            if (this._db) {
                removidos.forEach(r => this._idbDelete('historico', r.id));
            }
        }

        // Persiste async
        if (this._db) {
            this._idbPut('historico', novoItem);
        } else {
            this._lsSalvar('phoenix_historico', this.historico);
        }

        this.atualizarStats('conversoes');
        return novoItem;
    }

    obterHistorico() {
        return this.historico;
    }

    limparHistorico() {
        this.historico = [];
        if (this._db) {
            this._idbClear('historico');
        } else {
            this._lsSalvar('phoenix_historico', []);
        }
    }

    deletarDoHistorico(id) {
        this.historico = this.historico.filter(item => item.id !== id);
        if (this._db) {
            this._idbDelete('historico', id);
        } else {
            this._lsSalvar('phoenix_historico', this.historico);
        }
    }

    // ===== FAVORITOS =====
    salvarFavoritos() {
        if (this._db) return;
        this._lsSalvar('phoenix_favoritos', this.favoritos);
    }

    adicionarAosFavoritos(item) {
        const novoFavorito = {
            id: Date.now(),
            nome: item.nome,
            tipo: item.tipo,
            tamanho: item.tamanho,
            base64: item.base64,
            preview: item.preview,
            data: new Date().toLocaleString('pt-BR'),
            timestamp: Date.now()
        };

        // Verificar duplicatas
        if (this.favoritos.some(fav => fav.base64 === novoFavorito.base64)) {
            return { sucesso: false, mensagem: 'Este item já está nos favoritos!' };
        }

        this.favoritos.unshift(novoFavorito);

        if (this._db) {
            this._idbPut('favoritos', novoFavorito);
        } else {
            this._lsSalvar('phoenix_favoritos', this.favoritos);
        }

        return { sucesso: true, mensagem: 'Adicionado aos favoritos!' };
    }

    obterFavoritos() {
        return this.favoritos;
    }

    limparFavoritos() {
        this.favoritos = [];
        if (this._db) {
            this._idbClear('favoritos');
        } else {
            this._lsSalvar('phoenix_favoritos', []);
        }
    }

    deletarDosFavoritos(id) {
        this.favoritos = this.favoritos.filter(item => item.id !== id);
        if (this._db) {
            this._idbDelete('favoritos', id);
        } else {
            this._lsSalvar('phoenix_favoritos', this.favoritos);
        }
    }

    // ===== ESTATÍSTICAS (localStorage — pequenas, leitura síncrona) =====
    carregarStats() {
        try {
            const data = localStorage.getItem('phoenix_stats');
            return data ? JSON.parse(data) : this._statsDefault();
        } catch { return this._statsDefault(); }
    }

    _statsDefault() {
        return {
            totalConversoes: 0,
            conversoesHoje: 0,
            totalFavoritos: 0,
            ultimaConversao: null,
            dataUltimaLimpeza: new Date().toLocaleDateString('pt-BR')
        };
    }

    salvarStats() {
        try {
            localStorage.setItem('phoenix_stats', JSON.stringify(this.stats));
        } catch { /* ignora se localStorage estiver cheio */ }
    }

    atualizarStats(tipo) {
        const hoje = new Date().toLocaleDateString('pt-BR');
        const ultimaLimpeza = this.stats.dataUltimaLimpeza;

        // Resetar contador diário se for novo dia
        if (hoje !== ultimaLimpeza) {
            this.stats.conversoesHoje = 0;
            this.stats.dataUltimaLimpeza = hoje;
        }

        if (tipo === 'conversoes') {
            this.stats.totalConversoes++;
            this.stats.conversoesHoje++;
            this.stats.ultimaConversao = new Date().toLocaleString('pt-BR');
        }

        this.stats.totalFavoritos = this.favoritos.length;
        this.salvarStats();
    }

    obterStats() {
        // Sincroniza totalFavoritos com o array em memória
        this.stats.totalFavoritos = this.favoritos.length;
        return this.stats;
    }

    limparTudo() {
        localStorage.removeItem('phoenix_stats');
        localStorage.removeItem('phoenix_tentativas');
        this.historico = [];
        this.favoritos = [];
        this.stats = this._statsDefault();
        if (this._db) {
            this._idbClear('historico');
            this._idbClear('favoritos');
        } else {
            this._lsSalvar('phoenix_historico', []);
            this._lsSalvar('phoenix_favoritos', []);
        }
    }
}

const storage = new StorageManager();
