// Main script for project view
let currentProject = null;
let currentEntry = null;
let editingDate = null;
let measurementData = {
    testemunha1: [],
    testemunha2: [],
    teste1: [],
    teste2: []
};
let chartInstance = null;

// DOM Elements
const backBtn = document.getElementById('backBtn');
const projectNameDisplay = document.getElementById('projectNameDisplay');
const viewEntriesBtn = document.getElementById('viewEntriesBtn');
const viewGraphBtn = document.getElementById('viewGraphBtn');
const entriesView = document.getElementById('entriesView');
const graphView = document.getElementById('graphView');
const newEntryBtn = document.getElementById('newEntryBtn');
const entriesList = document.getElementById('entriesList');
const noEntries = document.getElementById('noEntries');
const entryModal = document.getElementById('entryModal');
const entryForm = document.getElementById('entryForm');
const entryModalTitle = document.getElementById('entryModalTitle');
const dateFrom = document.getElementById('dateFrom');
const dateTo = document.getElementById('dateTo');
const applyDateFilter = document.getElementById('applyDateFilter');
const resetDateFilter = document.getElementById('resetDateFilter');
const graphContainer = document.getElementById('graphContainer');
const noGraphData = document.getElementById('noGraphData');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentProject();
    setupEventListeners();
    setupMeasurementInputs();
});

function setupEventListeners() {
    // Navigation
    backBtn.addEventListener('click', () => {
        window.location.href = 'home.html';
    });

    viewEntriesBtn.addEventListener('click', () => {
        switchView('entries');
    });

    viewGraphBtn.addEventListener('click', () => {
        switchView('graph');
        renderGraph();
    });

    // New Entry
    newEntryBtn.addEventListener('click', () => {
        openNewEntry();
    });

    // Entry Form
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveEntry();
    });

    // Date Filter
    applyDateFilter.addEventListener('click', () => {
        renderGraph();
    });

    resetDateFilter.addEventListener('click', () => {
        dateFrom.value = '';
        dateTo.value = '';
        renderGraph();
    });

    // Close modals
    document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                hideModal(modal);
                resetForm();
            }
        });
    });

    // Close modal on outside click
    entryModal.addEventListener('click', (e) => {
        if (e.target === entryModal) {
            hideModal(entryModal);
            resetForm();
        }
    });
}

function setupMeasurementInputs() {
    const tests = ['testemunha1', 'testemunha2', 'teste1', 'teste2'];
    
    tests.forEach(test => {
        const addBtn = document.querySelector(`button.add-btn[data-test="${test}"]`);
        const input = document.querySelector(`input[data-test="${test}"]`);
        
        addBtn.addEventListener('click', () => {
            const value = parseFloat(input.value);
            if (value && value > 0) {
                measurementData[test].push(value);
                updateValuesList(test);
                updateAverage(test);
                updateResults();
                input.value = '';
                input.focus();
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addBtn.click();
            }
        });
    });
}

function updateValuesList(test) {
    const list = document.querySelector(`.values-list[data-test="${test}"]`);
    list.innerHTML = '';
    
    measurementData[test].forEach((value, index) => {
        const item = document.createElement('div');
        item.className = 'value-item';
        item.innerHTML = `
            <span class="value-text">${value.toFixed(3)} kg</span>
            <button class="remove-btn" onclick="removeValue('${test}', ${index})">×</button>
        `;
        list.appendChild(item);
    });
}

function removeValue(test, index) {
    measurementData[test].splice(index, 1);
    updateValuesList(test);
    updateAverage(test);
    updateResults();
}

function updateAverage(test) {
    const display = document.querySelector(`.average-display[data-test="${test}"] strong`);
    const values = measurementData[test];
    
    if (values.length === 0) {
        display.textContent = '-';
        return;
    }
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    display.textContent = `${avg.toFixed(3)} kg`;
}

