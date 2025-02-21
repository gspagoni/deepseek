const { contextBridge, ipcRenderer } = require("electron");

// Esponi un'API sicura per il renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // Metodo per inviare una risposta alla finestra di dialogo
  sendDialogResponse: (response) =>
    ipcRenderer.send("dialog-response", response),

  // Metodo per ricevere le opzioni della finestra di dialogo
  onDialogOptions: (callback) =>
    ipcRenderer.on("dialog-options", (event, options) => callback(options)),

  // Metodo per ricevere i progressi del download
  onDownloadProgress: (callback) =>
    ipcRenderer.on("download-progress", (event, progress) =>
      callback(progress)
    ),

  // Metodo per notificare il completamento del download
  onDownloadComplete: (callback) =>
    ipcRenderer.on("download-complete", () => callback()),
});
