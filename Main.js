const { app, BrowserWindow, Menu, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let currentFilePath = null; // To keep track of the currently opened file

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Adjust for security if needed
        },
    });

    mainWindow.loadFile('app/index.html');

    // Optional: Open DevTools for debugging
    // mainWindow.webContents.openDevTools();
}

const menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New File',
                accelerator: 'Ctrl+N',
                click() {
                    currentFilePath = null; // Reset current file path
                    mainWindow.webContents.send('editor:setContent', ''); // Clear editor content
                },
            },
            {
                label: 'Open',
                accelerator: 'Ctrl+O',
                click() {
                    dialog
                        .showOpenDialog(mainWindow, {
                            properties: ['openFile'],
                            filters: [
                                { name: 'JavaScript Files', extensions: ['js'] },
                                { name: 'Text Files', extensions: ['txt'] },
                                { name: 'All Files', extensions: ['*'] },
                            ],
                        })
                        .then(result => {
                            if (!result.canceled) {
                                currentFilePath = result.filePaths[0];
                                fs.readFile(currentFilePath, 'utf-8', (err, data) => {
                                    if (err) {
                                        console.error(err);
                                        return;
                                    }
                                    mainWindow.webContents.send('editor:setContent', data);
                                });
                            }
                        });
                },
            },
            {
                label: 'Save',
                accelerator: 'Ctrl+S',
                click() {
                    if (currentFilePath) {
                        // Save to the existing file
                        saveFile(currentFilePath);
                    } else {
                        // Show save dialog if there's no current file path
                        dialog
                            .showSaveDialog(mainWindow, {
                                filters: [
                                    { name: 'JavaScript Files', extensions: ['js'] },
                                    { name: 'Text Files', extensions: ['txt'] },
                                    { name: 'All Files', extensions: ['*'] },
                                ],
                            })
                            .then(result => {
                                if (!result.canceled) {
                                    currentFilePath = result.filePath;
                                    saveFile(currentFilePath);
                                }
                            });
                    }
                },
            },
            { type: 'separator' },
            {
                label: 'Quit',
                accelerator: 'CmdOrCtrl+Q',
                click() {
                    app.quit();
                },
            },
        ],
    },
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo',
            },
            {
                label: 'Redo',
                accelerator: 'CmdOrCtrl+Y',
                role: 'redo',
            },
            { type: 'separator' },
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                role: 'cut',
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                role: 'copy',
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                role: 'paste',
            },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectall',
            },
        ],
    },
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { type: 'separator' },
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' },
        ],
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'Learn More',
                click() {
                    require('electron').shell.openExternal('https://electronjs.org');
                },
            },
        ],
    },
];

function saveFile(filePath) {
    mainWindow.webContents.send('editor:getContent', (content) => {
        fs.writeFile(filePath, content, 'utf-8', (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('File saved successfully!');
        });
    });
}

app.whenReady().then(() => {
    createWindow();
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});