const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const axios = require("axios");
const WebSocket = require("ws");

let mainWindow;
let ws;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile('index.html');
}

const setupWebSocket = () => {
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        console.log('WebSocket connected');
        mainWindow.webContents.send('ws:status', { connected: true });
    }

    ws.onclose = () => {
        console.log('WebSocket disconnected');
        mainWindow.webContents.send('ws:status', { connected: false });
        // Attempt to reconnect after 5 seconds
        setTimeout(setupWebSocket, 5000);
    }

    ws.onmessage = async (event) => {
        try {
            const parsedData = JSON.parse(event.data);
            mainWindow.webContents.send('ws:message', parsedData);
        } catch (e) {
            console.error('Error parsing WebSocket message: ', error);
        }
    }

    ws.onerror = (error) => {
        console.error('WebSocket error: ', error);
        mainWindow.webContents.send('ws:status', { connected: false, error: error.message });
    };
}

app.whenReady().then(() => {
    createWindow();
    setupWebSocket();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform === 'darwin') {
        if (ws) {
            ws.close();
        }
        app.quit();
    }
});

const fetchFruitsApi = async () => {
    try {
        const response = await axios.get('http://localhost:3001/fruits');
        return response.data;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

ipcMain.handle('get:fruits', async () => {
    try {
        const fruits = await fetchFruitsApi();
        return { success: true, data: fruits };
    } catch (e) {
        console.log(e);
        return { success: false, error: e.message };
    }
})