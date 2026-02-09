console.log('🚀 Classificador de Frutas iniciado');

// Current project data
let currentProject = {
    projectNumber: '',
    limits: {
        codornaMin: 0,
        codornaMax: 0,
        galinhaMin: 0,
        galinhaMax: 0,
        laranjaMin: 0,
        laranjaMax: 0,
        cocoVerdeMin: 0,
        cocoVerdeMax: 0,
        cocoSecoMin: 0,
        cocoSecoMax: 0
    },
    tests: {
        testemunha1: [],
        testemunha2: [],
        teste1: [],
        teste2: []
    }
};

// Saved projects for comparison
let savedProjects = [];

// Chart instance
let comparisonChart = null;

// Confirm dialog
let confirmResolve = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadSavedProjects();
});

function initializeEventListeners() {
    // Project number input
    document.getElementById('projectNumber').addEventListener('input', (e) => {
        currentProject.projectNumber = e.target.value;
        updateSaveButton();
    });

    // Limit inputs
    const limitInputs = [
        'codornaMin', 'codornaMax', 'galinhaMin', 'galinhaMax',
        'laranjaMin', 'laranjaMax', 'cocoVerdeMin', 'cocoVerdeMax',
        'cocoSecoMin', 'cocoSecoMax'
    ];
    
    limitInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                currentProject.limits[id] = parseFloat(e.target.value) || 0;
                validateLimits();
                updateResults();
            });
        }
    });

    // Add value buttons
    document.querySelectorAll('.add-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const test = ['testemunha1', 'testemunha2', 'teste1', 'teste2'][index];
            const input = btn.previousElementSibling;
            const value = parseFloat(input.value);

            if (!isNaN(value) && value > 0) {
                addValue(test, value);
                input.value = '';
                updateResults();
                updateSaveButton();
            }
        });
    });

    // Enter key on inputs
    document.querySelectorAll('.input-group input').forEach((input, index) => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const test = ['testemunha1', 'testemunha2', 'teste1', 'teste2'][index];
                const value = parseFloat(input.value);

                if (!isNaN(value) && value > 0) {
                    addValue(test, value);
                    input.value = '';
                    updateResults();
                    updateSaveButton();
                }
            }
        });
    });

    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveProject);

    // Load button
    document.getElementById('loadBtn').addEventListener('click', showLoadModal);

    // Compare button
    document.getElementById('compareBtn').addEventListener('click', showCompareModal);

    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportProjects);

    // Import button
    document.getElementById('importBtn').addEventListener('click', importProjects);

    // Generate graph button
    document.getElementById('generateGraphBtn').addEventListener('click', generateComparisonGraph);

    // Modal close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('show');
        });
    });

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Confirm dialog buttons
    document.getElementById('confirmYes').addEventListener('click', () => {
        if (confirmResolve) {
            confirmResolve(true);
            confirmResolve = null;
        }
        document.getElementById('confirmDialog').classList.remove('show');
    });

    document.getElementById('confirmNo').addEventListener('click', () => {
        if (confirmResolve) {
            confirmResolve(false);
            confirmResolve = null;
        }
        document.getElementById('confirmDialog').classList.remove('show');
    });
}

function showConfirmDialog(title, message) {
    return new Promise((resolve) => {
        confirmResolve = resolve;
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmDialog').classList.add('show');
    });
}

function validateLimits() {
    const errorDiv = document.getElementById('limitsError');
    const errors = [];
    const limits = currentProject.limits;
    
    // Check for missing values
    const categories = [
        { name: 'Ovo de codorna', min: 'codornaMin', max: 'codornaMax' },
        { name: 'Ovo de galinha', min: 'galinhaMin', max: 'galinhaMax' },
        { name: 'Laranja', min: 'laranjaMin', max: 'laranjaMax' },
        { name: 'Coco verde', min: 'cocoVerdeMin', max: 'cocoVerdeMax' },
        { name: 'Coco seco', min: 'cocoSecoMin', max: 'cocoSecoMax' }
    ];
    
    categories.forEach(cat => {
        const min = limits[cat.min];
        const max = limits[cat.max];
        
        // Check if min > max
        if (min > 0 && max > 0 && min >= max) {
            errors.push(`⚠️ ${cat.name}: Mínimo deve ser menor que Máximo`);
        }
        
        // Check if only one is filled
        if ((min > 0 && max === 0) || (min === 0 && max > 0)) {
            errors.push(`⚠️ ${cat.name}: Preencha ambos os valores (Mín e Máx)`);
        }
    });
    
    // Check for overlapping ranges
    const ranges = categories.map(cat => ({
        name: cat.name,
        min: limits[cat.min],
        max: limits[cat.max]
    })).filter(r => r.min > 0 && r.max > 0);
    
    for (let i = 0; i < ranges.length; i++) {
        for (let j = i + 1; j < ranges.length; j++) {
            const r1 = ranges[i];
            const r2 = ranges[j];
            
            // Check if ranges overlap
            if ((r1.min <= r2.max && r1.max >= r2.min)) {
                errors.push(`⚠️ ${r1.name} e ${r2.name}: Faixas sobrepostas`);
            }
        }
    }
    
    // Display errors
    if (errors.length > 0) {
        errorDiv.innerHTML = errors.join('<br>');
        errorDiv.style.display = 'block';
        return false;
    } else {
        errorDiv.style.display = 'none';
        return true;
    }
}