function updateResults() {
    const mediaTestemunhas = calculateGroupAverage(['testemunha1', 'testemunha2']);
    const mediaTestes = calculateGroupAverage(['teste1', 'teste2']);
    
    // Update preview
    const previewMediaTestemunhas = document.getElementById('previewMediaTestemunhas');
    const previewMediaTestes = document.getElementById('previewMediaTestes');
    const previewComparacao = document.getElementById('previewComparacao');
    
    if (mediaTestemunhas !== null) {
        previewMediaTestemunhas.textContent = `${mediaTestemunhas.toFixed(3)} kg`;
    } else {
        previewMediaTestemunhas.textContent = '-';
    }
    
    if (mediaTestes !== null) {
        previewMediaTestes.textContent = `${mediaTestes.toFixed(3)} kg`;
    } else {
        previewMediaTestes.textContent = '-';
    }
    
    if (mediaTestemunhas !== null && mediaTestes !== null) {
        const diff = mediaTestes - mediaTestemunhas;
        const percent = ((diff / mediaTestemunhas) * 100).toFixed(1);
        const comparison = diff > 0 ? 
            `Testes ${Math.abs(percent)}% maiores` : 
            `Testes ${Math.abs(percent)}% menores`;
        previewComparacao.textContent = comparison;
    } else {
        previewComparacao.textContent = '-';
    }
}

function calculateGroupAverage(tests) {
    const allValues = [];
    tests.forEach(test => {
        allValues.push(...measurementData[test]);
    });
    
    if (allValues.length === 0) return null;
    
    return allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
}

function switchView(view) {
    if (view === 'entries') {
        entriesView.classList.add('active');
        graphView.classList.remove('active');
        viewEntriesBtn.classList.add('active');
        viewGraphBtn.classList.remove('active');
    } else {
        entriesView.classList.remove('active');
        graphView.classList.add('active');
        viewEntriesBtn.classList.remove('active');
        viewGraphBtn.classList.add('active');
    }
}

async function loadCurrentProject() {
    const projectId = localStorage.getItem('currentProjectId');
    
    if (!projectId) {
        alert('Erro: Nenhum projeto selecionado');
        window.location.href = 'home.html';
        return;
    }
    
    try {
        const result = await window.electronAPI.loadProject(projectId);
        
        if (result.success) {
            currentProject = result.project;
            projectNameDisplay.textContent = currentProject.name;
            displayEntries();
        } else {
            alert('Erro ao carregar projeto: ' + result.error);
            window.location.href = 'home.html';
        }
    } catch (error) {
        console.error('Error loading project:', error);
        alert('Erro ao carregar projeto');
        window.location.href = 'home.html';
    }
}

function displayEntries() {
    entriesList.innerHTML = '';
    
    if (!currentProject.entries || currentProject.entries.length === 0) {
        noEntries.style.display = 'block';
        return;
    }
    
    noEntries.style.display = 'none';
    
    currentProject.entries.forEach(entry => {
        const card = createEntryCard(entry);
        entriesList.appendChild(card);
    });
}

function createEntryCard(entry) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    
    const date = new Date(entry.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    
    const mediaTestemunhas = entry.results?.mediaTestemunhas ?? '-';
    const mediaTestes = entry.results?.mediaTestes ?? '-';
    const comparacao = entry.results?.comparacao ?? '-';
    
    card.innerHTML = `
        <div class="entry-date">
            📅 ${date}
        </div>
        <div class="entry-results">
            <div class="entry-result-row">
                <span class="entry-result-label">Média Testemunhas:</span>
                <span class="entry-result-value">${typeof mediaTestemunhas === 'number' ? mediaTestemunhas.toFixed(3) + ' kg' : mediaTestemunhas}</span>
            </div>
            <div class="entry-result-row">
                <span class="entry-result-label">Média Testes:</span>
                <span class="entry-result-value">${typeof mediaTestes === 'number' ? mediaTestes.toFixed(3) + ' kg' : mediaTestes}</span>
            </div>
            <div class="entry-result-row">
                <span class="entry-result-label">Comparação:</span>
                <span class="entry-result-value">${comparacao}</span>
            </div>
        </div>
        <div class="entry-actions">
            <button class="btn-edit" onclick="editEntry('${entry.date}')">✏️ Editar</button>
            <button class="btn-delete" onclick="deleteEntry('${entry.date}')">🗑️ Excluir</button>
        </div>
    `;
    
    return card;
}

function openNewEntry() {
    editingDate = null;
    entryModalTitle.textContent = 'Nova Entrada';
    resetForm();
    
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('entryDate').value = today;
    
    showModal(entryModal);
}

