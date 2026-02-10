// Home page functionality
let allProjects = [];

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
        alert('Por favor, insira um nome para o projeto.');
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
            alert('Erro ao criar projeto: ' + result.error);
        }
    } catch (error) {
        console.error('Error creating project:', error);
        alert('Erro ao criar projeto');
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
        'Confirmar Exclusão',
        'Tem certeza que deseja excluir este projeto? Todas as entradas serão perdidas.'
    );
    
    if (!confirmed) return;
    
    try {
        const result = await window.electronAPI.deleteProject(projectId);
        
        if (result.success) {
            await loadProjects();
        } else {
            alert('Erro ao excluir projeto: ' + result.error);
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Erro ao excluir projeto');
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

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