function addValue(test, value) {
    currentProject.tests[test].push(value);
    renderValues(test);
    updateAverage(test);
}

function renderValues(test) {
    const container = document.querySelector(`.values-list[data-test="${test}"]`);
    container.innerHTML = '';

    currentProject.tests[test].forEach((value, index) => {
        const div = document.createElement('div');
        div.className = 'value-item';
        div.innerHTML = `
            <span class="value-text">${value.toFixed(3)} kg</span>
            <button class="remove-btn" onclick="removeValue('${test}', ${index})">×</button>
        `;
        container.appendChild(div);
    });
}

function removeValue(test, index) {
    currentProject.tests[test].splice(index, 1);
    renderValues(test);
    updateAverage(test);
    updateResults();
    updateSaveButton();
}

function calculateAverage(values) {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
}

function getCategory(avgWeight) {
    const limits = currentProject.limits;
    
    if (avgWeight >= limits.codornaMin && avgWeight <= limits.codornaMax && limits.codornaMin > 0) {
        return { name: 'Ovo de codorna', class: 'ovo-codorna' };
    }
    if (avgWeight >= limits.galinhaMin && avgWeight <= limits.galinhaMax && limits.galinhaMin > 0) {
        return { name: 'Ovo de galinha', class: 'ovo-galinha' };
    }
    if (avgWeight >= limits.laranjaMin && avgWeight <= limits.laranjaMax && limits.laranjaMin > 0) {
        return { name: 'Laranja', class: 'laranja' };
    }
    if (avgWeight >= limits.cocoVerdeMin && avgWeight <= limits.cocoVerdeMax && limits.cocoVerdeMin > 0) {
        return { name: 'Coco verde', class: 'coco-verde' };
    }
    if (avgWeight >= limits.cocoSecoMin && avgWeight <= limits.cocoSecoMax && limits.cocoSecoMin > 0) {
        return { name: 'Coco seco', class: 'coco-seco' };
    }
    
    return null;
}

function updateCategoryLabel(elementId, avgWeight) {
    const categoryElement = document.getElementById(elementId);
    if (!categoryElement) return;
    
    const category = getCategory(avgWeight);
    
    if (category && avgWeight > 0) {
        categoryElement.className = `category-label ${category.class}`;
        categoryElement.textContent = category.name;
        categoryElement.style.display = 'inline-block';
    } else {
        categoryElement.textContent = '';
        categoryElement.style.display = 'none';
    }
}

function updateAverage(test) {
    const values = currentProject.tests[test];
    const avg = calculateAverage(values);
    const displayElement = document.querySelector(`.average-display[data-test="${test}"] strong`);
    
    if (values.length > 0) {
        displayElement.textContent = avg.toFixed(3) + ' kg';
    } else {
        displayElement.textContent = '-';
    }
}

