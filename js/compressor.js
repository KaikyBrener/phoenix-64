/**
 * js/compressor.js
 * Aba "Imagem → 200 KB": comprime a imagem localmente (Canvas) até ≤ 200 KB.
 * Reutiliza: AlertHelper, converter._formatarTamanho (conversor.js)
 *            ImageOptimizationService.carregarImagem (services.js)
 */

const Compressor200Config = {
    limiteBytes: 200 * 1024,   // 200 KB
    qualidadeMax: 0.95,
    qualidadeMin: 0.7,          // abaixo disso reduz dimensões em vez de qualidade
    maxPixels: 16000000,        // proteção contra limite de canvas (ex.: iOS Safari)
    ladoMinimo: 32,
    tiposPermitidos: ['image/png', 'image/jpeg', 'image/webp']
};

class Compressor200KB {
    constructor() {
        this.resultado = null;   // { blob, url, nomeDownload }
        this.ocupado = false;
        this.setupEventListeners();
    }

    // ===== EVENTOS =====
    setupEventListeners() {
        const area = document.getElementById('upload200Area');
        const input = document.getElementById('input200');
        const btnDownload = document.getElementById('download200Btn');
        const btnLimpar = document.getElementById('limpar200Btn');

        if (!area || !input || !btnDownload) return;

        area.addEventListener('click', () => input.click());
        area.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                input.click();
            }
        });

        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });

        area.addEventListener('dragleave', () => {
            area.classList.remove('dragover');
        });

        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            this.processar(e.dataTransfer.files[0]);
        });

        input.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.processar(e.target.files[0]);
            }

            // Permite selecionar o mesmo arquivo novamente
            input.value = '';
        });

        btnDownload.addEventListener('click', () => this.baixar());

        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => this.limpar());
        }
    }

    // ===== FLUXO PRINCIPAL =====
    async processar(arquivo) {
        if (!arquivo || this.ocupado) return;

        if (!Compressor200Config.tiposPermitidos.includes(arquivo.type)) {
            AlertHelper.error(
                'Erro na validação',
                'Tipo de arquivo não suportado. Use PNG, JPG ou WEBP.'
            );
            return;
        }

        this.ocupado = true;

        try {
            AlertHelper.loading(
                'Processando...',
                'Comprimindo imagem para até 200 KB'
            );

            const resultado = await this.comprimir(arquivo);

            this.exibirResultado(arquivo, resultado);

            Swal.close();

            AlertHelper.toast('Sucesso!', 'success', {
                text: 'Imagem pronta para download'
            });

        } catch (erro) {
            Swal.close();

            AlertHelper.error(
                'Erro ao processar',
                erro.message
            );
        } finally {
            this.ocupado = false;
        }
    }

    // ===== COMPRESSÃO =====
    async comprimir(arquivo) {
        const limite = Compressor200Config.limiteBytes;

        // Já está dentro do limite: mantém os bytes originais (sem perda)
        if (arquivo.size <= limite) {
            return {
                blob: arquivo,
                extensao: this._extensaoOriginal(arquivo)
            };
        }

        const img = await ImageOptimizationService.carregarImagem(arquivo);

        // Escala inicial (só limita imagens gigantes)
        const pixels = img.width * img.height;

        let escala = pixels > Compressor200Config.maxPixels
            ? Math.sqrt(Compressor200Config.maxPixels / pixels)
            : 1;

        const temAlpha =
            arquivo.type === 'image/jpeg'
                ? false
                : this._temTransparencia(img);

        const mime = this._escolherFormato(arquivo.type, temAlpha);
        const semPerda = mime === 'image/png';

        while (true) {
            const largura = Math.max(
                1,
                Math.round(img.width * escala)
            );

            const altura = Math.max(
                1,
                Math.round(img.height * escala)
            );

            const canvas = this._desenhar(
                img,
                largura,
                altura,
                mime === 'image/jpeg'
            );

            const { blob, minimoBlob } = await this._melhorQualidade(
                canvas,
                mime,
                semPerda
            );

            if (blob) {
                return {
                    blob,
                    extensao: this._extensaoSaida(arquivo, blob.type)
                };
            }

            // Não coube nem na qualidade mínima: reduz dimensões
            if (Math.max(largura, altura) <= Compressor200Config.ladoMinimo) {
                throw new Error(
                    'Não foi possível reduzir a imagem para 200 KB.'
                );
            }

            const fator =
                Math.sqrt(limite / minimoBlob.size) * 0.97;

            escala *= Math.max(
                0.1,
                Math.min(0.92, fator)
            );
        }
    }

    /**
     * Busca a MAIOR qualidade cujo resultado seja ≤ limite.
     * Retorna { blob } se coube, ou { blob: null, minimoBlob } se nem a qualidade mínima coube.
     */
    async _melhorQualidade(canvas, mime, semPerda) {
        const limite = Compressor200Config.limiteBytes;
        const { qualidadeMax, qualidadeMin } = Compressor200Config;

        if (semPerda) {
            const blob = await this._codificar(canvas, mime);

            return blob.size <= limite
                ? { blob }
                : { blob: null, minimoBlob: blob };
        }

        // Qualidade mínima primeiro
        const minBlob = await this._codificar(
            canvas,
            mime,
            qualidadeMin
        );

        if (minBlob.size > limite) {
            return {
                blob: null,
                minimoBlob: minBlob
            };
        }

        const maxBlob = await this._codificar(
            canvas,
            mime,
            qualidadeMax
        );

        if (maxBlob.size <= limite) {
            return { blob: maxBlob };
        }

        let melhor = minBlob;
        let baixo = qualidadeMin;
        let alto = qualidadeMax;

        // Busca binária pela melhor qualidade
        for (let i = 0; i < 7; i++) {
            const meio = (baixo + alto) / 2;

            const blob = await this._codificar(
                canvas,
                mime,
                meio
            );

            if (blob.size <= limite) {
                melhor = blob;
                baixo = meio;
            } else {
                alto = meio;
            }
        }

        return { blob: melhor };
    }

    _codificar(canvas, mime, qualidade) {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    blob
                        ? resolve(blob)
                        : reject(
                            new Error(
                                'Falha ao codificar a imagem.'
                            )
                        );
                },
                mime,
                qualidade
            );
        });
    }

    _desenhar(img, largura, altura, fundoBranco) {
        const canvas = document.createElement('canvas');

        canvas.width = largura;
        canvas.height = altura;

        const ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // JPEG não tem transparência: fundo branco
        if (fundoBranco) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(
                0,
                0,
                largura,
                altura
            );
        }

        ctx.drawImage(
            img,
            0,
            0,
            largura,
            altura
        );

        return canvas;
    }

    // ===== FORMATO =====
    _suportaWebp() {
        const canvas = document.createElement('canvas');

        canvas.width = 1;
        canvas.height = 1;

        return canvas
            .toDataURL('image/webp')
            .startsWith('data:image/webp');
    }

    _escolherFormato(tipoOriginal, temAlpha) {
        if (tipoOriginal === 'image/jpeg') {
            return 'image/jpeg';
        }

        const webp = this._suportaWebp();

        if (tipoOriginal === 'image/webp') {
            if (webp) {
                return 'image/webp';
            }

            return temAlpha
                ? 'image/png'
                : 'image/jpeg';
        }

        // PNG:
        // sem transparência -> JPEG
        // com transparência -> WEBP
        if (!temAlpha) {
            return 'image/jpeg';
        }

        return webp
            ? 'image/webp'
            : 'image/png';
    }

    _temTransparencia(img) {
        const escala = Math.min(
            1,
            512 / Math.max(img.width, img.height)
        );

        const w = Math.max(
            1,
            Math.round(img.width * escala)
        );

        const h = Math.max(
            1,
            Math.round(img.height * escala)
        );

        const canvas = document.createElement('canvas');

        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            img,
            0,
            0,
            w,
            h
        );

        const dados = ctx
            .getImageData(0, 0, w, h)
            .data;

        for (let i = 3; i < dados.length; i += 4) {
            if (dados[i] < 255) {
                return true;
            }
        }

        return false;
    }

    _extensaoOriginal(arquivo) {
        const match = arquivo.name.match(/\.[^.]+$/);

        if (match) {
            return match[0]
                .substring(1)
                .toLowerCase();
        }

        return {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp'
        }[arquivo.type] || 'jpg';
    }

    _extensaoSaida(arquivo, mimeSaida) {
        // Mesmo formato do original
        if (mimeSaida === arquivo.type) {
            return this._extensaoOriginal(arquivo);
        }

        return {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp'
        }[mimeSaida] || 'jpg';
    }

    // ===== EXIBIÇÃO =====
    exibirResultado(arquivo, { blob, extensao }) {
        if (this.resultado) {
            URL.revokeObjectURL(this.resultado.url);
        }

        const url = URL.createObjectURL(blob);

        const base = arquivo.name.replace(
            /\.[^/.]+$/,
            ''
        );

        this.resultado = {
            blob,
            url,
            nomeDownload: `${base}_200kb.${extensao}`
        };

        const reducao = Math.max(
            0,
            ((arquivo.size - blob.size) / arquivo.size) * 100
        );

        document.getElementById(
            'tamanhoOriginal200'
        ).textContent = converter._formatarTamanho(
            arquivo.size
        );

        document.getElementById(
            'tamanhoFinal200'
        ).textContent = converter._formatarTamanho(
            blob.size
        );

        document.getElementById(
            'reducao200'
        ).textContent = reducao.toFixed(1) + '%';

        document.getElementById(
            'stats200'
        ).style.display = 'grid';

        const preview = document.getElementById(
            'preview200Container'
        );

        preview.innerHTML = '';

        const img = document.createElement('img');

        img.src = url;
        img.alt = 'Imagem comprimida';
        img.style.cssText =
            'max-width: 100%; max-height: 380px; border-radius: 0.5rem;';

        preview.appendChild(img);

        document.getElementById(
            'download200Btn'
        ).disabled = false;
    }

    // ===== DOWNLOAD =====
    baixar() {
        if (!this.resultado) return;

        const link = document.createElement('a');

        link.href = this.resultado.url;
        link.download = this.resultado.nomeDownload;
        link.style.display = 'none';

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        AlertHelper.toast(
            'Download iniciado!',
            'success'
        );
    }

    // ===== LIMPAR =====
    limpar() {
        if (this.resultado?.url) {
            URL.revokeObjectURL(
                this.resultado.url
            );
        }

        this.resultado = null;

        const input = document.getElementById(
            'input200'
        );

        if (input) {
            input.value = '';
        }

        const preview = document.getElementById(
            'preview200Container'
        );

        if (preview) {
            preview.innerHTML =
                '<p class="text-white-50">Sua imagem comprimida aparecerá aqui</p>';
        }

        const tamanhoOriginal = document.getElementById(
            'tamanhoOriginal200'
        );

        const tamanhoFinal = document.getElementById(
            'tamanhoFinal200'
        );

        const reducao = document.getElementById(
            'reducao200'
        );

        if (tamanhoOriginal) {
            tamanhoOriginal.textContent = '-';
        }

        if (tamanhoFinal) {
            tamanhoFinal.textContent = '-';
        }

        if (reducao) {
            reducao.textContent = '-';
        }

        const stats = document.getElementById(
            'stats200'
        );

        if (stats) {
            stats.style.display = 'none';
        }

        const btnDownload = document.getElementById(
            'download200Btn'
        );

        if (btnDownload) {
            btnDownload.disabled = true;
        }
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    window.compressor200 = new Compressor200KB();
});