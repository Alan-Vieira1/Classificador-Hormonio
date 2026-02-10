// Home page functionality
let allProjects = [];

// Custom Alert/Confirm Functions
function customAlert(message, title = 'Aviso', type = 'info') {
    return new Promise((resolve) => {
        const icons = {
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌',
            success: '✅'
        };
        
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        overlay.innerHTML = `
            <div class="custom-alert-dialog">
                <div class="custom-alert-icon ${type}">${icons[type] || icons.info}</div>
                <h3 class="custom-alert-title">${title}</h3>
                <p class="custom-alert-message">${message}</p>
                <div class="custom-alert-buttons">
                    <button class="btn btn-primary alert-ok">OK</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const okBtn = overlay.querySelector('.alert-ok');
        okBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(true);
            }
        });
    });
}

function customConfirm(message, title = 'Confirmar') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        overlay.innerHTML = `
            <div class="custom-alert-dialog">
                <div class="custom-alert-icon warning">⚠️</div>
                <h3 class="custom-alert-title">${title}</h3>
                <p class="custom-alert-message">${message}</p>
                <div class="custom-alert-buttons">
                    <button class="btn btn-primary confirm-yes">Sim</button>
                    <button class="btn btn-secondary confirm-no">Não</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        overlay.querySelector('.confirm-yes').addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });
        
        overlay.querySelector('.confirm-no').addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(false);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(false);
            }
        });
    });
}

// DOM Elements
const newProjectBtn = document.getElementById('newProjectBtn');
const openProjectBtn = document.getElementById('openProjectBtn');
const newProjectModal = document.getElementById('newProjectModal');
const openProjectModal = document.getElementById('openProjectModal');
const newProjectForm = document.getElementById('newProjectForm');
const projectSearch = document.getElementById('projectSearch');
const projectsList = document.getElementById('projectsList');
const noProjects = document.getElementById('noProjects');
const recentProjects = document.getElementById('recentProjects');
const recentProjectsList = document.getElementById('recentProjectsList');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    setupEventListeners();
});

function setupEventListeners() {
    // New Project Button
    newProjectBtn.addEventListener('click', () => {
        showModal(newProjectModal);
    });

    // Open Project Button
    openProjectBtn.addEventListener('click', () => {
        showModal(openProjectModal);
    });

    // New Project Form
    newProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createNewProject();
    });

    // Search Projects
    projectSearch.addEventListener('input', (e) => {
        filterProjects(e.target.value);
    });

    // Close buttons
    document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) hideModal(modal);
        });
    });

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });
}

// Load all projects
async function loadProjects() {
    try {
        const result = await window.electronAPI.loadAllProjects();
        
        if (result.success) {
            allProjects = result.projects || [];
            displayProjects(allProjects);
            displayRecentProjects(allProjects.slice(0, 3));
        } else {
            console.error('Error loading projects:', result.error);
            allProjects = [];
            showNoProjects();
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        allProjects = [];
        showNoProjects();
    }
}

// Display projects in the grid
function displayProjects(projects) {
    projectsList.innerHTML = '';
    
    if (projects.length === 0) {
        showNoProjects();
        return;
    }
    
    noProjects.style.display = 'none';
    
    projects.forEach(project => {
        const card = createProjectCard(project);
        projectsList.appendChild(card);
    });
}

// Create project card element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const entriesCount = project.entries ? project.entries.length : 0;
    const lastEntry = project.lastModified ? new Date(project.lastModified).toLocaleDateString('pt-BR') : 'N/A';
    
    card.innerHTML = `
        <div class="project-card-header">
            <div>
                <div class="project-name">${escapeHtml(project.name)}</div>
            </div>
        </div>
        <div class="project-stats">
            <div class="project-stat">
                <strong>📅</strong> Última modificação: ${lastEntry}
            </div>
            <div class="project-stat">
                <strong>📊</strong> Entradas: ${entriesCount}
            </div>
        </div>
        ${project.description ? `<div class="project-description">${escapeHtml(project.description)}</div>` : ''}
        <div class="project-actions">
            <button class="btn-open" onclick="openProject('${project.id}')">Abrir</button>
            <button class="btn-delete" onclick="deleteProject('${project.id}', event)">Excluir</button>
        </div>
    `;
    
    return card;
}

// Display recent projects
function displayRecentProjects(projects) {
    if (projects.length === 0) {
        recentProjects.style.display = 'none';
        return;
    }
    
    recentProjects.style.display = 'block';
    recentProjectsList.innerHTML = '';
    
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'recent-project-card';
        card.onclick = () => openProject(project.id);
        
        const entriesCount = project.entries ? project.entries.length : 0;
        
        card.innerHTML = `
            <div class="recent-project-name">${escapeHtml(project.name)}</div>
            <div class="recent-project-info">${entriesCount} entrada(s)</div>
        `;
        
        recentProjectsList.appendChild(card);
    });
}

// Filter projects based on search
function filterProjects(searchTerm) {
    const filtered = allProjects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    displayProjects(filtered);
}

// Create new project
async function createNewProject() {
    const name = document.getElementById('projectName').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    
    if (!name) {
        await customAlert('Por favor, insira um nome para o projeto.', 'Nome Obrigatório', 'warning');
        return;
    }
    
    const projectData = {
        id: Date.now().toString(),
        name: name,
        description: description,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        entries: []
    };
    
    try {
        const result = await window.electronAPI.createProject(projectData);
        
        if (result.success) {
            hideModal(newProjectModal);
            newProjectForm.reset();
            openProject(projectData.id);
        } else {
            await customAlert('Erro ao criar projeto: ' + result.error, 'Erro', 'error');
        }
    } catch (error) {
        console.error('Error creating project:', error);
        await customAlert('Erro ao criar projeto', 'Erro', 'error');
    }
}

// Open project
function openProject(projectId) {
    // Store the project ID in localStorage for the main app to use
    localStorage.setItem('currentProjectId', projectId);
    // Navigate to main app
    window.location.href = 'index.html';
}

// Delete project
async function deleteProject(projectId, event) {
    event.stopPropagation();
    
    const confirmed = await customConfirm(
        'Tem certeza que deseja excluir este projeto? Todas as entradas serão perdidas.',
        'Confirmar Exclusão'
    );
    
    if (!confirmed) return;
    
    try {
        const result = await window.electronAPI.deleteProject(projectId);
        
        if (result.success) {
            await loadProjects();
            await customAlert('Projeto excluído com sucesso!', 'Sucesso', 'success');
        } else {
            await customAlert('Erro ao excluir projeto: ' + result.error, 'Erro', 'error');
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        await customAlert('Erro ao excluir projeto', 'Erro', 'error');
    }
}

// Show no projects message
function showNoProjects() {
    projectsList.innerHTML = '';
    noProjects.style.display = 'block';
}

// Modal functions
function showModal(modal) {
    modal.classList.add('show');
}

function hideModal(modal) {
    modal.classList.remove('show');
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