function updateResults() {
    // Calculate individual averages
    const avgTestemunha1 = calculateAverage(currentProject.tests.testemunha1);
    const avgTestemunha2 = calculateAverage(currentProject.tests.testemunha2);
    const avgTeste1 = calculateAverage(currentProject.tests.teste1);
    const avgTeste2 = calculateAverage(currentProject.tests.teste2);
    
    // Update individual results
    updateIndividualResult('mediaTestemunha1', 'categoryTestemunha1', avgTestemunha1);
    updateIndividualResult('mediaTestemunha2', 'categoryTestemunha2', avgTestemunha2);
    updateIndividualResult('mediaTeste1', 'categoryTeste1', avgTeste1);
    updateIndividualResult('mediaTeste2', 'categoryTeste2', avgTeste2);
    
    // Calculate group averages
    const mediaTestemunhas = (avgTestemunha1 + avgTestemunha2) / 2;
    const mediaTestes = (avgTeste1 + avgTeste2) / 2;
    
    // Update group averages display
    const mediaTestemunhasEl = document.getElementById('mediaTestemunhas');
    const mediaTestesEl = document.getElementById('mediaTestes');
    const comparacaoFinalEl = document.getElementById('comparacaoFinal');
    const comparacaoTextoEl = document.getElementById('comparacaoTexto');
    
    // Check if we have data
    const hasTestemunhaData = currentProject.tests.testemunha1.length > 0 || currentProject.tests.testemunha2.length > 0;
    const hasTesteData = currentProject.tests.teste1.length > 0 || currentProject.tests.teste2.length > 0;
    
    if (hasTestemunhaData) {
        mediaTestemunhasEl.innerHTML = `<strong>${mediaTestemunhas.toFixed(3)}</strong> kg`;
        updateCategoryLabel('categoryMediaTestemunhas', mediaTestemunhas);
    } else {
        mediaTestemunhasEl.innerHTML = '<strong>-</strong> kg';
        updateCategoryLabel('categoryMediaTestemunhas', 0);
    }
    
    if (hasTesteData) {
        mediaTestesEl.innerHTML = `<strong>${mediaTestes.toFixed(3)}</strong> kg`;
        updateCategoryLabel('categoryMediaTestes', mediaTestes);
    } else {
        mediaTestesEl.innerHTML = '<strong>-</strong> kg';
        updateCategoryLabel('categoryMediaTestes', 0);
    }
    
    // Comparison
    if (hasTestemunhaData && hasTesteData) {
        const diferenca = mediaTestes - mediaTestemunhas;
        const percentual = ((diferenca / mediaTestemunhas) * 100).toFixed(2);
        
        if (diferenca > 0) {
            comparacaoFinalEl.innerHTML = `<strong style="color: #28a745;">+${diferenca.toFixed(3)} kg (+${percentual}%)</strong>`;
            comparacaoTextoEl.textContent = 'Testes apresentaram peso maior que testemunhas';
        } else if (diferenca < 0) {
            comparacaoFinalEl.innerHTML = `<strong style="color: #dc3545;">${diferenca.toFixed(3)} kg (${percentual}%)</strong>`;
            comparacaoTextoEl.textContent = 'Testes apresentaram peso menor que testemunhas';
        } else {
            comparacaoFinalEl.innerHTML = `<strong>0.000 kg (0.00%)</strong>`;
            comparacaoTextoEl.textContent = 'Pesos idênticos';
        }
    } else {
        comparacaoFinalEl.innerHTML = '<strong>-</strong>';
        comparacaoTextoEl.textContent = 'Adicione valores para ver a comparação';
    }
}

function updateIndividualResult(valueId, categoryId, avgWeight) {
    const valueEl = document.getElementById(valueId);
    
    if (avgWeight > 0) {
        valueEl.innerHTML = `<strong>${avgWeight.toFixed(3)}</strong> kg`;
        updateCategoryLabel(categoryId, avgWeight);
    } else {
        valueEl.innerHTML = '<strong>-</strong> kg';
        updateCategoryLabel(categoryId, 0);
    }
}

function updateSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    const hasProject = currentProject.projectNumber.trim() !== '';
    const hasData = Object.values(currentProject.tests).some(arr => arr.length > 0);
    const limitsValid = validateLimits();
    
    saveBtn.disabled = !(hasProject && hasData && limitsValid);
}

async function saveProject() {
    const result = await window.electronAPI.saveProject(currentProject);
    
    if (result.success) {
        await window.electronAPI.showMessage({
            type: 'info',
            title: 'Projeto Salvo',
            message: 'Projeto salvo com sucesso!',
            buttons: ['OK']
        });
        loadSavedProjects();
    } else {
        await window.electronAPI.showMessage({
            type: 'error',
            title: 'Erro ao Salvar',
            message: 'Erro ao salvar projeto: ' + result.error,
            buttons: ['OK']
        });
    }
}

async function loadSavedProjects() {
    const result = await window.electronAPI.loadProjects();
    
    if (result.success) {
        savedProjects = result.projects;
    }
}

