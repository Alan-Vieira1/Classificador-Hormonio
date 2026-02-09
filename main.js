const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const archiver = require('archiver');
const unzipper = require('unzipper');

let mainWindow;
const userDataPath = app.getPath('userData');
const projectsPath = path.join(userDataPath, 'saves');

// Ensure saves directory exists
async function ensureProjectsDir() {
  try {
    await fs.access(projectsPath);
  } catch {
    await fs.mkdir(projectsPath, { recursive: true });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'build/icon.png')
  });

  mainWindow.loadFile('renderer/index.html');
  
  // Log version info when window loads
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('='.repeat(60));
    console.log('🚀 App loaded successfully!');
    console.log('📌 Version:', app.getVersion());
    console.log('🏠 User Data Path:', userDataPath);
    console.log('💾 Projects Path:', projectsPath);
    console.log('='.repeat(60));
    
    mainWindow.webContents.executeJavaScript(`
      console.log('${'='.repeat(60)}');
      console.log('🚀 Classificador de Frutas - Version ${app.getVersion()}');
      console.log('${'='.repeat(60)}');
    `);
  });
}

app.whenReady().then(async () => {
  await ensureProjectsDir();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for dialogs
ipcMain.handle('show-message', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('show-confirm', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ['Sim', 'Não'],
    defaultId: 0,
    cancelId: 1,
    ...options
  });
  return result.response === 0;
});

// IPC Handlers for project management
ipcMain.handle('save-project', async (event, projectData) => {
  try {
    const timestamp = Date.now();
    // Sanitize project name for filename
    const sanitizedName = projectData.projectNumber.replace(/[^a-z0-9_-]/gi, '_');
    const filename = `${sanitizedName}_${timestamp}.json`;
    const filepath = path.join(projectsPath, filename);
    
    const dataToSave = {
      ...projectData,
      savedAt: new Date().toISOString(),
      id: timestamp
    };
    
    await fs.writeFile(filepath, JSON.stringify(dataToSave, null, 2));
    return { success: true, id: timestamp, filename };
  } catch (error) {
    console.error('Error saving project:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-projects', async () => {
  try {
    const files = await fs.readdir(projectsPath);
    // Accept both old pattern (project_*.json) and new pattern (any .json file)
    const projectFiles = files.filter(f => f.endsWith('.json'));
    
    const projects = await Promise.all(
      projectFiles.map(async (filename) => {
        const filepath = path.join(projectsPath, filename);
        const content = await fs.readFile(filepath, 'utf-8');
        return JSON.parse(content);
      })
    );
    
    // Sort by savedAt date, newest first
    projects.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    
    return { success: true, projects };
  } catch (error) {
    console.error('Error loading projects:', error);
    return { success: false, projects: [], error: error.message };
  }
});

ipcMain.handle('delete-project', async (event, projectId) => {
  try {
    // Find the file with this project ID
    const files = await fs.readdir(projectsPath);
    const projectFile = files.find(f => {
      if (!f.endsWith('.json')) return false;
      const filepath = path.join(projectsPath, f);
      try {
        const content = require('fs').readFileSync(filepath, 'utf-8');
        const data = JSON.parse(content);
        return data.id === projectId;
      } catch {
        return false;
      }
    });
    
    if (projectFile) {
      const filepath = path.join(projectsPath, projectFile);
      await fs.unlink(filepath);
      return { success: true };
    } else {
      return { success: false, error: 'Project file not found' };
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('export-project', async (event) => {
  try {
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: 'Exportar Todos os Projetos',
      defaultPath: `projetos_backup_${Date.now()}.zip`,
      filters: [
        { name: 'ZIP Archive', extensions: ['zip'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }
    
    // Get all project files
    const files = await fs.readdir(projectsPath);
    const projectFiles = files.filter(f => f.endsWith('.json'));
    
    if (projectFiles.length === 0) {
      return { success: false, error: 'Nenhum projeto para exportar' };
    }
    
    // Create zip archive
    return new Promise((resolve, reject) => {
      const output = fsSync.createWriteStream(filePath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      output.on('close', () => {
        resolve({ success: true, filePath, count: projectFiles.length });
      });
      
      archive.on('error', (err) => {
        reject({ success: false, error: err.message });
      });
      
      archive.pipe(output);
      
      // Add all project files to archive
      projectFiles.forEach(filename => {
        const filepath = path.join(projectsPath, filename);
        archive.file(filepath, { name: filename });
      });
      
      archive.finalize();
    });
  } catch (error) {
    console.error('Error exporting projects:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('import-project', async () => {
  try {
    const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
      title: 'Importar Projetos',
      filters: [
        { name: 'ZIP Archive', extensions: ['zip'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });
    
    if (canceled || !filePaths || filePaths.length === 0) {
      return { success: false, canceled: true };
    }
    
    const zipPath = filePaths[0];
    let importedCount = 0;
    
    // Extract zip file to projects directory
    await new Promise((resolve, reject) => {
      fsSync.createReadStream(zipPath)
        .pipe(unzipper.Parse())
        .on('entry', async (entry) => {
          const fileName = entry.path;
          
          // Only process .json files
          if (fileName.endsWith('.json')) {
            const targetPath = path.join(projectsPath, fileName);
            
            // Check if file already exists
            try {
              await fs.access(targetPath);
              // File exists, skip or overwrite based on user choice
              // For now, we'll skip existing files
              entry.autodrain();
            } catch {
              // File doesn't exist, extract it
              entry.pipe(fsSync.createWriteStream(targetPath));
              importedCount++;
            }
          } else {
            entry.autodrain();
          }
        })
        .on('close', resolve)
        .on('error', reject);
    });
    
    return { success: true, count: importedCount };
  } catch (error) {
    console.error('Error importing projects:', error);
    return { success: false, error: error.message };
  }
});
