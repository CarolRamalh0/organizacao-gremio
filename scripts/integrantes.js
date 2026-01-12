// Aguardar o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script carregado com sucesso!');

    // Elementos do popup de visualização/edição
    const popupOverlay = document.getElementById('popupOverlay');
    const popupClose = document.getElementById('popupClose');
    const popupCargo = document.getElementById('popupCargo');
    const popupNome = document.getElementById('popupNome');
    const popupTurno = document.getElementById('popupTurno');
    const popupDescricao = document.getElementById('popupDescricao');
    const popupAvatar = document.getElementById('popupAvatar');
    const avatarInput = document.getElementById('avatarInput');
    const avatarUploadTrigger = document.getElementById('avatarUploadTrigger');

    // Botões de ação
    const btnEditar = document.getElementById('btnEditar');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnCancelar = document.getElementById('btnCancelar');

    // Variáveis de controle
    let cardAtual = null;
    let dadosOriginais = {};
    let modoEdicao = false;
    let novaImagemAvatar = null;

    // Sistema de armazenamento persistente
    const STORAGE_KEY = 'integrantes_data';

    // Carregar dados salvos ao iniciar
    function carregarDadosSalvos() {
        try {
            const dadosSalvos = localStorage.getItem(STORAGE_KEY);
            if (dadosSalvos) {
                return JSON.parse(dadosSalvos);
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
        return {};
    }

    // Salvar dados no armazenamento
    function salvarDados(dados) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
            console.log('Dados salvos com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            alert('Erro ao salvar dados. Verifique o espaço de armazenamento.');
        }
    }

    // Gerar ID único para cada card
    function gerarIdCard(card) {
        const index = Array.from(document.querySelectorAll('.integrante-card')).indexOf(card);
        return `card_${index}`;
    }

    // Função para abrir popup de um card
    function abrirPopupCard(card) {
        console.log('Abrindo popup para card:', card);
        
        cardAtual = card;
        
        const cargo = card.getAttribute('data-cargo');
        const nome = card.getAttribute('data-nome');
        const turno = card.getAttribute('data-turno');
        const descricao = card.getAttribute('data-descricao');
        const imagem = card.getAttribute('data-imagem') || '';

        dadosOriginais = { cargo, nome, turno, descricao, imagem };
        novaImagemAvatar = null;

        popupCargo.textContent = cargo;
        popupNome.textContent = nome;
        popupTurno.textContent = turno;
        popupDescricao.textContent = descricao;

        const imgExistente = popupAvatar.querySelector('img');
        if (imgExistente) {
            imgExistente.remove();
        }
        
        if (imagem) {
            const img = document.createElement('img');
            img.src = imagem;
            popupAvatar.insertBefore(img, popupAvatar.firstChild);
        }

        desativarModoEdicao();

        popupOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        
        console.log('Popup aberto!');
    }

    // Aplicar dados salvos aos cards
    function aplicarDadosSalvos() {
        const dadosSalvos = carregarDadosSalvos();
        const cards = document.querySelectorAll('.integrante-card');
        
        cards.forEach(card => {
            const cardId = gerarIdCard(card);
            const dadosCard = dadosSalvos[cardId];
            
            if (dadosCard) {
                card.setAttribute('data-cargo', dadosCard.cargo);
                card.setAttribute('data-nome', dadosCard.nome);
                card.setAttribute('data-turno', dadosCard.turno);
                card.setAttribute('data-descricao', dadosCard.descricao);
                
                if (dadosCard.imagem) {
                    card.setAttribute('data-imagem', dadosCard.imagem);
                }

                const cargoEl = card.querySelector('.integrante-cargo');
                const nomeEl = card.querySelector('.integrante-nome');
                const turnoEl = card.querySelector('.integrante-turno');
                const avatarEl = card.querySelector('.integrante-avatar');

                if (cargoEl) cargoEl.textContent = dadosCard.cargo;
                if (nomeEl) nomeEl.textContent = dadosCard.nome;
                if (turnoEl) turnoEl.innerHTML = `<strong>Turno:</strong> ${dadosCard.turno}`;
                
                if (dadosCard.imagem && avatarEl) {
                    let img = avatarEl.querySelector('img');
                    if (!img) {
                        img = document.createElement('img');
                        avatarEl.appendChild(img);
                    }
                    img.src = dadosCard.imagem;
                }
            }
        });
    }

    // Adicionar eventos de clique aos cards
    function adicionarEventosCards() {
        const cards = document.querySelectorAll('.integrante-card');
        console.log('Adicionando eventos a', cards.length, 'cards');
        
        cards.forEach((card, index) => {
            card.addEventListener('click', function(e) {
                console.log('Card clicado:', index);
                abrirPopupCard(card);
            });
        });
    }

    // Aplicar dados salvos e adicionar eventos
    aplicarDadosSalvos();
    adicionarEventosCards();

    // Upload de imagem do avatar (edição)
    if (avatarUploadTrigger) {
        avatarUploadTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (modoEdicao) {
                avatarInput.click();
            }
        });
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    novaImagemAvatar = event.target.result;
                    
                    let imgElement = popupAvatar.querySelector('img');
                    if (!imgElement) {
                        imgElement = document.createElement('img');
                        popupAvatar.insertBefore(imgElement, popupAvatar.firstChild);
                    }
                    imgElement.src = novaImagemAvatar;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // ============================================================
    // FUNCIONALIDADE DE ADICIONAR NOVO INTEGRANTE
    // ============================================================

    const btnAdicionar = document.querySelector('.btn-adicionar');
    const popupAdicionar = document.getElementById('popupAdicionar');
    const popupAdicionarClose = document.getElementById('popupAdicionarClose');
    const btnAdicionarSalvar = document.getElementById('btnAdicionarSalvar');
    const btnAdicionarCancelar = document.getElementById('btnAdicionarCancelar');

    const popupNovoCargo = document.getElementById('popupNovoCargo');
    const popupNovoNome = document.getElementById('popupNovoNome');
    const popupNovoTurno = document.getElementById('popupNovoTurno');
    const popupNovaDescricao = document.getElementById('popupNovaDescricao');
    const popupNovoAvatar = document.getElementById('popupNovoAvatar');
    const novoAvatarInput = document.getElementById('novoAvatarInput');

    let novaImagemNovoIntegrante = null;

    // Abrir popup de adicionar
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', () => {
            console.log('Botão adicionar clicado');
            
            popupNovoCargo.textContent = 'Cargo';
            popupNovoNome.textContent = 'Nome Completo';
            popupNovoTurno.textContent = 'Manhã / Tarde / Integral';
            popupNovaDescricao.textContent = 'Digite a descrição das responsabilidades e atividades do integrante...';
            
            const imgExistente = popupNovoAvatar.querySelector('img');
            if (imgExistente) imgExistente.remove();
            novaImagemNovoIntegrante = null;
            novoAvatarInput.value = '';
            
            popupAdicionar.classList.add('open');
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => popupNovoCargo.focus(), 100);
        });
    }

    // Upload de imagem para novo integrante
    if (popupNovoAvatar) {
        popupNovoAvatar.addEventListener('click', () => {
            novoAvatarInput.click();
        });
    }

    if (novoAvatarInput) {
        novoAvatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    novaImagemNovoIntegrante = event.target.result;
                    
                    let imgElement = popupNovoAvatar.querySelector('img');
                    if (!imgElement) {
                        imgElement = document.createElement('img');
                        popupNovoAvatar.insertBefore(imgElement, popupNovoAvatar.firstChild);
                    }
                    imgElement.src = novaImagemNovoIntegrante;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Função para criar novo card de integrante
    function criarNovoCard(dados) {
        const card = document.createElement('div');
        card.className = 'integrante-card';
        card.setAttribute('data-cargo', dados.cargo);
        card.setAttribute('data-nome', dados.nome);
        card.setAttribute('data-turno', dados.turno);
        card.setAttribute('data-descricao', dados.descricao);
        
        if (dados.imagem) {
            card.setAttribute('data-imagem', dados.imagem);
        }

        card.innerHTML = `
            <div class="integrante-avatar">
                ${dados.imagem ? `<img src="${dados.imagem}" alt="${dados.nome}">` : ''}
            </div>
            <div class="integrante-info">
                <div class="integrante-cargo">${dados.cargo}</div>
                <div class="integrante-nome">${dados.nome}</div>
                <div class="integrante-turno"><strong>Turno:</strong> ${dados.turno}</div>
            </div>
        `;

        card.addEventListener('click', () => abrirPopupCard(card));

        return card;
    }

    // Salvar novo integrante
    if (btnAdicionarSalvar) {
        btnAdicionarSalvar.addEventListener('click', () => {
            const cargo = popupNovoCargo.textContent.trim();
            const nome = popupNovoNome.textContent.trim();
            const turno = popupNovoTurno.textContent.trim();
            const descricao = popupNovaDescricao.textContent.trim();

            if (!cargo || cargo === 'Cargo' || !nome || nome === 'Nome Completo' || 
                !turno || turno === 'Manhã / Tarde / Integral' || 
                !descricao || descricao === 'Digite a descrição das responsabilidades e atividades do integrante...') {
                alert('Por favor, preencha todos os campos!');
                return;
            }

            const novoIntegrante = {
                cargo,
                nome,
                turno,
                descricao,
                imagem: novaImagemNovoIntegrante || ''
            };

            const novoCard = criarNovoCard(novoIntegrante);
            const grid = document.querySelector('.integrantes-grid');
            grid.appendChild(novoCard);

            const dadosSalvos = carregarDadosSalvos();
            const cardId = gerarIdCard(novoCard);
            dadosSalvos[cardId] = novoIntegrante;
            salvarDados(dadosSalvos);

            popupAdicionar.classList.remove('open');
            document.body.style.overflow = 'auto';

            alert('✅ Integrante adicionado com sucesso!');
        });
    }

    // Cancelar adição
    if (btnAdicionarCancelar) {
        btnAdicionarCancelar.addEventListener('click', () => {
            popupAdicionar.classList.remove('open');
            document.body.style.overflow = 'auto';
        });
    }

    // Fechar popup adicionar com X
    if (popupAdicionarClose) {
        popupAdicionarClose.addEventListener('click', () => {
            popupAdicionar.classList.remove('open');
            document.body.style.overflow = 'auto';
        });
    }

    // Fechar popup adicionar clicando fora
    if (popupAdicionar) {
        popupAdicionar.addEventListener('click', (e) => {
            if (e.target === popupAdicionar) {
                popupAdicionar.classList.remove('open');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Ativar modo de edição
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            modoEdicao = true;

            popupCargo.contentEditable = true;
            popupCargo.classList.add('editavel');
            
            popupNome.contentEditable = true;
            popupNome.classList.add('editavel');
            
            popupTurno.contentEditable = true;
            popupTurno.classList.add('editavel');
            
            popupDescricao.contentEditable = true;
            popupDescricao.classList.add('editavel');

            btnEditar.classList.add('hidden');
            btnSalvar.classList.remove('hidden');
            btnCancelar.classList.remove('hidden');

            popupCargo.focus();
        });
    }

    // Salvar alterações
    if (btnSalvar) {
        btnSalvar.addEventListener('click', () => {
            const novoCargo = popupCargo.textContent.trim();
            const novoNome = popupNome.textContent.trim();
            const novoTurno = popupTurno.textContent.trim();
            const novaDescricao = popupDescricao.textContent.trim();

            if (!novoCargo || !novoNome || !novoTurno || !novaDescricao) {
                alert('Por favor, preencha todos os campos!');
                return;
            }

            if (cardAtual) {
                const imagemFinal = novaImagemAvatar || dadosOriginais.imagem || '';
                
                cardAtual.setAttribute('data-cargo', novoCargo);
                cardAtual.setAttribute('data-nome', novoNome);
                cardAtual.setAttribute('data-turno', novoTurno);
                cardAtual.setAttribute('data-descricao', novaDescricao);

                if (imagemFinal) {
                    cardAtual.setAttribute('data-imagem', imagemFinal);
                    
                    const cardAvatar = cardAtual.querySelector('.integrante-avatar');
                    let cardImg = cardAvatar.querySelector('img');
                    if (!cardImg) {
                        cardImg = document.createElement('img');
                        cardAvatar.appendChild(cardImg);
                    }
                    cardImg.src = imagemFinal;
                }

                const cargoEl = cardAtual.querySelector('.integrante-cargo');
                const nomeEl = cardAtual.querySelector('.integrante-nome');
                const turnoEl = cardAtual.querySelector('.integrante-turno');

                if (cargoEl) cargoEl.textContent = novoCargo;
                if (nomeEl) nomeEl.textContent = novoNome;
                if (turnoEl) turnoEl.innerHTML = `<strong>Turno:</strong> ${novoTurno}`;

                const cardId = gerarIdCard(cardAtual);
                const dadosSalvos = carregarDadosSalvos();
                
                dadosSalvos[cardId] = {
                    cargo: novoCargo,
                    nome: novoNome,
                    turno: novoTurno,
                    descricao: novaDescricao,
                    imagem: imagemFinal
                };
                
                salvarDados(dadosSalvos);
            }

            dadosOriginais = {
                cargo: novoCargo,
                nome: novoNome,
                turno: novoTurno,
                descricao: novaDescricao,
                imagem: novaImagemAvatar || dadosOriginais.imagem
            };

            desativarModoEdicao();
            
            alert('✅ Dados salvos com sucesso!');
        });
    }

    // Cancelar edição
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            popupCargo.textContent = dadosOriginais.cargo;
            popupNome.textContent = dadosOriginais.nome;
            popupTurno.textContent = dadosOriginais.turno;
            popupDescricao.textContent = dadosOriginais.descricao;

            const imgExistente = popupAvatar.querySelector('img');
            if (imgExistente) {
                imgExistente.remove();
            }
            
            if (dadosOriginais.imagem) {
                const img = document.createElement('img');
                img.src = dadosOriginais.imagem;
                popupAvatar.insertBefore(img, popupAvatar.firstChild);
            }

            novaImagemAvatar = null;
            avatarInput.value = '';

            desativarModoEdicao();
        });
    }

    // Função para desativar modo de edição
    function desativarModoEdicao() {
        modoEdicao = false;

        popupCargo.contentEditable = false;
        popupCargo.classList.remove('editavel');
        
        popupNome.contentEditable = false;
        popupNome.classList.remove('editavel');
        
        popupTurno.contentEditable = false;
        popupTurno.classList.remove('editavel');
        
        popupDescricao.contentEditable = false;
        popupDescricao.classList.remove('editavel');

        btnEditar.classList.remove('hidden');
        btnSalvar.classList.add('hidden');
        btnCancelar.classList.add('hidden');
    }

    // Fechar popup quando clicar no botão X
    if (popupClose) {
        popupClose.addEventListener('click', () => {
            if (modoEdicao) {
                const confirmar = confirm('Você tem alterações não salvas. Deseja realmente fechar?');
                if (!confirmar) return;
            }
            
            popupOverlay.classList.remove('open');
            document.body.style.overflow = 'auto';
            desativarModoEdicao();
        });
    }

    // Fechar popup ao clicar fora do modal
    if (popupOverlay) {
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                if (modoEdicao) {
                    const confirmar = confirm('Você tem alterações não salvas. Deseja realmente fechar?');
                    if (!confirmar) return;
                }
                
                popupOverlay.classList.remove('open');
                document.body.style.overflow = 'auto';
                desativarModoEdicao();
            }
        });
    }

    // Fechar popup com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (popupOverlay && popupOverlay.classList.contains('open')) {
                if (modoEdicao) {
                    const confirmar = confirm('Você tem alterações não salvas. Deseja realmente fechar?');
                    if (!confirmar) return;
                }
                
                popupOverlay.classList.remove('open');
                document.body.style.overflow = 'auto';
                desativarModoEdicao();
            }
            
            if (popupAdicionar && popupAdicionar.classList.contains('open')) {
                popupAdicionar.classList.remove('open');
                document.body.style.overflow = 'auto';
            }
        }
    });

    console.log('Todos os eventos configurados com sucesso!');
});