async function showLoadModal() {
    await loadSavedProjects();
    
    const modal = document.getElementById('loadModal');
    const projectsList = document.getElementById('projectsList');
    
    projectsList.innerHTML = '';
    
    if (savedProjects.length === 0) {
        projectsList.innerHTML = '<p style="text-align: center; color: #6c757d;">Nenhum projeto salvo encontrado.</p>';
    } else {
        savedProjects.forEach(project => {
            const date = new Date(project.savedAt).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            const numTests = Object.values(project.tests).reduce((sum, arr) => sum + arr.length, 0);
            
            projectCard.innerHTML = `
                <div class="project-header">
                    <span class="project-title">🍍 ${project.projectNumber}</span>
                    <span class="project-date-text">${date}</span>
                </div>
                <div class="project-summary">${numTests} medições totais</div>
                <div class="project-actions">
                    <button class="delete-btn" onclick="deleteProject(${project.id}, event)">Excluir</button>
                </div>
            `;
            
            projectCard.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn')) {
                    loadProject(project);
                    modal.classList.remove('show');
                }
            });
            
            projectsList.appendChild(projectCard);
        });
    }
    
    modal.classList.add('show');
}

function loadProject(project) {
    currentProject = {
        projectNumber: project.projectNumber,
        limits: project.limits || {
            codornaMin: 0,
            codornaMax: 0,
            galinhaMin: 0,
            galinhaMax: 0,
            laranjaMin: 0,
            laranjaMax: 0,
            cocoVerdeMin: 0,
            cocoVerdeMax: 0,
            cocoSecoMin: 0,
            cocoSecoMax: 0
        },
        tests: project.tests || {
            testemunha1: project.hormones?.estradiol || [],
            testemunha2: project.hormones?.progesterona || [],
            teste1: project.hormones?.lh || [],
            teste2: project.hormones?.fsh || []
        }
    };
    
    // Update project name
    document.getElementById('projectNumber').value = currentProject.projectNumber;
    
    // Update limits
    Object.keys(currentProject.limits).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
            input.value = currentProject.limits[key];
        }
    });
    
    // Render all values
    ['testemunha1', 'testemunha2', 'teste1', 'teste2'].forEach(test => {
        renderValues(test);
        updateAverage(test);
    });
    
    validateLimits();
    updateResults();
    updateSaveButton();
}

async function deleteProject(projectId, event) {
    event.stopPropagation();
    
    const confirmed = await showConfirmDialog(
        'Confirmar Exclusão',
        'Tem certeza que deseja excluir este projeto?'
    );
    
    if (confirmed) {
        const result = await window.electronAPI.deleteProject(projectId);
        
        if (result.success) {
            loadSavedProjects();
            showLoadModal();
        }
    }
}

async function exportProjects() {
    const result = await window.electronAPI.exportProject();
    
    if (result.success) {
        await window.electronAPI.showMessage({
            type: 'info',
            title: 'Exportação Concluída',
            message: `${result.count} projeto(s) exportado(s) com sucesso!`,
            buttons: ['OK']
        });
    } else if (!result.canceled) {
        await window.electronAPI.showMessage({
            type: 'error',
            title: 'Erro na Exportação',
            message: 'Erro ao exportar projetos: ' + result.error,
            buttons: ['OK']
        });
    }
}

async function importProjects() {
    const result = await window.electronAPI.importProject();
    
    if (result.canceled) {
        return;
    }
    
    if (result.success) {
        await window.electronAPI.showMessage({
            type: 'info',
            title: 'Importação Concluída',
            message: `${result.count} projeto(s) importado(s) com sucesso!`,
            buttons: ['OK']
        });
        loadSavedProjects();
    } else {
        await window.electronAPI.showMessage({
            type: 'error',
            title: 'Erro na Importação',
            message: 'Erro ao importar projetos: ' + result.error,
            buttons: ['OK']
        });
    }
}

async function showCompareModal() {
    await loadSavedProjects();
    
    const modal = document.getElementById('compareModal');
    const checkboxContainer = document.getElementById('projectCheckboxes');
    const graphContainer = document.getElementById('graphContainer');
    const noDataMessage = document.getElementById('noDataMessage');
    
    // Clear previous checkboxes
    checkboxContainer.innerHTML = '';
    
    if (savedProjects.length === 0) {
        checkboxContainer.innerHTML = '<p style="text-align: center; color: #6c757d;">Nenhum projeto salvo encontrado.</p>';
        graphContainer.style.display = 'none';
        noDataMessage.style.display = 'block';
    } else {
        savedProjects.forEach(project => {
            const date = new Date(project.savedAt).toLocaleString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
            
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
            checkboxItem.innerHTML = `
                <input type="checkbox" id="project-${project.id}" value="${project.id}">
                <label for="project-${project.id}">
                    <span class="project-name">🍍 ${project.projectNumber}</span>
                    <span class="project-date">${date}</span>
                </label>
            `;
            
            checkboxContainer.appendChild(checkboxItem);
        });
        
        graphContainer.style.display = 'none';
        noDataMessage.style.display = 'block';
    }
    
    modal.classList.add('show');
}

