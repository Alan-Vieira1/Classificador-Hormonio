const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveProject: (projectData) => ipcRenderer.invoke('save-project', projectData),
  loadProjects: () => ipcRenderer.invoke('load-projects'),
  deleteProject: (projectId) => ipcRenderer.invoke('delete-project', projectId),
  exportProject: (projectData) => ipcRenderer.invoke('export-project', projectData),
  importProject: () => ipcRenderer.invoke('import-project'),
  showMessage: (options) => ipcRenderer.invoke('show-message', options),
  showConfirm: (options) => ipcRenderer.invoke('show-confirm', options)
});
