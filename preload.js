const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // New project-based structure
  loadAllProjects: () => ipcRenderer.invoke('load-all-projects'),
  createProject: (projectData) => ipcRenderer.invoke('create-project', projectData),
  loadProject: (projectId) => ipcRenderer.invoke('load-project', projectId),
  saveEntry: (data) => ipcRenderer.invoke('save-entry', data),
  deleteEntry: (data) => ipcRenderer.invoke('delete-entry', data),
  deleteProject: (projectId) => ipcRenderer.invoke('delete-project', projectId),
  
  // Legacy methods (kept for compatibility)
  saveProject: (projectData) => ipcRenderer.invoke('save-project', projectData),
  loadProjects: () => ipcRenderer.invoke('load-projects'),
  exportProject: (projectData) => ipcRenderer.invoke('export-project', projectData),
  importProject: () => ipcRenderer.invoke('import-project'),
  
  // Dialogs
  showMessage: (options) => ipcRenderer.invoke('show-message', options),
  showConfirm: (options) => ipcRenderer.invoke('show-confirm', options)
});
