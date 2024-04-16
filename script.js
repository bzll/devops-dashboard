const baseUrl = 'https://virtserver.swaggerhub.com/bzll/devops/v1'; // URL base dos endpoints

// Função para preencher a tabela com os dados dos serviços
function fillTable() {
    const serverType = document.getElementById('serverType').value;

    fetch(`${baseUrl}/server?type=${serverType}`)
        .then(response => response.json())
        .then(servers => {
            const tableBody = document.querySelector('tbody');
            tableBody.innerHTML = '';

            servers.forEach(server => {
                // Obter os serviços para cada servidor
                fetch(`${baseUrl}/server/${server.host}/services`)
                    .then(response => response.json())
                    .then(services => {
                        // Preencher a tabela com os serviços obtidos
                        services.forEach(service => {
                            const row = document.createElement('tr');
                            let classStatus = 'error'
                            switch (service.status.toLowerCase()) {
                                case 'ok':
                                    classStatus = 'success'
                                    break;
                                case 'warning':
                                    classStatus = 'warning'
                                    break;
                                default:
                                    break;
                            }
                            row.innerHTML = `
                  <td>${server.host}</td>
                  <td>${server.ip}</td>
                  <td>${server.type}</td>
                  <td>${service.name}</td>
                  <td>${service.port}</td>
                  <td class="${classStatus}">${service.status}</td>
                  <td><button onclick="syncService('${server.host}', '${service.name}')">Sincronizar</button></td>
                  <td><input type="checkbox" name="selectedServices" value="${server.host},${service.name}"></td>
                `;
                            tableBody.appendChild(row);
                            document.getElementById('checkAll').checked = false;
                        });
                    })
                    .catch(error => console.error('Erro ao obter os serviços do servidor:', error));
            });
        })
        .catch(error => console.error('Erro ao preencher a tabela:', error));
}
// Função para sincronizar um serviço específico
function syncService(serverName, serviceName) {
    fetch(`${baseUrl}/server/${serverName}/services/${serviceName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao sincronizar o serviço');
            }
            alert(`Serviço ${serviceName} do servidor ${serverName} sincronizado com sucesso.`);
        })
        .catch(error => console.error('Erro ao sincronizar o serviço:', error));
}

// Função para reiniciar/iniciar/pausar serviços selecionados conforme a ação selecionada
function performActionOnSelectedServices() {
    const selectedAction = document.getElementById('serviceActions').value;

    const selectedServices = Array.from(document.querySelectorAll('input[name="selectedServices"]:checked'))
        .map(checkbox => checkbox.value.split(','));

    if (selectedServices.length === 0) {
        alert('Selecione pelo menos um serviço para executar a ação.');
        document.getElementById('serviceActions').value = "none";
        return;
    }

    selectedServices.forEach(([serverName, serviceName]) => {
        fetch(`${baseUrl}/server/${serverName}/services/${serviceName}/${selectedAction}`, { method: 'POST' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao ${selectedAction} do serviço ${serviceName} do servidor ${serverName}`);
                }
                alert(`Ação "${selectedAction}" aplicada com sucesso no serviço ${serviceName} do servidor ${serverName}.`);

                // Após a execução da ação, retornar selectedAction para "none"
            })
            .catch(error => console.error(`Erro ao ${selectedAction} o serviço ${serviceName} do servidor ${serverName}:`, error));
    });
    document.getElementById('serviceActions').value = "none";
}

// Event listener para o botão de sincronizar servidores
document.getElementById('syncServers').addEventListener('click', fillTable);

// Event listener para o botão de sincronizar serviços
document.getElementById('syncServices').addEventListener('click', fillTable);


// Atualização do evento para o menu suspenso de ações nos serviços selecionados
document.getElementById('serviceActions').addEventListener('change', performActionOnSelectedServices);

// Preencher a tabela com os dados ao carregar a página
window.onload = fillTable;

// Event listener para selecionar todos ou desmarcar todos ao clicar no título da coluna "Selecionar"
document.getElementById('checkAll').addEventListener('click', toggleSelectAll);

// Função para selecionar todos ou desmarcar todos
function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('input[name="selectedServices"]');
    const checkAll = document.getElementById('checkAll');
    checkboxes.forEach(checkbox => {
        checkbox.checked = checkAll.checked;
    });
}