async function editEntry(date) {
    const entry = currentProject.entries.find(e => e.date === date);
    if (!entry) return;
    
    editingDate = date;
    entryModalTitle.textContent = 'Editar Entrada';
    
    // Load entry data
    document.getElementById('entryDate').value = entry.date;
    
    // Load limits
    if (entry.limits) {
        Object.keys(entry.limits).forEach(key => {
            const minInput = document.getElementById(`${key}Min`);
            const maxInput = document.getElementById(`${key}Max`);
            if (minInput && maxInput) {
                minInput.value = entry.limits[key].min;
                maxInput.value = entry.limits[key].max;
            }
        });
    }
    
    // Load measurements
    measurementData = {
        testemunha1: entry.measurements?.testemunha1 || [],
        testemunha2: entry.measurements?.testemunha2 || [],
        teste1: entry.measurements?.teste1 || [],
        teste2: entry.measurements?.teste2 || []
    };
    
    // Update UI
    ['testemunha1', 'testemunha2', 'teste1', 'teste2'].forEach(test => {
        updateValuesList(test);
        updateAverage(test);
    });
    updateResults();
    
    showModal(entryModal);
}

async function deleteEntry(date) {
    const confirmed = await customConfirm(
        'Confirmar Exclusão',
        'Tem certeza que deseja excluir esta entrada?'
    );
    
    if (!confirmed) return;
    
    try {
        const result = await window.electronAPI.deleteEntry({
            projectId: currentProject.id,
            entryDate: date
        });
        
        if (result.success) {
            await loadCurrentProject();
        } else {
            alert('Erro ao excluir entrada: ' + result.error);
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Erro ao excluir entrada');
    }
}

async function saveEntry() {
    // Validate date
    const entryDate = document.getElementById('entryDate').value;
    if (!entryDate) {
        alert('Por favor, selecione uma data');
        return;
    }
    
    // Check if date already exists (and we're not editing it)
    if (!editingDate && currentProject.entries.some(e => e.date === entryDate)) {
        alert('Já existe uma entrada para esta data. Use a opção Editar para modificá-la.');
        return;
    }
    
    // Get limits
    const limits = getLimits();
    if (!validateLimits(limits)) {
        return;
    }
    
    // Calculate results
    const mediaTestemunhas = calculateGroupAverage(['testemunha1', 'testemunha2']);
    const mediaTestes = calculateGroupAverage(['teste1', 'teste2']);
    
    let comparacao = '-';
    if (mediaTestemunhas !== null && mediaTestes !== null) {
        const diff = mediaTestes - mediaTestemunhas;
        const percent = ((diff / mediaTestemunhas) * 100).toFixed(1);
        comparacao = diff > 0 ? 
            `Testes ${Math.abs(percent)}% maiores` : 
            `Testes ${Math.abs(percent)}% menores`;
    }
    
    const entryData = {
        date: entryDate,
        limits: limits,
        measurements: { ...measurementData },
        results: {
            mediaTestemunhas,
            mediaTestes,
            comparacao
        }
    };
    
    try {
        const result = await window.electronAPI.saveEntry({
            projectId: currentProject.id,
            entryData: entryData
        });
        
        if (result.success) {
            hideModal(entryModal);
            resetForm();
            await loadCurrentProject();
        } else {
            alert('Erro ao salvar entrada: ' + result.error);
        }
    } catch (error) {
        console.error('Error saving entry:', error);
        alert('Erro ao salvar entrada');
    }
}

function getLimits() {
    return {
        codorna: {
            min: parseFloat(document.getElementById('codornaMin').value) || 0,
            max: parseFloat(document.getElementById('codornaMax').value) || 0
        },
        galinha: {
            min: parseFloat(document.getElementById('galinhaMin').value) || 0,
            max: parseFloat(document.getElementById('galinhaMax').value) || 0
        },
        laranja: {
            min: parseFloat(document.getElementById('laranjaMin').value) || 0,
            max: parseFloat(document.getElementById('laranjaMax').value) || 0
        },
        cocoVerde: {
            min: parseFloat(document.getElementById('cocoVerdeMin').value) || 0,
            max: parseFloat(document.getElementById('cocoVerdeMax').value) || 0
        },
        cocoSeco: {
            min: parseFloat(document.getElementById('cocoSecoMin').value) || 0,
            max: parseFloat(document.getElementById('cocoSecoMax').value) || 0
        }
    };
}

function validateLimits(limits) {
    const errorDiv = document.getElementById('limitsError');
    const errors = [];
    
    Object.keys(limits).forEach(key => {
        if (limits[key].min <= 0 || limits[key].max <= 0) {
            errors.push(`${key}: valores devem ser maiores que zero`);
        }
        if (limits[key].min >= limits[key].max) {
            errors.push(`${key}: mínimo deve ser menor que máximo`);
        }
    });
    
    // Check for overlaps
    const ranges = Object.values(limits).sort((a, b) => a.min - b.min);
    for (let i = 0; i < ranges.length - 1; i++) {
        if (ranges[i].max > ranges[i + 1].min) {
            errors.push('Limites não podem se sobrepor');
            break;
        }
    }
    
    if (errors.length > 0) {
        errorDiv.textContent = errors.join('; ');
        errorDiv.style.display = 'block';
        return false;
    }
    
    errorDiv.style.display = 'none';
    return true;
}

function resetForm() {
    entryForm.reset();
    measurementData = {
        testemunha1: [],
        testemunha2: [],
        teste1: [],
        teste2: []
    };
    
    ['testemunha1', 'testemunha2', 'teste1', 'teste2'].forEach(test => {
        updateValuesList(test);
        updateAverage(test);
    });
    
    updateResults();
    editingDate = null;
}

function renderGraph() {
    const entries = currentProject.entries || [];
    
    if (entries.length < 2) {
        graphContainer.style.display = 'none';
        noGraphData.style.display = 'block';
        return;
    }
    
    // Filter by date range
    let filteredEntries = [...entries];
    const fromDate = dateFrom.value ? new Date(dateFrom.value) : null;
    const toDate = dateTo.value ? new Date(dateTo.value) : null;
    
    if (fromDate || toDate) {
        filteredEntries = filteredEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            if (fromDate && entryDate < fromDate) return false;
            if (toDate && entryDate > toDate) return false;
            return true;
        });
    }
    
    if (filteredEntries.length < 2) {
        graphContainer.style.display = 'none';
        noGraphData.style.display = 'block';
        return;
    }
    
    graphContainer.style.display = 'block';
    noGraphData.style.display = 'none';
    
    // Sort by date
    filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Prepare data
    const labels = filteredEntries.map(e => e.date);
    const testemunhasData = filteredEntries.map(e => e.results?.mediaTestemunhas || null);
    const testesData = filteredEntries.map(e => e.results?.mediaTestes || null);
    
    // Destroy previous chart
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // Create chart
    const ctx = document.getElementById('evolutionChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Média Testemunhas',
                    data: testemunhasData,
                    borderColor: '#4dd0e1',
                    backgroundColor: 'rgba(77, 208, 225, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Média Testes',
                    data: testesData,
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e0e0',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 37, 55, 0.9)',
                    titleColor: '#e0e0e0',
                    bodyColor: '#e0e0e0',
                    borderColor: '#3a5a72',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(3) + ' kg';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'dd/MM/yyyy'
                        }
                    },
                    ticks: {
                        color: '#e0e0e0',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(58, 90, 114, 0.3)'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#e0e0e0',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return value.toFixed(3) + ' kg';
                        }
                    },
                    grid: {
                        color: 'rgba(58, 90, 114, 0.3)'
                    }
                }
            }
        }
    });
}

// Modal functions
function showModal(modal) {
    modal.classList.add('show');
}

function hideModal(modal) {
    modal.classList.remove('show');
}

// Custom confirm dialog
function customConfirm(title, message) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'modal show';
        dialog.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-body" style="text-align: center; padding: 30px;">
                    <div style="font-size: 3em; margin-bottom: 15px;">⚠️</div>
                    <h3 style="color: #e0e0e0; margin-bottom: 15px; font-size: 1.3em;">${title}</h3>
                    <p style="color: #b0b0b0; margin-bottom: 25px; font-size: 1em;">${message}</p>
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button class="btn btn-primary confirm-yes">Sim</button>
                        <button class="btn btn-secondary confirm-no">Não</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('.confirm-yes').addEventListener('click', () => {
            document.body.removeChild(dialog);
            resolve(true);
        });
        
        dialog.querySelector('.confirm-no').addEventListener('click', () => {
            document.body.removeChild(dialog);
            resolve(false);
        });
        
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
                resolve(false);
            }
        });
    });
}
