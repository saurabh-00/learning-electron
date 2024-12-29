const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('fruitsAPI', {
    getFruits: () => ipcRenderer.invoke('get:fruits'),
    onWebSocketStatus: (cb) => {
        ipcRenderer.on('ws:status', (event, status) => cb(status));
    },
    onWebSocketMessage: (cb) => {
        ipcRenderer.on('ws:message', (event, data) => cb(data));
    }
});