        // Dados simulados dos projetos
        const projetosIniciais = [
            {
                id: 1,
                nome: "Campanha Outubro Rosa",
                descricao: "Organizar campanha de conscientização sobre o câncer de mama com palestras e distribuição de materiais informativos.",
                tarefas: [
                    { id: 1, texto: "Criar cartazes informativos", concluida: true },
                    { id: 2, texto: "Agendar palestra com profissional da saúde", concluida: false },
                    { id: 3, texto: "Organizar distribuição de laços rosa", concluida: false }
                ]
            },
            {
                id: 2,
                nome: "Festival Cultural",
                descricao: "Preparar e executar festival cultural da escola com apresentações de dança, música, teatro e exposições artísticas.",
                tarefas: [
                    { id: 1, texto: "Definir data e horário", concluida: true },
                    { id: 2, texto: "Selecionar apresentações", concluida: true },
                    { id: 3, texto: "Reservar auditório", concluida: false },
                    { id: 4, texto: "Preparar divulgação nas redes sociais", concluida: false }
                ]
            },
            {
                id: 3,
                nome: "Torneio Esportivo",
                descricao: "Organizar campeonato interclasses de futebol e vôlei com premiação para os vencedores.",
                tarefas: [
                    { id: 1, texto: "Coletar inscrições das equipes", concluida: true },
                    { id: 2, texto: "Montar chaveamento", concluida: false },
                    { id: 3, texto: "Comprar troféus", concluida: false }
                ]
            },
            {
                id: 4,
                nome: "Reforma do Pátio",
                descricao: "Coordenar mutirão de pintura e revitalização do pátio escolar com participação de alunos e professores.",
                tarefas: [
                    { id: 1, texto: "Comprar tintas e materiais", concluida: false },
                    { id: 2, texto: "Definir data do mutirão", concluida: false },
                    { id: 3, texto: "Criar design das pinturas", concluida: true }
                ]
            },
            {
                id: 5,
                nome: "Arrecadação Solidária",
                descricao: "Campanha de arrecadação de alimentos e agasalhos para doação a instituições de caridade da comunidade.",
                tarefas: [
                    { id: 1, texto: "Identificar instituições parceiras", concluida: true },
                    { id: 2, texto: "Divulgar campanha nas salas", concluida: true },
                    { id: 3, texto: "Organizar pontos de coleta", concluida: true },
                    { id: 4, texto: "Agendar entrega das doações", concluida: false }
                ]
            },
            {
                id: 6,
                nome: "Rádio Escolar",
                descricao: "Implementar sistema de rádio no intervalo com músicas escolhidas pelos alunos e informativos sobre eventos.",
                tarefas: [
                    { id: 1, texto: "Testar equipamento de som", concluida: true },
                    { id: 2, texto: "Criar playlist semanal", concluida: false },
                    { id: 3, texto: "Recrutar apresentadores", concluida: false }
                ]
            }
        ];

        let projetos = [];
        let projetoAtual = null;

        // Carregar projetos do localStorage ou usar dados iniciais
        function carregarProjetos() {
            try {
                const saved = localStorage.getItem('ligaProjetos');
                if (saved) {
                    projetos = JSON.parse(saved);
                } else {
                    projetos = JSON.parse(JSON.stringify(projetosIniciais));
                    salvarProjetos();
                }
            } catch (error) {
                console.error('Erro ao carregar projetos:', error);
                projetos = JSON.parse(JSON.stringify(projetosIniciais));
            }
        }

        // Salvar projetos no localStorage
        function salvarProjetos() {
            try {
                localStorage.setItem('ligaProjetos', JSON.stringify(projetos));
            } catch (error) {
                console.error('Erro ao salvar projetos:', error);
            }
        }

        // Calcular progresso do projeto
        function calcularProgresso(projeto) {
            if (!projeto || !projeto.tarefas || projeto.tarefas.length === 0) return 0;
            const concluidas = projeto.tarefas.filter(t => t.concluida).length;
            return Math.round((concluidas / projeto.tarefas.length) * 100);
        }

        // Renderizar grid de projetos
        function renderizarProjetos() {
            const grid = document.getElementById('projetos-grid');
            if (!grid) return;
            
            grid.innerHTML = '';

            projetos.forEach(projeto => {
                const progresso = calcularProgresso(projeto);
                const card = document.createElement('div');
                card.className = 'projeto-dia-card';
                card.innerHTML = `
                    <div class="projeto-dia-header">${projeto.nome}</div>
                    <div class="projeto-progress">
                        <div class="progress-wrapper">
                            <div class="progress-bar-bg">
                                <div class="progress-bar-fill" style="width: ${progresso}%"></div>
                            </div>
                            <span class="progress-percent">${progresso}%</span>
                        </div>
                    </div>
                    <p class="projeto-descricao">${projeto.descricao}</p>
                    <div class="projeto-footer">
                        <button class="btn-abrir" data-projeto-id="${projeto.id}">Abrir tarefas</button>
                    </div>
                `;
                grid.appendChild(card);
            });

            // Adicionar event listeners aos botões
            document.querySelectorAll('.btn-abrir').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    const projetoId = parseInt(this.getAttribute('data-projeto-id'));
                    abrirPopup(projetoId);
                });
            });
        }

        // Abrir popup
        function abrirPopup(projetoId) {
            projetoAtual = projetos.find(p => p.id === projetoId);
            if (!projetoAtual) {
                console.error('Projeto não encontrado:', projetoId);
                return;
            }

            const nomeEl = document.getElementById('popup-nome-projeto');
            const descEl = document.getElementById('popup-descricao');
            
            if (nomeEl) nomeEl.textContent = projetoAtual.nome;
            if (descEl) descEl.textContent = projetoAtual.descricao;
            
            atualizarProgressoPopup();
            renderizarTarefas();

            const overlay = document.getElementById('popup-overlay');
            if (overlay) overlay.classList.add('active');
        }

        // Fechar popup
        function fecharPopup() {
            const overlay = document.getElementById('popup-overlay');
            if (overlay) overlay.classList.remove('active');
            projetoAtual = null;
            renderizarProjetos();
        }

        // Atualizar barra de progresso do popup
        function atualizarProgressoPopup() {
            if (!projetoAtual) return;
            
            const progresso = calcularProgresso(projetoAtual);
            const fillEl = document.getElementById('popup-progress-fill');
            const percentEl = document.getElementById('popup-progress-percent');
            
            if (fillEl) fillEl.style.width = progresso + '%';
            if (percentEl) percentEl.textContent = progresso + '%';
        }

        // Renderizar lista de tarefas
        function renderizarTarefas() {
            if (!projetoAtual) return;
            
            const lista = document.getElementById('popup-tarefas-lista');
            if (!lista) return;
            
            lista.innerHTML = '';

            projetoAtual.tarefas.forEach(tarefa => {
                const li = document.createElement('li');
                li.className = 'tarefa-item' + (tarefa.concluida ? ' concluida' : '');
                li.innerHTML = `
                    <input type="checkbox" class="tarefa-checkbox" ${tarefa.concluida ? 'checked' : ''} data-tarefa-id="${tarefa.id}">
                    <span class="tarefa-texto">${tarefa.texto}</span>
                    <button class="tarefa-excluir" data-tarefa-id="${tarefa.id}">×</button>
                `;
                lista.appendChild(li);
            });

            // Event listeners para checkboxes
            document.querySelectorAll('.tarefa-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', function(e) {
                    const tarefaId = parseInt(this.getAttribute('data-tarefa-id'));
                    toggleTarefa(tarefaId);
                });
            });

            // Event listeners para botões excluir tarefa
            document.querySelectorAll('.tarefa-excluir').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    const tarefaId = parseInt(this.getAttribute('data-tarefa-id'));
                    excluirTarefa(tarefaId);
                });
            });
        }

        // Toggle tarefa concluída
        function toggleTarefa(tarefaId) {
            if (!projetoAtual) return;
            
            const tarefa = projetoAtual.tarefas.find(t => t.id === tarefaId);
            if (tarefa) {
                tarefa.concluida = !tarefa.concluida;
                salvarProjetos();
                atualizarProgressoPopup();
                renderizarTarefas();
            }
        }

        // Adicionar nova tarefa
        function adicionarTarefa() {
            if (!projetoAtual) return;
            
            const input = document.getElementById('input-nova-tarefa');
            if (!input) return;
            
            const texto = input.value.trim();

            if (texto === '') return;

            const novoId = projetoAtual.tarefas.length > 0 
                ? Math.max(...projetoAtual.tarefas.map(t => t.id)) + 1 
                : 1;

            projetoAtual.tarefas.push({
                id: novoId,
                texto: texto,
                concluida: false
            });

            input.value = '';
            salvarProjetos();
            atualizarProgressoPopup();
            renderizarTarefas();
        }

        // Excluir tarefa
        function excluirTarefa(tarefaId) {
            if (!projetoAtual) return;
            
            if (confirm('Deseja realmente excluir esta tarefa?')) {
                projetoAtual.tarefas = projetoAtual.tarefas.filter(t => t.id !== tarefaId);
                salvarProjetos();
                atualizarProgressoPopup();
                renderizarTarefas();
            }
        }

        // Excluir projeto
        function excluirProjeto() {
            if (!projetoAtual) return;
            
            if (confirm(`Deseja realmente excluir o projeto "${projetoAtual.nome}"?`)) {
                projetos = projetos.filter(p => p.id !== projetoAtual.id);
                salvarProjetos();
                fecharPopup();
            }
        }

        // Event Listeners
        function inicializarEventListeners() {
            const btnFechar = document.getElementById('btn-fechar-popup');
            if (btnFechar) {
                btnFechar.addEventListener('click', fecharPopup);
            }

            const overlay = document.getElementById('popup-overlay');
            if (overlay) {
                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) {
                        fecharPopup();
                    }
                });
            }

            const btnAdd = document.getElementById('btn-add-tarefa');
            if (btnAdd) {
                btnAdd.addEventListener('click', adicionarTarefa);
            }

            const inputNova = document.getElementById('input-nova-tarefa');
            if (inputNova) {
                inputNova.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        adicionarTarefa();
                    }
                });
            }

            const btnExcluir = document.getElementById('btn-excluir-projeto');
            if (btnExcluir) {
                btnExcluir.addEventListener('click', excluirProjeto);
            }
        }

        // Inicializar quando o DOM estiver pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                carregarProjetos();
                renderizarProjetos();
                inicializarEventListeners();
            });
        } else {
            carregarProjetos();
            renderizarProjetos();
            inicializarEventListeners();
        }