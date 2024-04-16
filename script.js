const baseUrl = 'https://virtserver.swaggerhub.com/bzll/devops/v1'; 

function fillTable() {
    const serverType = document.getElementById('serverType').value;

    fetch(`${baseUrl}/server?type=${serverType}`)
        .then(response => response.json())
        .then(servers => {
            const tableBody = document.querySelector('tbody');
            tableBody.innerHTML = '';

            servers.forEach(server => {
                fetch(`${baseUrl}/server/${server.host}/services`)
                    .then(response => response.json())
                    .then(services => {
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
            })
            .catch(error => console.error(`Erro ao ${selectedAction} o serviço ${serviceName} do servidor ${serverName}:`, error));
    });
    document.getElementById('serviceActions').value = "none";
}

function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('input[name="selectedServices"]');
    const checkAll = document.getElementById('checkAll');
    checkboxes.forEach(checkbox => {
        checkbox.checked = checkAll.checked;
    });
}

document.getElementById('syncServers').addEventListener('click', fillTable);

document.getElementById('syncServices').addEventListener('click', fillTable);

document.getElementById('serviceActions').addEventListener('change', performActionOnSelectedServices);

document.getElementById('checkAll').addEventListener('click', toggleSelectAll);

window.onload = fillTable;