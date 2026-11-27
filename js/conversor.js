/**
 * Gerenciador de Conversão de Imagens
 * Processa Base64, validação de arquivos e tratamento de imagens
 */

class ConversorImagens {
    constructor() {
        this.imagemAtual = null;
        this.base64Atual = null;
        this.metadadosAtual = null;
        
        // Estratégia Padrão (Retrocompatibilidade)
        this.estrategia = new StandardConversionStrategy();
    }

    setEstrategia(estrategia) {
        this.estrategia = estrategia;
    }

    validarImagem(arquivo) {
        const tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
        const tamanhoMaximo = 3 * 1024 * 1024; // 3MB (Garante que o Base64 final não passe de ~4MB)

        if (!tiposPermitidos.includes(arquivo.type)) {
            return {
                valido: false,
                erro: 'Tipo de arquivo não suportado. Use PNG, JPG, JPEG, GIF ou WEBP.'
            };
        }

        if (arquivo.size > tamanhoMaximo) {
            return {
                valido: false,
                erro: 'Arquivo muito grande. Tamanho máximo permitido: 3MB.'
            };
        }

        return { valido: true };
    }

    converterParaBase64(arquivo) {
        return new Promise(async (resolve, reject) => {
            try {
                // Delega o processamento real para a estratégia selecionada
                const { base64, metadados } = await this.estrategia.processar(arquivo, this);
                
                this.imagemAtual = arquivo;
                this.base64Atual = base64;
                this.metadadosAtual = metadados;
                
                resolve({ base64, metadados });
            } catch (erro) {
                reject(erro);
            }
        });
    }

    gerarPreview(arquivo) {
        return new Promise((resolve, reject) => {
            const leitor = new FileReader();

            leitor.onload = (e) => {
                const urlPreview = e.target.result;
                const img = new Image();

                img.onload = () => {
                    resolve({
                        url: urlPreview,
                        largura: img.naturalWidth,
                        altura: img.naturalHeight
                    });
                };

                img.onerror = () => reject(new Error('Erro ao gerar preview'));
                img.src = urlPreview;
            };

            leitor.onerror = () => reject(new Error('Erro ao processar arquivo'));
            leitor.readAsDataURL(arquivo);
        });
    }

    _formatarTamanho(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const tamanhos = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + tamanhos[i];
    }

    obterTamanhoBase64(arquivoImagem) {
        // Base64 é aproximadamente 33% maior que o original
        const tamanhoBase64 = Math.ceil((arquivoImagem.size / 3) * 4);
        return this._formatarTamanho(tamanhoBase64);
    }

    calcularTamanhoReduzido(arquivoImagem) {
        return this.obterTamanhoBase64(arquivoImagem);
    }

    obterProporção(arquivoImagem) {
        const original = arquivoImagem.size;
        const codificado = Math.ceil((original / 3) * 4);
        return `1:${(codificado / original).toFixed(2)}`;
    }

    calcularProporção(arquivoImagem) {
        return this.obterProporção(arquivoImagem);
    }

    obterImagemAtual() {
        return this.imagemAtual;
    }

    obterBase64Atual() {
        return this.base64Atual;
    }

    obterMetadadosAtual() {
        return this.metadadosAtual;
    }

    limpar() {
        this.imagemAtual = null;
        this.base64Atual = null;
        this.metadadosAtual = null;
    }
}

class AlertHelper {
    static theme = {
        confirmButtonColor: '#ff6b35',
        background: '#1a1a1a',
        color: '#fff'
    };

    static fire(opcoes) {
        if (typeof Swal !== 'undefined') return Swal.fire(opcoes);
        return this.fallback(opcoes);
    }

    static close() {
        if (typeof Swal !== 'undefined') Swal.close();
    }

    // Usado quando o SweetAlert2 não carregou (CDN bloqueado ou offline)
    static fallback(opcoes) {
        const msg = [opcoes.title, opcoes.text].filter(Boolean).join('\n');
        if (opcoes.toast || opcoes.timer || opcoes.didOpen) {
            console.warn(msg);
            return Promise.resolve({ isConfirmed: false });
        }
        if (opcoes.showCancelButton) {
            return Promise.resolve({ isConfirmed: window.confirm(msg) });
        }
        window.alert(msg);
        return Promise.resolve({ isConfirmed: true });
    }

    static success(title, text, options = {}) {
        return this.fire({
            title,
            text,
            icon: 'success',
            ...this.theme,
            timer: 2000,
            ...options
        });
    }

    static error(title, text, options = {}) {
        return this.fire({
            title,
            text,
            icon: 'error',
            ...this.theme,
            ...options
        });
    }

    static warning(title, text, options = {}) {
        return this.fire({
            title,
            text,
            icon: 'warning',
            ...this.theme,
            ...options
        });
    }

    static info(title, text, options = {}) {
        return this.fire({
            title,
            text,
            icon: 'info',
            ...this.theme,
            ...options
        });
    }

    static confirm(title, text, options = {}) {
        return this.fire({
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6b35',
            cancelButtonColor: '#666',
            confirmButtonText: 'Sim',
            cancelButtonText: 'Cancelar',
            ...this.theme,
            ...options
        });
    }

    static loading(title = 'Processando...', text = '') {
        return this.fire({
            title,
            text,
            icon: 'info',
            allowOutsideClick: false,
            didOpen: () => { if (typeof Swal !== 'undefined') Swal.showLoading(); },
            ...this.theme
        });
    }

    static toast(title, icon = 'success', options = {}) {
        return this.fire({
            title,
            icon,
            timer: 2000,
            toast: true,
            position: 'top-end',
            ...this.theme,
            ...options
        });
    }
}

const converter = new ConversorImagens();