function generateComparisonGraph() {
    const checkboxes = document.querySelectorAll('#projectCheckboxes input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        document.getElementById('graphContainer').style.display = 'none';
        document.getElementById('noDataMessage').style.display = 'block';
        return;
    }
    
    document.getElementById('graphContainer').style.display = 'block';
    document.getElementById('noDataMessage').style.display = 'none';
    
    // Prepare data for the chart
    const datasets = [];
    const colorPalette = [
        '#4ECDC4', '#FFD93D', '#FF6B6B', '#6BCF7F', '#8B6F47',
        '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#FFFFD2'
    ];
    
    // Group projects and create evolution lines
    const projectGroups = [];
    
    checkboxes.forEach((checkbox, index) => {
        const projectId = parseInt(checkbox.value);
        const project = savedProjects.find(p => p.id === projectId);
        
        if (project) {
            // Handle different data formats
            const tests = project.tests || {
                testemunha1: project.hormones?.estradiol || [],
                testemunha2: project.hormones?.progesterona || [],
                teste1: project.hormones?.lh || [],
                teste2: project.hormones?.fsh || []
            };
            
            const t1 = tests.testemunha1 || [];
            const t2 = tests.testemunha2 || [];
            const test1 = tests.teste1 || [];
            const test2 = tests.teste2 || [];
            
            // Calculate averages for this project
            const avgTestemunha1 = calculateAverage(t1);
            const avgTestemunha2 = calculateAverage(t2);
            const avgTeste1 = calculateAverage(test1);
            const avgTeste2 = calculateAverage(test2);
            
            const mediaTestemunhas = (avgTestemunha1 + avgTestemunha2) / 2;
            const mediaTestes = (avgTeste1 + avgTeste2) / 2;
            
            projectGroups.push({
                project: project,
                mediaTestemunhas: mediaTestemunhas,
                mediaTestes: mediaTestes,
                color: colorPalette[index % colorPalette.length],
                date: new Date(project.savedAt)
            });
        }
    });
    
    // Sort by date to show evolution over time
    projectGroups.sort((a, b) => a.date - b.date);
    
    // Create labels from project names and dates
    const labels = projectGroups.map(pg => {
        const date = pg.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        return `${pg.project.projectNumber}\n${date}`;
    });
    
    // Create dataset for Média Testemunhas evolution
    const testemunhasData = projectGroups.map(pg => pg.mediaTestemunhas);
    datasets.push({
        label: 'Média Testemunhas',
        data: testemunhasData,
        borderColor: '#4dd0e1',
        backgroundColor: '#4dd0e140',
        tension: 0.4,
        pointRadius: 8,
        pointHoverRadius: 10,
        borderWidth: 3,
        fill: false
    });
    
    // Create dataset for Média Testes evolution
    const testesData = projectGroups.map(pg => pg.mediaTestes);
    datasets.push({
        label: 'Média Testes',
        data: testesData,
        borderColor: '#ffc107',
        backgroundColor: '#ffc10740',
        tension: 0.4,
        pointRadius: 8,
        pointHoverRadius: 10,
        borderWidth: 3,
        borderDash: [8, 4],
        fill: false
    });
    
    // Destroy previous chart if exists
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    // Create new chart
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    comparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Evolução de Peso ao Longo do Tempo',
                    font: {
                        size: 20,
                        weight: 'bold'
                    },
                    color: '#e0e0e0',
                    padding: 20
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#e0e0e0',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#e94560',
                    borderWidth: 2,
                    padding: 15,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        title: function(context) {
                            return context[0].label.replace('\n', ' - ');
                        },
                        label: function(context) {
                            const value = context.parsed.y.toFixed(3);
                            return `${context.dataset.label}: ${value} kg`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Peso Médio (kg)',
                        color: '#e0e0e0',
                        font: {
                            size: 15,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        color: '#b0b0b0',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return value.toFixed(3) + ' kg';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        lineWidth: 1
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Projetos (ordenados por data)',
                        color: '#e0e0e0',
                        font: {
                            size: 15,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        color: '#b0b0b0',
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        lineWidth: 1
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}
